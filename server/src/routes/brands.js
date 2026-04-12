import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { formatFunnelStages, normalizeFunnelStages } from '../lib/brandKitFields.js';
import { collectGuidelineStoragePaths } from '../services/brandDeletion.js';
import { normalizeEditableBrandKitPatch } from '../services/brands/updateBrandKit.js';
import { deleteBrandGuideline } from '../services/storage/supabaseStorage.js';

const router = Router();
router.use(authenticate);

// GET /api/brands
router.get('/', async (req, res, next) => {
  try {
    const ws = await getWorkspace(req.user.id);
    const { rows } = await pool.query(
      `SELECT b.*, k.voice_adjectives, k.vocabulary, k.restricted_words, k.content_goal,
              k.audience_type, k.buyer_seniority, k.age_range,
              k.industry_sector, k.industry_target, k.audience_pain_point,
              k.funnel_stages, k.funnel_stage,
              k.tone_shift, k.proof_style, k.cta_style, k.emoji_usage,
              k.publishing_frequency, k.formality_level, k.campaign_core_why,
              k.past_content_examples, k.website_url, k.website_urls, k.website_summary,
              k.guideline_file_url, k.guideline_file_name, k.guideline_storage_path, k.guideline_text_excerpt,
              k.version as kit_version
       FROM brands b
       LEFT JOIN brand_kits k ON k.brand_id = b.id AND k.is_active = TRUE
       WHERE b.workspace_id = $1
       ORDER BY b.created_at DESC
       LIMIT 50`,
      [ws.id]
    );
    res.json({ brands: rows.map(formatBrand) });
  } catch (err) { next(err); }
});

// GET /api/brands/:id
router.get('/:id', async (req, res, next) => {
  try {
    const ws = await getWorkspace(req.user.id);
    if (!ws) return res.status(404).json({ message: 'Brand not found.' });
    const rows = await hydrateBrandRows({ brandId: req.params.id, workspaceId: ws.id });
    if (!rows[0]) return res.status(404).json({ message: 'Brand not found.' });
    res.json({ brand: formatBrand(rows[0]) });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  const client = await pool.connect();

  try {
    const workspace = await getWorkspace(req.user.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });

    const brandResult = await client.query(
      `SELECT id
       FROM brands
       WHERE id = $1 AND workspace_id = $2
       LIMIT 1`,
      [req.params.id, workspace.id]
    );

    if (!brandResult.rows[0]) return res.status(404).json({ message: 'Brand not found.' });

    // Require explicit user confirmation so that programmatic or stale-tab
    // submissions cannot silently overwrite the brand kit.
    if (!req.body?.confirmed) {
      return res.status(400).json({ message: 'Explicit confirmation is required to update the brand kit.' });
    }

    const patch = normalizeEditableBrandKitPatch(req.body?.kit || {});
    if (Object.keys(patch).length === 0) {
      const rows = await hydrateBrandRows({ brandId: req.params.id, workspaceId: workspace.id, client });
      return res.json({ brand: formatBrand(rows[0]) });
    }

    await client.query('BEGIN');
    await upsertEditableBrandKit({ client, brandId: req.params.id, patch });
    await client.query(
      `UPDATE brands
       SET updated_at = NOW(),
           kit_version = COALESCE(kit_version, 1) + 1
       WHERE id = $1`,
      [req.params.id]
    );
    await client.query('COMMIT');

    const rows = await hydrateBrandRows({ brandId: req.params.id, workspaceId: workspace.id, client });
    res.json({ brand: formatBrand(rows[0]) });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const ws = await getWorkspace(req.user.id);
    if (!ws) return res.status(404).json({ message: 'Workspace not found.' });

    const brandResult = await pool.query(
      `SELECT b.id, b.name
       FROM brands b
       WHERE b.id = $1 AND b.workspace_id = $2
       LIMIT 1`,
      [req.params.id, ws.id]
    );

    if (!brandResult.rows[0]) return res.status(404).json({ message: 'Brand not found.' });

    const kitFilesResult = await pool.query(
      `SELECT guideline_storage_path
       FROM brand_kits
       WHERE brand_id = $1`,
      [req.params.id]
    );

    const guidelinePaths = collectGuidelineStoragePaths(kitFilesResult.rows);
    for (const path of guidelinePaths) {
      await deleteBrandGuideline(path);
    }

    await pool.query(
      `DELETE FROM brands
       WHERE id = $1 AND workspace_id = $2`,
      [req.params.id, ws.id]
    );

    res.json({ ok: true });
  } catch (err) { next(err); }
});

async function getWorkspace(userId) {
  const { rows } = await pool.query('SELECT * FROM workspaces WHERE user_id = $1', [userId]);
  return rows[0];
}

async function hydrateBrandRows({ brandId, workspaceId, client = pool }) {
  const { rows } = await client.query(
    `SELECT b.*, k.voice_adjectives, k.vocabulary, k.restricted_words,
            k.channel_rules_linkedin, k.channel_rules_blog, k.content_goal,
            k.audience_type, k.buyer_seniority, k.age_range,
            k.industry_sector, k.industry_target, k.audience_pain_point,
            k.funnel_stages, k.funnel_stage,
            k.tone_shift, k.proof_style, k.cta_style, k.emoji_usage,
            k.publishing_frequency, k.formality_level, k.campaign_core_why,
            k.past_content_examples, k.website_url, k.website_urls, k.website_summary,
            k.guideline_file_url, k.guideline_file_name, k.guideline_storage_path, k.guideline_text_excerpt,
            k.version as kit_version
     FROM brands b
     LEFT JOIN brand_kits k ON k.brand_id = b.id AND k.is_active = TRUE
     WHERE b.id = $1 AND b.workspace_id = $2`,
    [brandId, workspaceId]
  );

  return rows;
}

async function upsertEditableBrandKit({ client, brandId, patch }) {
  const entries = Object.entries(BRAND_KIT_FIELD_MAP)
    .filter(([field]) => field in patch);

  const existingResult = await client.query(
    `SELECT id
     FROM brand_kits
     WHERE brand_id = $1 AND is_active = TRUE
     ORDER BY created_at DESC
     LIMIT 1`,
    [brandId]
  );
  const existingKit = existingResult.rows[0] || null;

  if (!existingKit && entries.length === 0) {
    return;
  }

  if (!existingKit) {
    const columns = ['brand_id'];
    const placeholders = ['$1'];
    const values = [brandId];

    for (const [field, column] of entries) {
      values.push(patch[field]);
      columns.push(column);
      placeholders.push(`$${values.length}`);
    }

    if ('funnelStages' in patch) {
      values.push(formatFunnelStages(patch.funnelStages) || null);
      columns.push('funnel_stage');
      placeholders.push(`$${values.length}`);
    }

    await client.query(
      `INSERT INTO brand_kits (${columns.join(', ')})
       VALUES (${placeholders.join(', ')})`,
      values
    );
    return;
  }

  const values = [];
  const updates = [];

  for (const [field, column] of entries) {
    values.push(patch[field]);
    updates.push(`${column} = $${values.length}`);
  }

  if ('funnelStages' in patch) {
    values.push(formatFunnelStages(patch.funnelStages) || null);
    updates.push(`funnel_stage = $${values.length}`);
  }

  values.push(existingKit.id);

  await client.query(
    `UPDATE brand_kits
     SET ${updates.join(', ')},
         version = COALESCE(version, 1) + 1
     WHERE id = $${values.length}`,
    values
  );
}

const BRAND_KIT_FIELD_MAP = {
  voiceAdjectives: 'voice_adjectives',
  vocabulary: 'vocabulary',
  restrictedWords: 'restricted_words',
  channelRulesLinkedin: 'channel_rules_linkedin',
  channelRulesBlog: 'channel_rules_blog',
  contentGoal: 'content_goal',
  publishingFrequency: 'publishing_frequency',
  audienceType: 'audience_type',
  buyerSeniority: 'buyer_seniority',
  ageRange: 'age_range',
  industrySector: 'industry_sector',
  industryTarget: 'industry_target',
  audiencePainPoint: 'audience_pain_point',
  funnelStages: 'funnel_stages',
  toneShift: 'tone_shift',
  proofStyle: 'proof_style',
  ctaStyle: 'cta_style',
  emojiUsage: 'emoji_usage',
  voiceFormality: 'formality_level',
  campaignCoreWhy: 'campaign_core_why',
  pastContentExamples: 'past_content_examples',
  websiteUrl: 'website_url',
  websiteUrls: 'website_urls',
  websiteSummary: 'website_summary',
};

function formatBrand(row) {
  const funnelStages = normalizeFunnelStages(row.funnel_stages || row.funnel_stage);

  return {
    id: row.id,
    name: row.name,
    market: row.market,
    language: row.language,
    kitVersion: row.kit_version || row.version,
    updatedAt: row.updated_at,
    kit: {
      voiceAdjectives: row.voice_adjectives || [],
      vocabulary: row.vocabulary || [],
      restrictedWords: row.restricted_words || [],
      contentGoal: row.content_goal,
      publishingFrequency: row.publishing_frequency,
      audienceType: row.audience_type,
      buyerSeniority: row.buyer_seniority,
      ageRange: row.age_range,
      industrySector: row.industry_sector,
      industryTarget: row.industry_target,
      audiencePainPoint: row.audience_pain_point,
      funnelStages,
      funnelStage: formatFunnelStages(funnelStages) || row.funnel_stage,
      toneShift: row.tone_shift,
      proofStyle: row.proof_style,
      ctaStyle: row.cta_style,
      emojiUsage: row.emoji_usage,
      voiceFormality: row.formality_level,
      campaignCoreWhy: row.campaign_core_why,
      pastContentExamples: row.past_content_examples,
      websiteUrl: row.website_url,
      websiteUrls: row.website_urls || [],
      websiteSummary: row.website_summary || '',
      guidelineFileUrl: row.guideline_file_url,
      guidelineFileName: row.guideline_file_name,
      guidelineStoragePath: row.guideline_storage_path,
      guidelineTextExcerpt: row.guideline_text_excerpt,
      channelRulesLinkedin: row.channel_rules_linkedin,
      channelRulesBlog: row.channel_rules_blog,
    },
  };
}

export default router;

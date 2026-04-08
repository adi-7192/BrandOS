import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/brands
router.get('/', async (req, res, next) => {
  try {
    const ws = await getWorkspace(req.user.id);
    const { rows } = await pool.query(
      `SELECT b.*, k.voice_adjectives, k.vocabulary, k.restricted_words, k.content_goal,
              k.audience_type, k.buyer_seniority, k.age_range,
              k.industry_sector, k.industry_target, k.funnel_stage,
              k.tone_shift, k.proof_style, k.content_role,
              k.publishing_frequency, k.formality_level, k.campaign_core_why,
              k.past_content_examples, k.website_url, k.website_urls, k.website_summary,
              k.guideline_file_url, k.guideline_file_name, k.guideline_storage_path, k.guideline_text_excerpt,
              k.version as kit_version
       FROM brands b
       LEFT JOIN brand_kits k ON k.brand_id = b.id AND k.is_active = TRUE
       WHERE b.workspace_id = $1
       ORDER BY b.created_at DESC`,
      [ws.id]
    );
    res.json({ brands: rows.map(formatBrand) });
  } catch (err) { next(err); }
});

// GET /api/brands/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, k.voice_adjectives, k.vocabulary, k.restricted_words,
              k.channel_rules_linkedin, k.channel_rules_blog, k.content_goal,
              k.audience_type, k.buyer_seniority, k.age_range,
              k.industry_sector, k.industry_target, k.funnel_stage,
              k.tone_shift, k.proof_style, k.content_role,
              k.publishing_frequency, k.formality_level, k.campaign_core_why,
              k.past_content_examples, k.website_url, k.website_urls, k.website_summary,
              k.guideline_file_url, k.guideline_file_name, k.guideline_storage_path, k.guideline_text_excerpt,
              k.version as kit_version
       FROM brands b
       LEFT JOIN brand_kits k ON k.brand_id = b.id AND k.is_active = TRUE
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Brand not found.' });
    res.json({ brand: formatBrand(rows[0]) });
  } catch (err) { next(err); }
});

async function getWorkspace(userId) {
  const { rows } = await pool.query('SELECT * FROM workspaces WHERE user_id = $1', [userId]);
  return rows[0];
}

function formatBrand(row) {
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
      funnelStage: row.funnel_stage,
      toneShift: row.tone_shift,
      proofStyle: row.proof_style,
      contentRole: row.content_role,
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

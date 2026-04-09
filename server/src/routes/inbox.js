import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { interpretRoutingInstruction } from '../services/inbound/interpretRoutingInstruction.js';
import { extractBriefFromEmail } from '../services/extraction/briefExtraction.js';
import { extractBrandUpdateProposal } from '../services/extraction/brandUpdateExtraction.js';
import { applyBrandUpdateProposal } from '../services/brands/applyBrandUpdateProposal.js';

const router = Router();
router.use(authenticate);

function resolveOverallStatus({ campaignStatus, brandStatus }) {
  const actionable = [campaignStatus, brandStatus].filter((status) => status !== 'not_applicable');
  if (actionable.length === 0) {
    return 'pending';
  }

  return actionable.every((status) => status === 'done' || status === 'dismissed')
    ? 'used'
    : 'pending';
}

// GET /api/inbox?status=pending|used|dismissed
router.get('/', async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const ws = await getWorkspace(req.user.id);

    const [cards, counts] = await Promise.all([
      pool.query(
        `SELECT ic.*, b.name as brand_name
         FROM inbox_cards ic
         LEFT JOIN brands b ON b.id = ic.brand_id
         WHERE COALESCE(b.workspace_id, ic.workspace_id) = $1 AND ic.status = $2
         ORDER BY ic.created_at DESC`,
        [ws.id, status]
      ),
      pool.query(
        `SELECT
            COUNT(*) FILTER (WHERE ic.status = 'pending') AS pending_count,
            COUNT(*) FILTER (WHERE ic.status = 'used') AS used_count,
            COUNT(*) FILTER (WHERE ic.status = 'dismissed') AS dismissed_count
         FROM inbox_cards ic
         LEFT JOIN brands b ON b.id = ic.brand_id
         WHERE COALESCE(b.workspace_id, ic.workspace_id) = $1`,
        [ws.id]
      ),
    ]);

    const countRow = counts.rows[0] || {};

    res.json({
      cards: cards.rows.map(formatCard),
      counts: {
        pending: Number(countRow.pending_count || 0),
        used: Number(countRow.used_count || 0),
        dismissed: Number(countRow.dismissed_count || 0),
      },
    });
  } catch (err) { next(err); }
});

// PATCH /api/inbox/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const ws = await getWorkspace(req.user.id);
    const card = await getInboxCard(req.params.id, ws.id);
    if (!card) return res.status(404).json({ message: 'Inbox item not found.' });

    await pool.query('UPDATE inbox_cards SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/:id/route/interpret', async (req, res, next) => {
  try {
    const ws = await getWorkspace(req.user.id);
    const { instruction = '' } = req.body || {};
    const card = await getInboxCard(req.params.id, ws.id);
    if (!card) return res.status(404).json({ message: 'Inbox item not found.' });

    const brands = await pool.query(
      'SELECT id, name FROM brands WHERE workspace_id = $1 ORDER BY name ASC',
      [ws.id]
    );

    const interpretation = await interpretRoutingInstruction({
      instruction,
      brands: brands.rows,
      subject: card.email_subject,
      body: card.email_body,
    });

    const matchedBrand = brands.rows.find((brand) => brand.name === interpretation.brandName)
      || brands.rows.find((brand) => brand.name.toLowerCase() === interpretation.brandName.toLowerCase());

    res.json({
      interpretation: {
        ...interpretation,
        brandId: matchedBrand?.id || '',
        brandName: matchedBrand?.name || interpretation.brandName,
      },
    });
  } catch (err) { next(err); }
});

router.post('/:id/route/confirm', async (req, res, next) => {
  try {
    const ws = await getWorkspace(req.user.id);
    const {
      brandId,
      instruction = '',
      summary = '',
      createCampaign = true,
      reviewBrandUpdates = false,
    } = req.body || {};

    const card = await getInboxCard(req.params.id, ws.id);
    if (!card) return res.status(404).json({ message: 'Inbox item not found.' });

    const brandResult = await pool.query(
      `SELECT b.id, b.name,
              k.voice_adjectives, k.vocabulary, k.restricted_words,
              k.audience_type, k.tone_shift, k.proof_style,
              k.channel_rules_linkedin, k.channel_rules_blog
       FROM brands b
       LEFT JOIN brand_kits k ON k.brand_id = b.id AND k.is_active = TRUE
       WHERE b.id = $1 AND b.workspace_id = $2
       LIMIT 1`,
      [brandId, ws.id]
    );
    const brand = brandResult.rows[0];
    if (!brand) return res.status(400).json({ message: 'Brand not found for this workspace.' });

    const briefResult = await extractBriefFromEmail({
      subject: card.email_subject,
      body: card.email_body,
      threadMessages: [],
      brandName: brand.name,
    });

    const brandUpdateProposal = await extractBrandUpdateProposal({
      brandName: brand.name,
      body: card.email_body,
      currentKit: {
        voiceAdjectives: brand.voice_adjectives || [],
        vocabulary: brand.vocabulary || [],
        restrictedWords: brand.restricted_words || [],
        audienceType: brand.audience_type || '',
        toneShift: brand.tone_shift || '',
        proofStyle: brand.proof_style || '',
        channelRulesLinkedin: brand.channel_rules_linkedin || '',
        channelRulesBlog: brand.channel_rules_blog || '',
      },
    });

    const classification = createCampaign && reviewBrandUpdates
      ? 'mixed'
      : reviewBrandUpdates
        ? 'brand_update'
        : 'campaign';
    const campaignActionStatus = createCampaign ? 'pending' : 'not_applicable';
    const brandActionStatus = reviewBrandUpdates ? 'pending' : 'not_applicable';

    await pool.query(
      `UPDATE inbox_cards
       SET brand_id = $1,
           routing_status = 'confirmed',
           routing_instruction = $2,
           interpretation_summary = $3,
           classification = $4,
           campaign_action_status = $5,
           brand_update_action_status = $6,
           brand_update_proposal = $7,
           extracted_fields = $8,
           matched_fields = $9,
           unmatched_fields = $10,
           overall_score = $11,
           publish_date = $12,
           status = $13
       WHERE id = $14`,
      [
        brand.id,
        instruction || null,
        summary || null,
        classification,
        campaignActionStatus,
        brandActionStatus,
        brandUpdateProposal,
        briefResult.extractedFields,
        briefResult.matchedFields,
        briefResult.unmatchedFields,
        briefResult.overallScore,
        briefResult.publishDate || null,
        resolveOverallStatus({ campaignStatus: campaignActionStatus, brandStatus: brandActionStatus }),
        req.params.id,
      ]
    );

    const refreshed = await getInboxCard(req.params.id, ws.id);
    res.json({ card: formatCard(refreshed) });
  } catch (err) { next(err); }
});

router.post('/:id/apply-brand-updates', async (req, res, next) => {
  const client = await pool.connect();

  try {
    const ws = await getWorkspace(req.user.id);
    const card = await getInboxCard(req.params.id, ws.id, client);
    if (!card) return res.status(404).json({ message: 'Inbox item not found.' });
    if (!card.brand_id) return res.status(400).json({ message: 'This inbox item is not matched to a brand yet.' });

    await client.query('BEGIN');
    await applyBrandUpdateProposal({
      client,
      brandId: card.brand_id,
      proposal: card.brand_update_proposal || {},
    });
    const nextOverallStatus = resolveOverallStatus({
      campaignStatus: card.campaign_action_status,
      brandStatus: 'done',
    });
    await client.query(
      `UPDATE inbox_cards
       SET brand_update_action_status = 'done',
           status = $1
       WHERE id = $2`,
      [nextOverallStatus, req.params.id]
    );
    await client.query('COMMIT');

    const refreshed = await getInboxCard(req.params.id, ws.id);
    res.json({ card: formatCard(refreshed) });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

router.post('/:id/complete-campaign', async (req, res, next) => {
  try {
    const ws = await getWorkspace(req.user.id);
    const card = await getInboxCard(req.params.id, ws.id);
    if (!card) return res.status(404).json({ message: 'Inbox item not found.' });

    const nextOverallStatus = resolveOverallStatus({
      campaignStatus: 'done',
      brandStatus: card.brand_update_action_status,
    });

    await pool.query(
      `UPDATE inbox_cards
       SET campaign_action_status = 'done',
           status = $1
       WHERE id = $2`,
      [nextOverallStatus, req.params.id]
    );

    const refreshed = await getInboxCard(req.params.id, ws.id);
    res.json({ card: formatCard(refreshed) });
  } catch (err) { next(err); }
});

async function getWorkspace(userId) {
  const { rows } = await pool.query('SELECT * FROM workspaces WHERE user_id = $1', [userId]);
  return rows[0];
}

async function getInboxCard(cardId, workspaceId, client = pool) {
  const { rows } = await client.query(
    `SELECT ic.*, b.name AS brand_name
     FROM inbox_cards ic
     LEFT JOIN brands b ON b.id = ic.brand_id
     WHERE ic.id = $1
       AND COALESCE(b.workspace_id, ic.workspace_id) = $2
     LIMIT 1`,
    [cardId, workspaceId]
  );

  return rows[0] || null;
}

function formatCard(row) {
  return {
    id: row.id,
    brandId: row.brand_id || '',
    brandName: row.brand_name || 'Needs routing',
    workspaceId: row.workspace_id || '',
    providerEmailId: row.provider_email_id || '',
    providerMessageId: row.provider_message_id || '',
    emailTo: row.email_to || [],
    emailSubject: row.email_subject,
    emailFrom: row.email_from,
    excerpt: row.excerpt,
    emailBody: row.email_body,
    emailHeaders: row.email_headers || {},
    classification: row.classification || 'campaign',
    routingStatus: row.routing_status || 'matched',
    campaignActionStatus: row.campaign_action_status || 'not_applicable',
    brandUpdateActionStatus: row.brand_update_action_status || 'not_applicable',
    routingInstruction: row.routing_instruction || '',
    interpretationSummary: row.interpretation_summary || '',
    brandUpdateProposal: row.brand_update_proposal || {},
    matchedFields: row.matched_fields,
    unmatchedFields: row.unmatched_fields,
    overallScore: row.overall_score,
    publishDate: row.publish_date || '',
    status: row.status,
    createdAt: row.created_at,
    extractedFields: row.extracted_fields,
    threadId: row.thread_id,
  };
}

export default router;

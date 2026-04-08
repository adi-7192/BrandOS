import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { buildCanonicalBrief } from '../services/ai/briefBuilder.js';
import { generateContent, iterateContent } from '../services/ai/generation.js';

const router = Router();
router.use(authenticate);

// POST /api/generate/brief
// Merge inbox cards into a confirmed brief object
router.post('/brief', async (req, res, next) => {
  try {
    const { cardIds = [] } = req.body;

    if (cardIds.length === 0) return res.json({ brief: {} });

    const placeholders = cardIds.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `SELECT ic.*, b.name as brand_name, b.language,
              k.voice_adjectives, k.restricted_words, k.vocabulary,
              k.channel_rules_linkedin, k.channel_rules_blog,
              k.audience_type, k.buyer_seniority, k.age_range,
              k.industry_sector, k.industry_target, k.funnel_stage,
              k.tone_shift, k.proof_style, k.content_role,
              k.content_goal, k.publishing_frequency, k.formality_level,
              k.campaign_core_why, k.past_content_examples, k.website_url,
              k.version
       FROM inbox_cards ic
       JOIN brands b ON b.id = ic.brand_id
       LEFT JOIN brand_kits k ON k.brand_id = b.id AND k.is_active = TRUE
       WHERE ic.id IN (${placeholders})`,
      cardIds
    );

    res.json({ brief: buildCanonicalBrief(rows, cardIds) });
  } catch (err) { next(err); }
});

// POST /api/generate/create
// Full generation call: kit + brief + preview edits
router.post('/create', async (req, res, next) => {
  try {
    const { brief, sections } = req.body;
    const output = await generateContent({ brief, sections });
    res.json({ output });
  } catch (err) { next(err); }
});

// POST /api/generate/iterate
// Re-generate with full kit + instruction
router.post('/iterate', async (req, res, next) => {
  try {
    const { brief, instruction, currentContent } = req.body;
    const output = await iterateContent({ brief, instruction, currentContent });
    res.json({ output });
  } catch (err) { next(err); }
});

// POST /api/generate/save-draft
router.post('/save-draft', async (req, res, next) => {
  try {
    const { brandId, inboxCardId, format, content, instruction } = req.body;

    const last = await pool.query(
      'SELECT version_number FROM drafts WHERE brand_id = $1 AND format = $2 ORDER BY version_number DESC LIMIT 1',
      [brandId, format]
    );
    const nextVersion = (last.rows[0]?.version_number || 0) + 1;

    await pool.query(
      `INSERT INTO drafts (brand_id, inbox_card_id, format, content, version_number, iteration_instruction)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [brandId, inboxCardId || null, format, content, nextVersion, instruction || null]
    );

    res.json({ ok: true, version: nextVersion });
  } catch (err) { next(err); }
});

export default router;

import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { buildCanonicalBrief } from '../services/ai/briefBuilder.js';
import { generateContent, generatePreviewSuggestions, iterateContent, rewriteSelection } from '../services/ai/generation.js';
import { mapGenerationSessionRow } from '../services/generationSessions.js';

const router = Router();
router.use(authenticate);

router.get('/sessions', async (req, res, next) => {
  try {
    const { brandId, status = 'in_progress' } = req.query;
    const values = [req.user.id];
    const where = ['gs.user_id = $1'];

    if (brandId) {
      values.push(brandId);
      where.push(`gs.brand_id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      where.push(`gs.status = $${values.length}`);
    }

    const { rows } = await pool.query(
      `SELECT gs.*, b.name AS brand_name, b.language AS brand_language
       FROM generation_sessions gs
       JOIN brands b ON b.id = gs.brand_id
       WHERE ${where.join(' AND ')}
       ORDER BY gs.updated_at DESC
       LIMIT 10`,
      values
    );

    res.json({ sessions: rows.map(mapGenerationSessionRow) });
  } catch (err) { next(err); }
});

router.get('/sessions/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT gs.*, b.name AS brand_name, b.language AS brand_language
       FROM generation_sessions gs
       JOIN brands b ON b.id = gs.brand_id
       WHERE gs.id = $1 AND gs.user_id = $2
       LIMIT 1`,
      [req.params.id, req.user.id]
    );

    if (!rows[0]) return res.status(404).json({ message: 'Generation session not found.' });

    res.json({ session: mapGenerationSessionRow(rows[0]) });
  } catch (err) { next(err); }
});

router.post('/sessions', async (req, res, next) => {
  try {
    const {
      brandId,
      sessionTitle,
      source = 'manual',
      sourceCardIds = [],
      status = 'in_progress',
      currentStep = 'brief',
      briefPayload = {},
      previewPayload = {},
      outputPayload = {},
      activeTab = 'linkedin',
      lastInstruction = '',
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO generation_sessions (
        user_id, brand_id, session_title, source, source_card_ids, status, current_step,
        brief_payload, preview_payload, output_payload, active_tab, last_instruction
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        req.user.id,
        brandId,
        sessionTitle || null,
        source,
        sourceCardIds,
        status,
        currentStep,
        briefPayload,
        previewPayload,
        outputPayload,
        activeTab,
        lastInstruction || '',
      ]
    );

    const sessionRow = await hydrateSessionRow(rows[0].id, req.user.id);
    res.status(201).json({ session: mapGenerationSessionRow(sessionRow) });
  } catch (err) { next(err); }
});

router.patch('/sessions/:id', async (req, res, next) => {
  try {
    const existing = await hydrateSessionRow(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ message: 'Generation session not found.' });

    const nextPayload = {
      sessionTitle: req.body.sessionTitle ?? existing.session_title,
      source: req.body.source ?? existing.source,
      sourceCardIds: req.body.sourceCardIds ?? existing.source_card_ids,
      status: req.body.status ?? existing.status,
      currentStep: req.body.currentStep ?? existing.current_step,
      briefPayload: req.body.briefPayload ?? existing.brief_payload,
      previewPayload: req.body.previewPayload ?? existing.preview_payload,
      outputPayload: req.body.outputPayload ?? existing.output_payload,
      activeTab: req.body.activeTab ?? existing.active_tab,
      lastInstruction: req.body.lastInstruction ?? existing.last_instruction,
    };

    await pool.query(
      `UPDATE generation_sessions
       SET session_title = $1,
           source = $2,
           source_card_ids = $3,
           status = $4,
           current_step = $5,
           brief_payload = $6,
           preview_payload = $7,
           output_payload = $8,
           active_tab = $9,
           last_instruction = $10,
           updated_at = NOW()
       WHERE id = $11 AND user_id = $12`,
      [
        nextPayload.sessionTitle || null,
        nextPayload.source,
        nextPayload.sourceCardIds,
        nextPayload.status,
        nextPayload.currentStep,
        nextPayload.briefPayload,
        nextPayload.previewPayload,
        nextPayload.outputPayload,
        nextPayload.activeTab,
        nextPayload.lastInstruction || '',
        req.params.id,
        req.user.id,
      ]
    );

    const sessionRow = await hydrateSessionRow(req.params.id, req.user.id);
    res.json({ session: mapGenerationSessionRow(sessionRow) });
  } catch (err) { next(err); }
});

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
              k.campaign_core_why, k.past_content_examples, k.website_url, k.website_urls, k.website_summary,
              k.guideline_file_url, k.guideline_file_name, k.guideline_storage_path, k.guideline_text_excerpt,
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

// POST /api/generate/preview
// Draft editable preview sections from the confirmed brief
router.post('/preview', async (req, res, next) => {
  try {
    const { brief } = req.body;
    const sections = await generatePreviewSuggestions({ brief });
    res.json({ sections });
  } catch (err) { next(err); }
});

// POST /api/generate/iterate
// Re-generate with full kit + instruction
router.post('/iterate', async (req, res, next) => {
  try {
    const { brief, instruction, currentContent, format } = req.body;
    const output = await iterateContent({ brief, instruction, currentContent, format });
    res.json({ output });
  } catch (err) { next(err); }
});

// POST /api/generate/rewrite-selection
router.post('/rewrite-selection', async (req, res, next) => {
  try {
    const { brief, format, currentText, selectedText, instruction } = req.body;
    const selection = await rewriteSelection({ brief, format, currentText, selectedText, instruction });
    res.json({ selection });
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

async function hydrateSessionRow(sessionId, userId) {
  const { rows } = await pool.query(
    `SELECT gs.*, b.name AS brand_name, b.language AS brand_language
     FROM generation_sessions gs
     JOIN brands b ON b.id = gs.brand_id
     WHERE gs.id = $1 AND gs.user_id = $2
     LIMIT 1`,
    [sessionId, userId]
  );

  return rows[0];
}

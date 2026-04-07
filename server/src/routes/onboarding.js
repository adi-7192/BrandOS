import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { extractBrandKit } from '../services/ai/kitExtraction.js';
import { generateConfidenceSample } from '../services/ai/generation.js';

const router = Router();
router.use(authenticate);

// POST /api/onboarding/extract-kit
// Triggers Claude extraction from S4a + S4b inputs, returns draft kit cards
router.post('/extract-kit', async (req, res, next) => {
  try {
    const kitCards = await extractBrandKit(req.body);
    res.json({ kitCards });
  } catch (err) { next(err); }
});

// POST /api/onboarding/save-kit
// Persists final approved kit cards to DB
router.post('/save-kit', async (req, res, next) => {
  try {
    const { brandName, primaryMarket, brandLanguage, kitCards, ...kitParams } = req.body;

    // Get or create workspace
    const wsResult = await pool.query('SELECT * FROM workspaces WHERE user_id = $1', [req.user.id]);
    const workspace = wsResult.rows[0];

    // Create brand
    const brandResult = await pool.query(
      `INSERT INTO brands (workspace_id, name, market, language)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [workspace.id, brandName, primaryMarket, brandLanguage]
    );
    const brand = brandResult.rows[0];

    // Create brand kit
    await pool.query(
      `INSERT INTO brand_kits (
        brand_id, voice_adjectives, vocabulary, restricted_words,
        channel_rules_linkedin, channel_rules_blog, content_goal,
        publishing_frequency, audience_type, buyer_seniority,
        funnel_stage, tone_shift, proof_style, content_role,
        formality_level, past_content_examples, website_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        brand.id,
        kitCards.voiceAdjectives,
        kitCards.vocabulary,
        kitCards.restrictedWords,
        kitCards.channelRules?.linkedin,
        kitCards.channelRules?.blog,
        kitParams.contentGoal,
        kitParams.publishingFrequency,
        kitParams.audienceType,
        kitParams.buyerSeniority,
        kitParams.funnelStage,
        kitParams.toneShift,
        kitParams.proofStyle,
        kitParams.contentRole,
        kitParams.voiceFormality,
        kitParams.pastContentExamples,
        kitParams.websiteUrl,
      ]
    );

    // Mark onboarding complete
    await pool.query('UPDATE users SET onboarding_complete = TRUE WHERE id = $1', [req.user.id]);

    res.json({ brandId: brand.id });
  } catch (err) { next(err); }
});

// POST /api/onboarding/confidence-sample
router.post('/confidence-sample', async (req, res, next) => {
  try {
    const samplePost = await generateConfidenceSample(req.body);
    res.json({ samplePost });
  } catch (err) { next(err); }
});

export default router;

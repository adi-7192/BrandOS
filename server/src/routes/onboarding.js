import { Router } from 'express';
import multer from 'multer';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { extractBrandKit } from '../services/ai/kitExtraction.js';
import { generateConfidenceSample } from '../services/ai/generation.js';
import { extractGuidelineText } from '../services/extraction/guidelineText.js';
import { uploadBrandGuideline } from '../services/storage/supabaseStorage.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});
router.use(authenticate);

// POST /api/onboarding/extract-kit
// Triggers Claude extraction from S4a + S4b inputs, returns draft kit cards
router.post('/extract-kit', upload.single('brandGuidelinesFile'), async (req, res, next) => {
  try {
    const params = { ...req.body };
    let guideline = null;
    let warning = '';

    if (req.file) {
      try {
        const { text, excerpt } = await extractGuidelineText({
          buffer: req.file.buffer,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
        });

        const uploaded = await uploadBrandGuideline({
          buffer: req.file.buffer,
          filename: req.file.originalname,
          resourceKey: `user-${req.user.id}/${String(params.brandName || 'brand').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}`,
          mimetype: req.file.mimetype,
        });

        guideline = {
          fileUrl: uploaded.publicUrl,
          fileName: req.file.originalname,
          storagePath: uploaded.path,
          textExcerpt: excerpt,
        };
        params.guidelineTextExcerpt = text;
      } catch (err) {
        warning = 'We could not apply the uploaded guideline file, so BrandOS continued with the rest of your inputs.';
        console.warn('Guideline ingestion failed during onboarding extract-kit:', err.message);
      }
    }

    const kitCards = await extractBrandKit(params);
    res.json({ kitCards, guideline, warning });
  } catch (err) { next(err); }
});

// POST /api/onboarding/save-kit
// Persists final approved kit cards to DB
router.post('/save-kit', async (req, res, next) => {
  try {
    const {
      brandName,
      primaryMarket,
      brandLanguage,
      kitCards,
      role,
      team,
      brandCount,
      guidelineFileUrl,
      guidelineFileName,
      guidelineStoragePath,
      guidelineTextExcerpt,
      ...kitParams
    } = req.body;

    // Get or create workspace
    const wsResult = await pool.query('SELECT * FROM workspaces WHERE user_id = $1', [req.user.id]);
    let workspace = wsResult.rows[0];
    if (!workspace) {
      const createdWorkspace = await pool.query(
        'INSERT INTO workspaces (user_id, company_name) SELECT id, company_name FROM users WHERE id = $1 RETURNING *',
        [req.user.id]
      );
      workspace = createdWorkspace.rows[0];
    }

    // Persist Phase 1 user context now that onboarding is being finalised
    await pool.query(
      `UPDATE users
       SET role = $1, team = $2, brand_count = $3, onboarding_complete = TRUE
       WHERE id = $4`,
      [role || null, team || null, brandCount || null, req.user.id]
    );

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
        age_range, industry_sector, industry_target, funnel_stage,
        tone_shift, proof_style, content_role, formality_level,
        campaign_core_why, past_content_examples, website_url,
        guideline_file_url, guideline_file_name, guideline_storage_path, guideline_text_excerpt
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
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
        kitParams.ageRange,
        kitParams.industrySector,
        kitParams.industryTarget,
        kitParams.funnelStage,
        kitParams.toneShift,
        kitParams.proofStyle,
        kitParams.contentRole,
        kitParams.voiceFormality,
        kitParams.campaignCoreWhy,
        kitParams.pastContentExamples,
        kitParams.websiteUrl,
        guidelineFileUrl,
        guidelineFileName,
        guidelineStoragePath,
        guidelineTextExcerpt,
      ]
    );

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

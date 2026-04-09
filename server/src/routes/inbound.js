import { Router } from 'express';
import pool from '../db/pool.js';
import { verifyInboundWebhook } from '../services/inbound/verifyInboundWebhook.js';
import { getReceivedEmail } from '../services/inbound/resendInbound.js';
import { extractWorkspaceIdFromRecipient, pickWorkspaceRecipient } from '../services/inbound/intakeAddress.js';
import { matchBrandFromEmail } from '../services/inbound/matchBrandFromEmail.js';
import { classifyInboundEmail } from '../services/inbound/classifyInboundEmail.js';
import { extractBriefFromEmail } from '../services/extraction/briefExtraction.js';
import { extractBrandUpdateProposal } from '../services/extraction/brandUpdateExtraction.js';
import { normalizeInboundEmailContent } from '../services/inbound/normalizeInboundEmail.js';

const router = Router();

function getActionStatuses(classification) {
  if (classification === 'mixed') {
    return { campaign: 'pending', brand: 'pending' };
  }

  if (classification === 'brand_update') {
    return { campaign: 'not_applicable', brand: 'pending' };
  }

  if (classification === 'needs_routing') {
    return { campaign: 'not_applicable', brand: 'not_applicable' };
  }

  return { campaign: 'pending', brand: 'not_applicable' };
}

router.post('/email', async (req, res, next) => {
  const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');

  try {
    const event = verifyInboundWebhook({
      payload,
      headers: req.headers,
    });

    if (event.type !== 'email.received') {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const emailId = event.data?.email_id;
    const recipients = event.data?.to || [];
    const primaryRecipient = pickWorkspaceRecipient(recipients);
    const workspaceId = extractWorkspaceIdFromRecipient(primaryRecipient);

    if (!emailId || !workspaceId) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const workspaceResult = await pool.query(
      'SELECT * FROM workspaces WHERE id = $1 LIMIT 1',
      [workspaceId]
    );
    const workspace = workspaceResult.rows[0];
    if (!workspace) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const existing = await pool.query(
      'SELECT id FROM inbox_cards WHERE provider_email_id = $1 LIMIT 1',
      [emailId]
    );
    if (existing.rows[0]) {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    const received = await getReceivedEmail(emailId);
    const brandsResult = await pool.query(
      `SELECT b.id, b.name,
              k.voice_adjectives, k.vocabulary, k.restricted_words,
              k.audience_type, k.tone_shift, k.proof_style,
              k.channel_rules_linkedin, k.channel_rules_blog
       FROM brands b
       LEFT JOIN brand_kits k ON k.brand_id = b.id AND k.is_active = TRUE
       WHERE b.workspace_id = $1`,
      [workspace.id]
    );

    const normalizedBody = normalizeInboundEmailContent({
      text: received.text,
      html: received.html,
    });

    const brand = matchBrandFromEmail({
      brands: brandsResult.rows,
      subject: received.subject,
      text: normalizedBody,
      from: received.from,
    });

    const classificationResult = await safeClassifyInboundEmail({
      subject: received.subject,
      body: normalizedBody,
      brandName: brand?.name || '',
    });

    const briefResult = brand
      ? await safeExtractBrief({
          subject: received.subject,
          body: normalizedBody,
          threadMessages: [],
          brandName: brand.name,
        })
      : {
          extractedFields: {},
          matchedFields: [],
          unmatchedFields: [],
          overallScore: 0,
          publishDate: '',
          excerpt: normalizedBody.slice(0, 200),
        };

    const brandUpdateProposal = brand
      ? await safeExtractBrandUpdateProposal({
          brandName: brand.name,
          body: normalizedBody,
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
        })
      : { summary: '', fields: {} };
    const resolvedClassification = brand ? classificationResult.classification : 'needs_routing';
    const actionStatuses = getActionStatuses(resolvedClassification);

    await pool.query(
      `INSERT INTO inbox_cards (
        workspace_id, brand_id, provider_email_id, provider_message_id, email_to,
        email_subject, email_from, email_body, email_headers, excerpt,
        classification, routing_status, campaign_action_status, brand_update_action_status,
        interpretation_summary, brand_update_proposal,
        extracted_fields, matched_fields, unmatched_fields, overall_score, thread_id, publish_date, status
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,$16,
        $17,$18,$19,$20,$21,$22,$23
      )`,
      [
        workspace.id,
        brand?.id || null,
        emailId,
        received.message_id || null,
        received.to || [],
        received.subject || null,
        received.from || null,
        normalizedBody,
        received.headers || {},
        briefResult.excerpt || '',
        resolvedClassification,
        brand ? 'matched' : 'needs_routing',
        actionStatuses.campaign,
        actionStatuses.brand,
        classificationResult.summary || '',
        brandUpdateProposal,
        briefResult.extractedFields,
        briefResult.matchedFields,
        briefResult.unmatchedFields,
        briefResult.overallScore,
        received.headers?.['in-reply-to'] || received.message_id || emailId,
        briefResult.publishDate || null,
        'pending',
      ]
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

async function safeClassifyInboundEmail(input) {
  try {
    return await classifyInboundEmail(input);
  } catch (err) {
    console.warn('Inbound email classification failed:', err.message);
    return {
      classification: input.brandName ? 'campaign' : 'needs_routing',
      summary: input.brandName
        ? 'BrandOS found campaign details to review from this thread.'
        : 'BrandOS could not confidently route this thread yet.',
    };
  }
}

async function safeExtractBrief(input) {
  try {
    return await extractBriefFromEmail(input);
  } catch (err) {
    console.warn('Inbound brief extraction failed:', err.message);
    return {
      extractedFields: {},
      matchedFields: [],
      unmatchedFields: [],
      overallScore: 0,
      publishDate: '',
      excerpt: String(input.body || '').slice(0, 200),
    };
  }
}

async function safeExtractBrandUpdateProposal(input) {
  try {
    return await extractBrandUpdateProposal(input);
  } catch (err) {
    console.warn('Inbound brand-update extraction failed:', err.message);
    return { summary: '', fields: {} };
  }
}

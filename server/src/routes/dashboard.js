import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { buildUpcomingDeadlineItems, mapDashboardBrandRows } from '../services/dashboardSummary.js';

const router = Router();
router.use(authenticate);

router.get('/summary', async (req, res, next) => {
  try {
    const workspace = await getWorkspace(req.user.id);

    if (!workspace) {
      return res.json({
        summary: {
          counts: { brands: 0, pendingBriefs: 0, recentDrafts: 0, inProgressSessions: 0, brandsInPipeline: 0 },
          pendingBriefs: [],
          recentSessions: [],
          recentDrafts: [],
          brands: [],
          upcomingDeadlines: [],
          setup: {
            hasBrands: false,
            hasPendingBriefs: false,
            hasRecentDrafts: false,
            gmailAvailable: Boolean(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET),
          },
        },
      });
    }

    const [brands, pendingBriefs, recentSessions, recentDrafts, counts, upcomingDeadlines] = await Promise.all([
      pool.query(
        `SELECT b.id, b.name, b.market, b.language, b.updated_at,
                COALESCE(k.voice_adjectives, '{}') AS voice_adjectives,
                k.guideline_file_name,
                COUNT(ic.id) FILTER (WHERE ic.status = 'pending') AS pending_brief_count
         FROM brands b
         LEFT JOIN brand_kits k ON k.brand_id = b.id AND k.is_active = TRUE
         LEFT JOIN inbox_cards ic ON ic.brand_id = b.id
         WHERE b.workspace_id = $1
         GROUP BY b.id, k.voice_adjectives
         ORDER BY b.updated_at DESC`,
        [workspace.id]
      ),
      pool.query(
        `SELECT ic.id, ic.brand_id, ic.email_subject, ic.email_from, ic.excerpt, ic.matched_fields,
                ic.overall_score, ic.created_at, ic.publish_date, b.name AS brand_name, b.language
         FROM inbox_cards ic
         JOIN brands b ON b.id = ic.brand_id
         WHERE b.workspace_id = $1 AND ic.status = 'pending'
         ORDER BY ic.created_at DESC
         LIMIT 5`,
        [workspace.id]
      ),
      pool.query(
        `SELECT gs.id, gs.brand_id, gs.session_title, gs.current_step, gs.source, gs.source_card_ids,
                gs.updated_at, gs.publish_date, b.name AS brand_name, b.language
         FROM generation_sessions gs
         JOIN brands b ON b.id = gs.brand_id
         WHERE gs.user_id = $1 AND gs.status = 'in_progress'
         ORDER BY gs.updated_at DESC
         LIMIT 5`,
        [req.user.id]
      ),
      pool.query(
        `SELECT d.id, d.brand_id, d.inbox_card_id, d.format, d.content, d.version_number, d.created_at,
                b.name AS brand_name, b.language
         FROM drafts d
         JOIN brands b ON b.id = d.brand_id
         WHERE b.workspace_id = $1
         ORDER BY d.created_at DESC
         LIMIT 5`,
        [workspace.id]
      ),
      pool.query(
        `SELECT
            (SELECT COUNT(*) FROM brands b WHERE b.workspace_id = $1) AS brand_count,
            (
              SELECT COUNT(*)
              FROM inbox_cards ic
              JOIN brands b ON b.id = ic.brand_id
              WHERE b.workspace_id = $1 AND ic.status = 'pending'
            ) AS pending_count,
            (
              SELECT COUNT(*)
              FROM generation_sessions gs
              WHERE gs.user_id = $2 AND gs.status = 'in_progress'
            ) AS session_count,
            (
              SELECT COUNT(*)
              FROM drafts d
              JOIN brands b ON b.id = d.brand_id
              WHERE b.workspace_id = $1
            ) AS draft_count,
            (
              SELECT COUNT(*)
              FROM (
                SELECT ic.brand_id
                FROM inbox_cards ic
                JOIN brands b ON b.id = ic.brand_id
                WHERE b.workspace_id = $1 AND ic.status = 'pending'
                UNION
                SELECT gs.brand_id
                FROM generation_sessions gs
                WHERE gs.user_id = $2 AND gs.status = 'in_progress'
              ) AS pipeline_brands
            ) AS pipeline_brand_count`,
        [workspace.id, req.user.id]
      ),
      pool.query(
        `SELECT *
         FROM (
           SELECT
             'brief' AS kind,
             ic.id::text AS source_id,
             b.name AS brand_name,
             COALESCE(NULLIF(ic.extracted_fields->>'campaignName', ''), NULLIF(ic.extracted_fields->>'campaign_name', ''), ic.email_subject, 'Untitled campaign') AS title,
             ic.publish_date,
             'Pending brief' AS state_label,
             ic.created_at AS updated_at,
             ARRAY[]::text[] AS source_card_ids,
             NULL::text AS current_step
           FROM inbox_cards ic
           JOIN brands b ON b.id = ic.brand_id
           WHERE b.workspace_id = $1 AND ic.status = 'pending' AND ic.publish_date IS NOT NULL

           UNION ALL

           SELECT
             'session' AS kind,
             gs.id::text AS source_id,
             b.name AS brand_name,
             COALESCE(NULLIF(gs.brief_payload->>'campaignName', ''), NULLIF(gs.brief_payload->>'campaign_name', ''), gs.session_title, b.name, 'Untitled campaign') AS title,
             gs.publish_date,
             'In progress' AS state_label,
             gs.updated_at AS updated_at,
             COALESCE(gs.source_card_ids, ARRAY[]::text[]) AS source_card_ids,
             gs.current_step
           FROM generation_sessions gs
           JOIN brands b ON b.id = gs.brand_id
           WHERE gs.user_id = $2 AND gs.status = 'in_progress' AND gs.publish_date IS NOT NULL
         ) AS deadline_candidates
         ORDER BY publish_date ASC, updated_at DESC
         LIMIT 12`,
        [workspace.id, req.user.id]
      ),
    ]);

    const countsRow = counts.rows[0] || {};

    res.json({
      summary: {
        counts: {
          brands: Number(countsRow.brand_count || 0),
          pendingBriefs: Number(countsRow.pending_count || 0),
          inProgressSessions: Number(countsRow.session_count || 0),
          recentDrafts: Number(countsRow.draft_count || 0),
          brandsInPipeline: Number(countsRow.pipeline_brand_count || 0),
        },
        pendingBriefs: pendingBriefs.rows.map((row) => ({
          id: row.id,
          brandId: row.brand_id,
          brandName: row.brand_name,
          language: row.language,
          emailSubject: row.email_subject,
          emailFrom: row.email_from,
          excerpt: row.excerpt,
          matchedFields: row.matched_fields || [],
          overallScore: row.overall_score,
          createdAt: row.created_at,
          publishDate: row.publish_date || '',
        })),
        recentSessions: recentSessions.rows.map((row) => ({
          id: row.id,
          brandId: row.brand_id,
          brandName: row.brand_name,
          language: row.language,
          sessionTitle: row.session_title,
          currentStep: row.current_step,
          source: row.source,
          sourceCardIds: row.source_card_ids || [],
          publishDate: row.publish_date || '',
          updatedAt: row.updated_at,
        })),
        recentDrafts: recentDrafts.rows.map((row) => ({
          id: row.id,
          brandId: row.brand_id,
          brandName: row.brand_name,
          language: row.language,
          inboxCardId: row.inbox_card_id,
          format: row.format,
          content: row.content,
          versionNumber: row.version_number,
          createdAt: row.created_at,
        })),
        brands: mapDashboardBrandRows(brands.rows),
        upcomingDeadlines: buildUpcomingDeadlineItems(upcomingDeadlines.rows),
        setup: {
          hasBrands: Number(countsRow.brand_count || 0) > 0,
          hasPendingBriefs: Number(countsRow.pending_count || 0) > 0,
          hasRecentSessions: Number(countsRow.session_count || 0) > 0,
          hasRecentDrafts: Number(countsRow.draft_count || 0) > 0,
          gmailAvailable: Boolean(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

async function getWorkspace(userId) {
  const { rows } = await pool.query('SELECT * FROM workspaces WHERE user_id = $1', [userId]);
  return rows[0];
}

export default router;

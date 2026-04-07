import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/summary', async (req, res, next) => {
  try {
    const workspace = await getWorkspace(req.user.id);

    if (!workspace) {
      return res.json({
        summary: {
          counts: { brands: 0, pendingBriefs: 0, recentDrafts: 0 },
          pendingBriefs: [],
          recentDrafts: [],
          brands: [],
          setup: {
            hasBrands: false,
            hasPendingBriefs: false,
            hasRecentDrafts: false,
            gmailAvailable: Boolean(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET),
          },
        },
      });
    }

    const [brands, pendingBriefs, recentDrafts, counts] = await Promise.all([
      pool.query(
        `SELECT b.id, b.name, b.market, b.language, b.updated_at,
                COALESCE(k.voice_adjectives, '{}') AS voice_adjectives,
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
                ic.overall_score, ic.created_at, b.name AS brand_name, b.language
         FROM inbox_cards ic
         JOIN brands b ON b.id = ic.brand_id
         WHERE b.workspace_id = $1 AND ic.status = 'pending'
         ORDER BY ic.created_at DESC
         LIMIT 5`,
        [workspace.id]
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
              FROM drafts d
              JOIN brands b ON b.id = d.brand_id
              WHERE b.workspace_id = $1
            ) AS draft_count`,
        [workspace.id]
      ),
    ]);

    const countsRow = counts.rows[0] || {};

    res.json({
      summary: {
        counts: {
          brands: Number(countsRow.brand_count || 0),
          pendingBriefs: Number(countsRow.pending_count || 0),
          recentDrafts: Number(countsRow.draft_count || 0),
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
        brands: brands.rows.map((row) => ({
          id: row.id,
          name: row.name,
          market: row.market,
          language: row.language,
          updatedAt: row.updated_at,
          voiceAdjectives: row.voice_adjectives || [],
          pendingBriefCount: Number(row.pending_brief_count || 0),
        })),
        setup: {
          hasBrands: Number(countsRow.brand_count || 0) > 0,
          hasPendingBriefs: Number(countsRow.pending_count || 0) > 0,
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

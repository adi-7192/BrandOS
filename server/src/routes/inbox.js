import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/inbox?status=pending|used|dismissed
router.get('/', async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const ws = await getWorkspace(req.user.id);

    const [cards, counts] = await Promise.all([
      pool.query(
        `SELECT ic.*, b.name as brand_name
         FROM inbox_cards ic
         JOIN brands b ON b.id = ic.brand_id
         WHERE b.workspace_id = $1 AND ic.status = $2
         ORDER BY ic.created_at DESC`,
        [ws.id, status]
      ),
      pool.query(
        `SELECT
            COUNT(*) FILTER (WHERE ic.status = 'pending') AS pending_count,
            COUNT(*) FILTER (WHERE ic.status = 'used') AS used_count,
            COUNT(*) FILTER (WHERE ic.status = 'dismissed') AS dismissed_count
         FROM inbox_cards ic
         JOIN brands b ON b.id = ic.brand_id
         WHERE b.workspace_id = $1`,
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
    await pool.query('UPDATE inbox_cards SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

async function getWorkspace(userId) {
  const { rows } = await pool.query('SELECT * FROM workspaces WHERE user_id = $1', [userId]);
  return rows[0];
}

function formatCard(row) {
  return {
    id: row.id,
    brandName: row.brand_name,
    emailSubject: row.email_subject,
    emailFrom: row.email_from,
    excerpt: row.excerpt,
    emailBody: row.email_body,
    matchedFields: row.matched_fields,
    unmatchedFields: row.unmatched_fields,
    overallScore: row.overall_score,
    status: row.status,
    createdAt: row.created_at,
    extractedFields: row.extracted_fields,
    threadId: row.thread_id,
  };
}

export default router;

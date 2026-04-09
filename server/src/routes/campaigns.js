import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { mapCampaignRows } from '../services/campaignsSummary.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT gs.*, b.name AS brand_name, b.language AS brand_language
       FROM generation_sessions gs
       JOIN brands b ON b.id = gs.brand_id
       WHERE gs.user_id = $1
       ORDER BY gs.updated_at DESC`,
      [req.user.id]
    );

    res.json({ campaigns: mapCampaignRows(rows) });
  } catch (err) {
    next(err);
  }
});

export default router;

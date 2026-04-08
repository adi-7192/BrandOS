import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { dismissIntentPrompt, recordIntentSignal } from '../services/intentSignals.js';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const { moment, question_key: questionKey, answer, content_piece_count: contentPieceCount } = req.body;

    if (!moment || !questionKey || !answer) {
      return res.status(400).json({ message: 'moment, question_key, and answer are required.' });
    }

    await recordIntentSignal({
      userId: req.user.id,
      moment,
      questionKey,
      answer,
      contentPieceCount,
    });

    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

router.post('/dismiss', async (req, res, next) => {
  try {
    const { moment, question_key: questionKey, content_piece_count: contentPieceCount } = req.body;

    if (!moment || !questionKey) {
      return res.status(400).json({ message: 'moment and question_key are required.' });
    }

    await dismissIntentPrompt({
      userId: req.user.id,
      moment,
      questionKey,
      contentPieceCount,
    });

    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

export default router;

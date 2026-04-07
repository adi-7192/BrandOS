import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const sign = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { firstName, lastName, email, companyName, password } = req.body;
    if (!firstName || !lastName || !email || !companyName || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) return res.status(409).json({ message: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, company_name, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [firstName, lastName, email.toLowerCase(), companyName, passwordHash]
    );
    const user = rows[0];

    // Create workspace
    await pool.query('INSERT INTO workspaces (user_id, company_name) VALUES ($1, $2)', [user.id, companyName]);

    res.status(201).json({ token: sign(user), user: formatUser(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/signin
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email?.toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    if (!user.password_hash) return res.status(401).json({ message: 'Please sign in with SSO.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
    res.json({ token: sign(user), user: formatUser(user) });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: formatUser(rows[0]) });
  } catch (err) { next(err); }
});

function formatUser(u) {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    companyName: u.company_name,
    onboardingComplete: u.onboarding_complete,
  };
}

export default router;

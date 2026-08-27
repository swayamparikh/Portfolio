import crypto from 'crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db/pool';

const router = Router();

const signupSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string() });

function sign(userId: string) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '30d' });
}

router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { email, password, name } = parsed.data;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return res.status(409).json({ error: 'An account with that email already exists' });

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
    [crypto.randomUUID(), email, hash, name || null]
  );
  const user = rows[0];
  res.status(201).json({ token: sign(user.id), user });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { email, password } = parsed.data;

  const { rows } = await pool.query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: sign(user.id), user: { id: user.id, email: user.email, name: user.name } });
});

export default router;

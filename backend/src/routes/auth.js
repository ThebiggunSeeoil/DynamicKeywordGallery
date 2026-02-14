import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const MIN_PASSWORD_LEN = 8

router.post('/register', async (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  if (String(password).length < MIN_PASSWORD_LEN) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LEN} characters` })
  }

  const existing = await User.findOne({ username }).lean()
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username, passwordHash })
  const token = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '2h' })
  return res.status(201).json({ token })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const user = await User.findOne({ username })
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '2h' })
  return res.json({ token })
})

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       409:
 *         description: Username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login to get JWT token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default router

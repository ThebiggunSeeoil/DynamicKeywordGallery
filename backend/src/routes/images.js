import express from 'express'
import mongoose from 'mongoose'
import Image from '../models/Image.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.get('/', auth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '6', 10), 50)
  const cursor = req.query.cursor
  const keyword = req.query.keyword

  const filter = {}
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    filter._id = { $gt: new mongoose.Types.ObjectId(cursor) }
  }
  if (keyword) {
    filter.keywords = keyword
  }

  try {
    const items = await Image.find(filter)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .lean()

    const hasMore = items.length > limit
    const sliced = items.slice(0, limit)
    const nextCursor = hasMore ? sliced[sliced.length - 1]?._id : null

    res.json({
      items: sliced.map(item => ({
        id: item._id,
        url: item.url,
        width: item.width,
        height: item.height,
        keywords: item.keywords
      })),
      next_cursor: nextCursor
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load images' })
  }
})

/**
 * @openapi
 * /api/images:
 *   get:
 *     summary: List images with optional keyword filter
 *     tags:
 *       - Images
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageList'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default router

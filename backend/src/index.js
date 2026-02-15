import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import swaggerUi from 'swagger-ui-express'
import imageRoutes from './routes/images.js'
import authRoutes from './routes/auth.js'
import { buildSwaggerSpec } from './docs/swagger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gallery'

const rawOrigins = process.env.CORS_ORIGIN || '*'
const allowedOrigins =
  rawOrigins === '*'
    ? '*'
    : rawOrigins
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins === '*') return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    }
  })
)
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const swaggerSpec = buildSwaggerSpec(process.env.SWAGGER_SERVER_URL)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRoutes)
app.use('/api/images', imageRoutes)

async function start() {
  try {
    await mongoose.connect(MONGODB_URI)
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()

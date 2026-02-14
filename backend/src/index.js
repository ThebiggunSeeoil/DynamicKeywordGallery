import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import swaggerUi from 'swagger-ui-express'
import imageRoutes from './routes/images.js'
import authRoutes from './routes/auth.js'
import swaggerSpec from './docs/swagger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gallery'

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

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

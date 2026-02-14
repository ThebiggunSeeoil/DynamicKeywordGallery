import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Image from '../models/Image.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gallery'

const KEYWORDS = [
  'travel', 'food', 'nature', 'city', 'art', 'night', 'portrait', 'street',
  'minimal', 'color', 'blackwhite', 'ocean', 'mountain', 'forest', 'animal'
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickKeywords() {
  const count = randomInt(2, 5)
  const shuffled = [...KEYWORDS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)

    const count = Number(process.argv[2] || 80)
    const images = []

    for (let i = 0; i < count; i += 1) {
      const width = randomInt(260, 520)
      const height = randomInt(260, 640)
      images.push({
        url: `https://placehold.co/${width}x${height}`,
        width,
        height,
        keywords: pickKeywords()
      })
    }

    await Image.deleteMany({})
    await Image.insertMany(images)

    console.log(`Seeded ${images.length} images.`)
  } catch (err) {
    console.error('Seed failed', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seed()

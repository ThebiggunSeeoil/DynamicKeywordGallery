import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    keywords: [{ type: String, index: true }]
  },
  { timestamps: true }
)

imageSchema.index({ keywords: 1, _id: 1 })

export default mongoose.model('Image', imageSchema)

const { Schema, model } = require("mongoose");

const imageSchema = new Schema({
  // who uploaded the image
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  imageUrl: {
  type: String,
  required: true,
  },
  publicId: {
  type: String,
  },
  predictions: [
    {
      era: { type: String, required: true },       // "Impressionism"
      confidence: { type: Number, required: true } // 0.62
    }
  ],
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  // when it was uploaded
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Image = model("Image", imageSchema);
module.exports = Image;
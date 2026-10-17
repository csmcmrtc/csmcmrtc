import mongoose from "mongoose"

const buyRequestSchema = new mongoose.Schema({
  wholesalerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true,
  },
  requestedQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  pickupDate: {
    type: Date,
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
})

export default mongoose.models.BuyRequest || mongoose.model("BuyRequest", buyRequestSchema)

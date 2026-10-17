import mongoose from "mongoose"

const cropSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cropName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    enum: [
      "Adilabad",
      "Bhadradri Kothagudem",
      "Hanumakonda",
      "Hyderabad",
      "Jagtial",
      "Jangaon",
      "Jayashankar Bhupalpally",
      "Jogulamba Gadwal",
      "Kamareddy",
      "Karimnagar",
      "Khammam",
      "Kumuram Bheem",
      "Mahabubabad",
      "Mahabubnagar",
      "Mancherial",
      "Medak",
      "Medchal-Malkajgiri",
      "Mulugu",
      "Nagarkurnool",
      "Nalgonda",
      "Narayanpet",
      "Nirmal",
      "Nizamabad",
      "Peddapalli",
      "Rajanna Sircilla",
      "Rangareddy",
      "Sangareddy",
      "Siddipet",
      "Suryapet",
      "Vikarabad",
      "Wanaparthy",
      "Warangal",
      "Yadadri Bhuvanagiri",
    ],
    required: true,
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0,
  },
  isOrganic: {
    type: Boolean,
    required: true,
  },
  minimumOrderQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  farmerLocation: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Crop || mongoose.model("Crop", cropSchema)

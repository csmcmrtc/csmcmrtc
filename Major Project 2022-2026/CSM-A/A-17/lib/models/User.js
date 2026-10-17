import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  // Common fields
  role: {
    type: String,
    enum: ["farmer", "wholesaler", "admin"],
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Farmer specific fields
  kisanId: {
    type: String,
    unique: true,
    sparse: true, // Only unique if not null
    required: function () {
      return this.role === "farmer"
    },
  },
  password: {
    type: String,
    required: true,
  },

  // Wholesaler specific fields
  email: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return this.role === "wholesaler" || this.role === "admin"
    },
  },

  // Common profile fields
  name: {
    type: String,
    required: true,
  },
  phone: {
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
  address: {
    type: String,
    required: true,
  },
})

// Ensure either kisanId or email is provided based on role
userSchema.pre("save", function (next) {
  if (this.role === "farmer" && !this.kisanId) {
    return next(new Error("Kisan ID is required for farmers"))
  }
  if ((this.role === "wholesaler" || this.role === "admin") && !this.email) {
    return next(new Error("Email is required for wholesalers and admins"))
  }
  next()
})

export default mongoose.models.User || mongoose.model("User", userSchema)

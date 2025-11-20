import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: String,
  isSeller: {
    type: Boolean,
    default: false,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  address: String,
  city: String,
  state: String,
  businessName: String,
  businessDescription: String,
  bankAccountNumber: String,
  bankAccountName: String,
  bankName: String,
  totalItemsListed: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  contactCount: {
    type: Number,
    default: 0,
  },
  itemsSold: {
    type: Number,
    default: 0,
  },
  lastListingDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password)
}

export default mongoose.model("User", userSchema)

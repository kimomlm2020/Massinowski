import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
  // Core fields
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: [String], required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  level: { type: String, required: true },
  popular: { type: Boolean, default: false },
  duration: { type: String, required: true },
  date: { type: Number, default: Date.now },
  
  // Extended fields for frontend
  features: { type: [String], default: [] },
  subtitle: { type: String, default: '' },
  bestFor: { type: String, default: '' },
  support: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  icon: { type: String, default: '📋' },
  currency: { type: String, default: '€' },
  isActive: { type: Boolean, default: true }
});

// Virtuals
programSchema.virtual('priceDisplay').get(function() {
  return `${this.price}${this.currency}`;
});

// Settings
programSchema.set('toJSON', { virtuals: true });
programSchema.set('toObject', { virtuals: true });

const programModel = mongoose.models.program || mongoose.model("program", programSchema);

export default programModel;
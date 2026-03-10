import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    zipcode: { type: String, default: '' },
    country: { type: String, default: 'France' }
  },
  role: { type: String, default: 'user' },
  cartData: { type: Array, default: [] },
  avatar: { type: String, default: null }
}, { timestamps: true });

export default mongoose.models.user || mongoose.model('user', userSchema);
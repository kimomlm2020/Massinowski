import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: false },
    date: { type: Number, required: true },
    
    // Champs pour les paiements
    paymentId: { type: String },
    paymentDate: { type: Number },
    bankTransferReference: { type: String },
    stripeSessionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paypalOrderId: { type: String },
    paypalPaymentId: { type: String },
    payerId: { type: String },
    
    // Champs admin
    bankTransferConfirmedAt: { type: Date },
    bankTransferConfirmedBy: { type: String },
    adminNotes: { type: String }
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
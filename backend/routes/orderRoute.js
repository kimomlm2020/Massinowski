import express from 'express';
import { 
    placeOrder, 
    placeOrderCOD,
    placeOrderStripe, 
    placeOrderRazorpay, 
    placeOrderBankTransfer,
    placeOrderCrypto,
    placeOrderPayPal,      // ⭐ AJOUTÉ
    verifyPayPal,          // ⭐ AJOUTÉ
    listOrders, 
    userOrders, 
    updateStatus, 
    verifyStripe, 
    verifyRazorpay,
    getOrderById,
    confirmBankTransfer,
    listPendingBankTransfers,
    getOrderPublic
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// ====================
// ROUTES CLIENT (Auth requise)
// ====================

orderRouter.post('/paypal', authUser, placeOrderPayPal);           
orderRouter.post('/verifyPaypal', authUser, verifyPayPal);        
orderRouter.post('/bank-transfer', authUser, placeOrderBankTransfer);
orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/verifyStripe', authUser, verifyStripe);
orderRouter.post('/razorpay', authUser, placeOrderRazorpay);
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay);
orderRouter.post('/crypto', authUser, placeOrderCrypto);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.get('/:orderId', authUser, getOrderById);

// ====================
// ROUTES ADMIN (Admin Auth requise)
// ====================

orderRouter.get('/admin/pending-transfers', adminAuth, listPendingBankTransfers);
orderRouter.post('/admin/confirm-transfer', adminAuth, confirmBankTransfer);
orderRouter.post('/list', adminAuth, listOrders);
orderRouter.post('/update-status', adminAuth, updateStatus);

// ====================
// ROUTE PUBLIQUE (Sans auth)
// ====================

orderRouter.get('/public/:orderId', getOrderPublic);

export default orderRouter;
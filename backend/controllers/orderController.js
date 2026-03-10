import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import emailService from '../services/emailService.js';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import paypal from '@paypal/checkout-server-sdk';

// Configuration
const currency = 'eur';
const deliveryCharge = 0;

// Initialisation des gateways
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ⭐ CONFIGURATION PAYPAL
const paypalEnvironment = () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    // Mode sandbox pour test, live pour production
    return process.env.PAYPAL_MODE === 'live' 
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

const paypalClient = () => {
    return new paypal.core.PayPalHttpClient(paypalEnvironment());
};

// ====================
// HELPERS
// ====================
const enrichItems = (items) => {
    return items.map(item => ({
        programId: item.programId || item.id || item._id,
        name: item.name || item.title || 'Program',
        title: item.title || item.name || 'Program',
        description: item.description || item.fullDescription || '',
        level: item.level || 'Standard',
        category: item.category || 'Coaching',
        duration: item.duration || '/month',
        price: Number(item.price) || 0,
        priceNumber: Number(item.priceNumber) || Number(item.price) || 0,
        quantity: item.quantity || 1,
        icon: item.icon || '📋',
        image: item.image || item.images || [],
        features: item.features || [],
        bestFor: item.bestFor || '',
        support: item.support || '',
        type: 'program',
        addedAt: new Date().toISOString()
    }));
};

const formatAddress = (address) => ({
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    email: address.email || '',
    phone: address.phone || '',
    street: address.street || '',
    apartment: address.apartment || '',
    city: address.city || '',
    state: address.state || '',
    zipcode: address.zipcode || address.zipCode || '',
    country: address.country || 'France',
    fullName: `${address.firstName || ''} ${address.lastName || ''}`.trim()
});

// ====================
// ⭐ PAYPAL
// ====================
const placeOrderPayPal = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const userIdFromToken = req.userId;
        const origin = req.headers.origin || req.headers.referer || 'http://localhost:5173';

        console.log('🅿️ PayPal Order - Received:', { userId, itemsCount: items?.length, amount });

        if (userIdFromToken !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized user ID" });
        }

        if (!items || items.length === 0) {
            return res.json({ success: false, message: "No items in cart" });
        }

        const enrichedItems = enrichItems(items);
        const formattedAddress = formatAddress(address);

        // Créer la commande en base (statut pending)
        const orderData = {
            userId,
            items: enrichedItems,
            address: formattedAddress,
            amount: Number(amount),
            paymentMethod: "paypal",
            payment: false,
            status: 'pending_paypal',
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        console.log('🅿️ PayPal Order - Created in DB:', newOrder._id);

        // Créer la commande PayPal
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: newOrder._id.toString(),
                description: `Order #${newOrder._id.toString().slice(-8)}`,
                amount: {
                    currency_code: currency.toUpperCase(),
                    value: amount.toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: currency.toUpperCase(),
                            value: amount.toFixed(2)
                        }
                    }
                },
                items: enrichedItems.map(item => ({
                    name: item.name.substring(0, 127), // PayPal limit
                    description: `${item.level} - ${item.duration}`.substring(0, 127),
                    unit_amount: {
                        currency_code: currency.toUpperCase(),
                        value: item.price.toFixed(2)
                    },
                    quantity: item.quantity.toString(),
                    category: 'DIGITAL_GOODS'
                })),
                shipping: {
                    name: {
                        full_name: formattedAddress.fullName.substring(0, 300)
                    },
                    address: {
                        address_line_1: formattedAddress.street.substring(0, 300),
                        address_line_2: formattedAddress.apartment ? formattedAddress.apartment.substring(0, 300) : '',
                        admin_area_2: formattedAddress.city.substring(0, 120),
                        admin_area_1: formattedAddress.state ? formattedAddress.state.substring(0, 300) : '',
                        postal_code: formattedAddress.zipcode ? formattedAddress.zipcode.substring(0, 60) : '00000',
                        country_code: formattedAddress.country.substring(0, 2) || 'FR'
                    }
                }
            }],
            application_context: {
                brand_name: 'Massinowski',
                landing_page: 'BILLING',
                shipping_preference: 'SET_PROVIDED_ADDRESS',
                user_action: 'PAY_NOW',
                return_url: `${origin}/verify?success=true&orderId=${newOrder._id}&method=paypal`,
                cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}&method=paypal`
            }
        });

        const client = paypalClient();
        const paypalOrder = await client.execute(request);

        // Sauvegarder l'ID PayPal
        newOrder.paypalOrderId = paypalOrder.result.id;
        await newOrder.save();

        // Trouver l'URL d'approbation
        const approvalLink = paypalOrder.result.links.find(link => link.rel === 'approve');

        console.log('🅿️ PayPal Order - Created on PayPal:', paypalOrder.result.id);

        res.json({ 
            success: true, 
            approval_url: approvalLink.href,
            paypalOrderId: paypalOrder.result.id,
            orderId: newOrder._id
        });

    } catch (error) {
        console.error('🅿️ PayPal Error:', error);
        res.json({ success: false, message: error.message || 'PayPal payment creation failed' });
    }
};

// ⭐ VÉRIFICATION PAYPAL
const verifyPayPal = async (req, res) => {
    try {
        const { orderId, success, paypalOrderId, payerId } = req.body;
        const userId = req.userId;

        console.log('🅿️ PayPal Verify - Received:', { orderId, success, paypalOrderId });

        if (!orderId) {
            return res.json({ success: false, message: "Order ID required" });
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (success === "true" || success === true) {
            // Capturer le paiement PayPal
            if (paypalOrderId) {
                try {
                    const client = paypalClient();
                    const captureRequest = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
                    captureRequest.requestBody({});
                    
                    const capture = await client.execute(captureRequest);
                    console.log('🅿️ PayPal Capture:', capture.result.status);

                    if (capture.result.status === 'COMPLETED') {
                        order.payment = true;
                        order.status = 'completed';
                        order.paymentId = capture.result.id;
                        order.payerId = payerId;
                        order.paymentDate = Date.now();
                        await order.save();

                        // Vider le panier
                        await userModel.findByIdAndUpdate(userId, { cartData: {} });

                        // Envoyer email de confirmation
                        try {
                            await emailService.sendPaymentConfirmationToClient(order);
                        } catch (emailError) {
                            console.error('⚠️ Confirmation email error:', emailError.message);
                        }

                        console.log('✅ PayPal Payment verified and captured');
                        return res.json({ success: true, message: "Payment verified and completed" });
                    } else {
                        return res.json({ success: false, message: "Payment not completed" });
                    }
                } catch (captureError) {
                    console.error('🅿️ PayPal Capture Error:', captureError);
                    return res.json({ success: false, message: "Payment capture failed" });
                }
            } else {
                // Fallback si pas de paypalOrderId (ancien flux)
                order.payment = true;
                order.status = 'completed';
                order.paymentDate = Date.now();
                await order.save();
                await userModel.findByIdAndUpdate(userId, { cartData: {} });
                
                res.json({ success: true, message: "Payment verified" });
            }
        } else {
            order.status = 'cancelled';
            order.payment = false;
            await order.save();
            
            console.log('🅿️ PayPal Payment cancelled');
            res.json({ success: false, message: "Payment cancelled" });
        }
    } catch (error) {
        console.error('🅿️ Verify PayPal Error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ====================
// ⭐ BANK TRANSFER
// ====================
const placeOrderBankTransfer = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const userIdFromToken = req.userId;

        console.log('🏦 Bank Transfer Order - Received:', { userId, itemsCount: items?.length, amount });

        if (userIdFromToken !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized user ID" });
        }

        if (!items || items.length === 0) {
            return res.json({ success: false, message: "No items in cart" });
        }

        const enrichedItems = enrichItems(items);
        const formattedAddress = formatAddress(address);

        if (!formattedAddress.email || !formattedAddress.firstName || !formattedAddress.lastName) {
            return res.json({ success: false, message: "Complete address required" });
        }

        const orderData = {
            userId,
            items: enrichedItems,
            address: formattedAddress,
            amount: Number(amount),
            paymentMethod: "bank-transfer",
            payment: false,
            status: 'pending_bank_transfer',
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Vider le panier
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        console.log('✅ Bank Transfer Order Created:', newOrder._id, 'Ref:', newOrder.bankTransferReference);

        try {
            await emailService.sendBankTransferInstructionsToClient(newOrder);
            console.log('📧 Client email sent');
            
            await emailService.sendBankTransferNotificationToAdmin(newOrder);
            console.log('📧 Admin email sent');
        } catch (emailError) {
            console.error('⚠️ Email error (non-blocking):', emailError.message);
        }

        res.json({ 
            success: true, 
            message: "Order created. Check your email for bank transfer instructions.",
            orderId: newOrder._id,
            order: {
                _id: newOrder._id,
                reference: newOrder.bankTransferReference,
                amount: newOrder.amount,
                status: newOrder.status,
                bankDetails: {
                    holder: process.env.BANK_HOLDER || 'MASSINOWSKI SARL',
                    iban: process.env.BANK_IBAN || 'FR76 1234 5678 9012 3456 7890 123',
                    bic: process.env.BANK_BIC || 'ABCDEFGH',
                    bankName: process.env.BANK_NAME || 'Crédit Agricole'
                }
            }
        });

    } catch (error) {
        console.error('🏦 Bank Transfer Error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ====================
// ⭐ CASH ON DELIVERY
// ====================
const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const userIdFromToken = req.userId;

        console.log('💵 COD Order - Received:', { userId, itemsCount: items?.length, amount });

        if (userIdFromToken !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized user ID" });
        }

        if (!items || items.length === 0) {
            return res.json({ success: false, message: "No items in cart" });
        }

        const enrichedItems = enrichItems(items);
        const formattedAddress = formatAddress(address);

        const orderData = {
            userId,
            items: enrichedItems,
            address: formattedAddress,
            amount: Number(amount),
            paymentMethod: "cod",
            payment: false,
            status: 'pending_cod',
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Vider le panier
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        console.log('✅ COD Order Created:', newOrder._id);

        try {
            await emailService.sendCODConfirmationToClient(newOrder);
            console.log('📧 Client COD email sent');
            
            await emailService.sendCODNotificationToAdmin(newOrder);
            console.log('📧 Admin COD email sent');
        } catch (emailError) {
            console.error('⚠️ Email error (non-blocking):', emailError.message);
        }

        res.json({ 
            success: true, 
            message: "Order placed successfully. Pay on delivery.",
            orderId: newOrder._id,
            order: {
                _id: newOrder._id,
                amount: newOrder.amount,
                status: newOrder.status,
                paymentMethod: 'cod'
            }
        });

    } catch (error) {
        console.error('💵 COD Error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ====================
// ⭐ ADMIN: Confirmer virement bancaire
// ====================
const confirmBankTransfer = async (req, res) => {
    try {
        const { orderId, notes } = req.body;
        const adminId = req.userId;

        console.log('🔐 Admin confirming bank transfer:', orderId);

        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.paymentMethod !== 'bank-transfer') {
            return res.json({ success: false, message: "Not a bank transfer order" });
        }

        if (order.status === 'paid' || order.status === 'completed') {
            return res.json({ success: false, message: "Order already paid" });
        }

        // Mise à jour
        order.status = 'paid';
        order.payment = true;
        order.bankTransferConfirmedAt = new Date();
        order.bankTransferConfirmedBy = adminId;
        if (notes) order.adminNotes = notes;
        
        await order.save();

        console.log('✅ Bank transfer confirmed:', orderId);

        try {
            await emailService.sendPaymentValidatedToClient(order);
            console.log('📧 Payment validation email sent to client');
        } catch (emailError) {
            console.error('⚠️ Validation email error:', emailError.message);
        }

        res.json({ 
            success: true, 
            message: "Bank transfer confirmed. Customer notified.",
            order: {
                _id: order._id,
                status: order.status,
                confirmedAt: order.bankTransferConfirmedAt
            }
        });

    } catch (error) {
        console.error('Confirm error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ====================
// ⭐ ADMIN: Liste des virements en attente
// ====================
const listPendingBankTransfers = async (req, res) => {
    try {
        const orders = await orderModel.find({ 
            paymentMethod: 'bank-transfer',
            status: 'pending_bank_transfer'
        })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email');

        res.json({ 
            success: true, 
            count: orders.length,
            orders: orders.map(o => ({
                _id: o._id,
                reference: o.bankTransferReference,
                amount: o.amount,
                status: o.status,
                createdAt: o.createdAt,
                customer: o.userId,
                address: o.address
            }))
        });

    } catch (error) {
        console.error('List pending error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ====================
// EXISTANT: STRIPE
// ====================
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const origin = req.headers.origin || req.headers.referer || 'http://localhost:5173';

        console.log('Stripe Order - Received:', { userId, itemsCount: items?.length, amount });

        if (!items || items.length === 0) {
            return res.json({ success: false, message: "No items in cart" });
        }

        const enrichedItems = enrichItems(items);
        const formattedAddress = formatAddress(address);

        const orderData = {
            userId,
            items: enrichedItems,
            address: formattedAddress,
            amount: Number(amount),
            paymentMethod: "stripe",
            payment: false,
            status: 'pending',
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        console.log('Stripe Order - Created:', newOrder._id);

        const line_items = enrichedItems.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                    description: `${item.level} - ${item.duration}`,
                    images: item.image && item.image.length > 0 ? [item.image[0]] : []
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity || 1
        }));

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
            customer_email: formattedAddress.email,
            metadata: {
                orderId: newOrder._id.toString(),
                userId: userId.toString()
            }
        });

        newOrder.stripeSessionId = session.id;
        await newOrder.save();

        res.json({ 
            success: true, 
            session_url: session.url,
            orderId: newOrder._id
        });

    } catch (error) {
        console.log('Stripe Error:', error);
        res.json({ success: false, message: error.message });
    }
};

const verifyStripe = async (req, res) => {
    try {
        const { orderId, success, userId } = req.body;

        console.log('Stripe Verify - Received:', { orderId, success, userId });

        if (!orderId) {
            return res.json({ success: false, message: "Order ID required" });
        }

        if (success === "true" || success === true) {
            await orderModel.findByIdAndUpdate(orderId, { 
                payment: true, 
                status: 'completed',
                paymentDate: Date.now()
            });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            
            console.log('Stripe Verify - Payment confirmed');
            res.json({ success: true, message: "Payment verified" });
        } else {
            await orderModel.findByIdAndUpdate(orderId, { 
                status: 'cancelled',
                payment: false
            });
            console.log('Stripe Verify - Payment cancelled');
            res.json({ success: false, message: "Payment cancelled" });
        }
    } catch (error) {
        console.log('Verify Stripe Error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ====================
// EXISTANT: RAZORPAY
// ====================
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        console.log('Razorpay Order - Received:', { userId, itemsCount: items?.length, amount });

        if (!items || items.length === 0) {
            return res.json({ success: false, message: "No items in cart" });
        }

        const enrichedItems = enrichItems(items);
        const formattedAddress = formatAddress(address);

        const orderData = {
            userId,
            items: enrichedItems,
            address: formattedAddress,
            amount: Number(amount),
            paymentMethod: "razorpay",
            payment: false,
            status: 'pending',
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        console.log('Razorpay Order - Created:', newOrder._id);

        const options = {
            amount: Math.round(amount * 100),
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(),
            notes: {
                userId: userId.toString(),
                orderId: newOrder._id.toString()
            }
        };
        
        const order = await razorpayInstance.orders.create(options);
        
        res.json({ 
            success: true, 
            order,
            orderId: newOrder._id
        });

    } catch (error) {
        console.log('Razorpay Error:', error);
        res.json({ success: false, message: error.message });
    }
};

const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        console.log('Razorpay Verify - Received:', { userId, razorpay_order_id });

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.json({ success: false, message: "Missing payment details" });
        }

        const crypto = await import('crypto');
        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.json({ success: false, message: "Invalid payment signature" });
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        
        if (orderInfo.status === 'paid') {
            const order = await orderModel.findOneAndUpdate(
                { _id: orderInfo.receipt },
                { 
                    payment: true, 
                    status: 'completed',
                    paymentId: razorpay_payment_id,
                    paymentDate: Date.now()
                },
                { new: true }
            );

            if (order) {
                await userModel.findByIdAndUpdate(userId, { cartData: {} });
                console.log('Razorpay Verify - Payment confirmed');
                res.json({ success: true, message: "Payment Successful", order });
            } else {
                res.json({ success: false, message: "Order not found" });
            }
        } else {
            res.json({ success: false, message: 'Payment not completed' });
        }

    } catch (error) {
        console.log('Verify Razorpay Error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ====================
// PUBLIC ORDER INFO
// ====================
const getOrderPublic = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await orderModel
      .findById(orderId)
      .select('items amount status createdAt userId')
      .populate('userId', 'name'); 
    
    if (!order) {
      return res.json({ success: false, message: 'Commande non trouvée' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ====================
// AUTRES FONCTIONS
// ====================
const placeOrder = async (req, res) => {
    return placeOrderCOD(req, res);
};

const placeOrderCrypto = async (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: "Crypto payment not implemented yet" 
    });
};

const userOrders = async (req, res) => {
    try {
        const userId = req.userId;
        
        console.log('Fetching orders for user:', userId);

        if (!userId) {
            return res.json({ success: false, message: "User ID required" });
        }

        const orders = await orderModel.find({ userId })
            .sort({ date: -1 })
            .lean();

        console.log(`Found ${orders.length} orders for user ${userId}`);

        const processedOrders = orders.map(order => ({
            ...order,
            _id: order._id.toString(),
            items: order.items.map(item => ({
                ...item,
                name: item.name || item.title || 'Program',
                title: item.title || item.name || 'Program',
                description: item.description || '',
                level: item.level || 'Standard',
                category: item.category || 'Coaching',
                duration: item.duration || '/month',
                price: Number(item.price) || 0,
                quantity: item.quantity || 1,
                icon: item.icon || '📋',
                image: item.image || [],
                features: item.features || []
            })),
            address: {
                ...order.address,
                firstName: order.address?.firstName || '',
                lastName: order.address?.lastName || '',
                email: order.address?.email || '',
                phone: order.address?.phone || '',
                street: order.address?.street || '',
                city: order.address?.city || '',
                country: order.address?.country || ''
            }
        }));

        res.json({ 
            success: true, 
            orders: processedOrders,
            count: processedOrders.length
        });

    } catch (error) {
        console.log('User Orders Error:', error);
        res.json({ success: false, message: error.message });
    }
};

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .sort({ date: -1 })
            .populate('userId', 'name email');
        res.json({ success: true, orders });
    } catch (error) {
        console.log('List Orders Error:', error);
        res.json({ success: false, message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        const validStatuses = [
            'OrderPlaced', 
            'Packing', 
            'Shipped', 
            'Out for delivery', 
            'Delivered',
            'pending',
            'pending_bank_transfer',
            'pending_cod',
            'pending_paypal',
            'completed',
            'paid',
            'cancelled'
        ];
        
        if (!validStatuses.includes(status)) {
            return res.json({ 
                success: false, 
                message: `Invalid status: "${status}"` 
            });
        }

        await orderModel.findByIdAndUpdate(orderId, { status });
        
        res.json({ success: true, message: 'Status Updated' });
        
    } catch (error) {
        console.log('Update Status Error:', error);
        res.json({ success: false, message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.log('Get Order Error:', error);
        res.json({ success: false, message: error.message });
    }
};

export {
    placeOrder,
    placeOrderCOD,
    placeOrderStripe,
    verifyStripe,
    placeOrderRazorpay,
    verifyRazorpay,
    placeOrderBankTransfer,
    placeOrderCrypto,
    placeOrderPayPal,        
    verifyPayPal,            
    confirmBankTransfer,
    listPendingBankTransfers,
    userOrders,
    listOrders,
    updateStatus,
    getOrderById,
    getOrderPublic
};
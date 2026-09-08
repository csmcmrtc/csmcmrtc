import Razorpay from 'razorpay';
import crypto from 'crypto';
import supabase from '../config/supabase.js';

// Lazy initialization of Razorpay instance
let razorpayInstance = null;

const getRazorpay = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpayInstance;
};

// ============================================
// PAYMENT ROUTES
// ============================================

/**
 * Create a Razorpay order
 * POST /api/payments/create-order
 */
export const createPaymentOrder = async (req, res) => {
    try {
        const razorpay = getRazorpay();
        
        const {
            amount,
            currency = 'INR',
            product_id,
            store_id,
            product_name,
            store_name
        } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            notes: {
                product_id: product_id || '',
                store_id: store_id || '',
                product_name: product_name || '',
                store_name: store_name || ''
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            data: {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            }
        });
    } catch (error) {
        console.error('Create payment order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

/**
 * Verify Razorpay payment signature
 * POST /api/payments/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_details
        } = req.body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment verification fields'
            });
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - Invalid signature'
            });
        }

        // Get payment details from Razorpay
        const razorpay = getRazorpay();
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        const amountInRupees = payment.amount / 100;

        // Generate order number
        const orderNumber = 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + 
            Math.random().toString(36).substr(2, 6).toUpperCase();

        // Create order in database
        let orderId = null;
        if (order_details?.store_id && order_details?.product_id) {
            // Calculate order amounts
            const subtotal = order_details.product_price || amountInRupees;
            const deliveryFee = order_details.delivery_fee || 0;
            const taxAmount = Math.round((subtotal + deliveryFee) * 0.05 * 100) / 100; // 5% tax
            const totalAmount = subtotal + deliveryFee + taxAmount;

            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    user_id: req.user?.id || null,
                    store_id: order_details.store_id,
                    subtotal: subtotal,
                    discount_amount: 0,
                    delivery_fee: deliveryFee,
                    tax_amount: taxAmount,
                    total_amount: totalAmount,
                    status: 'confirmed',
                    payment_status: 'paid',
                    payment_method: payment.method === 'upi' ? 'upi' : 
                                   payment.method === 'card' ? 'card' : 
                                   payment.method === 'netbanking' ? 'netbanking' : 
                                   payment.method === 'wallet' ? 'wallet' : 'card',
                    delivery_address: order_details.billing_info?.address || null,
                    delivery_city: null,
                    delivery_pincode: order_details.billing_info?.pincode || null,
                    delivery_phone: order_details.billing_info?.phone || null,
                    confirmed_at: new Date().toISOString()
                })
                .select()
                .single();

            if (orderError) {
                console.error('Error creating order:', orderError);
            } else {
                orderId = order.id;

                // Create order item
                const { error: itemError } = await supabase
                    .from('order_items')
                    .insert({
                        order_id: order.id,
                        product_id: order_details.product_id,
                        product_name: order_details.product_name || 'Product',
                        product_sku: null,
                        product_image: order_details.product_image || null,
                        quantity: 1,
                        unit_price: subtotal,
                        total_price: subtotal
                    });

                if (itemError) {
                    console.error('Error creating order item:', itemError);
                }
            }
        }

        // Payment info is already stored in the orders table via payment_status and razorpay fields

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                db_order_id: orderId,
                order_number: orderNumber,
                status: payment.status,
                amount: amountInRupees,
                method: payment.method
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

/**
 * Get payment details by ID
 * GET /api/payments/:paymentId
 */
export const getPaymentDetails = async (req, res) => {
    try {
        const razorpay = getRazorpay();
        const { paymentId } = req.params;

        const payment = await razorpay.payments.fetch(paymentId);

        res.status(200).json({
            success: true,
            data: {
                id: payment.id,
                amount: payment.amount / 100,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                created_at: new Date(payment.created_at * 1000)
            }
        });
    } catch (error) {
        console.error('Get payment details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment details',
            error: error.message
        });
    }
};

/**
 * Get user's payment history
 * GET /api/payments/history
 */
export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { data: payments, error, count } = await supabase
            .from('payments')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history',
            error: error.message
        });
    }
};

/**
 * Handle Razorpay webhook
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        // Verify webhook signature
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        switch (event) {
            case 'payment.captured':
                // Payment was successful
                console.log('Payment captured:', payload.payment.entity.id);
                // Update order status in database
                break;

            case 'payment.failed':
                // Payment failed
                console.log('Payment failed:', payload.payment.entity.id);
                // Handle failed payment
                break;

            case 'order.paid':
                // Order was paid
                console.log('Order paid:', payload.order.entity.id);
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
};

/**
 * Initiate refund
 * POST /api/payments/:paymentId/refund
 */
export const initiateRefund = async (req, res) => {
    try {
        const razorpay = getRazorpay();
        const { paymentId } = req.params;
        const { amount, reason } = req.body;

        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount ? Math.round(amount * 100) : undefined, // Partial refund in paise
            notes: {
                reason: reason || 'Customer requested refund'
            }
        });

        // Update payment record in database
        await supabase
            .from('payments')
            .update({
                status: 'refunded',
                refund_id: refund.id,
                refund_amount: refund.amount / 100,
                updated_at: new Date().toISOString()
            })
            .eq('razorpay_payment_id', paymentId);

        res.status(200).json({
            success: true,
            message: 'Refund initiated successfully',
            data: {
                refund_id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            }
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate refund',
            error: error.message
        });
    }
};

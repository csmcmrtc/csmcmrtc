import express from 'express';
import {
    createPaymentOrder,
    verifyPayment,
    getPaymentDetails,
    getPaymentHistory,
    handleWebhook,
    initiateRefund
} from '../controllers/PaymentController.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PAYMENT ROUTES
// ============================================

// Create payment order (optional auth - guests can also pay)
router.post('/create-order', optionalAuth, createPaymentOrder);

// Verify payment after completion (optional auth)
router.post('/verify', optionalAuth, verifyPayment);

// Razorpay webhook (no auth - called by Razorpay)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Get payment details by payment ID (requires auth)
router.get('/:paymentId', authenticateUser, getPaymentDetails);

// Get user's payment history (requires auth)
router.get('/history/me', authenticateUser, getPaymentHistory);

// Initiate refund (requires auth - admin only in production)
router.post('/:paymentId/refund', authenticateUser, initiateRefund);

export default router;

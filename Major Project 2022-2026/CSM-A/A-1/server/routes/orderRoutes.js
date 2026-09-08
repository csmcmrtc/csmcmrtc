import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    trackOrder,
    reorder,
    updatePaymentStatus
} from '../controllers/OrderController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ============================================
// USER ORDER ROUTES
// ============================================

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);
router.get('/:id/track', trackOrder);
router.post('/:id/reorder', reorder);
router.patch('/:id/payment-status', updatePaymentStatus);

export default router;

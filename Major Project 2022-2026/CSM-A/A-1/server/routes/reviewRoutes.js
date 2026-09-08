import express from 'express';
import {
    // Public routes
    getProductReviews,
    getStoreReviews,
    // User routes
    createReview,
    getMyReviews,
    updateReview,
    deleteReview,
    canReview
} from '../controllers/ReviewController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

router.get('/product/:productId', getProductReviews);
router.get('/store/:storeId', getStoreReviews);

// ============================================
// USER ROUTES (Authentication required)
// ============================================

router.get('/my', verifyToken, getMyReviews);
router.get('/can-review/:productId', verifyToken, canReview);
router.post('/', verifyToken, createReview);
router.put('/:id', verifyToken, updateReview);
router.delete('/:id', verifyToken, deleteReview);

export default router;

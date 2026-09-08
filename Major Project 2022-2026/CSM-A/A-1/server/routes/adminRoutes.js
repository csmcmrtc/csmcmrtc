import express from 'express';
import {
    // Dashboard
    getDashboardStats,
    getRecentOrders,
    getRecentUsers,
    // Orders
    getAllOrders,
    getOrderById,
    updateOrder,
    // Categories
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    // Reviews
    getAllReviews,
    toggleReviewVisibility,
    deleteReview,
    // Settings
    getSystemSettings
} from '../controllers/AdminController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken, isAdmin);

// ============================================
// DASHBOARD
// ============================================

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-orders', getRecentOrders);
router.get('/dashboard/recent-users', getRecentUsers);

// ============================================
// ORDERS MANAGEMENT
// ============================================

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id', updateOrder);

// ============================================
// CATEGORIES MANAGEMENT
// ============================================

router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ============================================
// REVIEWS MANAGEMENT
// ============================================

router.get('/reviews', getAllReviews);
router.patch('/reviews/:id/toggle-visibility', toggleReviewVisibility);
router.delete('/reviews/:id', deleteReview);

// ============================================
// SYSTEM SETTINGS
// ============================================

router.get('/settings', getSystemSettings);

export default router;

import express from 'express';
import {
    // Public routes
    getActiveStores,
    getStoreById,
    getStoreProducts,
    getStoreReviews,
    // Store admin routes
    getMyStore,
    updateMyStore,
    getMyStoreOrders,
    updateOrderStatus,
    getMyStoreCustomers,
    getMyStoreStats,
    // Admin routes
    getAllStores,
    createStore,
    updateStore,
    deleteStore,
    toggleStoreStatus,
    verifyStore
} from '../controllers/StoreController.js';
import { verifyToken, isAdmin, isStoreAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

router.get('/', getActiveStores);
router.get('/:id', getStoreById);
router.get('/:id/products', getStoreProducts);
router.get('/:id/reviews', getStoreReviews);

// ============================================
// STORE ADMIN ROUTES (Store owners)
// ============================================

router.get('/my/store', verifyToken, isStoreAdmin, getMyStore);
router.put('/my/store', verifyToken, isStoreAdmin, updateMyStore);
router.get('/my/orders', verifyToken, isStoreAdmin, getMyStoreOrders);
router.patch('/my/orders/:orderId/status', verifyToken, isStoreAdmin, updateOrderStatus);
router.get('/my/customers', verifyToken, isStoreAdmin, getMyStoreCustomers);
router.get('/my/stats', verifyToken, isStoreAdmin, getMyStoreStats);

// ============================================
// ADMIN ROUTES (Super Admin)
// ============================================

router.get('/admin/all', verifyToken, isAdmin, getAllStores);
router.post('/admin/create', verifyToken, isAdmin, createStore);
router.put('/admin/:id', verifyToken, isAdmin, updateStore);
router.delete('/admin/:id', verifyToken, isAdmin, deleteStore);
router.patch('/admin/:id/toggle-status', verifyToken, isAdmin, toggleStoreStatus);
router.patch('/admin/:id/verify', verifyToken, isAdmin, verifyStore);

export default router;

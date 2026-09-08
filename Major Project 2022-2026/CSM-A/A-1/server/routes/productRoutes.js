import express from 'express';
import {
    // Public routes
    searchProducts,
    getProductById,
    getFeaturedProducts,
    getProductsByCategory,
    getCategories,
    // Store admin routes
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleFeatured,
    updateStock,
    bulkUpdateProducts,
    getLowStockProducts
} from '../controllers/ProductController.js';
import { verifyToken, isStoreAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// STORE ADMIN ROUTES (must be before /:id to avoid matching)
// ============================================

router.get('/my', verifyToken, isStoreAdmin, getMyProducts);
router.get('/my/low-stock', verifyToken, isStoreAdmin, getLowStockProducts);
router.post('/', verifyToken, isStoreAdmin, createProduct);
router.put('/:id', verifyToken, isStoreAdmin, updateProduct);
router.delete('/:id', verifyToken, isStoreAdmin, deleteProduct);
router.patch('/:id/toggle-status', verifyToken, isStoreAdmin, toggleProductStatus);
router.patch('/:id/toggle-featured', verifyToken, isStoreAdmin, toggleFeatured);
router.patch('/:id/stock', verifyToken, isStoreAdmin, updateStock);
router.patch('/bulk-update', verifyToken, isStoreAdmin, bulkUpdateProducts);

// ============================================
// PUBLIC ROUTES
// ============================================

router.get('/categories', getCategories);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:slug', getProductsByCategory);
router.get('/:id', getProductById);

export default router;

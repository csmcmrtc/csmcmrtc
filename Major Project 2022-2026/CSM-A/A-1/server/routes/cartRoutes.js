import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearStoreCart,
    getCartCount,
    validateCart
} from '../controllers/CartController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

// ============================================
// CART ROUTES
// ============================================

router.get('/', getCart);
router.get('/count', getCartCount);
router.get('/validate', validateCart);
router.post('/add', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeFromCart);
router.delete('/clear', clearCart);
router.delete('/clear/store/:storeId', clearStoreCart);

export default router;

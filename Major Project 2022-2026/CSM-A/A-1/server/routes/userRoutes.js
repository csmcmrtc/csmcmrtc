import express from 'express';
import {
    // Authentication
    register,
    login,
    refreshToken,
    logout,
    // Profile
    getProfile,
    updateProfile,
    changePassword,
    // Admin - User Management
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus
} from '../controllers/UserController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Authentication
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Logout (requires auth to identify user)
router.post('/logout', verifyToken, logout);

// Profile routes (authenticated users)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

// ============================================
// ADMIN ROUTES (Admin authentication required)
// ============================================

router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/:id', verifyToken, isAdmin, getUserById);
router.put('/:id', verifyToken, isAdmin, updateUser);
router.delete('/:id', verifyToken, isAdmin, deleteUser);
router.patch('/:id/toggle-status', verifyToken, isAdmin, toggleUserStatus);

export default router;

import jwt from 'jsonwebtoken';

// Verify JWT token
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Check if user is store admin
export const isStoreAdmin = (req, res, next) => {
    if (req.user.role !== 'store_admin' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Store admin privileges required.'
        });
    }
    next();
};

// Check if user is accessing their own resource or is admin
export const isOwnerOrAdmin = (req, res, next) => {
    const resourceUserId = req.params.id;
    
    if (req.user.id !== resourceUserId && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.'
        });
    }
    next();
};

// Alias for verifyToken (for consistency)
export const authenticateUser = verifyToken;

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without user
        req.user = null;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        // Invalid token, continue without user
        req.user = null;
    }
    
    next();
};

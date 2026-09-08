import supabase from '../config/supabase.js';

// ============================================
// ADMIN DASHBOARD & ANALYTICS
// ============================================

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        const [
            usersResult,
            storesResult,
            ordersResult,
            productsResult
        ] = await Promise.all([
            // Total users
            supabase
                .from('users')
                .select('id, role', { count: 'exact' }),
            
            // Total stores
            supabase
                .from('stores')
                .select('id, is_active', { count: 'exact' }),
            
            // Total orders
            supabase
                .from('orders')
                .select('id, status, total_amount', { count: 'exact' }),
            
            // Total products
            supabase
                .from('products')
                .select('id, status', { count: 'exact' })
        ]);

        // Calculate stats
        const usersByRole = {
            total: usersResult.count || 0,
            users: usersResult.data?.filter(u => u.role === 'user').length || 0,
            store_admins: usersResult.data?.filter(u => u.role === 'store_admin').length || 0,
            admins: usersResult.data?.filter(u => u.role === 'admin').length || 0
        };

        const storeStats = {
            total: storesResult.count || 0,
            active: storesResult.data?.filter(s => s.is_active).length || 0,
            inactive: storesResult.data?.filter(s => !s.is_active).length || 0
        };

        const orderStats = {
            total: ordersResult.count || 0,
            pending: ordersResult.data?.filter(o => o.status === 'pending').length || 0,
            confirmed: ordersResult.data?.filter(o => o.status === 'confirmed').length || 0,
            delivered: ordersResult.data?.filter(o => o.status === 'delivered').length || 0,
            cancelled: ordersResult.data?.filter(o => o.status === 'cancelled').length || 0
        };

        const totalRevenue = ordersResult.data
            ?.filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;

        const productStats = {
            total: productsResult.count || 0,
            active: productsResult.data?.filter(p => p.status === 'active').length || 0,
            inactive: productsResult.data?.filter(p => p.status === 'inactive').length || 0,
            outOfStock: productsResult.data?.filter(p => p.status === 'out-of-stock').length || 0
        };

        res.status(200).json({
            success: true,
            data: {
                users: usersByRole,
                stores: storeStats,
                orders: orderStats,
                products: productStats,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get recent orders (Admin)
export const getRecentOrders = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                user:users(id, name, email),
                store:stores(id, name)
            `)
            .order('ordered_at', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch orders',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get recent orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get recent users (Admin)
export const getRecentUsers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, avatar_url, created_at')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch users',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get recent users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status,
            payment_status,
            store_id,
            user_id,
            search,
            from_date,
            to_date,
            sort_by = 'ordered_at',
            order = 'desc'
        } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('orders')
            .select(`
                *,
                user:users(id, name, email, phone),
                store:stores(id, name),
                items:order_items(*)
            `, { count: 'exact' });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (payment_status) {
            query = query.eq('payment_status', payment_status);
        }
        if (store_id) {
            query = query.eq('store_id', store_id);
        }
        if (user_id) {
            query = query.eq('user_id', user_id);
        }
        if (search) {
            query = query.or(`order_number.ilike.%${search}%,delivery_address.ilike.%${search}%`);
        }
        if (from_date) {
            query = query.gte('ordered_at', from_date);
        }
        if (to_date) {
            query = query.lte('ordered_at', to_date);
        }

        // Sorting and pagination
        query = query.order(sort_by, { ascending: order === 'asc' })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: orders, error, count } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch orders',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get order by ID (Admin)
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                user:users(id, name, email, phone, avatar_url),
                store:stores(id, name, address, phone),
                items:order_items(
                    *,
                    product:products(id, name, image_url)
                )
            `)
            .eq('id', id)
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update order (Admin)
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status, cancellation_reason } = req.body;

        const updateData = {};
        const now = new Date().toISOString();

        if (status) {
            updateData.status = status;
            switch (status) {
                case 'confirmed':
                    updateData.confirmed_at = now;
                    break;
                case 'shipped':
                    updateData.shipped_at = now;
                    break;
                case 'delivered':
                    updateData.delivered_at = now;
                    break;
                case 'cancelled':
                    updateData.cancelled_at = now;
                    if (cancellation_reason) {
                        updateData.cancellation_reason = cancellation_reason;
                    }
                    break;
            }
        }

        if (payment_status) {
            updateData.payment_status = payment_status;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const { data: order, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update order',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// CATEGORY MANAGEMENT (Admin)
// ============================================

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const { include_inactive = false } = req.query;

        let query = supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (include_inactive !== 'true') {
            query = query.eq('is_active', true);
        }

        const { data: categories, error } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch categories',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Create category
export const createCategory = async (req, res) => {
    try {
        const { name, slug, description, image_url, parent_id, sort_order = 0 } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: 'Name and slug are required'
            });
        }

        const { data: category, error } = await supabase
            .from('categories')
            .insert({
                name,
                slug,
                description,
                image_url,
                parent_id,
                sort_order,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    message: 'Category with this slug already exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to create category',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, image_url, parent_id, sort_order, is_active } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (slug !== undefined) updateData.slug = slug;
        if (description !== undefined) updateData.description = description;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (parent_id !== undefined) updateData.parent_id = parent_id;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const { data: category, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update category',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete category',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// REVIEWS MANAGEMENT (Admin)
// ============================================

// Get all reviews
export const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, store_id, product_id, rating, is_visible } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('reviews')
            .select(`
                *,
                user:users(id, name, email, avatar_url),
                store:stores(id, name),
                product:products(id, name, image_url)
            `, { count: 'exact' });

        if (store_id) {
            query = query.eq('store_id', store_id);
        }
        if (product_id) {
            query = query.eq('product_id', product_id);
        }
        if (rating) {
            query = query.eq('rating', parseInt(rating));
        }
        if (is_visible !== undefined) {
            query = query.eq('is_visible', is_visible === 'true');
        }

        query = query.order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: reviews, error, count } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch reviews',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Toggle review visibility
export const toggleReviewVisibility = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: review, error: fetchError } = await supabase
            .from('reviews')
            .select('is_visible')
            .eq('id', id)
            .single();

        if (fetchError || !review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const { data: updatedReview, error } = await supabase
            .from('reviews')
            .update({ is_visible: !review.is_visible })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to toggle review visibility',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: `Review ${updatedReview.is_visible ? 'shown' : 'hidden'} successfully`,
            data: updatedReview
        });
    } catch (error) {
        console.error('Toggle review visibility error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete review',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// SYSTEM SETTINGS (Admin) - Placeholder
// ============================================

export const getSystemSettings = async (req, res) => {
    try {
        // Placeholder - implement actual settings table if needed
        res.status(200).json({
            success: true,
            data: {
                appName: 'JustSearch',
                version: '1.0.0',
                maintenanceMode: false,
                allowRegistration: true,
                allowStoreRegistration: true
            }
        });
    } catch (error) {
        console.error('Get system settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

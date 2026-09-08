import supabase from '../config/supabase.js';

// ============================================
// PUBLIC STORE ROUTES
// ============================================

// Get all active stores (public)
export const getActiveStores = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            type, 
            city, 
            search,
            sort_by = 'created_at',
            order = 'desc'
        } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('stores')
            .select('*', { count: 'exact' })
            .eq('is_active', true);

        // Apply filters
        if (type) {
            query = query.eq('type', type);
        }
        if (city) {
            query = query.ilike('city', `%${city}%`);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Sorting
        query = query.order(sort_by, { ascending: order === 'asc' });

        // Pagination
        query = query.range(offset, offset + parseInt(limit) - 1);

        const { data: stores, error, count } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch stores',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: {
                stores,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get active stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get store by ID (public)
export const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: store, error } = await supabase
            .from('stores')
            .select(`
                *,
                owner:users!stores_owner_id_fkey(id, name, email, avatar_url)
            `)
            .eq('id', id)
            .single();

        if (error || !store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        res.status(200).json({
            success: true,
            data: store
        });
    } catch (error) {
        console.error('Get store by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get store products (public)
export const getStoreProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            page = 1, 
            limit = 20, 
            category, 
            search,
            status = 'active',
            featured,
            sort_by = 'created_at',
            order = 'desc'
        } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('products')
            .select(`
                *,
                category:categories(id, name, slug)
            `, { count: 'exact' })
            .eq('store_id', id);

        // Apply filters
        if (status !== 'all') {
            query = query.eq('status', status);
        }
        if (category) {
            query = query.eq('category_id', category);
        }
        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
        }

        // Sorting
        query = query.order(sort_by, { ascending: order === 'asc' });

        // Pagination
        query = query.range(offset, offset + parseInt(limit) - 1);

        const { data: products, error, count } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch products',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get store products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get store reviews (public)
export const getStoreReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { data: reviews, error, count } = await supabase
            .from('reviews')
            .select(`
                *,
                user:users(id, name, avatar_url)
            `, { count: 'exact' })
            .eq('store_id', id)
            .eq('is_visible', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

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
        console.error('Get store reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// STORE ADMIN ROUTES (Store owners)
// ============================================

// Get current user's store
export const getMyStore = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: store, error } = await supabase
            .from('stores')
            .select(`
                *,
                owner:users!stores_owner_id_fkey(id, name, email, phone)
            `)
            .eq('owner_id', userId)
            .single();

        if (error || !store) {
            return res.status(404).json({
                success: false,
                message: 'You do not have a store'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                store
            }
        });
    } catch (error) {
        console.error('Get my store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update my store
export const updateMyStore = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            description,
            address,
            city,
            state,
            pincode,
            phone,
            email,
            logo_url,
            banner_url,
            delivery_available,
            delivery_time,
            delivery_fee,
            min_order_amount,
            opening_time,
            closing_time,
            working_days
        } = req.body;

        // Build update object
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (pincode !== undefined) updateData.pincode = pincode;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (logo_url !== undefined) updateData.logo_url = logo_url;
        if (banner_url !== undefined) updateData.banner_url = banner_url;
        if (delivery_available !== undefined) updateData.delivery_available = delivery_available;
        if (delivery_time !== undefined) updateData.delivery_time = delivery_time;
        if (delivery_fee !== undefined) updateData.delivery_fee = delivery_fee;
        if (min_order_amount !== undefined) updateData.min_order_amount = min_order_amount;
        if (opening_time !== undefined) updateData.opening_time = opening_time;
        if (closing_time !== undefined) updateData.closing_time = closing_time;
        if (working_days !== undefined) updateData.working_days = working_days;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const { data: store, error } = await supabase
            .from('stores')
            .update(updateData)
            .eq('owner_id', userId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update store',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Store updated successfully',
            data: store
        });
    } catch (error) {
        console.error('Update my store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get my store's orders
export const getMyStoreOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            page = 1, 
            limit = 10, 
            status,
            payment_status,
            search,
            from_date,
            to_date
        } = req.query;
        const offset = (page - 1) * limit;

        // First get the store
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', userId)
            .single();

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        let query = supabase
            .from('orders')
            .select(`
                *,
                user:users(id, name, email, phone),
                items:order_items(*)
            `, { count: 'exact' })
            .eq('store_id', store.id);

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (payment_status) {
            query = query.eq('payment_status', payment_status);
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

        query = query.order('ordered_at', { ascending: false })
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
        console.error('Get my store orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { status, cancellation_reason } = req.body;

        // Verify store ownership
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', userId)
            .single();

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        // Verify order belongs to store
        const { data: order } = await supabase
            .from('orders')
            .select('id, status')
            .eq('id', orderId)
            .eq('store_id', store.id)
            .single();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Build update data
        const updateData = { status };
        const now = new Date().toISOString();

        // Set timestamp based on status
        switch (status) {
            case 'confirmed':
                updateData.confirmed_at = now;
                break;
            case 'shipped':
                updateData.shipped_at = now;
                break;
            case 'delivered':
                updateData.delivered_at = now;
                updateData.payment_status = 'paid';
                break;
            case 'cancelled':
                updateData.cancelled_at = now;
                updateData.cancellation_reason = cancellation_reason;
                break;
        }

        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
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
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get my store's customers
export const getMyStoreCustomers = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, tier, status, search } = req.query;
        const offset = (page - 1) * limit;

        // Get store
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', userId)
            .single();

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        let query = supabase
            .from('customers')
            .select(`
                *,
                user:users(id, name, email, phone, avatar_url)
            `, { count: 'exact' })
            .eq('store_id', store.id);

        if (tier) {
            query = query.eq('tier', tier);
        }
        if (status) {
            query = query.eq('status', status);
        }

        query = query.order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: customers, error, count } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch customers',
                error: error.message
            });
        }

        // Filter by search if provided (search in user data)
        let filteredCustomers = customers;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredCustomers = customers.filter(c => 
                c.user?.name?.toLowerCase().includes(searchLower) ||
                c.user?.email?.toLowerCase().includes(searchLower)
            );
        }

        res.status(200).json({
            success: true,
            data: {
                customers: filteredCustomers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get my store customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get my store's stats/dashboard
export const getMyStoreStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get store
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', userId)
            .single();

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        // Get various stats
        const [
            ordersResult,
            productsResult,
            customersResult,
            revenueResult
        ] = await Promise.all([
            // Total orders
            supabase
                .from('orders')
                .select('id', { count: 'exact' })
                .eq('store_id', store.id),
            
            // Total products
            supabase
                .from('products')
                .select('id', { count: 'exact' })
                .eq('store_id', store.id),
            
            // Total customers
            supabase
                .from('customers')
                .select('id', { count: 'exact' })
                .eq('store_id', store.id),
            
            // Total revenue (delivered orders)
            supabase
                .from('orders')
                .select('total_amount')
                .eq('store_id', store.id)
                .eq('status', 'delivered')
        ]);

        // Calculate revenue
        const totalRevenue = revenueResult.data?.reduce((sum, order) => 
            sum + parseFloat(order.total_amount || 0), 0) || 0;

        // Get pending orders count
        const { count: pendingOrders } = await supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('store_id', store.id)
            .eq('status', 'pending');

        // Get low stock products - fetch all products and filter in JavaScript
        const { data: allProducts } = await supabase
            .from('products')
            .select('id, name, stock, min_stock, category')
            .eq('store_id', store.id);

        // Filter products where stock is less than min_stock
        const lowStockProducts = (allProducts || []).filter(
            product => product.stock < (product.min_stock || 10)
        );

        res.status(200).json({
            success: true,
            data: {
                totalOrders: ordersResult.count || 0,
                totalProducts: productsResult.count || 0,
                totalCustomers: customersResult.count || 0,
                totalRevenue,
                pendingOrders: pendingOrders || 0,
                lowStockProducts: lowStockProducts || []
            }
        });
    } catch (error) {
        console.error('Get my store stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// ADMIN ROUTES (Super Admin)
// ============================================

// Get all stores (Admin)
export const getAllStores = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            type, 
            is_active,
            is_verified,
            search,
            sort_by = 'created_at',
            order = 'desc'
        } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('stores')
            .select(`
                *,
                owner:users!stores_owner_id_fkey(id, name, email)
            `, { count: 'exact' });

        // Apply filters
        if (type) {
            query = query.eq('type', type);
        }
        if (is_active !== undefined) {
            query = query.eq('is_active', is_active === 'true');
        }
        if (is_verified !== undefined) {
            query = query.eq('is_verified', is_verified === 'true');
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Sorting
        query = query.order(sort_by, { ascending: order === 'asc' });

        // Pagination
        query = query.range(offset, offset + parseInt(limit) - 1);

        const { data: stores, error, count } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch stores',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: {
                stores,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Create store (Admin)
export const createStore = async (req, res) => {
    try {
        const {
            owner_id,
            name,
            type = 'local',
            description,
            address,
            city,
            state,
            pincode,
            phone,
            email,
            logo_url,
            banner_url,
            delivery_available = true,
            delivery_time,
            delivery_fee = 0,
            min_order_amount = 0,
            opening_time,
            closing_time,
            working_days
        } = req.body;

        // Validate required fields
        if (!name || !address || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name, address, phone and email are required'
            });
        }

        // If owner_id provided, verify user exists and update their role
        if (owner_id) {
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, role')
                .eq('id', owner_id)
                .single();

            if (userError || !user) {
                return res.status(404).json({
                    success: false,
                    message: 'Owner user not found'
                });
            }

            // Update user role to store_admin
            await supabase
                .from('users')
                .update({ role: 'store_admin' })
                .eq('id', owner_id);
        }

        const { data: store, error } = await supabase
            .from('stores')
            .insert({
                owner_id,
                name,
                type,
                description,
                address,
                city,
                state,
                pincode,
                phone,
                email,
                logo_url,
                banner_url,
                delivery_available,
                delivery_time,
                delivery_fee,
                min_order_amount,
                opening_time,
                closing_time,
                working_days,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create store',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: store
        });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update store (Admin)
export const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Remove fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.created_at;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const { data: store, error } = await supabase
            .from('stores')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update store',
                error: error.message
            });
        }

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Store updated successfully',
            data: store
        });
    } catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete store (Admin)
export const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;

        // Get store to find owner
        const { data: store } = await supabase
            .from('stores')
            .select('owner_id')
            .eq('id', id)
            .single();

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        // Delete the store
        const { error } = await supabase
            .from('stores')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete store',
                error: error.message
            });
        }

        // Revert owner's role to user if they don't have other stores
        if (store.owner_id) {
            const { count } = await supabase
                .from('stores')
                .select('id', { count: 'exact' })
                .eq('owner_id', store.owner_id);

            if (count === 0) {
                await supabase
                    .from('users')
                    .update({ role: 'user' })
                    .eq('id', store.owner_id);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Store deleted successfully'
        });
    } catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Toggle store status (Admin)
export const toggleStoreStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Get current status
        const { data: store, error: fetchError } = await supabase
            .from('stores')
            .select('is_active')
            .eq('id', id)
            .single();

        if (fetchError || !store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        // Toggle status
        const { data: updatedStore, error } = await supabase
            .from('stores')
            .update({ is_active: !store.is_active })
            .eq('id', id)
            .select('id, name, is_active')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to toggle store status',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: `Store ${updatedStore.is_active ? 'activated' : 'deactivated'} successfully`,
            data: updatedStore
        });
    } catch (error) {
        console.error('Toggle store status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Verify store (Admin)
export const verifyStore = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;

        const { data: store, error } = await supabase
            .from('stores')
            .update({ is_verified: is_verified !== false })
            .eq('id', id)
            .select('id, name, is_verified')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to verify store',
                error: error.message
            });
        }

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Store ${store.is_verified ? 'verified' : 'unverified'} successfully`,
            data: store
        });
    } catch (error) {
        console.error('Verify store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

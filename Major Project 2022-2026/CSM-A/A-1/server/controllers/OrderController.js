import supabase from '../config/supabase.js';

// ============================================
// USER ORDER ROUTES
// ============================================

// Create order
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            store_id,
            items, // Array of { product_id, quantity }
            delivery_address,
            delivery_city,
            delivery_pincode,
            delivery_phone,
            delivery_instructions,
            payment_method = 'cash'
        } = req.body;

        // Validate required fields
        if (!store_id || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Store ID and items are required'
            });
        }

        if (!delivery_address || !delivery_phone) {
            return res.status(400).json({
                success: false,
                message: 'Delivery address and phone are required'
            });
        }

        // Verify store exists and is active
        const { data: store } = await supabase
            .from('stores')
            .select('id, name, delivery_fee, min_order_amount, is_active')
            .eq('id', store_id)
            .single();

        if (!store || !store.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Store not found or inactive'
            });
        }

        // Get product details and validate
        const productIds = items.map(item => item.product_id);
        const { data: products } = await supabase
            .from('products')
            .select('id, name, sku, price, stock, image_url, status')
            .eq('store_id', store_id)
            .in('id', productIds);

        if (!products || products.length !== items.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more products not found'
            });
        }

        // Validate stock and calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = products.find(p => p.id === item.product_id);
            
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.product_id} not found`
                });
            }

            if (product.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: `Product "${product.name}" is not available`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Available: ${product.stock}`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                product_sku: product.sku,
                product_image: product.image_url,
                quantity: item.quantity,
                unit_price: product.price,
                total_price: itemTotal
            });
        }

        // Check minimum order amount
        if (store.min_order_amount && subtotal < store.min_order_amount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount is ₹${store.min_order_amount}`
            });
        }

        // Calculate totals
        const deliveryFee = store.delivery_fee || 0;
        const taxAmount = 0; // Calculate tax if needed
        const discountAmount = 0; // Apply discounts if needed
        const totalAmount = subtotal + deliveryFee + taxAmount - discountAmount;

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                store_id,
                subtotal,
                discount_amount: discountAmount,
                delivery_fee: deliveryFee,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                status: 'pending',
                payment_status: 'pending',
                payment_method,
                delivery_address,
                delivery_city,
                delivery_pincode,
                delivery_phone,
                delivery_instructions
            })
            .select()
            .single();

        if (orderError) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create order',
                error: orderError.message
            });
        }

        // Create order items
        const orderItemsWithOrderId = orderItems.map(item => ({
            ...item,
            order_id: order.id
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsWithOrderId);

        if (itemsError) {
            // Rollback order
            await supabase.from('orders').delete().eq('id', order.id);
            return res.status(500).json({
                success: false,
                message: 'Failed to create order items',
                error: itemsError.message
            });
        }

        // Update product stock
        for (const item of items) {
            const product = products.find(p => p.id === item.product_id);
            const newStock = product.stock - item.quantity;
            
            await supabase
                .from('products')
                .update({ 
                    stock: newStock,
                    status: newStock === 0 ? 'out-of-stock' : 'active'
                })
                .eq('id', item.product_id);
        }

        // Update store total orders
        await supabase
            .from('stores')
            .update({ total_orders: store.total_orders + 1 })
            .eq('id', store_id);

        // Create or update customer record
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id, total_orders, total_spent')
            .eq('user_id', userId)
            .eq('store_id', store_id)
            .single();

        if (existingCustomer) {
            await supabase
                .from('customers')
                .update({
                    total_orders: existingCustomer.total_orders + 1,
                    total_spent: parseFloat(existingCustomer.total_spent) + totalAmount,
                    last_order_date: new Date().toISOString()
                })
                .eq('id', existingCustomer.id);
        } else {
            await supabase
                .from('customers')
                .insert({
                    user_id: userId,
                    store_id,
                    total_orders: 1,
                    total_spent: totalAmount,
                    last_order_date: new Date().toISOString()
                });
        }

        // Clear cart items for ordered products
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .in('product_id', productIds);

        // Fetch complete order with items
        const { data: completeOrder } = await supabase
            .from('orders')
            .select(`
                *,
                store:stores(id, name, phone),
                items:order_items(*)
            `)
            .eq('id', order.id)
            .single();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: completeOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user's orders
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            page = 1, 
            limit = 10, 
            status,
            from_date,
            to_date
        } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('orders')
            .select(`
                *,
                store:stores(id, name, logo_url, phone),
                items:order_items(
                    *,
                    product:products(id, name, image_url)
                )
            `, { count: 'exact' })
            .eq('user_id', userId);

        if (status) {
            query = query.eq('status', status);
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
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                store:stores(id, name, address, phone, logo_url),
                items:order_items(
                    *,
                    product:products(id, name, image_url, price)
                )
            `)
            .eq('id', id)
            .eq('user_id', userId)
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

// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { cancellation_reason } = req.body;

        // Get order
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(product_id, quantity)
            `)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Update order status
        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancellation_reason: cancellation_reason || 'Cancelled by customer'
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to cancel order',
                error: error.message
            });
        }

        // Restore product stock
        for (const item of order.items) {
            const { data: product } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single();

            if (product) {
                await supabase
                    .from('products')
                    .update({ 
                        stock: product.stock + item.quantity,
                        status: 'active'
                    })
                    .eq('id', item.product_id);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Track order
export const trackOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                status,
                payment_status,
                ordered_at,
                confirmed_at,
                shipped_at,
                delivered_at,
                cancelled_at,
                store:stores(id, name, phone)
            `)
            .eq('id', id)
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Build tracking timeline
        const timeline = [
            {
                status: 'pending',
                label: 'Order Placed',
                timestamp: order.ordered_at,
                completed: true
            },
            {
                status: 'confirmed',
                label: 'Order Confirmed',
                timestamp: order.confirmed_at,
                completed: !!order.confirmed_at
            },
            {
                status: 'shipped',
                label: 'Shipped',
                timestamp: order.shipped_at,
                completed: !!order.shipped_at
            },
            {
                status: 'delivered',
                label: 'Delivered',
                timestamp: order.delivered_at,
                completed: !!order.delivered_at
            }
        ];

        if (order.cancelled_at) {
            timeline.push({
                status: 'cancelled',
                label: 'Cancelled',
                timestamp: order.cancelled_at,
                completed: true
            });
        }

        res.status(200).json({
            success: true,
            data: {
                order_number: order.order_number,
                current_status: order.status,
                payment_status: order.payment_status,
                store: order.store,
                timeline
            }
        });
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Reorder (create order from previous order)
export const reorder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Get previous order
        const { data: previousOrder } = await supabase
            .from('orders')
            .select(`
                store_id,
                delivery_address,
                delivery_city,
                delivery_pincode,
                delivery_phone,
                payment_method,
                items:order_items(product_id, quantity)
            `)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!previousOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Forward to createOrder with previous order data
        req.body = {
            store_id: previousOrder.store_id,
            items: previousOrder.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            })),
            delivery_address: previousOrder.delivery_address,
            delivery_city: previousOrder.delivery_city,
            delivery_pincode: previousOrder.delivery_pincode,
            delivery_phone: previousOrder.delivery_phone,
            payment_method: previousOrder.payment_method
        };

        return createOrder(req, res);
    } catch (error) {
        console.error('Reorder error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update payment status (for payment gateway callback)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, transaction_id } = req.body;

        const { data: order, error } = await supabase
            .from('orders')
            .update({ 
                payment_status,
                // You can add transaction_id field to schema if needed
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update payment status',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment status updated',
            data: order
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

import supabase from '../config/supabase.js';

// ============================================
// CART MANAGEMENT
// ============================================

// Get cart items
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select(`
                *,
                product:products(
                    id,
                    name,
                    price,
                    original_price,
                    image_url,
                    stock,
                    status,
                    unit,
                    store:stores(id, name, is_active, delivery_fee, min_order_amount)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch cart',
                error: error.message
            });
        }

        // Filter out items with unavailable products
        const validItems = cartItems.filter(item => 
            item.product && 
            item.product.status === 'active' && 
            item.product.store?.is_active
        );

        // Group items by store
        const groupedByStore = validItems.reduce((acc, item) => {
            const storeId = item.product.store.id;
            if (!acc[storeId]) {
                acc[storeId] = {
                    store: item.product.store,
                    items: [],
                    subtotal: 0
                };
            }
            const itemTotal = item.product.price * item.quantity;
            acc[storeId].items.push({
                ...item,
                item_total: itemTotal
            });
            acc[storeId].subtotal += itemTotal;
            return acc;
        }, {});

        // Calculate totals
        const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = validItems.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0
        );

        res.status(200).json({
            success: true,
            data: {
                items: validItems,
                grouped_by_store: Object.values(groupedByStore),
                summary: {
                    total_items: totalItems,
                    total_amount: totalAmount,
                    item_count: validItems.length
                }
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Verify product exists and is available
        const { data: product } = await supabase
            .from('products')
            .select(`
                id, name, price, stock, status,
                store:stores(id, is_active)
            `)
            .eq('id', product_id)
            .single();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.status !== 'active' || !product.store?.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        // Check if item already in cart
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', userId)
            .eq('product_id', product_id)
            .single();

        let cartItem;
        let newQuantity = quantity;

        if (existingItem) {
            // Update quantity
            newQuantity = existingItem.quantity + quantity;

            // Check stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available in stock`
                });
            }

            const { data, error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id)
                .select(`
                    *,
                    product:products(id, name, price, image_url)
                `)
                .single();

            if (error) throw error;
            cartItem = data;
        } else {
            // Check stock
            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available in stock`
                });
            }

            // Add new item
            const { data, error } = await supabase
                .from('cart_items')
                .insert({
                    user_id: userId,
                    product_id,
                    quantity
                })
                .select(`
                    *,
                    product:products(id, name, price, image_url)
                `)
                .single();

            if (error) throw error;
            cartItem = data;
        }

        res.status(200).json({
            success: true,
            message: existingItem ? 'Cart updated' : 'Item added to cart',
            data: cartItem
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        // If quantity is 0, remove item
        if (quantity === 0) {
            return removeFromCart(req, res);
        }

        // Get cart item with product info
        const { data: cartItem } = await supabase
            .from('cart_items')
            .select(`
                id,
                product:products(id, stock, status)
            `)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // Check stock
        if (quantity > cartItem.product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${cartItem.product.stock} items available in stock`
            });
        }

        const { data: updatedItem, error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', id)
            .select(`
                *,
                product:products(id, name, price, image_url)
            `)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update cart item',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cart item updated',
            data: updatedItem
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to remove item from cart',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Clear entire cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to clear cart',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Clear cart items from specific store
export const clearStoreCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId } = req.params;

        // Get product IDs from the store
        const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('store_id', storeId);

        if (!products || products.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No items to clear'
            });
        }

        const productIds = products.map(p => p.id);

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .in('product_id', productIds);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to clear store cart',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Store cart cleared successfully'
        });
    } catch (error) {
        console.error('Clear store cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get cart count
export const getCartCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to get cart count',
                error: error.message
            });
        }

        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        res.status(200).json({
            success: true,
            data: {
                count: totalItems,
                unique_items: cartItems.length
            }
        });
    } catch (error) {
        console.error('Get cart count error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Validate cart (check stock and availability)
export const validateCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select(`
                id,
                quantity,
                product:products(
                    id,
                    name,
                    price,
                    stock,
                    status,
                    store:stores(id, name, is_active)
                )
            `)
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to validate cart',
                error: error.message
            });
        }

        const issues = [];
        const validItems = [];

        for (const item of cartItems) {
            if (!item.product) {
                issues.push({
                    cart_item_id: item.id,
                    type: 'product_not_found',
                    message: 'Product no longer exists'
                });
                continue;
            }

            if (!item.product.store?.is_active) {
                issues.push({
                    cart_item_id: item.id,
                    product_id: item.product.id,
                    product_name: item.product.name,
                    type: 'store_inactive',
                    message: 'Store is currently inactive'
                });
                continue;
            }

            if (item.product.status !== 'active') {
                issues.push({
                    cart_item_id: item.id,
                    product_id: item.product.id,
                    product_name: item.product.name,
                    type: 'product_unavailable',
                    message: 'Product is not available'
                });
                continue;
            }

            if (item.quantity > item.product.stock) {
                issues.push({
                    cart_item_id: item.id,
                    product_id: item.product.id,
                    product_name: item.product.name,
                    type: 'insufficient_stock',
                    message: `Only ${item.product.stock} available`,
                    available_stock: item.product.stock,
                    requested_quantity: item.quantity
                });
                continue;
            }

            validItems.push(item);
        }

        res.status(200).json({
            success: true,
            data: {
                is_valid: issues.length === 0,
                valid_items: validItems.length,
                issues
            }
        });
    } catch (error) {
        console.error('Validate cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

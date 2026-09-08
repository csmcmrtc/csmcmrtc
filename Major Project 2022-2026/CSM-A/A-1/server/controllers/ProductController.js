import supabase from '../config/supabase.js';

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

const toRad = (deg) => deg * (Math.PI / 180);

// ============================================
// PUBLIC PRODUCT ROUTES
// ============================================

// Search products across all stores
export const searchProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            q,           // Alias for search (from frontend)
            category,
            min_price,
            max_price,
            store_id,
            featured,
            sort_by = 'created_at',
            order = 'desc',
            lat,      // User latitude
            lng,      // User longitude
            radius = 2 // Default 2km radius
        } = req.query;
        
        const searchTerm = search || q; // Support both 'search' and 'q' params
        const offset = (page - 1) * limit;

        let query = supabase
            .from('products')
            .select(`
                *,
                store:stores!inner(id, name, is_active, city, rating, latitude, longitude, address, delivery_time, delivery_fee),
                category:categories(id, name, slug)
            `, { count: 'exact' })
            .eq('status', 'active')
            .eq('stores.is_active', true);

        // Apply filters
        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
        }
        if (category) {
            query = query.eq('category_id', category);
        }
        if (store_id) {
            query = query.eq('store_id', store_id);
        }
        if (min_price) {
            query = query.gte('price', parseFloat(min_price));
        }
        if (max_price) {
            query = query.lte('price', parseFloat(max_price));
        }
        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        // Sorting
        query = query.order(sort_by, { ascending: order === 'asc' });

        const { data: products, error, count } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to search products',
                error: error.message
            });
        }

        // Filter by distance if user location is provided
        let filteredProducts = products;
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const maxRadius = parseFloat(radius);

            filteredProducts = products
                .map(product => {
                    if (product.store?.latitude && product.store?.longitude) {
                        const distance = calculateDistance(
                            userLat,
                            userLng,
                            parseFloat(product.store.latitude),
                            parseFloat(product.store.longitude)
                        );
                        return { ...product, distance: Math.round(distance * 10) / 10 }; // Round to 1 decimal
                    }
                    return { ...product, distance: null };
                })
                .filter(product => {
                    // Include products within radius, or if store has no location (online stores)
                    if (product.distance === null) return true;
                    return product.distance <= maxRadius;
                })
                .sort((a, b) => {
                    // Sort by distance if available
                    if (a.distance !== null && b.distance !== null) {
                        return a.distance - b.distance;
                    }
                    return 0;
                });
        }

        // Apply pagination after distance filtering
        const paginatedProducts = filteredProducts.slice(offset, offset + parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                products: paginatedProducts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: filteredProducts.length,
                    totalPages: Math.ceil(filteredProducts.length / limit)
                },
                location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) } : null
            }
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: product, error } = await supabase
            .from('products')
            .select(`
                *,
                store:stores(id, name, address, phone, rating, is_active),
                category:categories(id, name, slug)
            `)
            .eq('id', id)
            .single();

        if (error || !product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all active categories (public)
export const getCategories = async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name, slug, image_url, is_active')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

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
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                store:stores!inner(id, name, is_active),
                category:categories(id, name, slug)
            `)
            .eq('status', 'active')
            .eq('is_featured', true)
            .eq('stores.is_active', true)
            .order('rating', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch featured products',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 20, sort_by = 'created_at', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;

        // Get category by slug
        const { data: category } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('slug', slug)
            .single();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        let query = supabase
            .from('products')
            .select(`
                *,
                store:stores!inner(id, name, is_active),
                category:categories(id, name, slug)
            `, { count: 'exact' })
            .eq('category_id', category.id)
            .eq('status', 'active')
            .eq('stores.is_active', true);

        query = query.order(sort_by, { ascending: order === 'asc' })
            .range(offset, offset + parseInt(limit) - 1);

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
                category,
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
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// STORE ADMIN PRODUCT ROUTES
// ============================================

// Get my store's products
export const getMyProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            page = 1,
            limit = 20,
            status,
            category,
            search,
            featured,
            low_stock,
            sort_by = 'created_at',
            order = 'desc'
        } = req.query;
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
            .from('products')
            .select(`
                *,
                category:categories(id, name, slug)
            `, { count: 'exact' })
            .eq('store_id', store.id);

        // Apply filters
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        if (category) {
            query = query.eq('category_id', category);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }
        // Note: low_stock filtering will be done after fetching
        // since Supabase doesn't support comparing columns directly

        // Sorting
        query = query.order(sort_by, { ascending: order === 'asc' });

        // Pagination
        query = query.range(offset, offset + parseInt(limit) - 1);

        let { data: products, error, count } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch products',
                error: error.message
            });
        }

        // Filter low stock products in JavaScript if requested
        if (low_stock === 'true' && products) {
            products = products.filter(p => p.stock < (p.min_stock || 10));
            count = products.length;
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
        console.error('Get my products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Create product
export const createProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            sku,
            name,
            description,
            category_id,
            price,
            original_price,
            stock = 0,
            min_stock = 5,
            unit = 'piece',
            image_url,
            images,
            is_featured = false,
            tags
        } = req.body;

        // Validate required fields
        if (!sku || !name || !price) {
            return res.status(400).json({
                success: false,
                message: 'SKU, name, and price are required'
            });
        }

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

        // Check for duplicate SKU in store
        const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('store_id', store.id)
            .eq('sku', sku)
            .single();

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: 'A product with this SKU already exists in your store'
            });
        }

        // Determine status
        let status = 'active';
        if (stock === 0) {
            status = 'out-of-stock';
        }

        const { data: product, error } = await supabase
            .from('products')
            .insert({
                store_id: store.id,
                category_id,
                sku,
                name,
                description,
                price,
                original_price,
                stock,
                min_stock,
                unit,
                image_url,
                images,
                status,
                is_featured,
                tags
            })
            .select(`
                *,
                category:categories(id, name, slug)
            `)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create product',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = { ...req.body };

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.store_id;
        delete updateData.created_at;

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

        // Verify product belongs to store
        const { data: existingProduct } = await supabase
            .from('products')
            .select('id, stock')
            .eq('id', id)
            .eq('store_id', store.id)
            .single();

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Auto-update status based on stock
        if (updateData.stock !== undefined) {
            if (updateData.stock === 0) {
                updateData.status = 'out-of-stock';
            } else if (existingProduct.stock === 0 && updateData.stock > 0) {
                updateData.status = 'active';
            }
        }

        const { data: product, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .eq('store_id', store.id)
            .select(`
                *,
                category:categories(id, name, slug)
            `)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update product',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

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

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('store_id', store.id);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete product',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Toggle product status
export const toggleProductStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

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

        // Get current product
        const { data: product } = await supabase
            .from('products')
            .select('id, status, stock')
            .eq('id', id)
            .eq('store_id', store.id)
            .single();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Toggle status
        let newStatus;
        if (product.status === 'active') {
            newStatus = 'inactive';
        } else if (product.stock === 0) {
            newStatus = 'out-of-stock';
        } else {
            newStatus = 'active';
        }

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update({ status: newStatus })
            .eq('id', id)
            .select('id, name, status')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to toggle product status',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
            data: updatedProduct
        });
    } catch (error) {
        console.error('Toggle product status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Toggle featured status
export const toggleFeatured = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

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

        // Get current product
        const { data: product } = await supabase
            .from('products')
            .select('id, is_featured')
            .eq('id', id)
            .eq('store_id', store.id)
            .single();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update({ is_featured: !product.is_featured })
            .eq('id', id)
            .select('id, name, is_featured')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to toggle featured status',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: `Product ${updatedProduct.is_featured ? 'featured' : 'unfeatured'} successfully`,
            data: updatedProduct
        });
    } catch (error) {
        console.error('Toggle featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update stock
export const updateStock = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { stock, operation } = req.body; // operation: 'set', 'add', 'subtract'

        if (stock === undefined || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid stock value is required'
            });
        }

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

        // Get current product
        const { data: product } = await supabase
            .from('products')
            .select('id, stock')
            .eq('id', id)
            .eq('store_id', store.id)
            .single();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Calculate new stock
        let newStock;
        switch (operation) {
            case 'add':
                newStock = product.stock + stock;
                break;
            case 'subtract':
                newStock = Math.max(0, product.stock - stock);
                break;
            default:
                newStock = stock;
        }

        // Determine status
        const newStatus = newStock === 0 ? 'out-of-stock' : 'active';

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update({ stock: newStock, status: newStatus })
            .eq('id', id)
            .select('id, name, stock, status')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update stock',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Bulk update products
export const bulkUpdateProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_ids, update_data } = req.body;

        if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs array is required'
            });
        }

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

        // Remove sensitive fields
        const safeUpdateData = { ...update_data };
        delete safeUpdateData.id;
        delete safeUpdateData.store_id;
        delete safeUpdateData.created_at;
        delete safeUpdateData.sku;

        const { data: products, error } = await supabase
            .from('products')
            .update(safeUpdateData)
            .eq('store_id', store.id)
            .in('id', product_ids)
            .select('id, name, status, is_featured');

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update products',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: `${products.length} products updated successfully`,
            data: products
        });
    } catch (error) {
        console.error('Bulk update products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
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

        const { data: products, error } = await supabase
            .from('products')
            .select('id, name, sku, stock, min_stock, image_url, status')
            .eq('store_id', store.id)
            .or('stock.lt.min_stock,status.eq.out-of-stock')
            .order('stock', { ascending: true });

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch low stock products',
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get low stock products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

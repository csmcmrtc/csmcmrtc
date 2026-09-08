import supabase from '../config/supabase.js';

// ============================================
// PUBLIC REVIEW ROUTES
// ============================================

// Get product reviews
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, rating } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('reviews')
            .select(`
                *,
                user:users(id, name, avatar_url)
            `, { count: 'exact' })
            .eq('product_id', productId)
            .eq('is_visible', true);

        if (rating) {
            query = query.eq('rating', parseInt(rating));
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

        // Get rating breakdown
        const { data: allReviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', productId)
            .eq('is_visible', true);

        const ratingBreakdown = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };

        let totalRating = 0;
        allReviews?.forEach(r => {
            ratingBreakdown[r.rating]++;
            totalRating += r.rating;
        });

        const averageRating = allReviews?.length 
            ? (totalRating / allReviews.length).toFixed(1) 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                reviews,
                summary: {
                    average_rating: parseFloat(averageRating),
                    total_reviews: count,
                    rating_breakdown: ratingBreakdown
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get store reviews
export const getStoreReviews = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { page = 1, limit = 10, rating } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('reviews')
            .select(`
                *,
                user:users(id, name, avatar_url),
                product:products(id, name, image_url)
            `, { count: 'exact' })
            .eq('store_id', storeId)
            .eq('is_visible', true);

        if (rating) {
            query = query.eq('rating', parseInt(rating));
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

        // Get rating summary
        const { data: allReviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('store_id', storeId)
            .eq('is_visible', true);

        const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalRating = 0;

        allReviews?.forEach(r => {
            ratingBreakdown[r.rating]++;
            totalRating += r.rating;
        });

        const averageRating = allReviews?.length 
            ? (totalRating / allReviews.length).toFixed(1) 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                reviews,
                summary: {
                    average_rating: parseFloat(averageRating),
                    total_reviews: count,
                    rating_breakdown: ratingBreakdown
                },
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
// USER REVIEW ROUTES
// ============================================

// Create review
export const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, store_id, order_id, rating, title, comment } = req.body;

        // Validate required fields
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        if (!product_id && !store_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID or Store ID is required'
            });
        }

        // Check if user has already reviewed this product
        if (product_id) {
            const { data: existingReview } = await supabase
                .from('reviews')
                .select('id')
                .eq('user_id', userId)
                .eq('product_id', product_id)
                .single();

            if (existingReview) {
                return res.status(409).json({
                    success: false,
                    message: 'You have already reviewed this product'
                });
            }
        }

        // Verify purchase if order_id provided
        let isVerifiedPurchase = false;
        if (order_id) {
            const { data: order } = await supabase
                .from('orders')
                .select('id, status')
                .eq('id', order_id)
                .eq('user_id', userId)
                .eq('status', 'delivered')
                .single();

            isVerifiedPurchase = !!order;
        }

        // Get store_id from product if not provided
        let finalStoreId = store_id;
        if (product_id && !store_id) {
            const { data: product } = await supabase
                .from('products')
                .select('store_id')
                .eq('id', product_id)
                .single();
            
            if (product) {
                finalStoreId = product.store_id;
            }
        }

        // Create review
        const { data: review, error } = await supabase
            .from('reviews')
            .insert({
                user_id: userId,
                product_id,
                store_id: finalStoreId,
                order_id,
                rating,
                title,
                comment,
                is_verified_purchase: isVerifiedPurchase,
                is_visible: true
            })
            .select(`
                *,
                user:users(id, name, avatar_url)
            `)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create review',
                error: error.message
            });
        }

        // Update product rating
        if (product_id) {
            await updateProductRating(product_id);
        }

        // Update store rating
        if (finalStoreId) {
            await updateStoreRating(finalStoreId);
        }

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user's reviews
export const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { data: reviews, error, count } = await supabase
            .from('reviews')
            .select(`
                *,
                product:products(id, name, image_url),
                store:stores(id, name)
            `, { count: 'exact' })
            .eq('user_id', userId)
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
        console.error('Get my reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update review
export const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { rating, title, comment } = req.body;

        // Validate rating
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const updateData = {};
        if (rating !== undefined) updateData.rating = rating;
        if (title !== undefined) updateData.title = title;
        if (comment !== undefined) updateData.comment = comment;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        // Get review to verify ownership
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('id, product_id, store_id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .update(updateData)
            .eq('id', id)
            .select(`
                *,
                user:users(id, name, avatar_url)
            `)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update review',
                error: error.message
            });
        }

        // Update ratings if rating changed
        if (rating !== undefined) {
            if (existingReview.product_id) {
                await updateProductRating(existingReview.product_id);
            }
            if (existingReview.store_id) {
                await updateStoreRating(existingReview.store_id);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });
    } catch (error) {
        console.error('Update review error:', error);
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
        const userId = req.user.id;
        const { id } = req.params;

        // Get review to verify ownership and get IDs for rating update
        const { data: review } = await supabase
            .from('reviews')
            .select('id, product_id, store_id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

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

        // Update ratings
        if (review.product_id) {
            await updateProductRating(review.product_id);
        }
        if (review.store_id) {
            await updateStoreRating(review.store_id);
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

// Check if user can review a product
export const canReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        // Check if already reviewed
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (existingReview) {
            return res.status(200).json({
                success: true,
                data: {
                    can_review: false,
                    reason: 'already_reviewed',
                    existing_review_id: existingReview.id
                }
            });
        }

        // Check if user has purchased this product
        const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
                id,
                order:orders!inner(id, user_id, status)
            `)
            .eq('product_id', productId)
            .eq('orders.user_id', userId)
            .eq('orders.status', 'delivered');

        const hasPurchased = orderItems && orderItems.length > 0;

        res.status(200).json({
            success: true,
            data: {
                can_review: true,
                has_purchased: hasPurchased,
                is_verified_purchase: hasPurchased
            }
        });
    } catch (error) {
        console.error('Can review error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Update product rating
async function updateProductRating(productId) {
    try {
        const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', productId)
            .eq('is_visible', true);

        if (!reviews || reviews.length === 0) {
            await supabase
                .from('products')
                .update({ rating: 0, total_ratings: 0 })
                .eq('id', productId);
            return;
        }

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);

        await supabase
            .from('products')
            .update({ 
                rating: parseFloat(averageRating), 
                total_ratings: reviews.length 
            })
            .eq('id', productId);
    } catch (error) {
        console.error('Update product rating error:', error);
    }
}

// Update store rating
async function updateStoreRating(storeId) {
    try {
        const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('store_id', storeId)
            .eq('is_visible', true);

        if (!reviews || reviews.length === 0) {
            await supabase
                .from('stores')
                .update({ rating: 0, total_ratings: 0 })
                .eq('id', storeId);
            return;
        }

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);

        await supabase
            .from('stores')
            .update({ 
                rating: parseFloat(averageRating), 
                total_ratings: reviews.length 
            })
            .eq('id', storeId);
    } catch (error) {
        console.error('Update store rating error:', error);
    }
}

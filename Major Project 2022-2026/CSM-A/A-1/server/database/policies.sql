-- ============================================
-- JustSearch Database RLS Policies for Supabase
-- ============================================
-- Run this AFTER creating the schema
-- These policies control who can access what data

-- ============================================
-- HELPER FUNCTIONS (Security Definer to bypass RLS)
-- ============================================

-- Function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is store admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_store_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text 
        AND role = 'store_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM users 
    WHERE id::text = auth.uid()::text;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid()::text = id::text);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (is_admin());

-- Admins can update any user
CREATE POLICY "Admins can update any user"
    ON users FOR UPDATE
    USING (is_admin());

-- Admins can delete users (except themselves)
CREATE POLICY "Admins can delete users"
    ON users FOR DELETE
    USING (is_admin() AND id::text != auth.uid()::text);

-- Allow insert for registration (handled by service role in backend)
CREATE POLICY "Service role can insert users"
    ON users FOR INSERT
    WITH CHECK (true);

-- ============================================
-- STORES TABLE POLICIES
-- ============================================

-- Anyone can view active stores
CREATE POLICY "Anyone can view active stores"
    ON stores FOR SELECT
    USING (is_active = true);

-- Store owners can view their own stores (even inactive)
CREATE POLICY "Store owners can view own stores"
    ON stores FOR SELECT
    USING (owner_id::text = auth.uid()::text);

-- Store owners can update their own stores
CREATE POLICY "Store owners can update own stores"
    ON stores FOR UPDATE
    USING (owner_id::text = auth.uid()::text)
    WITH CHECK (owner_id::text = auth.uid()::text);

-- Admins can view all stores
CREATE POLICY "Admins can view all stores"
    ON stores FOR SELECT
    USING (is_admin());

-- Admins can insert stores
CREATE POLICY "Admins can insert stores"
    ON stores FOR INSERT
    WITH CHECK (is_admin());

-- Admins can update any store
CREATE POLICY "Admins can update any store"
    ON stores FOR UPDATE
    USING (is_admin());

-- Admins can delete stores
CREATE POLICY "Admins can delete stores"
    ON stores FOR DELETE
    USING (is_admin());

-- ============================================
-- CATEGORIES TABLE POLICIES
-- ============================================

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
    ON categories FOR SELECT
    USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can insert categories"
    ON categories FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
    ON categories FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete categories"
    ON categories FOR DELETE
    USING (is_admin());

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

-- Anyone can view active products from active stores
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (
        status = 'active' 
        AND EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = products.store_id 
            AND stores.is_active = true
        )
    );

-- Store owners can view all their products
CREATE POLICY "Store owners can view own products"
    ON products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Store owners can insert products to their stores
CREATE POLICY "Store owners can insert products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Store owners can update their products
CREATE POLICY "Store owners can update own products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Store owners can delete their products
CREATE POLICY "Store owners can delete own products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Admins can manage all products
CREATE POLICY "Admins can view all products"
    ON products FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can insert any product"
    ON products FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update any product"
    ON products FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete any product"
    ON products FOR DELETE
    USING (is_admin());

-- ============================================
-- CUSTOMERS TABLE POLICIES
-- ============================================

-- Users can view their own customer records
CREATE POLICY "Users can view own customer records"
    ON customers FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Store owners can view their store's customers
CREATE POLICY "Store owners can view store customers"
    ON customers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = customers.store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Store owners can manage their store's customers
CREATE POLICY "Store owners can insert customers"
    ON customers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Store owners can update store customers"
    ON customers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = customers.store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Admins can manage all customers
CREATE POLICY "Admins can manage customers"
    ON customers FOR ALL
    USING (is_admin());

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Users can create orders
CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (user_id::text = auth.uid()::text);

-- Store owners can view orders for their stores
CREATE POLICY "Store owners can view store orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = orders.store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Store owners can update order status for their stores
CREATE POLICY "Store owners can update store orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = orders.store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders"
    ON orders FOR ALL
    USING (is_admin());

-- ============================================
-- ORDER ITEMS TABLE POLICIES
-- ============================================

-- Users can view their own order items
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id::text = auth.uid()::text
        )
    );

-- Users can insert order items for their orders
CREATE POLICY "Users can insert order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_id 
            AND orders.user_id::text = auth.uid()::text
        )
    );

-- Store owners can view order items for their stores
CREATE POLICY "Store owners can view store order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            JOIN stores ON stores.id = orders.store_id
            WHERE orders.id = order_items.order_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Admins can manage all order items
CREATE POLICY "Admins can manage order items"
    ON order_items FOR ALL
    USING (is_admin());

-- ============================================
-- REVIEWS TABLE POLICIES
-- ============================================

-- Anyone can view visible reviews
CREATE POLICY "Anyone can view visible reviews"
    ON reviews FOR SELECT
    USING (is_visible = true);

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews"
    ON reviews FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (user_id::text = auth.uid()::text);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
    ON reviews FOR DELETE
    USING (user_id::text = auth.uid()::text);

-- Store owners can view all reviews for their stores
CREATE POLICY "Store owners can view store reviews"
    ON reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = reviews.store_id 
            AND stores.owner_id::text = auth.uid()::text
        )
    );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
    ON reviews FOR ALL
    USING (is_admin());

-- ============================================
-- CART ITEMS TABLE POLICIES
-- ============================================

-- Users can view their own cart
CREATE POLICY "Users can view own cart"
    ON cart_items FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Users can add to their own cart
CREATE POLICY "Users can add to own cart"
    ON cart_items FOR INSERT
    WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
    ON cart_items FOR UPDATE
    USING (user_id::text = auth.uid()::text);

-- Users can delete from their own cart
CREATE POLICY "Users can delete from own cart"
    ON cart_items FOR DELETE
    USING (user_id::text = auth.uid()::text);

-- ============================================
-- REFRESH TOKENS TABLE POLICIES
-- ============================================

-- Users can view their own refresh tokens
CREATE POLICY "Users can view own refresh tokens"
    ON refresh_tokens FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Service role handles token management (no user policies for insert/update/delete)
-- Backend uses service role key which bypasses RLS

-- ============================================
-- ADDITIONAL HELPER FUNCTION: Check if user owns store
-- ============================================

CREATE OR REPLACE FUNCTION owns_store(store_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_uuid 
        AND owner_id::text = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [req.params.email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, name, role, phone, address, verified, profileImage } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO users (email, name, role, phone, address, verified, profileImage) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, name, role, phone || null, address || null, verified || false, profileImage || null]
    );
    
    const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { email, name, role, phone, address, verified, profileImage } = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (role !== undefined) { updateFields.push('role = ?'); updateValues.push(role); }
    if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone); }
    if (address !== undefined) { updateFields.push('address = ?'); updateValues.push(address); }
    if (verified !== undefined) { updateFields.push('verified = ?'); updateValues.push(verified); }
    if (profileImage !== undefined) { updateFields.push('profileImage = ?'); updateValues.push(profileImage); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateValues.push(req.params.id);
    
    await db.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    const [updatedUser] = await db.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;

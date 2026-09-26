const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM organizations ORDER BY createdAt DESC');
    
    const organizations = rows.map(org => ({
      ...org,
      documents: JSON.parse(org.documents || '[]')
    }));
    
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM organizations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    const org = {
      ...rows[0],
      documents: JSON.parse(rows[0].documents || '[]')
    };
    
    res.json(org);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Create organization
router.post('/', async (req, res) => {
  try {
    const { name, type, email, phone, address, description, verified, documents, userId } = req.body;
    
    const [result] = await db.execute(
      `INSERT INTO organizations (name, type, email, phone, address, description, verified, documents, userId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        type,
        email,
        phone,
        address,
        description,
        verified || false,
        JSON.stringify(documents || []),
        userId
      ]
    );
    
    const [newOrg] = await db.execute('SELECT * FROM organizations WHERE id = ?', [result.insertId]);
    const org = {
      ...newOrg[0],
      documents: JSON.parse(newOrg[0].documents || '[]')
    };
    
    res.status(201).json(org);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Update organization
router.put('/:id', async (req, res) => {
  try {
    const { name, type, email, phone, address, description, verified, documents, userId } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (type !== undefined) { updateFields.push('type = ?'); updateValues.push(type); }
    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
    if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone); }
    if (address !== undefined) { updateFields.push('address = ?'); updateValues.push(address); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (verified !== undefined) { updateFields.push('verified = ?'); updateValues.push(verified); }
    if (documents !== undefined) { updateFields.push('documents = ?'); updateValues.push(JSON.stringify(documents)); }
    if (userId !== undefined) { updateFields.push('userId = ?'); updateValues.push(userId); }
    
    updateValues.push(req.params.id);
    
    await db.execute(
      `UPDATE organizations SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    const [updatedOrg] = await db.execute('SELECT * FROM organizations WHERE id = ?', [req.params.id]);
    if (updatedOrg.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    const org = {
      ...updatedOrg[0],
      documents: JSON.parse(updatedOrg[0].documents || '[]')
    };
    
    res.json(org);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

module.exports = router;

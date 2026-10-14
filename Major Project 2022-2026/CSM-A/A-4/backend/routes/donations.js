const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Get all donations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM donations ORDER BY createdAt DESC');
    
    // Parse JSON fields
    const donations = rows.map(donation => ({
      ...donation,
      images: JSON.parse(donation.images || '[]'),
      aiAssessment: donation.aiAssessment ? JSON.parse(donation.aiAssessment) : null
    }));
    
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM donations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    const donation = {
      ...rows[0],
      images: JSON.parse(rows[0].images || '[]'),
      aiAssessment: rows[0].aiAssessment ? JSON.parse(rows[0].aiAssessment) : null
    };
    
    res.json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({ error: 'Failed to fetch donation' });
  }
});

// Get donations by donor ID
router.get('/donor/:donorId', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM donations WHERE donorId = ? ORDER BY createdAt DESC', [req.params.donorId]);
    
    const donations = rows.map(donation => ({
      ...donation,
      images: JSON.parse(donation.images || '[]'),
      aiAssessment: donation.aiAssessment ? JSON.parse(donation.aiAssessment) : null
    }));
    
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Create donation
router.post('/', async (req, res) => {
  try {
    const {
      donorId,
      donorName,
      title,
      description,
      category,
      quantity,
      expiryDate,
      pickupLocation,
      images,
      status,
      aiAssessment,
      assignedBeneficiary
    } = req.body;
    
    const [result] = await db.execute(
      `INSERT INTO donations 
       (donorId, donorName, title, description, category, quantity, expiryDate, pickupLocation, images, status, aiAssessment, assignedBeneficiary) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        donorId,
        donorName,
        title,
        description,
        category,
        quantity,
        expiryDate,
        pickupLocation,
        JSON.stringify(images || []),
        status || 'pending',
        aiAssessment ? JSON.stringify(aiAssessment) : null,
        assignedBeneficiary || null
      ]
    );
    
    const [newDonation] = await db.execute('SELECT * FROM donations WHERE id = ?', [result.insertId]);
    const donation = {
      ...newDonation[0],
      images: JSON.parse(newDonation[0].images || '[]'),
      aiAssessment: newDonation[0].aiAssessment ? JSON.parse(newDonation[0].aiAssessment) : null
    };
    
    res.status(201).json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Update donation
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      donorId,
      donorName,
      title,
      description,
      category,
      quantity,
      expiryDate,
      pickupLocation,
      images,
      status,
      aiAssessment,
      assignedBeneficiary
    } = req.body;

    // Authorization rules:
    // - Admin can update delivery statuses: pending, approved, delivered, rejected (and review).
    // - Beneficiary/Partner can set pickup status `in_transit` for their own assignment.
    const requesterRole = req.auth.role;
    const requesterId = req.auth.userId;

    const deliveryStatusesAdminOnly = ['pending', 'approved', 'delivered', 'rejected', 'review'];
    if (status !== undefined) {
      if (deliveryStatusesAdminOnly.includes(status)) {
        if (requesterRole !== 'admin') {
          return res.status(403).json({ error: 'Admin access required for this status update' });
        }
      } else if (status === 'in_transit') {
        if (!['beneficiary', 'partner'].includes(requesterRole)) {
          return res.status(403).json({ error: 'Not allowed to set delivery in_transit' });
        }
        const assignedBeneficiaryId = assignedBeneficiary !== undefined ? Number(assignedBeneficiary) : null;
        if (!assignedBeneficiaryId || assignedBeneficiaryId !== requesterId) {
          return res.status(403).json({ error: 'assignedBeneficiary must match the authenticated user' });
        }
      } else {
        // Should be covered by ENUM validation in DB, but return a clean 400 instead of a 500.
        return res.status(400).json({ error: 'Invalid status value' });
      }
    }

    // Non-admins are only allowed to update their pickup request assignment + pickup status.
    if (requesterRole !== 'admin') {
      const allowedNonAdminFields = new Set(['status', 'assignedBeneficiary']);
      for (const key of Object.keys(req.body || {})) {
        if (!allowedNonAdminFields.has(key)) {
          return res.status(403).json({ error: 'Not allowed to update this donation field' });
        }
      }
    }

    const validStatuses = ['pending', 'review', 'approved', 'rejected', 'in_transit', 'delivered'];
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (donorId !== undefined) { updateFields.push('donorId = ?'); updateValues.push(donorId); }
    if (donorName !== undefined) { updateFields.push('donorName = ?'); updateValues.push(donorName); }
    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
    if (quantity !== undefined) { updateFields.push('quantity = ?'); updateValues.push(quantity); }
    if (expiryDate !== undefined) { updateFields.push('expiryDate = ?'); updateValues.push(expiryDate); }
    if (pickupLocation !== undefined) { updateFields.push('pickupLocation = ?'); updateValues.push(pickupLocation); }
    if (images !== undefined) { updateFields.push('images = ?'); updateValues.push(JSON.stringify(images)); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (aiAssessment !== undefined) { updateFields.push('aiAssessment = ?'); updateValues.push(JSON.stringify(aiAssessment)); }
    if (assignedBeneficiary !== undefined) { updateFields.push('assignedBeneficiary = ?'); updateValues.push(assignedBeneficiary); }
    
    updateFields.push('updatedAt = NOW()');
    updateValues.push(req.params.id);
    
    await db.execute(
      `UPDATE donations SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    const [updatedDonation] = await db.execute('SELECT * FROM donations WHERE id = ?', [req.params.id]);
    if (updatedDonation.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    const donation = {
      ...updatedDonation[0],
      images: JSON.parse(updatedDonation[0].images || '[]'),
      aiAssessment: updatedDonation[0].aiAssessment ? JSON.parse(updatedDonation[0].aiAssessment) : null
    };
    
    res.json(donation);
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ error: 'Failed to update donation' });
  }
});

module.exports = router;

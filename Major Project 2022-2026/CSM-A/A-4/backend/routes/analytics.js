const express = require('express');
const router = express.Router();
const db = require('../db');

// Get analytics
router.get('/', async (req, res) => {
  try {
    // Get total donations
    const [donationCount] = await db.execute('SELECT COUNT(*) as count FROM donations');
    const totalDonations = donationCount[0].count;
    
    // Get active donors (users with role 'donor')
    const [donorCount] = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'donor'");
    const activeDonors = donorCount[0].count;
    
    // Get beneficiaries served (users with role 'beneficiary')
    const [beneficiaryCount] = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'beneficiary'");
    const beneficiariesServed = beneficiaryCount[0].count;
    
    // Get total food saved (sum of quantities)
    const [foodSaved] = await db.execute('SELECT SUM(quantity) as total FROM donations');
    const foodSavedTotal = foodSaved[0].total || 0;
    
    // Calculate impact score (simple calculation)
    const impactScore = Math.min(100, Math.round((totalDonations * 10 + activeDonors * 5 + beneficiariesServed * 3) / 10));
    
    res.json({
      totalDonations,
      activeDonors,
      beneficiariesServed,
      foodSaved: foodSavedTotal,
      impactScore
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// Get chat history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM chat_messages WHERE userId = ? ORDER BY timestamp ASC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Create chat message
router.post('/', async (req, res) => {
  try {
    const { userId, message, response } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO chat_messages (userId, message, response) VALUES (?, ?, ?)',
      [userId, message, response]
    );
    
    const [newMessage] = await db.execute('SELECT * FROM chat_messages WHERE id = ?', [result.insertId]);
    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Error creating chat message:', error);
    res.status(500).json({ error: 'Failed to create chat message' });
  }
});

module.exports = router;

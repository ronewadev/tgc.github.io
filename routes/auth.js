const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Firestore query for user by username
    const userSnapshot = await db.collection('users').where('username', '==', username).get();
    if (userSnapshot.empty) return res.status(400).json({ message: 'Invalid credentials' });
    const user = userSnapshot.docs[0].data();
    user.id = userSnapshot.docs[0].id;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });
    const user = userDoc.data();
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
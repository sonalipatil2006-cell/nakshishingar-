const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendRegistrationSuccessEmail } = require('../utils/sendEmail');

// Temporary OTP store (in-memory)
const otpStore = {};

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    console.log(`[Register] Attempt for email: ${email}`);
    
    let user = await User.findOne({ email });
    if (user) {
      console.log(`[Register] User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ fullName, email, mobile, password: hashedPassword });
    await user.save();
    console.log(`[Register] User saved successfully: ${email}`);

    // Send successful registration email
    try {
      await sendRegistrationSuccessEmail(email, fullName);
    } catch (emailErr) {
      console.error('[Register] Failed to send registration email:', emailErr.message);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user._id, fullName, email, mobile } });
  } catch (error) {
    console.error('Register error details:', error);
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, mobile: user.mobile, dob: user.dob, address: user.address } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    console.log(`[OTP] Request for ${email} (${fullName})`);
    
    if (!email) {
      console.log('[OTP] Email missing in request');
      return res.status(400).json({ message: 'Email is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    console.log(`[OTP] Sending email to ${email}...`);
    await sendOTPEmail(email, otp, fullName);
    console.log(`[OTP] Email sent successfully to ${email}`);

    res.json({ message: 'OTP sent to your email successfully' });
  } catch (err) {
    console.error('[OTP] Error in send-otp route:', err);
    res.status(500).json({ message: 'Failed to send OTP: ' + err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: 'OTP not found. Please request again.' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: 'OTP expired. Please request again.' });
    }
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    
    delete otpStore[email]; // Clear after successful verify
    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { dob, address } = req.body;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (dob) user.dob = dob;
    if (address) user.address = { ...user.address, ...address };

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, fullName: user.fullName, email: user.email, mobile: user.mobile, dob: user.dob, address: user.address } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

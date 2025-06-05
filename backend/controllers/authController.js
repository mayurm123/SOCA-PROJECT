const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

//
exports.getUser = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
//



exports.register = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role
    });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful', role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
  
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // should be true in production (HTTPS)
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
};

exports.checkAuth = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true, user: decoded });
  } catch (err) {
    return res.json({ authenticated: false });
  }
};

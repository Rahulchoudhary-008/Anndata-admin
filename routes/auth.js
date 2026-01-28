const express = require('express');
const router = express.Router();
const User = require('../models/User');


// Signup GET
router.get('/signup', (req, res) => {
  res.render('auth/signup', { message: null });
});

// Signup POST
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.render('auth/signup', { message: 'Email already registered!' });
    }

    const user = new User({ name, email, password, role });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.log(error);
    res.render('auth/signup', { message: 'Something went wrong!' });
  }
});

// Login page
router.get('/login', (req, res) => res.render('auth/login'));

// Login submit
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.render('auth/login', { message: 'Invalid credentials' });
  }

  req.session.user = {
    id: user._id,
    name: user.name,
    role: user.role,
  };

  if (user.role === 'admin') {
    res.redirect('/admin');
  } else {
    res.redirect('/user/home');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;

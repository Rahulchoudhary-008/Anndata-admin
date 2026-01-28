const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please login');
    return res.redirect('/login');
  }
  next();
}
router.use(requireAuth);

// Dashboard
router.get('/', async (req, res) => {
  const usersCount = await User.countDocuments({ role: { $ne: 'admin' } });
  const productsCount = await Product.countDocuments();
  res.render('admin/dashboard', { usersCount, productsCount });
});

// User management
router.get('/users', async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
  res.render('admin/users', { users });
});
router.get('/users/new', (req, res) => res.render('admin/user_form', { user: {} }));
router.post('/users',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', 'Invalid form');
      return res.redirect('/admin/users/new');
    }
    await User.create(req.body);
    req.flash('success', 'User created');
    res.redirect('/admin/users');
  }
);
router.get('/users/:id/edit', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('admin/user_form', { user });
});
router.put('/users/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  req.flash('success', 'User updated');
  res.redirect('/admin/users');
});
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  req.flash('success', 'User deleted');
  res.redirect('/admin/users');
});

// Product management
router.get('/products', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render('admin/products', { products });
});
router.get('/products/new', (req, res) => res.render('admin/product_form', { product: {} }));
router.post('/products',
  body('name').notEmpty(),
  body('price').isNumeric(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.redirect('/admin/products/new');
    const payload = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      discount: parseFloat(req.body.discount || 0),
      stock: parseInt(req.body.stock || 0),
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    };
    await Product.create(payload);
    req.flash('success', 'Product created');
    res.redirect('/admin/products');
  }
);
router.get('/products/:id/edit', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('admin/product_form', { product });
});
router.put('/products/:id', async (req, res) => {
  const payload = req.body;
  payload.tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [];
  await Product.findByIdAndUpdate(req.params.id, payload);
  req.flash('success', 'Product updated');
  res.redirect('/admin/products');
});
router.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  req.flash('success', 'Product deleted');
  res.redirect('/admin/products');
});

module.exports = router;

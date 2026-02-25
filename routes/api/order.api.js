const express = require('express')
const Order = require('../../models/Order')
const Cart = require('../../models/Cart')
const auth = require('../../middleware/jwtAuth')

const router = express.Router()

// ======================
// CREATE ORDER (CHECKOUT)
// ======================
router.post('/create', auth, async (req, res) => {
  const { address } = req.body

  if (!address)
    return res.status(400).json({ message: 'address required' })

  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product')

  if (!cart || cart.items.length === 0)
    return res.status(400).json({ message: 'cart empty' })

  let total = 0

  const orderItems = cart.items.map(item => {
    total += item.product.price * item.qty

    return {
      product: item.product._id,
      qty: item.qty,
      price: item.product.price
    }
  })

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalAmount: total,
    address
  })

  // clear cart after order
  cart.items = []
  await cart.save()

  res.json({
    message: 'order created successfully',
    order
  })
})

// ======================
// GET MY ORDERS
// ======================
router.get('/', auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product')
    .sort({ createdAt: -1 })

  res.json(orders)
})

module.exports = router

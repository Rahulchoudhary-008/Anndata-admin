const express = require('express')
const mongoose = require('mongoose')
const Cart = require('../../models/Cart')
const auth = require('../../middleware/jwtAuth')

const router = express.Router()

// ==========================
// ADD / UPDATE CART
// ==========================
router.post('/add', auth, async (req, res) => {
  const { productId, qty } = req.body

  if (!productId || qty <= 0)
    return res.status(400).json({ message: 'invalid input' })

  if (!mongoose.Types.ObjectId.isValid(productId))
    return res.status(400).json({ message: 'invalid product id' })

  const pid = new mongoose.Types.ObjectId(productId)

  let cart = await Cart.findOne({ user: req.user.id })

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [{ product: pid, qty }]
    })
  } else {
    const index = cart.items.findIndex(
      i => i.product.toString() === productId
    )

    if (index > -1) {
      cart.items[index].qty += qty
    } else {
      cart.items.push({ product: pid, qty })
    }

    await cart.save()
  }

  res.json(cart)
})

// ==========================
// GET CART
// ==========================
router.get('/', auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product')

  // res.json({test: 'cart api'})
  res.json(cart || { items: [] })

})

// ==========================
// REMOVE ITEM
// ==========================
router.delete('/remove/:productId', auth, async (req, res) => {
  const { productId } = req.params

  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) return res.status(404).json({ message: 'cart not found' })

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  )

  await cart.save()
  res.json(cart)
})

// ==========================
// CLEAR CART
// ==========================
router.delete('/clear', auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) return res.status(404).json({ message: 'cart not found' })

  cart.items = []
  await cart.save()

  res.json({ message: 'cart cleared' })
})

// ==========================
// UPDATE ITEM QUANTITY
// ==========================
router.put('/update', auth, async (req, res) => {
  const { productId, qty } = req.body

  const cart = await Cart.findOne({ user: req.user.id })

  const item = cart.items.find(
    i => i.product.toString() === productId
  )

  if (!item) return res.status(404).json({ message: 'item not found' })

  if (qty <= 0) {
    cart.items = cart.items.filter(
      i => i.product.toString() !== productId
    )
  } else {
    item.qty = qty
  }

  await cart.save()
  res.json(cart)
})


module.exports = router
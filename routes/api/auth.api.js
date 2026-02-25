const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')

const router = express.Router()

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body

  const exists = await User.findOne({ email })
  if (exists)
    return res.status(400).json({ message: 'email already exists' })

  const user = await User.create({
    name,
    email,
    password,
    role: 'user'
  })

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  })
})


router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Check email or password' })

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  })
})

module.exports = router

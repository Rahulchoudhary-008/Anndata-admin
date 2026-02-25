const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        qty: Number,
        price: Number
      }
    ],
    totalAmount: Number,
    status: {
      type: String,
      default: 'placed'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)

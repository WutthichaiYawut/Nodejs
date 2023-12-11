const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    ProName: String,
    quantity: Number,
    price: Number,
    order: Number
  },{
    timestamps: true
  });


module.exports = mongoose.model('products', productSchema);

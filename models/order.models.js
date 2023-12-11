const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    OrderName: String,
    cusName: String

  },{
    timestamps: true
  });


module.exports = mongoose.model('order', userSchema);

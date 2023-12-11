const mongoose = require('mongoose')

const regisSchema = new mongoose.Schema({
    username: String,
    password: String,
    approve: Boolean,
    fname: String,
    lname: String,
    email: String,
    tel: String,
    address: String

  },{
    timestamps: true
  });


module.exports = mongoose.model('registers', regisSchema);

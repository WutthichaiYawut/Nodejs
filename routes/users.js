var express = require('express');
var router = express.Router();
const verfyToken = require('../middleware/jwt_decoded');
const productModels = require('../models/product.models');
const { default: mongoose } = require('mongoose');
let registerModels = require('../models/register.models');
let productSchema = require('../models/product.models');
let bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


/* Login */
router.post('/login', async function(req, res, next) {
  try{

  let { password, username} = req.body;
  let ur = await registerModels.findOne({
    username: username
  });

    if(!ur){
      return res.status(500).send({
        message: "login fail",
        success: false
      });
    }
    let checkPassword = await bcrypt.compare(password, ur.password);
    
    if(!checkPassword){
      return res.status(500).send({
        message: "pass fail",
        success: false
      });
    }
    if(!ur.approve){
      return res.status(500).send({
        message: "No Approve!",
        success: false
      });
    }
      const {_id, fname, lname, email, approve} = ur;
      const token = jwt.sign({_id, fname, lname, email, approve}, process.env.JWT_KEY);
      return res.status(201).send({
      data: {_id, fname, lname, email, approve, token},
      message: "login success",
      success: true
    });
    

  }catch (error){
    return res.status(500).send({
      message: "login false",
      success: false
    })
  }
});
/* Register */
router.post('/regis',verfyToken, async function(req, res, next) {
  try{
    let body = req.body
    const { username, password, fname, lname, email, tel, address} = req.body;
    let hashPassword = await bcrypt.hash(password, 10);
    let regis = new registerModels({
      username: username,
      password: hashPassword,
      approve: false,
      fname: fname,
      lname: lname,
      email: email,
      tel: tel,
      address
  
    });
    let reg = await regis.save();
    return res.status(200).send({
  
      message: "create sucsess",
      success: true
    })
    }catch (error){
      return res.status(500).send({
        message: "create false",
        success: false
      })
    }
  });

/* GetUser */
router.get('/getuser', verfyToken, async function(req, res, next) {
  try{
  let body = req.body
  const regis = await registerModels.find();
  return res.status(200).send({
    data: regis,
    message: "success",
    success: true
  });
  }catch (error){
    return res.status(500).send({
      message: "false",
      success: false
    })
  }
});

/* Get Product */
router.get('/getp', verfyToken, async function(req, res, next) {
  try{
  let body = req.body
  
  const pd = await productModels.find();
  /* คงเหลือ */
  // let sum = [];let i=0;
  //   for(i; i < pd.length;i++){
  //      sum[i] = pd[i].quantity - pd[i].order;
  //      console.log(sum[i]);
  //      pd[i].quantity=sum[i];
  //  }
   
  return res.status(200).send({
    data: pd,
    message: "success",
    success: true
  });
  }catch (error){
    return res.status(500).send({
      message: "false",
      success: false
    })
  }
});

/* Get someProduct  */
router.get('/getsp/:id', verfyToken, async function(req, res, next) {
  try{
  let params = req.params
  let body = req.body
  let orr = await productModels.findById(params.id);
  let Quantity = orr.quantity - orr.order;
  const pd = await productModels.findById(params.id);
  const {_id, ProName, quantity, price, order} = pd;
  let Quantity_Now = Quantity;
  return res.status(200).send({
    data: {_id, ProName, quantity, price, order, Quantity_Now},
    message: "success",
    success: true
  });
  }catch (error){
    return res.status(500).send({
      message: "Get false",
      success: false
    })
  }
});

/* AddProduct */
router.post('/addp', verfyToken, async function(req, res, next) {
  try{
  let body = req.body
  const { ProName, quantity, price} = req.body;
  let Products = new productModels({
    ProName: ProName,
    quantity: quantity,
    price: price

  });
  let product = await Products.save();
  return res.status(200).send({

    message: "create success",
    success: true
  })
  }catch (error){
    return res.status(500).send({
      message: "create false",
      success: false
    })
  }
});

/* Edit Product */
router.put('/products/:id', verfyToken, async function(req , res , next){
  let id = req.params.id
  let body = req.body
  try{
      let Products = await productModels.findByIdAndUpdate(id , {ProName:body.ProName, quantity:body.quantity, price:body.price});

      if(!Products){
          res.status(500).send({
              massage : "Update Fail!",
              Success : false
          });
      }else{
          res.status(200).send({
              massage : "Update Success",
              Success : true
          });
      }

  }catch(error){
      res.send("error");
  }
});

/* Delete Product */
router.delete('/delete/:id' , verfyToken, async function(req , res , next){
  let id = req.params.id
  let body = req.body
  try{
      let Products = await productModels.findByIdAndDelete(id);

      if(!Products){
          res.status(500).send({
              massage : "Delete Fail!",
              Success : false
          });
      }else{
          res.status(200).send({
              massage : "Delete Suc",
              Success : true
          });
      }

  }catch(error){
      res.send("error");
  }
});

/* Approve */
router.put('/app/:id' , verfyToken, async function(req , res , next){
  let id = req.params.id
  let body = req.body
  try{
      let app = await registerModels.findByIdAndUpdate(id , {approve:body.approve});

      if(!app){
          res.status(500).send({
              massage : "Approve Fail!",
              Success : false
          });
      }else{
          res.status(200).send({
              massage : "Approve Success",
              Success : true
          });
      }

  }catch(error){
      res.send("error");
  }
});

/* Add Order */
router.post('/addor/:id',verfyToken, async function(req, res, next) {
  try{
  let id = req.params.id
  let body = req.body
 
  let orr = await productModels.findById(id);
  if(!orr.order){
    orr.order = 0;
  }
  let Quantity = orr.quantity - orr.order;
  let totall = orr.order + body.order;
  if(totall > orr.quantity){
    return res.status(500).send({
      Quantity: Quantity,
      message: "Not enough product",
      success: false
    });
  }
  let or = await productModels.findByIdAndUpdate(id , {order:orr.order + body.order});
    
  return res.status(200).send({
    message: "Add success",
    success: true
  })
  }catch (error){
    return res.status(500).send({
      message: "Add false",
      success: false
    })
  }
});

/* Get OrderAll */
router.get('/getallor', verfyToken, async function(req, res, next) {
  try{
  let id = req.params.id
  let body = req.body
  const pd = await productModels.find();
  const orderArray = pd.map(item => ({ order: item.order }));
  let sum = 0;let i=0;
    for(i; i < pd.length;i++){
       sum+= pd[i].order;
   }
   
  return res.status(200).send({
    list: orderArray,
    Orders: sum,
    message: "success",
    success: true
  });
  
  }catch (error){
    return res.status(500).send({
      message: "sum false",
      success: false
    })
  }
});

/* Get Order */
router.get('/getalls', verfyToken, async function(req, res, next) {
  try {
    const pd = await productModels.find();
    const orderArray = pd.map(item => ({ name: item.ProName, order: item.order }));

    return res.status(200).send({
      data: orderArray,
      message: "success",
      success: true
    });

  } catch (error) {
    return res.status(500).send({
      message: "false",
      success: false
    });
  }
});

module.exports = router;

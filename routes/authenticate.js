const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');


router.post('/register' , jsonParser, function(req , res){
    if(req.body.email != undefined){
        newUser = new User({
            username: req.body.username,
            email: req.body.email
        });
    }
    else{
        newUser = new User({
            username: req.body.username,
            email: ''
        })
    }
    User.register(newUser , req.body.password , function(err , user){
        if(err){
            return res.status(400).json({success:false , errors:err})
        }
        else{
            return res.status(200).json({sucess:true})
        }
    });
    
});

router.post('/login', jsonParser , function(req , res){
   if(req.body.username == undefined){
       return res.status(400).json({success:false , errors:"username is undefined"})
   }
   if(req.body.password == undefined){
       return res.status(400).json({success:false , errors:"password is undefined"})
   }
   console.log("poop")
   passport.authenticate('local' ,{failureFlash:true , failureRedirect:'/'} ,(err , user , info)=>{
       if(err){
            return res.status(400).json({success:false , errors:err})
       }
       if(!user){
            return res.status(400).json({success:false , errors:"user does not exist"})
       }
       req.logIn(user , function(err){
           if(err){
                return res.status(400).status({success:false , errors:err})
           }
            return res.status(200).json({success:true})
       })
   })(req , res);
})

module.exports = router
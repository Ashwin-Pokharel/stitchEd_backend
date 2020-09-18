const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Teacher = require('../models/teacher')
const Student = require('../models/student')
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');


router.post('/register' , jsonParser, function(req , res){
    newUser = new User({
        username: req.body.username,
        email: req.body.email,
        name : req.body.name,
    })
    User.register(newUser , req.body.password , function(err , user){
        if(err){
            return res.status(400).json({success:false , errors:err})
        }
        else{
            if(req.body.is_teacher == true){
                var teacher = new Teacher({
                    username : user.username,
                    email : user.email,
                    name : user.name,
                    join_code: randomString(5,'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
                })

                teacher.save().then((saved_teacher)=>{
                    return res.status(200).json({success:true , user:{
                        _id: saved_teacher._id,
                        name : saved_teacher.name,
                        username : saved_teacher.username,
                        email: saved_teacher.email,
                        students: saved_teacher.students,
                        assignments : saved_teacher.assignments,
                        join_code : saved_teacher.join_code
                    }})
                }).catch((err)=>{
                    return res.status(400).json({success:false , errors:err})
                })
            }
            else{
                var student = new Student({
                    username : user.username,
                    email: user.email,
                    name: user.name,
                    total_points: 0
                })
                student.save().then((student)=>{
                    var filter = {
                        join_code : req.body.join_code
                    }
                    Teacher.findOne(filter , (err , result) =>{
                        if(err){
                            return res.status(400).json({success:false , error:err})
                        }
                        if(result != null){
                            result.students.push(student._id)
                            result.save().then(() =>{
                                return res.status(200).json({success:true , user:{
                                    _id : student._id,
                                    username: student.username,
                                    email: user.email,
                                    name: user.name
                                }})     
                            })
                        }
                        else{
                            return res.status(400).json({success:false , error:"wrong join code"})
                        }
                    })
                }).catch((err)=>{
                    return res.status(400).json({success:false , errors:err})
                })
            }
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
           var filter = {
               username : user.username
           }
            Teacher.findOne(filter , (err , result) =>{
                if(err){
                    return res.status(400).json({success:false , error:err})
                }
                if(result == null){
                    Student.findOne(filter , (err , studentres) =>{
                        if(err){
                            return res.status(400).json({success:false , error:err})
                        }
                        if(studentres == null){
                            return res.status(400).json({success:false})
                        }
                        return res.status(200).json({success:true , user:{
                            _id: studentres._id,
                            is_teacher: false,
                            username: studentres.username,
                            name: studentres.name,
                            email: studentres.email,
                            total_points: studentres.total_points,
                            assignments: studentres.assignments
                            
                        }})
                    })
                }else{
                    return res.status(200).json({success:true , user:{
                        _id: result._id,
                        is_teacher: true,
                        username: result.username,
                        name: result.name,
                        email: result.email,
                        join_code: result.join_code
                    }})
                }
            })
       })
   })(req , res);
})

module.exports = router


function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
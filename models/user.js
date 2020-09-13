const mongoose = require('mongoose')
const schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')
const uuid = require('uuid');

var options = {disciminatorKey: 'is_teacher'}
var userSchema = new schema({
    username: {type:String , required:true , unique:true},
    email:{type:String , unique:true , required:false , default:""},
    name:{type:String , unique:false , required: true , default:""},
} , options);

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User" , userSchema );
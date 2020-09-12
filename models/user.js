const mongoose = require('mongoose')
const schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

var userSchema = new schema({
    username: {type:String , required:true , unique:true},
    email:{type:String , unique:true , required:false}
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User" , userSchema);
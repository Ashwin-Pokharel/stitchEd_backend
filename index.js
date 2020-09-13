require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/user')
const session = require('express-session')

mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true}).then(()=>{
    console.log("MongoDB connection established")
}).catch((err)=>{
    console.log(err)
})
var sess = {
  secret: process.env.SECRET_KEY,
  resave : false,
  saveUninitialized: false,
  cookie: {
    secure:false
  }
}
app.use(session(sess))
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));


const authRoutes = require('./routes/authenticate');
const assignmentRoutes = require('./routes/assignment');

app.use('' , authRoutes)
app.use('' , assignmentRoutes)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

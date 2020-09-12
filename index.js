require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/user')
const router = express.Router();
const authRoutes = require('./authentication/authenticate')

mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true}).then(()=>{
    console.log("connection worked")
}).catch((err)=>{
    console.log(err)
})



app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));



app.get('/', (req, res) => {
  res.send("Hello MY name is Ahsiwn")
})

app.use('' , authRoutes)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
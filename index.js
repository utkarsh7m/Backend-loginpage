import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bycrypt from 'bcrypt'
const app = express()
app.set("view engine","ejs")
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))

mongoose.connect("mongodb://localhost:27017",{dbName:"Rose"})
.then(() => {
  console.log('Connected to MongoDB')
})
.catch(() => {
  console.error(`Unable to connect to the database`)
})
const userSchema = mongoose.Schema({
  name:String,
  email:String,
  password:String,
})
const User = mongoose.model("User",userSchema)

const isAuthenticated = async(req,res,next) => {
  const {token} = req.cookies
  if(token){
    const decoded = jwt.verify(token,"asdfghjkl")
    req.user = await User.findById(decoded._id)
    next()}
  else{res.render("login")}
}
app.get("/",isAuthenticated,(req,res) => {
  res.render("logout",{name:req.user.name})
})
app.post("/login",async(req,res) => {
  const {email,password} = req.body
  let user = await User.findOne({email})
  console.log(user);
  if(!user)return res.render("register",{message:"No user found with the provided email"})
  const isMatch = await bycrypt.compare(password,user.password)
  if(!isMatch) return res.render("login",{email,message:"Incorrect Password"})

  const token = jwt.sign({_id:user._id},"asdfghjkl")
    res.cookie("token",token,{
        httpOnly:true,expires:new Date(Date.now()+60*1000)
    })
  res.redirect("/")
})
app.post("/register",async(req,res) => {
  const{name,email,password} = req.body
  let user = await User.findOne({email})
  if(user) return res.render("login")
  const hashedPassword = await bycrypt.hash(password,10)
  user = await User.create({name,email,password:hashedPassword})
  const token = jwt.sign({_id:user._id},"asdfghjkl")
    res.cookie("token",token,{
        httpOnly:true,expires:new Date(Date.now()+60*1000)
    })
  res.redirect("/")
})
app.get("/logout",(req,res) => {
    res.cookie("token",null,{
        httpOnly:true,expires:new Date(Date.now())
    })
  res.redirect("/")
})
app.get("/yoo",(req,res) => {
  res.redirect("/")
  
})
app.listen(2000,() => {
  console.log('server is running on port 2000')
})
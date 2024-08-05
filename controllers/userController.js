import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { user_Model } from "../model/user_model.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { cloudinaryUpload } from "../connection/cloudinary.js";


dotenv.config();
//  DB functions

let addNew_user = async (username, email, password, token,url) => {
  let user = new user_Model({
    username: username,
    email: email,
    password: password,
    token: token,
    profile_pic:url
  });
 // console.log("user saved");
  return await user.save();
};

//token verification

export const userVerification = (req, res, next) => {
  let token = req.cookies.token;
  if (token == undefined) {
    res.status(401).send("no token provided");
    return;
  }

  jwt.verify(token, process.env.secret, (err, decoded) => {
    if (err) {
      console.log(err);
      res.status(500).send("Authentication failed");
    } else {
      console.log(decoded);
      next();
    }
  });
};

//random password/token generater
function generatePassword() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

// send mail
function sendMail(email, subject, text) {
  let mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  let mailDetails = {
    from: process.env.email,
    to: email,
    subject: subject,
    text: text,
  };

  mailTransport.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs");
    } else {
      console.log("Email sent successfully");
    }
  });
}


export const postSignup = async (req, res) => {
  const saltRounds = 10;
  let { password, username, email } = req.body;
  //console.log(password);
  let checkUser= await user_Model.findOne({email:email}).then((data)=>{
    return data
  })
 // console.log(email,checkUser,req.file);
if (checkUser==undefined) {
  
  bcrypt.hash(password, saltRounds,async (err, hash) => {
    if (hash) {

      const uploadResult = await cloudinaryUpload.uploader
      .upload(
        req.file.path, {
              public_id: "upload/images",
          }
      ).then((data)=>{
        return data
      })
      .catch((error) => {
          console.log(error);
      });

      let token = generatePassword();
      let user = addNew_user(username, email, hash, token,uploadResult.secure_url);

      sendMail(email, "email verification", token);

      res.status(200).cookie("email", email).send(`user:,${user}`);
      return;
    }
    res.send("signup Failed");
    return
  });
}
else{
  res.status(500).send("email already exist")
}
};


export const emailVerification = async (req, res) => {
  let token = req.body.otp;
  let user = await user_Model
    .findOne({ email: req.cookies.email })
    .then((data) => {
      return data;
    })
    .catch((err) => console.log("error"));

  if (user.token === token) {
    res.status(200).send("email verified");
    return;
  }
  res.status(401).send("invalid email");
};


export const postLogin = async (req, res) => {
  let { password, email } = req.body;
   // console.log(password);
  let default_user = await user_Model
    .findOne({ email: email })
    .then((data) => {
      return data;
    })
    .catch((err) => console.log("error"));

  if (default_user == undefined) {
    res.status(401).send("invalid email");
    return;
  }

  bcrypt.compare(password, default_user.password, (err, result) => {
    if (result) {
      //console.log(default_user.username,default_user.email);
      let user = { email: default_user.email };
      let token = jwt.sign(user, process.env.secret, { expiresIn: 120 });
      res.cookie("token", token).status(200).send(default_user);
      return;
    }
    console.log(err);
    res.status(401).send("not match");
  });
};


export const getHome = async (req, res) => {
  res.send({ access: "allowed" });
};

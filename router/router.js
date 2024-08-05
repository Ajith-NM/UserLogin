import  express from "express";
import {postSignup,postLogin, userVerification,getHome, emailVerification} from "../controllers/userController.js";
const user_router=express.Router()

 import multer from "multer";
 const storage=multer.diskStorage({
    filename: function (req,file,cb) {
      cb(null, file.originalname)
    }
  });
 const upload=multer({storage:storage})

user_router.post("/postSignup",upload.single("image"),postSignup)
//upload.single("pf")
user_router.post("/postLogin",postLogin)

user_router.get("/home",userVerification,getHome)

user_router.post("/mailVerification",emailVerification)

export default user_router

import mongoose, { Schema } from "mongoose";
const user_Schema=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    token:{type:String,required:true},
    profile_pic:{type:String,required:true}
})
export const user_Model=mongoose.model("users",user_Schema)
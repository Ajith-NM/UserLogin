import express from "express";
import bodyParser from "body-parser";
import cors from "cors"
import user_router from "./router/router.js";
import { Mongo_DB } from "./connection/connection.js";
import cookieParser from "cookie-parser";
const app=express()

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use("/",user_router)
Mongo_DB()
app.listen(4000,()=>console.log("server running"))
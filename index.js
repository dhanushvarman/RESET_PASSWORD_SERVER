const express = require("express")
const cors = require("cors")
const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const dotenv = require("dotenv").config()
const app = express();
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
const { connectDb } = require("./config")

app.use(cors({
    origin: "*",
}))

app.use(express.json());

app.post("/forgot-password", async (req, res, next) => {

    try {
        const db = await connectDb();
        const user = await db.collection("users").findOne({ email: req.body.email })
        if (user) {
            let randomString = (Math.random() + 1).toString(36).substring(7);
            await db.collection("users").updateOne({_id : mongodb.ObjectId(user._id)},{$set : {random : randomString}});
            const token = jwt.sign({ _id: user._id, email: user.email}, process.env.JWT_SECRET, { expiresIn: "15m" });
            const link = `https://reset-password-server.vercel.app/verification/${user._id}/${token}`;
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'dhanushvarmanj66@gmail.com',
                    pass: 'cmskelsyfieblemd'
                }
            });

            var mailOptions = {
                from: 'dhanushvarmanj66@gmail.com',
                to: user.email,
                subject: 'Password Reset Link',
                html: `<div><h4>VERFICATION CODE :</h4> ${randomString}</div><div><h2>RESET PASSWORD : </h2>${link}</div>`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.json({ message: "Email Sent Successfuly"})
        } else {
            res.status(404).json({ message: "User not found" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in Forgot Password" })
    }
})

app.get("/:id", async (req,res,next)=>{

    try {
        const db = await connectDb();
        const user = await db.collection("users").findOne({_id : mongodb.ObjectId(req.params.id)});
        if(user){
            res.json(user)
        } else {
            res.status(404).json({ message: "User not found" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in Getting user" })
    }
})

app.post("/reset-password/:id/:token", async (req, res, next) => {

    try {
        const { id, token } = req.params;
        const { password } = req.body.password;
        const db = await connectDb();
        const user = await db.collection("users").findOne({ _id: mongodb.ObjectId(id) })
        if (user) {
            const verify = jwt.verify(token, process.env.JWT_SECRET);
            var salt = await bcrypt.genSalt(10);
            var hash = await bcrypt.hash(req.body.password, salt);
            req.body.password = hash;
            await db.collection("users").updateOne({ _id: mongodb.ObjectId(id) }, { $set: { password: hash } });
            res.json({message : "Password Updated"})
        } else {
            res.status(401).json({ message: "Username not found" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in Reset Password" })
    }
})

app.listen(process.env.PORT || 3003)


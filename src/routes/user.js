const express = require('express');
const createHttpError = require('http-errors');
const connection = require('../connection')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const { verifyAccesstoken } = require('../utilities/jwt_helper');
const Utils = require('../utilities/utils')

const router = express.Router();


router.post('/signup', (req, res, next) => {
    try {
        const user = req.body;
        const params = [user.email]
        const query = "select email,password,role,status from user where email = ?";
        connection.query(query, params, (err, result) => {
            if (err) return next(createHttpError.InternalServerError("Error from DB script select"));
            if (result.length > 0) return next(createHttpError(400, "Email already Exist..!"));
            const insertQuery = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
            const insertParams = [user.name, user.contactNumber, user.email, user.password];
            connection.query(insertQuery, insertParams, (err, result) => {
                if (err) return next(createHttpError.InternalServerError());
                return res.status(200).json({ message: "Successfully Registered..!" })
            })
        })

    }
    catch (err) {
        next(err);
    }
})

router.post('/login', (req, res, next) => {

    try {
        console.log("Inside /login ");
        const user = req.body;
        const query = "select email,password,role,status from user where email = ?"
        const params = [user.email];
        connection.query(query, params, (err, result) => {
            console.log(`After exevuting qury of login err-> ${err}, result-> ${result} `)
            if (err) return next(createHttpError.InternalServerError(err));
            if (result.length <= 0 || result[0].password != user.password) {
                return next(createHttpError.Unauthorized("Invalid User Credentials..!"))
            }
            else if (result[0].status === 'false') {
                return next(createHttpError(401, "Wait for Admin Approval"))
            }
            else if (result[0].password === user.password) {
                const response = {
                    email: result[0].email,
                    role: result[0].role
                }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
                return res.status(200).json({ token: accessToken })
            }
            else {
                return next(createHttpError.InternalServerError())
            }
        })
    } catch (err) {
        console.log(`Error in /login ${err}`)
        next(err)
    }

})

router.post('/forgotpassword', (req, res, next) => {
    try {
        const user = req.body;
        const query = "select email,password from user where email = ?"
        const params = [user.email];
        connection.query(query, params, (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err))
            if (result.length <= 0) {
                //if email  not exist
                return res.status(200).json({ message: "password sent successfully to your email" });

            } else {
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: result[0].email,
                    subject: 'Password of your Cafe Management System',
                    html: `<p>
                   <b> Your Login details for CFS </b> <br>
                   <b>Email : </b> ${result[0].email} <br>
                   <b>Password : </b> ${result[0].password}   <br>
                   <a href="http://localhost:4200">Click here to  login</a>
                   </p>`
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) { return next(createHttpError.InternalServerError(error)) }
                    else {
                        return res.status(200).json({ message: "password sent successfully to your email" });
                    }
                })
               
            }
        })
    } catch (err) {
        next(err);
    }
});

router.patch('/update', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    try {
        const user = req.body;
        const query = "update user set status=? where id=?";
        const params = [user.status, user.id]
        connection.query(query, params, (err, result) => {
            if (err) return next(createHttpError.InternalServerError());
            if (result.affectedRows == 0) {
                return next(createHttpError(400, "User ID does not exist..!"))
            }
            return res.status(200).json({message: "User updated successfully..!"});
        })
    } catch (err) {
        next(err)
    }

})

router.get('/get', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    try {
        const query = "select id,name,email,contactNumber,status from user where role = 'user'";
        connection.query(query, (err, result) => {
            if (err) return next(createHttpError.InternalServerError());

            return res.status(200).json(result);
        })
    } catch (err) {
        next(err)
    }

})

router.post('/changePassword', verifyAccesstoken,(req, res, next) => {
    try {
        const user = req.body;
        const email = res.locals.email;
        const query = "select * from user where email = ? and password = ?";
        const params = [email, user.oldPassword]
        connection.query(query, params, (err, result) => {
            if (err) return next(createHttpError.InternalServerError())
            if (result.length <= 0) return next(createHttpError.Unauthorized("Incorrect old Password"));
            else if (result[0].password === user.oldPassword) {
                const updateQuery = "update user set password = ? where email =?";
                const updateParams = [user.newPassword, email]
                connection.query(updateQuery, updateParams, (error, updateResult) => {
                    if (err) return next(createHttpError.InternalServerError());
                    return res.status(200).json({ message: "Password updated successfully..!" })
                })
            }
            else {
                return next(createHttpError.Unauthorized("Something went wrong.."))
            }
        })

    } catch (err) {

    }
})

router.get('/checkToken', verifyAccesstoken, (req, res, next) => {
    try {
        return res.status(200).json({ message: 'true' })
    } catch (err) {

    }
})



let transporter = nodemailer.createTransport({
    host: process.env.EMAIL,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


module.exports = router;
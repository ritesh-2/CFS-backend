const express = require('express');
const createHttpError = require('http-errors');
const connection = require('../connection')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const { verifyAccesstoken } = require('../utilities/jwt_helper');
const Utils = require('../utilities/utils');
const { cfsLogger, logObject } = require('../utilities/logger');

const router = express.Router();


router.post('/signup', (req, res, next) => {
    let logSource = "router - post - /signup"
    try {

        cfsLogger.debug(logObject(logSource, "ENTRY"))

        const user = req.body;
        const params = [user.email]
        const query = "select email,password,role,status from user where email = ?";
        connection.query(query, params, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError("Error from DB script select"));
            if (result.length > 0) return next(createHttpError(400, "Email already Exist..!"));
            const insertQuery = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
            const insertParams = [user.name, user.contactNumber, user.email, user.password];
            connection.query(insertQuery, insertParams, (err, result) => {
                cfsLogger.debug(logObject(logSource, `After executing ${insertQuery} err  => ${!!err} result ${!!result}`))
                if (err) return next(createHttpError.InternalServerError());
                return res.status(200).json({ message: "Successfully Registered..!" })
            })
        })

        cfsLogger.debug(logObject(logSource, "EXIT"))
    }
    catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err);
    }
})

router.post('/login', (req, res, next) => {
    let logSource = "router - post - /login"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const user = req.body;
        const query = "select email,password,role,status from user where email = ?"
        const params = [user.email];
        connection.query(query, params, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
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
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err)
    }

})

router.post('/forgotpassword', (req, res, next) => {
    let logSource = "router - post - /forgotpassword"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const user = req.body;
        const query = "select email,password from user where email = ?"
        const params = [user.email];
        connection.query(query, params, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError(err))
            if (result.length <= 0) {
                cfsLogger.debug(logObject(logSource, `Email not found but sent success message to client because unauthorized access`))
                //if email  not exist
                return res.status(200).json({ message: "password sent successfully to your email" });

            } else {
                cfsLogger.debug(logObject(logSource, `Sending Email Strted`))
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
                    cfsLogger.debug(logObject(logSource, `Response recived from transported email error => ${!!error}`))
                    if (error) {
                        return next(createHttpError.InternalServerError(error))
                    }
                    else {
                        return res.status(200).json({ message: "password sent successfully to your email" });
                    }
                })

            }
        })

        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err)
    }
});

router.patch('/update', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    let logSource = "router - patch - /update"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const user = req.body;
        const query = "update user set status=? where id=?";
        const params = [user.status, user.id]
        connection.query(query, params, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError());
            if (result.affectedRows == 0) {
                return next(createHttpError(400, "User ID does not exist..!"))
            }
            return res.status(200).json({ message: "User updated successfully..!" });
        })
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err)
    }

})

router.get('/get', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    let logSource = "router - get - /get"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const query = "select id,name,email,contactNumber,status from user where role = 'user'";
        connection.query(query, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError());

            return res.status(200).json(result);
        })
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err)
    }

})

router.post('/changePassword', verifyAccesstoken, (req, res, next) => {
    let logSource = "router - post - /changePassword"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const user = req.body;
        const email = res.locals.email;
        const query = "select * from user where email = ? and password = ?";
        const params = [email, user.oldPassword]
        connection.query(query, params, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
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
        cfsLogger.debug(logObject(logSource, "EXIT"))

    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err)
    }
})

router.get('/checkToken', verifyAccesstoken, (req, res, next) => {
    let logSource = "router - get - /checkToken"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        return res.status(200).json({ message: 'true' })
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err)
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
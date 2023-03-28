const express = require('express');
const createHttpError = require('http-errors');
const connection = require('../connection');
const { verifyAccesstoken } = require('../utilities/jwt_helper');
const router = express.Router();
const Utils = require('../utilities/utils')
const ejs = require('ejs')
const pdf = require('html-pdf')
const path = require('path')
const fs = require('fs')
const uuid = require('uuid')


router.post('/generateReport', verifyAccesstoken, (req, res, next) => {
    let logSource = "router - post - /generateReport"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const uid = uuid.v4();
        const orderDetails = req.body;
        let productDetails = JSON.parse(orderDetails.productDetails);

        const query = "insert into bill(name,uuid,email,contactNumber,paymentMethod,total,productDetails,createdBy) values(?,?,?,?,?,?,?,?)"
        const params = [orderDetails.name, uid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.totalAmount, orderDetails.productDetails, orderDetails.createdBy];
        connection.query(query, params, (err, result) => {

            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))

            if (err) return next(createHttpError.InternalServerError(err));
            ejs.renderFile(path.join(__dirname, '', 'report.ejs'),
                {
                    productDetails: productDetails,
                    name: orderDetails.name,
                    email: orderDetails.email,
                    contactNumber: orderDetails.contactNumber,
                    paymentMethod: orderDetails.paymentMethod,
                    totalAmount: orderDetails.totalAmount,

                }, (error, data) => {

                    cfsLogger.debug(logObject(logSource, `Response recived at ejs.renderfile error => ${!!error} and data => ${!!data}`))

                    if (error) return (next(createHttpError.InternalServerError(error)))
                    pdf.create(data).toFile('./generate_pdf/' + uid + ".pdf", (err2, data2) => {
                        cfsLogger.debug(logObject(logSource, `Response recived at+ pdf.create error => ${!!err2} and data => ${!!data2}`))
                        if (err2) {
                            console.log(err2)
                            return next(createHttpError.InternalServerError(err2))
                        }
                        else {
                            return res.status(200).json({ uuid: uid })
                        }

                    })
                })
        })
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err);
    }
})

router.post('/getPdf', verifyAccesstoken, (req, res, next) => {
    let logSource = "router - post - /getPdf"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY")) 
        const orderDetails = req.body;
        const pdfPath = './generate_pdf/' + orderDetails.uuid + '.pdf';
        if (fs.existsSync(pdfPath)) {
            cfsLogger.debug(logObject(logSource, `PDF path ${pdfPath} exist..`))
            res.contentType('application/pdf');
            fs.createReadStream(pdfPath).pipe(res);
        }
        else {
            let productDetails = JSON.parse(orderDetails.productDetails);
            ejs.renderFile(path.join(__dirname, '', 'report.ejs'),
                {
                    productDetails: productDetails,
                    name: orderDetails.name,
                    email: orderDetails.email,
                    contactNumber: orderDetails.contactNumber,
                    paymentMethod: orderDetails.paymentMethod,
                    totalAmount: orderDetails.totalAmount,

                }, (error, data) => {
                    cfsLogger.debug(logObject(logSource, `Response recived at ejs.renderfile error => ${!!error} and data => ${!!data}`))
                    if (error) return (next(createHttpError.InternalServerError(error)))
                    pdf.create(data).toFile('./generate_pdf/' + orderDetails.uuid + ".pdf", (err2, data2) => {
                        cfsLogger.debug(logObject(logSource, `Response recived at+ pdf.create error => ${!!err2} and data => ${!!data2}`))
                        if (err2) {
                            console.log(err2)
                            return next(createHttpError.InternalServerError(err2))
                        }
                        else {
                            res.contentType('application/pdf');
                            fs.createReadStream(pdfPath).pipe(res);
                        }

                    })
                })
        }
        cfsLogger.debug(logObject(logSource, "EXIt")) 
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err);
    }

})

router.get('/getBills', verifyAccesstoken, (req, res, next) => {
    let logSource = "router - get - /getBills"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY")) 
        const query = "select * from  bill order by id DESC"
        connection.query(query, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json(result)

        })
        cfsLogger.debug(logObject(logSource, "EXIT")) 
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err);
    }

})

router.delete('/delete/:id', verifyAccesstoken, (req, res, next) => {
    let logSource = "router - delete - /delete/:id"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY")) 
        const id = req.params.id;
        const query = "delete from bill where id = ?"
        connection.query(query, [id], (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError(err));
            else if(result.affectedRows == 0) return next(createHttpError(400,"Id does not exist"))
            return res.status(200).json(result)

        })
        cfsLogger.debug(logObject(logSource, "EXIT")) 
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err);
    }

})




module.exports = router
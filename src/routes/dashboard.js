const express = require('express');
const createHttpError = require('http-errors');
const connection = require('../connection');
const { verifyAccesstoken } = require('../utilities/jwt_helper');
const router = express.Router();
const Utils = require('../utilities/utils')
const { cfsLogger , logObject } = require('../utilities/logger')


router.get('/details', verifyAccesstoken, (req, res, next) => {
    let logSource = "router - get - /details"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        let categoryCount;
        let productCount;
        let billCount;
        let categoryQuery = "select count(id) as categoryCount from category";
        connection.query(categoryQuery, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${categoryQuery} err  => ${!!err} result ${!!result}`))
            if (err) next(createHttpError.InternalServerError(err));
            categoryCount = result[0].categoryCount;
        })
        let productQuery = "select count(id) as productCount from product";
        connection.query(productQuery, (err2, result2) => {
            cfsLogger.debug(logObject(logSource, `After executing ${productQuery} err2  => ${!!err2} result2 ${!!result2}`))
            if (err2) next(createHttpError.InternalServerError(err2));
            productCount = result2[0].productCount;
        })

        let billQuery = "select count(id) as billCount from bill";
        connection.query(billQuery, (err3, result3) => {
            cfsLogger.debug(logObject(logSource, `After executing ${billQuery} err3  => ${!!err3} result3 ${!!result3}`))
            if (err3) next(createHttpError.InternalServerError(err3));
            billCount = result3[0].billCount;
            let data = {
                category: categoryCount,
                product: productCount,
                bill: billCount
            }
            return res.status(200).json(data);
        })
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        cfsLogger.error(logObject(logSource, err))
        next(err);
    }
})

module.exports = router
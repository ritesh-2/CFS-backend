const express = require('express');
const createHttpError = require('http-errors');
const connection = require('../connection');
const { verifyAccesstoken } = require('../utilities/jwt_helper');
const router = express.Router();
const Utils = require('../utilities/utils')


router.post('/add', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    let logSource = "router - post - /add"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const category = req.body
        const query = "insert into category (name) values(?)";
        connection.query(query, [category.name], (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json({ message: "Category Added successfully..!" })
        })
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        next(err)
    }
})

router.get('/get', verifyAccesstoken, (req, res, next) => {
    let logSource = "router - get - /get"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const query = "select * from category order by name";
        connection.query(query, (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json(result);
        })
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        next(err)
    }

})

router.patch('/update', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    let logSource = "router - patch - /update"
    try {
        cfsLogger.debug(logObject(logSource, "ENTRY"))
        const category = req.body;
        const query = "update category set name = ? where id = ?"
        connection.query(query, [category.name, category.id], (err, result) => {
            cfsLogger.debug(logObject(logSource, `After executing ${query} err  => ${!!err} result ${!!result}`))
            if (err) return next(createHttpError.InternalServerError(err))
            if (result.affectedRows == 0) return next(createHttpError(400, "Category ID does not exist..!"));
            return res.status(200).json({ message: "Category updated successfully..!" })
        })
        cfsLogger.debug(logObject(logSource, "EXIT"))
    } catch (err) {
        next(err)
    }

})

module.exports = router;
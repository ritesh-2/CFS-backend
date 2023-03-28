const express = require('express');
const createHttpError = require('http-errors');
const connection = require('../connection');
const { verifyAccesstoken } = require('../utilities/jwt_helper');
const router = express.Router();
const Utils = require('../utilities/utils')


router.post('/add', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    try {
        const category = req.body
        const query = "insert into category (name) values(?)";
        connection.query(query, [category.name], (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json({ message: "Category Added successfully..!" })
        })
    } catch (err) {
        next(err)
    }
})

router.get('/get', verifyAccesstoken, (req, res, next) => {
    try {
        const query = "select * from category order by name";
        connection.query(query, (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json(result);
        })
    } catch (err) {
        next(err)
    }

})

router.patch('/update', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    try {
        const category = req.body;
        const query = "update category set name = ? where id = ?"
        connection.query(query, [category.name, category.id], (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err))
            if (result.affectedRows == 0) return next(createHttpError(400, "Category ID does not exist..!"));
            return res.status(200).json({ message: "Category updated successfully..!" })
        })
    } catch (err) {
        next(err)
    }

})

module.exports = router;
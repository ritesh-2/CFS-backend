const express = require('express');
const createHttpError = require('http-errors');
const connection = require('../connection');
const { verifyAccesstoken } = require('../utilities/jwt_helper');
const router = express.Router();
const Utils = require('../utilities/utils');

router.post('/add', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    try {
        const product = req.body;
        const query = "insert into product(name,categoryId,description,price,status) values(?,?,?,?,'true')";
        const params = [product.name, product.categoryId, product.description, product.price];
        connection.query(query, params, (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json({ message: "Product added successfully..!" })
        })
    } catch (err) {
        next(err)
    }
})

router.get('/get', verifyAccesstoken, (req, res, next) => {
    try {
        const query = "select p.id,p.name,p.description,p.price,p.status,c.id as categoryId,c.name as categoryName from product as p INNER JOIN category as c where p.categoryId =c.id";
        connection.query(query, (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json(result)
        })
    } catch (err) {
        next(err)
    }
})

router.get('/getByCategory/:id', verifyAccesstoken, (req, res, next) => {
    try {
        const id = req.params.id;
        const query = "select id,name from product where categoryId = ? and status = 'true' ";
        connection.query(query, [id], (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json(result)
        })
    } catch (err) {
        next(err)
    }
})

router.get('/getById/:id', verifyAccesstoken, (req, res, next) => {
    try {
        const id = req.params.id;
        const query = "select id,name,description,price from product where id = ?";
        connection.query(query, [id], (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            return res.status(200).json(result[0])
        })
    } catch (err) {
        next(err)
    }
})

router.patch('/update', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    try {
        const product = req.body;
        const query = "update product set name = ? , categoryId = ?,description =?,price=? where id = ?";
        const params = [product.name, product.categoryId, product.description, product.price, product.id];
        connection.query(query, params, (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            if (result.affectedRows == 0) return next(createHttpError(400, "Product Id does not exist"))
            return res.status(200).json({ message: "Product updates successfully..!" })
        })
    } catch (err) {
        next(err)
    }
})

router.patch('/updateStatus', verifyAccesstoken, Utils.checkRole, (req, res, next) => {
    try {
        const product = req.body;
        const query = "update product set status =? where id = ?";
        connection.query(query, [product.status,product.id], (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            if (result.affectedRows == 0) return next(createHttpError(400, "Product Id does not exist"))
            return res.status(200).json({ message: "Product Status updated successfully..!" })
        })
    } catch (err) {
        next(err)
    }
})


router.delete('/delete/:id', verifyAccesstoken, (req, res, next) => {
    try {
        const id = req.params.id;
        const query = "delete from product where id =?"
        connection.query(query, [id], (err, result) => {
            if (err) return next(createHttpError.InternalServerError(err));
            if(result.affectedRows == 0) return next(createHttpError(400,"Product Id does not exist"))
            return res.status(200).json({message:"product deleted successfully..!"})
        })

    } catch (err) {
        next(err)
    }
})

module.exports = router;
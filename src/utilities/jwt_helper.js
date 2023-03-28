const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    verifyAccesstoken: (req, res, next) => {
        try {
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1]
            if (!token) return next(createHttpError.Unauthorized());

            jwt.verify(token, process.env.ACCESS_TOKEN, (err, resp) => {
                if (err) return next(createHttpError.Unauthorized())
                res.locals = resp;
                next();
            })

        } catch (err) {
            next(err)
        }

    }
}
require('dotenv').config();

const Utils = {}
Utils.checkRole = (req, res, next) => {
    try {
        if (res.locals.role === process.env.USER) res.sendStatus(401)
        else next()
    } catch (err) {
        next(err)
    }
}

module.exports = Utils
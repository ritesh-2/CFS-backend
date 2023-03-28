const fs = require('fs');
const logger = {}

logger.errorLogger = (err, req, res, next) => {
    let errMessage = `${new Date()} - ${err.stack}\n`
    fs.appendFile('./logs/errorLogger.txt', errMessage, (error) => {
        if (error) console.log("logging error failed")
        else {
            res.status(err.status || 500)
            res.json({
                status: err.status || 500,
                message: err.message,
            })
        }
    })
}

logger.requestLogger = (req, res, next) => {
    let logMessage = `${new Date()} - ${req.method} - ${req.path}\n`;
    fs.appendFile('./logs/requestLogger.txt', logMessage, (err) => {
        if (err) next(err);
        else next();
    })
}

module.exports = logger;
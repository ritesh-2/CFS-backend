
require('dotenv').config();
const { createLogger, format, transports, json } = require('winston');
const { combine, prettyPrint, printf, timestamp } = format;
const { MongoDB }  = require('winston-mongodb')

const logObject = (source, logMsg) => {
    try {
        let logMsgString = "";

        let logMsgObj = {
            "source": source,
            "message": logMsg
        }
        // logMsgString = JSON.stringify(logMsgObj).replace(/\\/g, '/');
        return logMsgObj;
    } catch (err) {
        return err;
    }

}



const errorLogger = (err, req, res, next) => {
    // let errMessage = `${new Date()} - ${err.stack}\n`;
    cfsLogger.error(err.message ?? err.stack);
    res.status(err.status || 500)
    res.json({
        status: err.status || 500,
        message: err.message
    })
}


const myFormat = printf(({ level, timestamp, message }) => {
    return `${timestamp} __${level}  ${message}`;
});

const intialiseLogger = () => {

    const logger = createLogger({
        level: process.env.LOG_LEVEL || "error",
        format: combine(
            myFormat,
            timestamp({ format: "hh:mm:ss" }),
            format.json(),

        ),
        // defaultMeta: { service: 'user-service' },
        transports: [
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
        ],
    });

    if (process.env.ENABLE_COMBINE_LOGGER === "true") {
        const combineTransport = new transports.File({ filename: 'logs/combined.log' })
        logger.add(combineTransport);
    }
    if (process.env.ENABLE_CONSOLE_LOGGER === "true") {
        const consoleLoggerTrasnport = new transports.Console();
        logger.add(consoleLoggerTrasnport);
    }

    if(process.env.ENABLE_DB_LOGGER === "true"){
        const mongoDBTrasnport = new transports.MongoDB({
            db: process.env.LOGGER_DB_STRING,
            level:"error",
            options: {useUnifiedTopology: true},
            collection:'cfs_logs'
        }) 

        logger.add(mongoDBTrasnport);
    }

    return logger;
}




const cfsLogger = intialiseLogger();

module.exports = { errorLogger, cfsLogger, logObject }
const mysql = require('mysql');
require('dotenv').config();

const config = {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user:process.env.DB_USERNAME ,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};


let connection = mysql.createConnection(config)
connection.connect((err)=>{
    if(err) console.error(err);
    else console.log(`DB COnnected susccessfully.. with ${process.env.DB_NAME}`)
})
module.exports = connection;
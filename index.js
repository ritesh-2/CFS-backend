require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const userRoute = require('./src/routes/user')
const categoryroute = require('./src/routes/category')
const productRoute = require('./src/routes/product')
const billRoute = require('./src/routes/bill')
const dashboardRoute = require('./src/routes/dashboard')
const { requestLogger, errorLogger } = require('./src/utilities/logger')
const router = express.Router();
const app = express();


// middlewares
app.use(bodyparser.json())
app.use(cors());

app.use('/', (req, res,next) => {
    console.log("routes are working")
    next();
})

//Logging request
// app.use(requestLogger);

app.use('/user', userRoute)
app.use('/dashboard', dashboardRoute)
app.use('/category', categoryroute)
app.use('/product', productRoute)
app.use('/bill', billRoute)
//Handling errors
app.use(errorLogger)

//connecting to DB
const connection = require('./src/connection');


app.listen(process.env.PORT, () => {
    console.log(`server started on ${process.env.PORT}`)
})
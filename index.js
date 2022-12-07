const express = require("express");
const colors = require("colors");
const cors = require("cors");
const env = require('dotenv');
const app = express();
const morgan = require("morgan");

const transaction = require("./routes/transaction");
const errorHandler = require("./middleware/errorHandler");

env.config({
    path: "./environments/environments.env"
})

/* Log API Requests in console */
app.use(morgan('tiny'));

/* Parse JSON requests*/
app.use(express.json());

/**
 * Enable all sources to access API
 */
 app.use(cors({
    origin: "*"
}));


/* routes */
app.use("/api/v1/transactions",transaction);


/* middleware */
app.use(errorHandler);



/**
 * Port 3000
 */
app.listen((process.env.PORT || 3000),()=> {
    console.log('App is now running'.green);
});





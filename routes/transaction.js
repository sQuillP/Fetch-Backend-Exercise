const express = require('express');
const router = express.Router();
const TransactionManager = require("../utils/TransactionManager");
const {
    addTransactions,
    spend,
    getPayers
} = require('../controllers/transaction');



/**
 * In-Memory storage service for transactions. 
 */
const transactionManager = new TransactionManager();

router.route("/")
.post(addTransactions(transactionManager));

router.route("/spend")
.post(spend(transactionManager));

router.route("/getPayers")
.get(getPayers(transactionManager));

module.exports = router;
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");


const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;


/**
 * @description - Meant for posting all payer transactions. Note that only one transaction should go through at a time.
 * @route - POST api/v1/transactions
 * @param { TransactionManager } transactionManager - Processes and stores transactions
 * @returns { (fn)=> (req,res,next)=> Promise<any> }
 */
exports.addTransactions = (transactionManager)=> {
    return asyncHandler((req,res,next)=> {
        const errorMsg = "Invalid transaction format. Please provide {payer:string, points:number, timestamp:Date}";

        const transaction = req.body;
        if(
            !transaction    || 
            !transaction.points || 
            !transaction.payer || 
            !transaction.timestamp ||
            Object.keys(transaction).length !== 3
        ){
            return next(
                new ErrorResponse(
                    BAD_REQUEST,
                    errorMsg
                )
            )
        }
        //Re-cast transaction timestamp
        transaction.timestamp = new Date(transaction.timestamp);
        if(
            typeof transaction.payer !== 'string' || 
            typeof transaction.points !== 'number'||
            transaction.timestamp.toString().toLowerCase() === 'invalid date'
        ){
            return next(
                new ErrorResponse(
                    BAD_REQUEST,
                    errorMsg
                )
            )
        }
        transactionManager.insertTransactions(transaction);
        res.status(CREATED).json({
            success: true,
            data: "Transaction successfully inserted"
        });
    })
}



/**
 * @description - 
 * @route - POST api/v1/transactions/spend
 * @param { TransactionManager } transactionManager - Processes and stores transactions
 * @returns { (fn)=> (req,res,next)=> Promise<any> }
 */
exports.spend = (transactionManager)=> {
    return asyncHandler((req,res,next)=> {
        const spendObj = req.body;
        if(!spendObj || !spendObj.points || typeof spendObj.points !== 'number')
            return next( 
                new ErrorResponse(BAD_REQUEST,`Provide spend request in the form {'points':integer}`)
            );
        const receipt = transactionManager.spendPoints(spendObj.points);
        
        res.status(OK).json({
            success: true,
            data: receipt
        });
    });
}



/**
 * @description - 
 * @route - GET api/v1/transactions/getPayers
 * @QueryParam - ignoreZero will just filter out all payers with balance of zero.
 * @param { TransactionManager } transactionManager - Processes and stores transactions
 * @returns { (fn)=> (req,res,next)=> Promise<any> }
 */
exports.getPayers= (transactionManager) => {
    return asyncHandler((req,res,next)=> {
        let payerBalances = transactionManager.payerBalances;

        res.status(OK).json({
            success: true,
            data: payerBalances
        });
    })
}

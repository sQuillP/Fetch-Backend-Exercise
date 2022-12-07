
const ErrorResponse = require("./ErrorResponse");
const RecordStore = require("./RecordStore");

/**
 * @description - Perform all transaction functionality. Transactions are store in memory.
 */
class TransactionManager {

    /* Sum of all users points*/
    #_pointsBalance = 0;
    
    /**
     * @type {Map<string,{[payer:string]:points:number} } - combines payer name as key and the total points of payer.
     * @description - 
     */
    #_payer_records = new Map();


    /* Store and prioritize earliest transactions records*/
    #_transaction_records = new RecordStore();
    
    constructor(){}

    /**
     * @description - inserts transactions records
     * @param {{payer:string, points:number, timestamp: Date}} transactions - transaction record.
     * @throws {Error} - Error when transaction results in a negative points balance.
     */
    insertTransactions(transactions){
        transactions.timestamp = new Date(transactions.timestamp);
        transactions.points = parseInt(transactions.points);
        if(!this.#_payer_records.has(transactions.payer))//add new pay record if it doesn't exist
            this.#_payer_records.set(transactions.payer,{
                payer: transactions.payer, 
                points: 0
            });
        
        let payRecord = this.#_payer_records.get(transactions.payer);
        
        if(transactions.points < 0 && payRecord.points >= Math.abs(transactions.points)){ //negative transaction
            payRecord.points -= Math.abs(transactions.points);
            this.#_pointsBalance-= Math.abs(transactions.points);
            this.#_transaction_records.addNegativeTransaction({...transactions});
            return;
        }
        else if(transactions.points < 0 && payRecord.points < Math.abs(transactions.points))//avoid negative pay record balances
            throw new ErrorResponse(400,"Payer records cannot have negative balance");


        //Insert and update positive transactions
        this.#_pointsBalance += transactions.points;
        payRecord.points += transactions.points;
        this.#_transaction_records.addPositiveTransaction(transactions);   
    }


    /**
     * @description - Spends points obtained by records and then removes them
     * @param {number} expendablePoints - points to spend by user.
     * @throws {Error} - If users balance is less than the points they want to spend.
     * @returns {{payer:string, points:number}[]} - list of points deducted from transactions
     */
    spendPoints(expendablePoints){
        const spendingReceipt = [];

        if(this.#_pointsBalance < expendablePoints)
            throw new ErrorResponse(400,"You do not have enough points");
        else if(expendablePoints < 0)
            throw new ErrorResponse(400,"expendable points must be positive");
        
        let tempPoints = expendablePoints;
        while(tempPoints !== 0){

            const transaction = this.#_transaction_records.nextTransaction();
            const curRecord = this.#_payer_records.get(transaction.payer);

            if(tempPoints >= transaction.points){ //use up all the transaction points
                tempPoints -= transaction.points;
                this.#_pointsBalance -= transaction.points;
                curRecord.points -= transaction.points;
                spendingReceipt.push({
                    [`${transaction.payer}`]: -transaction.points
                });
            }
            else if(tempPoints < transaction.points){
                transaction.points -= tempPoints
                curRecord.points -= tempPoints;
                this.#_pointsBalance -= tempPoints;
                spendingReceipt.push({
                    [`${transaction.payer}`]: -tempPoints
                });
                this.#_transaction_records.addPositiveTransaction(transaction);
                break;
            }
        }
        return spendingReceipt;
    }

    /**
     * @returns {number} - sum of all payer balances
     */
    get balance(){
        return this.#_pointsBalance;
    }

    /**
     * @returns {{payer:string, points: number}[]} - list of payer balances
     */
    get payerBalances(){
        return Array.from(this.#_payer_records.values());
    }


    /**
     * @returns {{payer:string, points:number, timestamp:Date}[]} - Records sorted by earliest date
     */
    get records(){
        return this.#_transaction_records.records;
    }
}


module.exports = TransactionManager;
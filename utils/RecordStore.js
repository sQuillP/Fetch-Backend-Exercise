const ErrorResponse = require("./ErrorResponse");



/**
 * Priority queue implementation that puts early transaction dates 
 * at the highest priority.
 */
class RecordStore{
    
    #_records = [];


    constructor(){}

    
    /**
     * @description - executes binary search by comparing dates.
     * 
     * @param {number} left - leftmost index of array
     * @param {number} right - rightmost array index
     * @param {{payer:string, points:number, timestamp:Date }} newRecord - Date to compare and eventually insert.
     * 
     * @returns {number} - Index that the new record should be inserted to
     */
    #_bin_search(left,right, newRecord){
        const middle = left + Math.floor((right - left)/2);

        if(right === left && newRecord.timestamp >= this.#_records[right].timestamp)
            return middle+1;

        else if(right === left)
            return middle;

        if(newRecord.timestamp > this.#_records[middle].timestamp){
            return this.#_bin_search(middle+1,right, newRecord);
        } 

        else if(middle === left)//edge case for earliest date in the array.
            return this.#_bin_search(left,middle,newRecord);

        else 
            return this.#_bin_search(left,middle-1,newRecord);
    }

    
    /**
     * @description - Optimize insertion by doing binary search on single element: O(log(n)) + O(n). For array transactions: O(n*log(n)) + O(n).
     * @param {{payer:string, points:number, timestamp: Date}} transaction - transaction record.
     */
    addPositiveTransaction(transactions){
        if(transactions.points <=0)
            throw new ErrorResponse(400,"Must provide positive transaction")
        if(this.#_records.length === 0){
            this.records.push(transactions);
        }
        else {
            const index = this.#_bin_search(0,this.#_records.length-1,transactions);
            this.#_records.splice(index,0,transactions);
        }
    }


    /**
     * @description - For negative transactions only. deducts points from matching record payers. When a record payer's points is zero it is removed.
     * @param {{payer:string, points:string, timestamp:Date}} transaction - transaction with negative points
     * @throws {Error} - Method should not take in positive records and when there are not enough points to cover negative transaction
     * @returns {void} - insertion only
     */
    addNegativeTransaction(transaction){
        if(transaction.points >=0)
            throw new ErrorResponse(400,"enqueueNegative method should only take in negative transactions");

        transaction.points = Math.abs(transaction.points);
        let index = 0;
        while(transaction.points !== 0 && index < this.#_records.length){
            if(this.#_records[index].payer !== transaction.payer){
                index++;
                continue;
            }
            if(this.#_records[index].points > transaction.points){
                this.#_records[index].points -= transaction.points;
                return;
            }
            transaction.points -= this.#_records[index].points;
            this.#_records.splice(index,1);
            if(transaction.points === 0)
                return;
        }
        if(transaction.points !== 0){
            throw new ErrorResponse(400,`Not enough points to cover negative transaction. Remaining negative transaction: ${-transaction.points}`);
        }
    }


    /**
     * @description -  Removes earliest transaction from front of queue
     * @returns {{payer:string, points:string, timestamp:Date}} - Transaction record
     */
    nextTransaction(){
        if(this.#_records.length === 0)
            return null;
        return this.#_records.shift();
    }


    /**
     * @returns {{payer:string, points:string, timestamp:Date}[]} - Transactions list
     */
    get records(){
        return this.#_records;
    }
}

module.exports = RecordStore;
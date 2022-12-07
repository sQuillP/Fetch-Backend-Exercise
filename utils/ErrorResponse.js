

/**
 * @description - Error response object for catch-all error handler used in middleware.
*/
class ErrorResponse extends Error {

    constructor(status, message){
        super(message);
        this.status = status;
    }
}


module.exports = ErrorResponse;


/**
 * @description - Catches all errors thrown/returned inside the asyncHandler.
 */
const errorHandler = (error,req,res,next)=> {
    res.status(error.status || 500).json({
        success: false,
        data: error.message
    });
}

module.exports = errorHandler;
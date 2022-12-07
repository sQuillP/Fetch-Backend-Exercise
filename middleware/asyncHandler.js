
/* Removes the need for try-catch blocks when resolving
asynchronous and error-throwing functions/methods. */
module.exports = (fn)=> (req,res,next)=> Promise.resolve(fn(req,res,next)).catch(next);


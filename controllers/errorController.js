const AppError = require('./../utils/appError');

const handleCastErrorDB = () => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const message = 'Duplicate field ' + value + ' Please use another value';
    return new AppError(message, 400)
}
handleJWTError = err => new AppError('Invalid token', 401);
handleJWTExpiredError = err => new AppError('Expired token', 401);



const sendErrorDev = (err, req, res) => {

    if (req.originalUrl.startsWith('/api')) // api
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    else// render website     
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
}
const sendErrorProd = (err, req, res) => {
    // api
    if (req.originalUrl.startsWith('/api')) 
    {

        if (err.isOperational)
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });

        else
            return res.status(500).json({
                status: 'error',
                message: 'Something went wrong'
            });

    }
    else 
    {
        if (err.isOperational)
            return res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: err.message
            });
        else 
            return res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: 'Please try again later.'
            });
            
    }
}



module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development')
        sendErrorDev(err, req, res)
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message=err.message;
        if (error.name === 'Cast Error')
            error = handleCastErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError(error);
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError(error);

        sendErrorProd(error, req, res);
    }
}

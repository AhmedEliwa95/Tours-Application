const AppError = require("../utils/appError");

const handleCastErrorDB = (err) =>{
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError( message , 400);    
};   

const handleDuplicateFieldsDB = (err)=>{
    const message = `Duplicate field value "${err.keyValue.name}" please use another one`;
    return new AppError(message , 400)
};

const handleValidationErrorDB = (err)=>{
    const errros = Object.values(err.errors).map(val => val.message)
    const message = `Invalid input data ${errros.join('. ')}`;
    return new AppError(message,400)
};

const handleJWTError = ()=> new AppError('Invalid token, please log in again!' , 401)
const handleJWTExpiredError = ()=> new AppError('Your token has expired, please log in again!' , 401)

const sendErrorDev = (err,req,res)=>{
    /// API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status:  err.status,
            message: err.message,
            error:err,
            stack:err.stack
        })
    }
        /// Rendered Website
        return res.status(err.statusCode ).render('error',{
            title:'something went wrong ',
            msg:err.message
        })
};

const sendErrorProd = (err,req,res)=>{
    ///- A) API 
    if(req.originalUrl.startsWith('/api')){
        //Opertional, trusted error send message to the client
        if(err.isOperational){    
            return res.status(err.statusCode).send({
                status:  err.status,
                message: err.message 
            });
        //Programming or other unknown error: don't leak error details    
        }
        // 1) Log Error
        console.error('Error:',err);
        // 2) send generate messge
        return res.status(500).json({
            status:'fail',
            message:'Something went very wrong!'
        });        
    };
    ///- B) Rendered Website
    if(err.isOperational){
        return res.status(err.statusCode).render('error',{
            title:  'Something went wrong!',
            msg: err.message 
        });
    // Programming or other unknown error: don't leak error details    
    }
    // 1) Log Error
    console.error('Error:',err);
    // 2) send generate messge
    return res.status(err.statusCode).send({
        title:  'Something went wrong!',
        msg: 'Please try again later! '
    });
};



module.exports = (err,req,res,next)=>{
    // console.log(err.stack)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req,res);
    }else if(process.env.NODE_ENV === 'production'){

        let error = Object.create(err);
        error.message = err.message
        if(error.name === 'CastError'){error =  handleCastErrorDB(error)};

        if(error.code*1 === 11000) error = handleDuplicateFieldsDB(error);

        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);

        if(error.name === 'JsonWebTokenError') error = handleJWTError(error)
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError(error)
        sendErrorProd(error,req,res);
    }

};

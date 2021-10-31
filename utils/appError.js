class AppError extends Error // inherit from Error class
{ 

  constructor(message, statusCode){
      super(message, statusCode);
      this.statusCode=statusCode;
      this.status=`${statusCode}`.startsWith('4')?'fail':'error';
      this.isOperational=true;
      Error.captureStackTrace(this, this.constructor);
  }
}
module.exports=AppError;

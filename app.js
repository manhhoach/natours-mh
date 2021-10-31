const express = require('express');
const rateLimit=require('express-rate-limit')
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp');
const path=require('path')
const cookieParser=require('cookie-parser')
const methodOverride=require('method-override')
const compression=require('compression')

const app=express();

// reuire router
const tourRouter=require('./routes/tourRoutes');
const userRouter=require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes');
const viewRouter=require('./routes/viewRoutes');
const bookingRouter=require('./routes/bookingRoutes')
const adminRouter=require('./routes/adminRoutes');
const meRouter=require('./routes/meRoutes');

const AppError=require('./utils/appError');
const globalErrorHandle=require('./controllers/errorController');


// static files
app.use(express.static(path.join(__dirname, 'public')));

// set template engine
app.set('view engine', 'pug');
app.set('views',path.join(__dirname, 'views'));

// set security http header
app.use(helmet())

// method override
app.use(methodOverride('_method'));


// body parser
app.use(cookieParser());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({
    extended:true,
    limit:'50mb'
}));

// data sanitization against NOSQL injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss())

// prevent parameter pollution
app.use(hpp({
    whitelist:[
        'duration', 'ratingsQuantity',
        'ratingsAverage', 'maxGroupSize',
        'difficulty', 'price'
    ]
}));
app.use(compression())

// limit request from same api
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000, //max: 100 request in 1 hour
    message:'Too many request from this IP. Please try again in an hour!'
});
app.use('/api',limiter);



// thiếu phần tính khoảng cách, phần update ratingsAverage

//PUT: cập nhật toàn bộ obj //PATCH: cập nhật properties của obj

// route


app.use('/', viewRouter);
app.use('/admin',adminRouter);
app.use('/me', meRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);


app.all('*', (req, res, next) => {
    const err=new AppError(`Can't find ${req.originalUrl} on this server`, 404);
    next(err);
})

app.use(globalErrorHandle);


module.exports=app; 
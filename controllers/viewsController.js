const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');

let option;

module.exports.getOverview = catchAsync(async (req, res, next) => {

    let tours;
    //let page=req.query.page;
    if(!req.query.page||req.query.page<1)
     req.query.page=1;   
   
    if(req.query.sort==='asc')
     option='price';
    else if(req.query.sort==='desc')
     option='-price'; 
    else if(req.query.sort===option)
     option=''; 
  
    const limit=6;
    const skip=(req.query.page-1)*limit;
    if(req.query.q)
     tours = await Tour.find({"name": new RegExp('.*' + req.query.q + '.*','gi')})
    else
     tours = await Tour.find({}).skip(skip).limit(limit).sort(option);
    
    if(tours.length===0)
     res.render('error',{
        title:'Empty'
    })
    else
     res.render('overview', {
        title: 'All tours',
        tours: tours,
        page: req.query.page
    });
});

module.exports.getTour = catchAsync(async (req, res, next) => {
    //1. get data form request (include review and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if (!tour)
        return next(new AppError('There is no tour with that name', 404));
    res.render('tour', {
        title: tour.name,
        tour: tour
    });
});

module.exports.getSignUpForm = (req, res, next) => {
    res.render('auth/signup', {
        title: 'Sign Up'
    });
};

module.exports.signup = catchAsync(async (req, res, next) => {
    if (req.body.password !== req.body.passwordConfirm)
        return next(new AppError('Password is incorrect', 400));
    else if (await User.findOne({ email: req.body.email }))
        return next(new AppError('Email is already in use', 400));
    else {
        const newUser = await User.create({ ...req.body });
        res.redirect('/login');
    }
});

module.exports.getLoginForm = (req, res, next) => {
    res.render('auth/login', {
        title: 'Login'
    })
}

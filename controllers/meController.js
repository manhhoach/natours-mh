const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Booking = require('./../models/bookingModel');
const Review = require('./../models/reviewModel');
const adminController = require('./adminController');


// [GET] /
module.exports.getProfile = (req, res, next) => {
    res.render('account', {
        title: 'Your account'
    })
}

// [GET] /my-tours
module.exports.getMyTours = catchAsync(async (req, res, next) => {

    const bookings = await Booking.find({ user: req.user.id });
    res.render('my-tours', {
        title: 'My Tours',
        bookings
    });
});
// [GET] /create-booking/:slug
module.exports.createBooking = catchAsync(async (req, res, next) => {
    const user = res.locals.user;
    const tour = await Tour.findOne({ slug: req.params.slug });
    if (!user || !tour)
        return next(new AppError('Tour or User is not exists', 404));
    
    const status= await adminController.ConfirmStatus();
    await Booking.create({
        tour: tour._id,
        user: user._id,
        price: tour.price,
        status: !status// true mới dc review=> admin ko kiểm duyệt
        
    });
    res.redirect('/me/my-tours');
});

// [GET] /paid
module.exports.paid = catchAsync(async (req, res, next) => {
     
})

// [DEL] /delete-booking/:id
module.exports.deleteBooking= catchAsync(async (req, res, next) => {

    const booking = await Booking.findByIdAndDelete(req.params.id);
    res.redirect('/me/my-tours');
})

// [GET] /create-reviews
module.exports.getCreateReviewForm = catchAsync(async (req, res, next) => {
    res.render('create-review',{
        title: 'Create Review',
        bookingId: req.params.bookingId
    })
})
module.exports.createReview = catchAsync(async (req,res, next) => {
    const booking=await Booking.findByIdAndUpdate(req.params.bookingId, {isReview: true});
    const review = await Review.create({
        tour: booking.tour.id,
        user: req.user.id, 
        review: req.body.review,
        rating: req.body.rating  
    });
    res.redirect('/me/my-tours');

})

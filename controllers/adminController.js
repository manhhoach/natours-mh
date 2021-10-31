const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Booking = require('./../models/bookingModel');
const Review = require('./../models/reviewModel');
const User = require('./../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
let check=true;

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image'))
        cb(null, true)
    else
        cb(new AppError('Not an image! Please upload only image', 400), false)
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

module.exports.ConfirmStatus=async()=>{
    const user= await User.findOne({role: 'admin'});
    return user.isApproval;
}

module.exports.changeApproval=catchAsync(async(req, res, next)=>{
    const users=await User.updateMany({role: 'admin'}, {isApproval: !check});
    check=!check;
    res.redirect('/me');
})
 // [GET] /manage-tours
module.exports.manageTours = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.render('manage/manage-tours', {
        title: 'Manage tours',
        tours: tours
    })
})
// [GET] /create-tour
module.exports.getCreateTourForm = catchAsync(async (req, res, next) => {
    res.render('manage/create-tour', {
        title: 'Create tour'
    })
})

// [POST] /create-tour
module.exports.uploadTourImages = upload.array('images', 4);
module.exports.resizeTourImages = catchAsync(async (req, res, next) => {
       
    const tour=await Tour.findById(res.locals.id);
    const image_cover = `tour-${res.locals.id}-cover.jpeg`;
    let imagesArray=[];
    let fileName;     
    req.files.map(async (file, index) => {
        if(index===0)
            fileName=image_cover;
        else 
        {
            fileName = `tour-${res.locals.id}-${index}.jpeg`;
            imagesArray.push(fileName);
        }
        await sharp(file.buffer)
            .resize(2000, 1333).toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${fileName}`);       
        })  
    const updateTour= await Tour.findByIdAndUpdate(res.locals.id, {imageCover: image_cover, images: imagesArray})  
    res.redirect('/admin/manage-tours');    
    
})
module.exports.createTour = catchAsync(async (req, res, next) => {
    if (!req.files)
        return next(new AppError('Can not create tour without images',400)); 
    const tour=await Tour.create({...req.body});
    res.locals.id=tour._id;
    next(); 
})


// [GET] /edit-tour/:slug
module.exports.getEditTourForm = catchAsync(async (req, res, next) => {
    const tour = await Tour.find({ slug: req.params.slug }); 
    res.render('manage/edit-tour', {
        title: 'Edit tour',
        tour: tour[0]
    })
})

// [PATCH] /edit-tour/:slug
module.exports.editTour = catchAsync(async (req, res, next) => {
    const tour=await Tour.findOneAndUpdate({ slug: req.params.slug}, req.body, {runValidators: true});
    if(req.files)
    {
        res.locals.id=tour._id;
        next();
    }
    else 
        res.redirect('/admin/manage-tours')  
})

// [DEL] /delete-tour/:id
module.exports.deleteTour= catchAsync(async (req, res, next) => {
  
   await Promise.all([
       Tour.findByIdAndDelete(req.params.id),
       Review.deleteMany({tour: req.params.id}),
       Booking.deleteMany({tour: req.params.id})
   ])
   res.redirect('/admin/manage-tours');
})



// [GET] /manage-bookings
module.exports.manageBookings = catchAsync(async (req, res, next)=>{

    const bookings = await Booking.find({}); 
    res.render('manage/manage-bookings',{
        title: 'Manage bookings',
        bookings
    })
})

// [GET] confirm-bookings/:id
module.exports.confirmBookings=catchAsync(async (req, res, next) => {
    const booking=await Booking.findByIdAndUpdate( req.params.id, { status: true} );
    res.redirect('/admin/manage-bookings');
});

// [DEL] /delete-booking/:id
module.exports.deleteBooking= catchAsync(async (req, res, next) => {
    await Booking.findByIdAndDelete(req.params.id);
    res.redirect('/admin/manage-bookings');

});

// [GET] /manage-users
module.exports.manageUsers= catchAsync(async (req, res, next) => {
    const users= await User.find({role: { $ne: 'admin'}});
    res.render('manage/manage-users',{
        title: 'Manage users',
        users
    })
});

// [GET] /delete-user/:id
module.exports.deleteUser = catchAsync(async (req, res, next) => {
    await Promise.all([
        User.findByIdAndDelete(req.params.id),
        Booking.deleteMany({user: req.params.id}),
        Review.deleteMany({user: req.params.id})
    ]);
    res.redirect('/admin/manage-users');
})


// manage reviews
module.exports.manageReviews = catchAsync(async (req, res, next) => {
  
})
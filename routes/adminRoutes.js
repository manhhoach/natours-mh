const express = require('express');
const router=express.Router();

const authController=require('./../controllers/authController');
const adminController=require('./../controllers/adminController');



router.use(authController.protect);
router.use(authController.restrictTo('admin'))

// manage tours
router.get('/manage-tours',  adminController.manageTours);
router.get('/create-tour', adminController.getCreateTourForm);
router.get('/edit-tour/:slug', adminController.getEditTourForm);
router.get('/delete-tour/:id', adminController.deleteTour);
router.post('/create-tour', 
 adminController.uploadTourImages, 
 adminController.createTour,
 adminController.resizeTourImages
 );

router.patch('/edit-tour/:slug',
  adminController.uploadTourImages, 
  adminController.editTour,
  adminController.resizeTourImages); 

// manage bookings
router.get('/manage-bookings', adminController.manageBookings);
router.get('/confirm-bookings/:id', adminController.confirmBookings);
router.get('/delete-bookings/:id', adminController.deleteBooking);


// manage users
router.get('/manage-users', adminController.manageUsers);
router.get('/delete-user/:id', adminController.deleteUser);

// manage reviews
router.get('/manage-reviews', adminController.manageReviews);

router.get('/change-status', adminController.changeApproval);


module.exports=router;
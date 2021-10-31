const express = require('express');
const router=express.Router();

const authController=require('./../controllers/authController');
const meController=require('./../controllers/meController');
const userController = require('./../controllers/userController');

router.use(authController.protect);

router.get('/', meController.getProfile);
router.get('/my-tours', meController.getMyTours);
router.get('/create-booking/:slug', meController.createBooking);
router.get('/create-review/:bookingId', meController.getCreateReviewForm);
router.post('/create-review/:bookingId', meController.createReview);
router.get('/delete-booking/:id', meController.deleteBooking);

router.patch('/update-data',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe);

router.patch('/update-password', authController.updatePassword);
router.get('/paid/:slug', meController.paid);


module.exports=router;
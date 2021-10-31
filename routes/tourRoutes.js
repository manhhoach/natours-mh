const express = require('express');
const router=express.Router();
const tourController=require('./../controllers/tourController');
const authController=require('./../controllers/authController');
const reviewRouter=require('./reviewRoutes');

router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/')
 .get(tourController.getAllTours)
 .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.createTour);

router.route('/tour-stats')
 .get(tourController.getTourStats);

router.route('/distances/:latlng/unit/:unit')
 .get(tourController.getDistances);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
      .get( tourController.getTourWithin); 


router.route('/:id')
 .get(tourController.getTour)
 .patch( 
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
 .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.deleteTour);

       
module.exports = router;
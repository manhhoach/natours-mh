const express = require('express')
const router = express.Router();
const viewsController = require('./../controllers/viewsController')
const authController = require('./../controllers/authController');

const tourController = require('./../controllers/tourController');



router.use(authController.isLoggedIn); // check user to render header

// guest: done!
router.get('/', viewsController.getOverview);
router.get('/tour/:slug',  viewsController.getTour);
router.get('/signup', viewsController.getSignUpForm);
router.post('/signup', viewsController.signup);
router.get('/login', viewsController.getLoginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);








module.exports = router;

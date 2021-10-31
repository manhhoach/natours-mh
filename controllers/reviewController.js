const Review = require('./../models/reviewModel');
const factory=require('./handlerFactory');


module.exports.setTourUserIds=(req, res, next)=>{
    if(!req.body.tour)
     req.body.tour=req.params.tourId;
    if(!req.body.user)
     req.body.user=req.user.id;
    next();  
}

module.exports.getAllReviews = factory.getAll(Review);
module.exports.getReview = factory.getOne(Review);
module.exports.createReview = factory.createOne(Review);
module.exports.deleteReview = factory.deleteOne(Review);
module.exports.updateReview = factory.updateOne(Review);
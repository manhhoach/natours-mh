const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        require:[true, 'Booking must belong to a tour']
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require:[true, 'Booking must belong to a user']
    },
    price:{ 
        type: Number,
        require:[true, 'Booking must have a price']
    },
    createdAt: 
    {
        type: Date,
        default: Date.now(),
    },
    status: 
    {
        type: Boolean,
        default: false
    },
    isReview:
    {
        type: Boolean,
        default: false
    }
});

bookingSchema.pre(/^find/, function(next){
    this.populate('user').populate({
        path: 'tour',
        select: 'name imageCover'
    });
    next();
})

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

const mongoose = require('mongoose')
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: 
    {
        type: String, trim: true, 
        required: [true, 'A tour must have a name'],
        unique: true,
        maxlength: [50, 'A tour name must have less of equal 50 characters'],
        minlength: [10, 'A tour name must have more of equal 10 characters']
        //validate: [validator.isAlpha, 'Tour name must only contain character']
    },
    slug: { type: String },
    duration: { type: Number, default: "empty" },
    maxGroupSize: { type: Number, default: "empty" },
    difficulty:
    { 
        type: String,
        required:[true, 'A tour must have a difficulty'],
        enum:
            {
            values: ['easy', 'medium','difficult'],
            message:'Difficulty is either: easy, medium, difficult'
            }
    },
    ratingsAverage: 
    { 
      type: Number, 
      default: 4.5, 
      min:[1, 'Rating must be above 1.0'],
      max:[5, 'Rating must be below 5.0'],
      set: val=> Math.round(val*10)/10   
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    sumary: { type: String, trim: true },
    description: { type: String, trim: true },
    imageCover: { type: String },
    images: [String],
    startDate:{ type:Date, default:Date.now()}, 
    priceDiscount: 
    { 
        type: Number,
        validate:
        {
            validator: function(val){
               return val<this.price;
            },
            message:'Discount price ({VALUE}) should be below regular price'
        }     
    },
    createdAt: { type: Date, default: Date.now() },
    secretTour: { type: Boolean, default: false },
    destination:String,
    guides:
    [
        { 
           type:mongoose.Schema.ObjectId,
           ref: 'User'
        }
    ]

}, 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



tourSchema.index({
    price: 1,
    ratingsAverage: -1
});
tourSchema.index({
    slug: 1
});


tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

// virtual populate
tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// document middleware: run before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// query middleware
tourSchema.pre(/^find/, function (next) {  
    this.populate({
        path: 'guides',
        select:'-__v -passwordChangedAt'
    });
    next();
})

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
})

// tourSchema.post(/^find/, function (doc, next) {
//     console.log('Query took in ' + (Date.now() - this.start) + ' milisecond');
//     next();
// })


// overwrite `Tour` model after compiled.
module.exports = mongoose.models.Tour || mongoose.model('Tour', tourSchema);
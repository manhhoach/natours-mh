const multer = require('multer')
const sharp = require('sharp')

const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');



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


module.exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);


module.exports.resizeTourImages = catchAsync(async (req, res, next) => {

    if (!req.files.images || !req.files.imageCover)
    {
        return next();
    }      

    // handle imageCover
    req.body.imageCover = `tour-${req.params.id}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333).toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // handle images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, index) => {
            const fileName = `tour-${req.params.id}-${index + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333).toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${fileName}`);

            req.body.images.push(fileName)
        })
    )
    next();
})


module.exports.getAllTours = factory.getAll(Tour);
module.exports.getTour = factory.getOne(Tour, { path: 'reviews' });
module.exports.createTour = factory.createOne(Tour);
module.exports.updateTour = factory.updateOne(Tour);
module.exports.deleteTour = factory.deleteOne(Tour);





// tours-within/:210/center/34.12,-12.54/unit/mi
module.exports.getTourWithin = catchAsync(async (req, res, next) => {

    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng)
        return next(new appError('Please provide longitude, latitude in the format', 400));

    const tours = await Tour.find(
        {
            startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
        }
    );

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { tours }
    });

})
module.exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng)
        return next(new appError('Please provide longitude, latitude in the format', 400));

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
                spherical: true
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: { distances }
    });

})
module.exports.getTourStats = catchAsync(async (req, res) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group:
            {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort:
            {
                avgPrice: 1
            }
        },
        {
            // ne: not equal
            $match: { _id: { $ne: 'easy' } }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: { stats }
    });
})
module.exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,sumary,difficulty';
    next();
}
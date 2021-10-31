const multer = require('multer')
const sharp = require('sharp')

const User = require('./../models/userModel');
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

module.exports.uploadUserPhoto = upload.single('photo')

module.exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file)
        return next();

    req.file.filename = `user-${res.locals.user.id}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
})

const filterObj = (obj, ...allowFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowFields.includes(el))
            newObj[el] = obj[el];
    })
    return newObj;
}

module.exports.createUser = (req, res) => {
    res.status(200).json({
        status: 'error',
        message: 'This route is not defined! Please use signup'
    })
}
module.exports.updateMe = catchAsync(async (req, res, next) => {

    //1 create error if user posts password data
    // api
    // if (req.body.password || req.body.passwordConfirm) {
    //     return next(new AppError('this route is not for password update',
    //         400));
    // }

    //2 filter out fields name that are not allowed to be updated
    const filterBody = filterObj(req.body, 'name', 'email');
    if (req.file)
        filterBody.photo = req.file.filename;

    const updateUser = await User
        .findByIdAndUpdate(res.locals.user.id, filterBody, {
            new: true, // return new obj
            runValidators: true
        });
    res.redirect('/me');

})

module.exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    })
})

module.exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

module.exports.getAllUsers = factory.getAll(User);
module.exports.getUser = factory.getOne(User);
// don't update password
module.exports.updateUser = factory.updateOne(User);
module.exports.deleteUser = factory.deleteOne(User);


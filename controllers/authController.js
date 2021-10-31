const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');


const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() +
            process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000), // convert to ms
            secure:true,
        httpOnly: true
    };
    user.password = undefined;
    res.cookie('jwt', token, cookieOptions).redirect('/');
    // res.status(statusCode).json({
    //     status: 'success',
    //     token: token,
    //     data: { user }
    // })   
}

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}


module.exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({ ...req.body });
    createSendToken(newUser, 201, res);
});


module.exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;
    // api
    // // 1. check if email and password are exist
    // if (!email || !password) {
    //     return next(new AppError('Please provide email and password', 400));
    // }
    // //2 check if user exist and password is correct
    // const user = await User.findOne({ email: email }).select('+password');
    // if (!user || !(await user.correctPassword(password, user.password))) {
    //     return next(new AppError('Incorrect email or password', 401));
    // }

    // render web
    if (!email || !password)
        res.redirect('/login');

    const user = await User.findOne({ email: email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password)))
        res.redirect('/login');
    else
        createSendToken(user, 200, res); // kiểm tra tk, mk hợp lệ thì gửi cho cái token
})


module.exports.logout = (req, res, next) => {
    const cookieOptions = {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    };
    res.cookie('jwt', '', cookieOptions).redirect('/');
}

// bảo vệ route
module.exports.protect = catchAsync(async (req, res, next) => {

    let token;
    //1. getting to token and check of it is there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];
    else if (req.cookies.jwt)
        token = req.cookies.jwt;

    if (!token)
        return next(new AppError('Your are not logged in!', 401));

    //2. verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    //3.check if user still exists 
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
        return next(new AppError('The user is not exist', 401));

    //4. check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat))
        return next(new AppError('User recently changed password', 401));

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
})

module.exports.isLoggedIn = async (req, res, next) => {

    if (req.cookies.jwt) {
        try {
            // verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            // check user is exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser)
                return next();
            if (currentUser.changedPasswordAfter(decoded.iat))
                return next();
            res.locals.user = currentUser;
        }
        catch (err) {
            return next();
        }
    }
    next();
}

// phân quyền
module.exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']
        if (!roles.includes(req.user.role))
            return next(new AppError('You do not have permission to perform this action', 403));
        next();
    }
}

module.exports.forgotPassword = catchAsync(async (req, res, next) => {

    //1 get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return next(new AppError('User is not exist', 404));
        
    //2 generate the random reset tokenKey
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3 send it to user email
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })

    }
    catch (e) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email. Try again later.', 500));
    }
});

module.exports.resetPassword = async (req, res, next) => {
    // 1. get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    //2 if token has not expired and there is user, set the new password 
    if (!user)
        return next(new AppError('Token is invalid or has expired', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // log the user in, send JWT
    createSendToken(user, 200, res);
}

module.exports.updatePassword = async (req, res, next) => {
    // api
    // get user from collection
    // const user = await User.findById(req.user.id).select('+password');
    // // check if posted current password is correct
    // if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    //     return next(new AppError('Password is wrong', 401));

    // // if so, update the password
    // user.password = req.body.password;
    // user.passwordConfirm = req.body.passwordConfirm;
    // await user.save();
    // // user.findbyIdAndUpdate is not work

    // // log user in, send jwt
    // createSendToken(user, 200, res);


    // render web
    const user = await User.findById(res.locals.user.id).select('+password');

    if(req.body.newPassword!==req.body.newPasswordConfirm)
      res.redirect('/me'); 
    else if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
      res.redirect('/me');
    else
    {
        user.password = req.body.newPassword;
        user.passwordConfirm = req.body.newPassword;
        await user.save();
        createSendToken(user, 200, res);
    }
   
}
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const permitFields = require('../utils/permitFields');

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(
    await permitFields(
      req.body,
      'name',
      'email',
      'password',
      'passwordConfirm',
      'photo',
    ),
  );

  genJWTAndSend(res, 201, user);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email })
    .select('+password')
    .select('+loginAttempts');

  if (!user || !(await user.isValidPW(password)) || user.isLocked) {
    if (user.isLocked) {
      return next(
        new AppError(
          'This account is locked. Please try again in 15 minutes',
          401,
        ),
      );
    }

    if (user) {
      user.loginAttempts++;
      if (user.loginAttempts > 2) {
        user.lockUntil = new Date(Date.now() + 900000);
        user.loginAttempts = 0;
      }
      await user.save({ validateBeforeSave: false });
    }

    return next(new AppError('Incorrect email or password', 401));
  }

  user.lockUntil = undefined;
  user.loginAttempts = 0;
  await user.save({ validateBeforeSave: false });

  genJWTAndSend(res, 200, user);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  const token = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${token}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset link for Natours (valid for 10 minutes)',
      message: `Please submit your new password to ${resetURL}\nIf you did not request this link, please ignore this email.`,
    });

    res.status(200).json({
      status: 'success',
      message: `Password reset link sent to ${user.email}`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending your reset email. Please try again later.',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError(
        'This link is no longer valid. Please request a new reset link.',
        404,
      ),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  genJWTAndSend(
    res,
    200,
    user,
    'Password updated successfully. You are now logged in',
  );
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, passwordConfirm } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.isValidPW(password))) {
    return next(new AppError('Incorrect password', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  genJWTAndSend(res, 200, user, 'Password successfully updated');
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new AppError('You must login to view this page', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // user deletes acct but still has token
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('User does not exist', 401));

  // user updates password since token was issued
  if (user.isPWChanged(decoded.iat)) {
    return next(
      new AppError(
        'Login credentials have changed. Please try logging in again',
        401,
      ),
    );
  }

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this action', 403),
      );
    }

    next();
  };
};

const genJWTAndSend = async (res, status, user, message) => {
  // hide these two fields from the output:
  user.loginAttempts = undefined;
  user.password = undefined;

  let payload = {
    status: 'success',
    token: user.generateJWT(),
    data: user,
  };

  if (status === 201) payload = { ...payload, data: user };
  if (message) payload = { ...payload, message };

  const cookieOptions = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRY)),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', payload.token, cookieOptions);
  res.status(status).json(payload);
};

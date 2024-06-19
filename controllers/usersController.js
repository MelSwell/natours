const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const permitFields = require('../utils/permitFields');

exports.updateProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `You cannot update your password from here\nPlease go to ${req.protocol}://${req.get('host')}/api/v1/users/update-password`,
        400,
      ),
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    await permitFields(req.body, 'name', 'email', 'photo'),
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.deactivateAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: { users },
  });
});

// admin
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getUserByID = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

//admin
exports.updateUser = catchAsync(async (req, res, next) => {
  // let user = await User.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });
  // if (!user) {
  //   return next(new AppError(`No user found with ID ${req.params.id}`, 404));
  // }
  // res.json({
  //   status: 'success',
  //   data: { user },
  // });
});

//admin
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const AppError = require('../utils/appError');

const handleCastErr = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErr = (err) => {
  let message = '';
  for (errorName in err.errors) {
    message += err.errors[errorName] + '\n';
  }
  return new AppError(message, 400);
};

const handleDupKey = (err) => {
  let message = '';
  for (const [key, val] of Object.entries(err.keyValue)) {
    message += `The ${key}: ${val} has already been taken, please try something else`;
  }
  return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message,
  });
};

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('💥💥 ERROR: ', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'Something went wrong. Please try again later';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { message: err.message, ...err };

    if (err.name === 'CastError') error = handleCastErr(err);
    if (err.name === 'ValidationError') error = handleValidationErr(err);
    if (err.code === 11000) error = handleDupKey(err);

    sendErrProd(error, res);
  }
};

const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const AppError = require('./utils/appError.js');
const errorController = require('./controllers/errorController.js');

const app = express();

if (process.env.NODE_ENV === 'development') {
  console.log('In the development environment');
  app.use(morgan('dev')); // simple http logging
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  return next(new AppError(`${req.originalUrl} is not a valid resource`, 404));
});

app.use(errorController);

module.exports = app;

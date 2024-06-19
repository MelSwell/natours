const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError.js');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const errorController = require('./controllers/errorController.js');

const app = express();
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  console.log('In the development environment');
  app.use(morgan('dev')); // simple http logging
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// establish rate limits
app.use('/api', limiter);
// limit request payload
app.use(express.json({ limit: '10kb' }));
// sanitize against nosql injection
app.use(mongoSanitize());
// prevent cross site scripting
app.use(xss());
// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
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

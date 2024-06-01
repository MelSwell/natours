const Tour = require('../models/tourModel');
const APIQuery = require('../utils/apiQuery');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

////////////////////////// CRUD ///////////////////////////////

exports.getAllTours = catchAsync(async (req, res, next) => {
  const apiQuery = new APIQuery(Tour.find(), req.query)
    .filter()
    .sort()
    .project()
    .paginate();
  const tours = await apiQuery.query;

  res.json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).select('-__v');

  if (!tour) {
    return next(new AppError(`No tour found with ID ${req.params.id}`, 404));
  }

  res.json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  let tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError(`No tour found with ID ${req.params.id}`, 404));
  }

  res.json({
    status: 'success',
    data: { tour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour found with ID ${req.params.id}`, 404));
  }

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

////////////////////////// AGGREGATORS ///////////////////////////////

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.getStats();

  res.json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlySched = catchAsync(async (req, res, next) => {
  const sched = await Tour.getMonthlySched(req.params.year * 1);

  res.json({
    status: 'success',
    data: { sched },
  });
});

////////////////////////// MIDDLEWARE ///////////////////////////////

exports.aliasTop5 = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

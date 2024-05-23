const Tour = require('../models/tourModel');
const APIQuery = require('../utils/apiQuery');

////////////// CRUD ////////////////////////

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).select('-__v');

    res.json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Placeholder error string',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Placeholder error',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    let tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      message: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.getStats();

    res.json({
      status: 'success',
      data: { stats },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlySched = async (req, res) => {
  try {
    const sched = await Tour.getMonthlySched(req.params.year * 1);

    res.json({
      status: 'success',
      data: { sched },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
////////////////////////// MIDDLEWARE ///////////////////////////////
exports.aliasTop5 = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

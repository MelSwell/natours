const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A name must be included'],
    unique: true,
  },
  duration: {
    type: Number,
    required: [true, 'A duration must be included'],
  },
  maxGroupSize: {
    type: Number,
    require: [true, 'Must include maximum group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'Must include a difficulty rating'],
  },
  ratingAverage: {
    type: Number,
    default: 3,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A price must be included'],
  },
  discount: Number,
  summary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trime: true,
    required: [true, 'A tour must have a description'],
  },
  imageCover: {
    type: String,
    required: [true, 'Must include a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

tourSchema.statics.getStats = async function () {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsQuantity: { $gte: 1 } },
      },
      {
        $group: {
          _id: '$difficulty',
          num: { $sum: 1 },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { num: 1 },
      },
    ]);

    return stats;
  } catch (err) {
    throw new Error(err);
  }
};

tourSchema.statics.getMonthlySched = async function (year) {
  try {
    const sched = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          count: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    return sched;
  } catch (err) {
    throw new Error(err);
  }
};

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

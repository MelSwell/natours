const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Must include a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name can be 40 characters long at most'],
      minlength: [5, 'Name must be at least 5 characters long'],
    },
    duration: {
      type: Number,
      required: [true, 'Must include a duration'],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'Must include maximum group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Must include a difficulty rating'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be one of: easy, medium, or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 3,
      max: 5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Must include a price'],
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount cannot be greater than the total price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Must include a description'],
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
    slug: String,
  },
  // Set schema options:
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
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

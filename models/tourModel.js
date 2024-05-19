const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A name must be included'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 3,
  },
  price: {
    type: Number,
    required: [true, 'A price must be included'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

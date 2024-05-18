const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

////////////// CRUD ////////////////////////
exports.getAllTours = (req, res) => {
  res.json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.getTourByID = (req, res) => {
  const tour = tours.find((tour) => tour.id === Number(req.params.id));
  if (tour) {
    res.json({
      status: 'success',
      data: { tour },
    });
  } else
    res.status(404).json({
      status: 'fail',
      data: {
        message: "Could not find the tour you're looking for",
      },
    });
};

exports.createTour = (req, res) => {
  const id = tours[tours.length - 1].id + 1;
  const newTour = { id, ...req.body };
  tours.push(newTour);

  fs.writeFile(
    `./dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
};

exports.updateTour = (req, res) => {
  res.json({
    status: 'error',
    tour: 'This route is not yet defined',
  });
};

exports.deleteTour = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

////////////////// MIDDLEWARE //////////////////
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Tour must include a name and a price',
    });
  }
  next();
};

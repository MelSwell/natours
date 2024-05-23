const express = require('express');
const toursController = require('../controllers/toursController.js');

const router = express.Router();

// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   next();
// });

router
  .route('/')
  .get(toursController.getAllTours)
  .post(toursController.createTour);

router
  .route('/top-5')
  .get(toursController.aliasTop5, toursController.getAllTours);

router.route('/stats').get(toursController.getTourStats);
router.route('/monthly-sched/:year').get(toursController.getMonthlySched);

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = router;

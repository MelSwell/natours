const express = require('express');
const toursController = require('../controllers/toursController.js');
const authController = require('../controllers/authController.js');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, toursController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.createTour,
  );

router
  .route('/top-5')
  .get(
    authController.protect,
    toursController.aliasTop5,
    toursController.getAllTours,
  );

router.route('/stats').get(toursController.getTourStats);
router.route('/monthly-sched/:year').get(toursController.getMonthlySched);

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.deleteTour,
  );

module.exports = router;

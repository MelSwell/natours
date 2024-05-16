const express = require('express')
const toursController = require('../controllers/toursController.js')

const tourRouter = express.Router()

tourRouter.route('/')
  .get(toursController.getAllTours) 
  .post(toursController.createTour)
  
tourRouter.route('/:id')  
  .get(toursController.getTourByID)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour)

module.exports = tourRouter
  
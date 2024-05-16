const express = require('express')
const toursController = require('../controllers/toursController.js')

const router = express.Router()

router.param('id', (req, res, next, val) => {
  console.log(`Tour id is: ${val}`)
  next()
})

router.route('/')
  .get(toursController.getAllTours) 
  .post(toursController.checkBody, toursController.createTour)
  
router.route('/:id')  
  .get(toursController.getTourByID)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour)

module.exports = router
  
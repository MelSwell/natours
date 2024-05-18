const express = require('express');
const usersController = require('../controllers/usersController.js');

const router = express.Router();

router
  .route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser);

router
  .route('/:id')
  .get(usersController.getUserByID)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;

const express = require('express')
const usersController = require('../controllers/usersController.js')

const userRouter = express.Router()

userRouter.route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser)

userRouter.route('/:id')
  .get(usersController.getUserByID)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser)

module.exports = userRouter
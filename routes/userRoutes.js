const express = require('express');
const usersController = require('../controllers/usersController.js');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword,
);

router.patch(
  '/update-profile',
  authController.protect,
  usersController.updateProfile,
);

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

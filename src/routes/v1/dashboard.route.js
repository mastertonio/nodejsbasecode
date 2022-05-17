const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dashboardValidation = require('../../validations/dashboard.validation');
const dashboardController = require('../../controllers/dashboard.controller');

const router = express.Router();

router
  .route('/:userId')
//   .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getDashboard);
  .get(dashboardController.getDashboard);

module.exports = router;
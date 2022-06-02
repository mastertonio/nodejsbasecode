const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dashboardValidation = require('../../validations/dashboard.validation');
const dashboardController = require('../../controllers/dashboard.controller');
const { get } = require('mongoose');

const router = express.Router();

router
  .route('/:userId')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getDashboard)
  .put(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.updateTemplateStatus);

router
  .route('/importance/:templateId/:userId')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getImportance)
  .put(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.updateImportance)

module.exports = router;
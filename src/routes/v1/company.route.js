const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const companyValidation = require('../../validations/company.validation');
const companyController = require('../../controllers/company.controller');
// const dashboardController = require('../../controllers/dashboard.controller');
// const { get } = require('mongoose');

const router = express.Router();

router
  .route('/')
  .post(auth('createCompany'), validate(companyValidation.createCompany), companyController.createCompany)
  .get(auth('getCompany'), validate(companyValidation.getCompany), companyController.getAllCompany);

router
  .route('/:_id')
  .get(auth('getCompany'), validate(companyValidation.getCompany), companyController.getCompany)
  .patch(auth('getCompany'), validate(companyValidation.patchCompany), companyController.patchCompany);
  
  

module.exports = router;
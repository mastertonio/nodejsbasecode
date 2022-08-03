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
  //auth('createCompany'), validate(companyValidation.createCompany),
  .post(  companyController.createCompany)
  .get(auth('getCompany'), validate(companyValidation.getCompany), companyController.getAllCompany);

router
  .route('/user')
  .post(auth('createCompanyUser'), validate(companyValidation.createCompanyUser), companyController.createCompanyUser);

router
  .route('/template')
  .post(auth('createCompnayTemplate'), validate(companyValidation.createCompnayTemplate), companyController.createCompanyTemplate)
  .get(auth('listCompanyTemplate'), validate(companyValidation.listCompanyTemplate), companyController.listCompanyTemplate)

router
  .route('/template/version')
  .post(auth('createCompnayTemplateVersion'), validate(companyValidation.createCompnayTemplateVersion), companyController.createCompnayTemplateVersion);


router
  .route('/company/logo/:_id')
  .get(auth('createCompany'),companyController.getFile)
router
  .route('/:_id')
  .get(auth('getCompany'), validate(companyValidation.getCompany), companyController.getCompany)
  .patch(auth('getCompany'), validate(companyValidation.patchCompany), companyController.patchCompany);
  
  

module.exports = router;

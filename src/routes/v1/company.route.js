const express = require('express');

const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const companyValidation = require('../../validations/company.validation');
const companyController = require('../../controllers/company.controller');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
// const dashboardController = require('../../controllers/dashboard.controller');
// const { get } = require('mongoose');

const router = express.Router();

/**
 * company creattion
 * 
 */
router
  .route('/')
  .post(auth('createCompany'), companyController.createCompany)
  .get(auth('getCompany'), validate(companyValidation.getCompany), companyController.getAllCompany);


/**
 * Company user
 */
router
  .route('/:company_id/user')
  .post(auth('createCompanyUser'), validate(companyValidation.createCompanyUser), companyController.createCompanyUser)
  .get(auth('getAllUser'), validate(companyValidation.getAllCompanyUser), companyController.getAllCompanyUser);


/**
 * transfer ROI 
 */
 router
 .route('/:company_id/roi/transfer')
 .post(auth('transferTemplate'), validate(companyValidation.transferTemplate), companyController.transferTemplateAccount)

/**
 * Company patch user
 */
 router
 .route('/:company_id/user/:userId')
 .patch(auth('patchCompanyUser'), validate(companyValidation.patchCompanyUser), companyController.patchCompanyUser)
 .get(auth('getUser'), validate( userValidation.getUser), userController.getUser);

/**
 * get company by id
 */
 router
 .route('/:_id')
 .get(auth('getCompany'), validate(companyValidation.getCompany), companyController.getCompany)
 .patch(auth('getCompany'), validate(companyValidation.patchCompany), companyController.patchCompany);











  


//list of user


//list of manager
router
  .route('/manager')
  .get(auth('getManager'), validate(companyValidation.getManager), companyController.getAllManager);

//list of currency
router
  .route('/currency')
  .get(auth('getCurrency'), validate(companyValidation.getCurrency), companyController.getAllCurrency);

/**
 * Company Template
 */
router
  .route('/template')
  .post(auth('createCompnayTemplate'), validate(companyValidation.createCompnayTemplate), companyController.createCompanyTemplate)
  .get(auth('listCompanyTemplate'), validate(companyValidation.listCompanyTemplate), companyController.listCompanyTemplate)

/**
 * Company Template version
 */
router
  .route('/template/version')
  .post(auth('createCompnayTemplateVersion'), validate(companyValidation.createCompnayTemplateVersion), companyController.createCompnayTemplateVersion);


/**
 * Capture company logo
 */
router
  .route('/company/logo/:_id')
  .get(auth('createCompany'),companyController.getFile)

  
  
  

module.exports = router;

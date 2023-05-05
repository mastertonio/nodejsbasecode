const express = require('express');

const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const companyValidation = require('../../validations/company.validation');
const companyController = require('../../controllers/company.controller');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

/**
 * company creattion
 * auth('createCompany'),
 */
router
  .route('/')
  .post(auth('createCompany'), validate(companyValidation.createCompany), companyController.createCompany)
  .get(auth('getCompany'), validate(companyValidation.getCompany), companyController.getAllCompany);

router
.route('/:company_id/license')
.get(auth('getCompany'), validate(companyValidation.getCompany), companyController.getCompanylicenseStatus);

/**
 * Company user
 */
router
  .route('/:company_id/user')
  .post(auth('createCompanyUser'), validate(companyValidation.createCompanyUser), companyController.createCompanyUser)
  .get(auth('getAllUser'), validate(companyValidation.getAllCompanyUser), companyController.getAllCompanyUser);

// router
//   .route('/:company_id/enduser')
//   .get(auth('getAllUser'), validate(companyValidation.getAllCompanyUser), companyController.getAllCompanyUser);

router
  .route('/:company_id/user/templates')
  .get(auth('getAllUserTemplate'), validate(companyValidation.getAllCompanyUser), companyController.getAllUserTemplate);

/**
 * transfer ROI 
 */
 router
 .route('/:company_id/roi/transfer/all')
 .post(auth('transferTemplate'), validate(companyValidation.transferTemplates), companyController.transferAllTemplateAccount)

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

//list of manager
router
  .route('/:company_id/manager')
  .get(auth('getManager'), validate(companyValidation.getManager), companyController.getAllManager);

//list of currency
router
  .route('/currency/list')
  .get(auth('getCurrency'), validate(companyValidation.getCurrency), companyController.getAllCurrency);

/**
 * Company Template
 */
router
  .route('/:company_id/template')
  .post(auth('createCompnayTemplate'), validate(companyValidation.createCompnayTemplate), companyController.createCompanyTemplate)
  .get(auth('listCompanyTemplate'), validate(companyValidation.listCompanyTemplate), companyController.listCompanyTemplate)

router
  .route('/:company_id/template/:template_id')
  .patch(auth('patchCompnayTemplate'), validate(companyValidation.patchCompnayTemplate), companyController.patchCompnayTemplate)
  .get(auth('CompnayTemplateInfo'), validate(companyValidation.getTemplateInfo), companyController.getTemplateInfo)
  .delete(auth('deleteTemplate'), validate(companyValidation.deleteTemplate), companyController.deleteTemplate)

/**
 * Company Template version
 * Get templateversion for the templatebuilder
 */
router
  .route('/:company_id/template/:template_id/version')
  .post(auth('createCompnayTemplateVersion'), validate(companyValidation.createCompnayTemplateVersion), companyController.createCompnayTemplateVersion)
  .get(auth('getCompnayTemplateVersion'), validate(companyValidation.getCompnayTemplateVersion), companyController.getCompnayTemplateVersion)

router
  .route('/:company_id/template/:template_id/version/:version_id/adminTool')
  .get(auth('getCompnayTemplateVersion'), validate(companyValidation.getCompnayTemplateBuilder), companyController.getCompanyadminTool)
  .put(auth('getCompnayTemplateVersion'), validate(companyValidation.createCompnayTemplateBuilder), companyController.createCompanyAdminTool)
router
  .route('/admintool/:adminTool_id/section/:section_id')
  .patch(auth('getCompnayTemplateVersion'), validate(companyValidation.patchSection), companyController.updateCompanyAdminTool)
  .delete(auth('getCompnayTemplateVersion'), validate(companyValidation.deleteSection), companyController.deleteSection)

router
  .route('/admintool/:adminTool_id/section/:section_id/element/:element_id')
  .patch(auth('getCompnayTemplateVersion'), validate(companyValidation.patchSectionElement), companyController.updateSectionElement)
  router
  .route('/admintool/:adminTool_id/section/:section_id/element/:element_id/target/:target_name')
  .delete(auth('getCompnayTemplateVersion'), validate(companyValidation.deleteSectionElement), companyController.deleteSectionElement)

router
  .route('/:company_id/template/:template_id/version/:version_id')
  .patch(auth('patchCompnayTemplateVersion'), validate(companyValidation.patchCompnayTemplateVersion), companyController.patchCompnayTemplateVersion)
  .get(auth('getCompnayTemplateVersion'), validate(companyValidation.getCompnayTemplateVersionInfo), companyController.getCompnayTemplateVersionInfo)
  .delete(auth('deleteTemplateVersion'), validate(companyValidation.deleteTemplateVersion), companyController.deleteCompanyTemplateVersionInfo)


/**
 * Capture company logo
 */
router
  .route('/company/logo/:_id')
  .get(auth('createCompany'),companyController.getFile)

module.exports = router;

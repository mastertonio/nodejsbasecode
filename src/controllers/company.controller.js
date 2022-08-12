const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const {companyService, userService} = require('../services');
const { create } = require('../models/token.model');
const { jwtExtract, getCID, getUserRole } = require('./common.controller');

const AWSs3 =  require('../services/s3.service');
const { info } = require('../config/logger');
const logger = require('../config/logger');
const { User } = require('../models');
const {currency} = require('../config/currency');

const {getCalculatorStatistic} = require('../services/dashboard.service');
const { email } = require('../config/config');
const { values } = require('underscore');
const { objectId } = require('../validations/custom.validation');
const ObjectId = require('mongodb').ObjectID;
const ApiError = require('../utils/ApiError');
const _ = require("underscore");
const getFile = catchAsync(async (req, res)=>{
    /**
     * extracting JWT Token to get the User Id
     */
     const token = jwtExtract(req);
     /**
      * validating the user Account base on the response of the extraction
      */
     const is_user = await userService.getUserById(token);
     if(!is_user){
       let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
       logger.error(`[Invalid TOken] ${error}`);
       throw error;
     }
    const awsService = await new AWSs3({name:req.params._id,data:null, bucket:1});
    const encode = await awsService.fetch_file;
    logger.info(`[File] ${encode}`);
    res.writeHead(200, {"Content-type":encode.ContentType});    
    res.end(encode.Body)
});

const createCompany = catchAsync(async (req, res) =>{
  
    /**
     * extracting JWT Token to get the User Id
     */
    const token = jwtExtract(req);
    /**
     * validating the user Account base on the response of the extraction
     */
    const is_user = await userService.getUserById(token);
    let bucketLocation = null;
    if(!is_user){
      let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }

    /**
     * get the file and upload to s3bucket services
     */
    // if(req.files.contract_file !== 'undefined' || req.files.contract_file !== null){
    //   const file = req.files.contract_file;
    //   const awsService = await new AWSs3(file);
    //   await awsService.upload_file;
    //   bucketLocation = file.name;
      
    // }


    /**
     * construct company info
     */
    const data = {};
    data.name = req.body.name;
    data.alias = req.body.alias;
    data.active = req.body.active;
    data.licenses = req.body.licenses;
    data.contact_fname = req.body.contact_fname;
    data.contact_lname = req.body.contact_lname;
    data.contact_email = req.body.contact_email;
    data.contact_phone = req.body.contact_phone;
    data.contract_file = "NA";
    // data.contract_file = bucketLocation;
    data.contract_start_date = req.body.contract_start_date;
    data.contract_end_date = req.body.contract_end_date;
    data.notes = req.body.notes;
    
    const create_company = await companyService.createCompany(data);
    logger.info(`[Company endpoint] response: ${create_company}`)
    res.send(create_company);
  });

const getCompany = catchAsync(async (req, res) =>{
    const token = jwtExtract(req);
    const get_company = await companyService.getCompany(token, req.params);
    res.send(get_company);
})

/**
 * Get comapnay by user role
 * if the user role is admin it will return all the company
 * if the user role is company-admin it will return own company info
 */
const getAllCompany = catchAsync(async (req, res) =>{
     /**
  * extracting JWT Token to get the User Id
  */
   const token = jwtExtract(req);
   /**
       * validating the user Account base on the response of the extraction
       */
   const is_user = await userService.getUserById(token);
   if(!is_user){
     let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
     logger.error(`[Invalid TOken] ${error}`);
     throw error;
   }


    const getAll_company = await companyService.getAllCompany(token);     
    
    res.send(getAll_company);
})

const patchCompany = catchAsync(async (req,res) => {
    console.log(req.body)
    const token = jwtExtract(req);
    
    const patch_company = await companyService.patchCompany(token, req.params, req.body);
    res.send(patch_company);
})
/**
 * create user company
 * only the admin or the company admin can create user account for specific company
 * 
 */

const createCompanyUser = catchAsync(async (req, res) => {
  
  /**
    * extracting JWT Token to get the User Id
    */
   const token = jwtExtract(req);
   /**
     * validating the user Account base on the response of the extraction
     */
   const is_user = await userService.getUserById(token);
   if(!is_user){
     let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
     logger.error(`[Invalid TOken] ${error}`);
     throw error;
   }
   const company_id = getCID(req);
   /**
    * validate if the company id is valid
    */
   const is_company = await companyService.getCompanyById(req.params.company_id);
   
   if(!is_company) {
    let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
    logger.error(`[Invalid TOken] ${error}`);
    throw error;
   }
  req.body = getUserRole(req.body);

   //create new user under specific company
   const user_req = {...req.body};
   user_req.company_id = company_id;
   user_req.created_by = token;
   user_req.status = 1;
   
   const createUser = await companyService.company_user(user_req);



  res.send(createUser)
})

/**
 * create company template
 */
const createCompanyTemplate = catchAsync(async (req, res)=>{
  /**
    * extracting JWT Token to get the User Id
    */
    const token = jwtExtract(req);
    /**
      * validating the user Account base on the response of the extraction
      */
    const is_user = await userService.getUserById(token);
    if(!is_user){
      let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
    const company_id = getCID(req);
    /**
     * validate if the company id is valid
     */
    const is_company = await companyService.getCompanyById(company_id);
    
    if(!is_company) {
      let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
     logger.error(`[Invalid TOken] ${error}`);
     throw error;
    }

    /**
     * Add body parameters company_id and created by which can be extract in the JWT token
     * cid = company id => company_id
     * sub = user id => token
     */
    req.body.company_id = company_id;
    req.body.created_by = token;
    const create_template = await companyService.createNewTempalete(req.body)
    res.send(create_template);

});

/**
 * create company template Version
 */
const createCompnayTemplateVersion = catchAsync(async (req, res)=>{
   /**
    * extracting JWT Token to get the User Id
    */
    const token = jwtExtract(req);
    /**
      * validating the user Account base on the response of the extraction
      */
    const is_user = await userService.getUserById(token);
    if(!is_user){
      let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
    const company_id = getCID(req);
    /**
     * validate if the company id is valid
     */
    const is_company = await companyService.getCompanyById(company_id);
    
    if(!is_company) {
      let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
     logger.error(`[Invalid TOken] ${error}`);
     throw error;
    }
    
    /**
     * Add body parameters company_id and created by which can be extract in the JWT token
     * cid = company id => company_id
     * sub = user id => token
     * getTemplateVersion(template_id)
     * getCompanyTemplateByCompanyId (company_id)
     */

    const template = await companyService.getCompanyTemplateByCompanyId(company_id);
    req.body.template_id = template[0]._id;
    req.body.created_by = token;
    
    const templateVersion = await companyService.createTemplateVersion(req.body);
    res.send(templateVersion);
})

  const listCompanyTemplate = catchAsync(async(req,res)=>{
    /**
    * extracting JWT Token to get the User Id
    */
     const token = jwtExtract(req);
     /**
       * validating the user Account base on the response of the extraction
       */
     const is_user = await userService.getUserById(token);
     if(!is_user){
       let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
       logger.error(`[Invalid TOken] ${error}`);
       throw error;
     }
     const company_id = req.params.company_id;
     /**
      * validate if the company id is valid
      */
     const is_company = await companyService.getCompanyById(company_id);
     
     if(!is_company) {
       let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
     }
     
     /**
      * Add body parameters company_id and created by which can be extract in the JWT token
      * cid = company id => company_id
      * sub = user id => token
      * getTemplateVersion(template_id)
      * getCompanyTemplateByCompanyId (company_id)
      */
    

     const template = await companyService.getCompanyTemplateByCompanyId(company_id);
      
     res.send(template)
      
  });

  const getAllCurrency = catchAsync(async(req,res)=>{
    /**
    * extracting JWT Token to get the User Id
    */
     const token = jwtExtract(req);
     /**
       * validating the user Account base on the response of the extraction
       */
     const is_user = await userService.getUserById(token);
     if(!is_user){
       let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
       logger.error(`[Invalid TOken] ${error}`);
       throw error;
     }
     const company_id = getCID(req);
     /**
      * validate if the company id is valid
      */
     const is_company = await companyService.getCompanyById(company_id);
     
     if(!is_company) {
       let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
     }
    res.send(currency)  
  });

  /**
   * get all manager 
   */
  const getAllManager = catchAsync(async(req,res)=>{
    /**
    * extracting JWT Token to get the User Id
    */
     const token = jwtExtract(req);
     /**
       * validating the user Account base on the response of the extraction
       */
     const is_user = await userService.getUserById(token);
     if(!is_user){
       let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
       logger.error(`[Invalid TOken] ${error}`);
       throw error;
     }
     const company_id = req.params.company_id;
     /**
      * validate if the company id is valid
      */
     const is_company = await companyService.getCompanyById(company_id);
     
     if(!is_company) {
       let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
     }
     let comp_id = company_id;
     
     const companyMangerAccount = await companyService.getManagerByCompanyId(comp_id);
     res.send(companyMangerAccount);
  })

  const getAllCompanyUser = catchAsync(async(req,res)=>{
    /**
    * extracting JWT Token to get the User Id
    */
     const token = jwtExtract(req);
     /**
       * validating the user Account base on the response of the extraction
       */
     const is_user = await userService.getUserById(token);
     if(!is_user){
       let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
       logger.error(`[Invalid TOken] ${error}`);
       throw error;
     }
     const company_id = req.params.company_id;
     /**
      * validate if the company id is valid
      */
     const is_company = await companyService.getCompanyById(company_id);
     
     if(!is_company) {
       let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
     }
    //  let comp_id = (is_user.role == "company-admin")? company_id : null;
     const companyUserAccount = await companyService.companyUserAccount(company_id);
     
     
     
     res.send(companyUserAccount)
    });

/**
 * Transfer ROI account to new account
 * 
 */
const transferTemplateAccount = catchAsync(async(req,res)=>{
    /**
    * extracting JWT Token to get the User Id
    */
     const token = jwtExtract(req);
     /**
       * validating the user Account base on the response of the extraction
       */
     const is_user = await userService.getUserById(token);
     if(!is_user){
       let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
       logger.error(`[Invalid TOken] ${error}`);
       throw error;
     }
     
     /**
      * validate if the company id is valid
      */
     const is_company = await companyService.getCompanyById(req.params.company_id);
     
     if(!is_company) {
       let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
     }


     const transferAccount = await companyService.transferAccount(req.body);
     res.send(transferAccount)
  });

  /**
   * update company user account
   */
  const patchCompanyUser = catchAsync(async(req,res)=>{
    /**
    * extracting JWT Token to get the User Id
    */
     const token = jwtExtract(req);
     /**
       * validating the user Account base on the response of the extraction
       */
     const is_user = await userService.getUserById(token);
     if(!is_user){
       let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
       logger.error(`[Invalid TOken] ${error}`);
       throw error;
     }
     const company_id = req.params.company_id;
     /**
      * validate if the company id is valid
      */
     const is_company = await companyService.getCompanyById(company_id);
     
     if(!is_company) {
       let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
     }

    req.body = getUserRole(req.body);

    const updateUserAccount = await companyService.updateUserAccount(req.params.userId,req.body);
    res.send(updateUserAccount);
   
  })
  
  module.exports = {
    createCompanyTemplate,
    createCompanyUser,
    createCompany,
    getFile,
    getCompany,
    getAllCompany,
    patchCompany,
    createCompnayTemplateVersion,
    listCompanyTemplate,
    getAllCurrency,
    getAllManager,
    getAllCompanyUser,
    transferTemplateAccount,
    patchCompanyUser
  }
  
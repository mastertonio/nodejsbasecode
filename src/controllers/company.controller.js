const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const {companyService, userService} = require('../services');
const { create } = require('../models/token.model');
const { jwtExtract, getCID, getUserRole } = require('./common.controller');

const AWSs3 =  require('../services/s3.service');
const { info } = require('../config/logger');
const logger = require('../config/logger');
const { User, Calculator, Template, TemplateVersion } = require('../models');
const {currency} = require('../config/currency');

const {getCalculatorStatistic} = require('../services/dashboard.service');
const { email } = require('../config/config');
const { values, template } = require('underscore');
const { objectId } = require('../validations/custom.validation');
const ObjectId = require('mongodb').ObjectID;
const ApiError = require('../utils/ApiError');
const _ = require("underscore");
const {ACTIVE,INACTIVE, LOGGER_INVALID_TOKEN, STATUS_ACTIVE} = require("../common/staticValue.common");
const { reset } = require('nodemon');


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
   
    if(req.files){
      const file = req.files.contract_file;
      const awsService = await new AWSs3(file);
      await awsService.upload_file;
      bucketLocation = file.name;
      
    }


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
    data.contract_file = bucketLocation;
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
      logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
      throw error;
    }
    const company_id = req.params.company_id;
    /**
     * validate if the company id is valid
     */
    const is_company = await companyService.getCompanyById(company_id);
    
    if(!is_company) {
      let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
     logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
     throw error;
    }

    /**
     * Add body parameters company_id and created by which can be extract in the JWT token
     * cid = company id => company_id
     * sub = user id => token
     */
    req.body.company_id = company_id;
    req.body.created_by = token;
    const create_template = await companyService.createNewTempalete(req.body);
    let status = (create_template.active == 1)? ACTIVE:INACTIVE;
    res.send({
      _id:create_template._id,
      name:create_template.name,
      notes:create_template.notes,
      company_id:create_template.company_id,
      active:create_template.active,
      status:status
    });

});

/**
 * patch company template
 */
const patchCompnayTemplate = catchAsync(async (req, res)=>{
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
     logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
     throw error;
   }
   const company_id = req.params.company_id;
   /**
    * validate if the company id is valid
    */
   const is_company = await companyService.getCompanyById(company_id);
   
   if(!is_company) {
    let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
    logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
    throw error;
   }
   const template_id = req.params.template_id;
   req.body.active = req.body.status;
   
   const template_response = await companyService.updateTemplate(template_id,req.body);
   res.send(template_response)
})

/**
 * get all template version
 */

const getCompnayTemplateVersion = catchAsync(async (req,res)=>{
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
   const template_id = req.params.template_id;
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
   const template = await Template.findById(template_id);  

   if(!template){
     let error = new ApiError(httpStatus.NOT_FOUND, 'Template id not found');
     logger.error(`[Invalid TOken] ${error}`);
     throw error;
   }
   const templateVersion = await TemplateVersion.find({template_id:template_id})
   const container = [];
   templateVersion.map(v=>{
    let templateVersion_status = "inactive"
    if(v.stage == 1){
      templateVersion_status = "active"
    }
    container.push({
      _id:v._id,
      stage:v.stage,
      level:v.level,
      versions:v.version,
      name:v.name,
      notes:v.notes,
      template_id: v.template_id,
      status:templateVersion_status
    })
    
   })
   res.send(container)
})

/**
 * get all template version
 */

 const getCompnayTemplateVersionInfo = catchAsync(async (req,res)=>{
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
   const template_id = req.params.template_id;
   const version_id = req.params.version_id;
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
   const template = await Template.findById(template_id);  

   if(!template){
     let error = new ApiError(httpStatus.NOT_FOUND, 'Template id not found');
     logger.error(`[Invalid TOken] ${error}`);
     throw error;
   }
   const templateVersion = await TemplateVersion.find({_id:version_id,template_id:template_id})
   const container = [];
   templateVersion.map(v=>{
    let templateVersion_status = "inactive"
    if(v.stage == 1){
      templateVersion_status = "active"
    }
    container.push({
      _id:v._id,
      stage:v.stage,
      level:v.level,
      versions:v.version,
      name:v.name,
      notes:v.notes,
      template_id: v.template_id,
      status:templateVersion_status
    })
    
   })
   res.send(container)
})

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
    const company_id = req.params.company_id;
    const template_id = req.params.template_id;
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
    const template = await Template.findById(template_id);  

    if(!template){
      let error = new ApiError(httpStatus.NOT_FOUND, 'Template id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }

    if(template.active != STATUS_ACTIVE){
      let error = new ApiError(httpStatus.NON_AUTHORITATIVE_INFORMATION , 'Inactive Template ID');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
    
    req.body.template_id = template._id;
    req.body.created_by = token;
    
    const templateVersion = await companyService.createTemplateVersion(req.body);
    res.send(templateVersion);
})

/**
 * create company template Version
 */
 const patchCompnayTemplateVersion = catchAsync(async (req, res)=>{
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
   const template_id = req.params.template_id;
   const version_id = req.params.version_id;
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
   const template = await Template.findById(template_id);  

   if(!template){
     let error = new ApiError(httpStatus.NOT_FOUND, 'Template id not found');
     logger.error(`[Invalid TOken] ${error}`);
     throw error;
   }

   if(template.active != STATUS_ACTIVE){
     let error = new ApiError(httpStatus.NON_AUTHORITATIVE_INFORMATION , 'Inactive Template ID');
     logger.error(`[Invalid TOken] ${error}`);
     throw error;
   }

   /**
     * check if there's active version exist
     */
    const activeTemplateVersion = await TemplateVersion.find({template_id:template_id,stage:1});

    if(!_.isEmpty(activeTemplateVersion) && activeTemplateVersion[0]._id != version_id){
      let error = new ApiError(httpStatus.NON_AUTHORITATIVE_INFORMATION , 'Unable to activate this template, need to deactivate active template versions.');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
   console.log(req.body.status)
   req.body.template_id = template._id;
   req.body.created_by = token;
   if(!_.isUndefined(req.body.status)){
    req.body.stage = req.body.status;
   }
   
   const update_templateVersion = await companyService.updateTemplateVersion(version_id,req.body);
  res.send(update_templateVersion)
 
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
    

     const templates = await companyService.getCompanyTemplateByCompanyId(company_id);
      
     res.send(templates)
      
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

  const getAllUserTemplate = catchAsync(async(req,res)=>{
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
     const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
     
     const getTemplateList = await companyService.getAllUserTemplate(company_id);
     const container = [];
     const template_container = [];

     const template = await Template.find({company_id:company_id});
     
     getTemplateList.map(v=>{
     
      v.templates.map(k=>{
        
        let d=new Date(k.createdAt);     
        let monthIndex  =  d.getMonth();
        let monthName = months[monthIndex]
        let getDate = d.getDate();
            getDate = (String(Math.abs(getDate)).charAt(0) == getDate) ? `0${getDate}` : getDate;
        let getYear = d.getFullYear();
        let n_d = d.toLocaleString();
            n_d= n_d.split(', ');

            template.map(p=>{
              
              container.push({
                user_id: v._id,
                template_id: p._id,
                template_name: p.name,
                calculator_name: k.title,
                username: v.email,
                link: (k.verification_code == "" || k.verification_code == null || k.verification_code == "null") ? "" : `https://www.theroishop.com/enterprise/${v._id}/?roi=35acaf126d430c17d1a438bf8ae424ccc5d94885`,
                createdAt: `${monthName} ${getDate},${getYear} ${n_d[1]}`,
                visits: k.visits,
                unique_ip: parseInt(k.unique_ip)
              })
            })
        

      })      
     })
     res.send(container)
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
     
     const companyUserAccount = await companyService.companyUserAccount(company_id);
     
     res.send(companyUserAccount)
    });

/**
 * Transfer ROI account to new account
 * 
 */
const transferAllTemplateAccount = catchAsync(async(req,res)=>{
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


     const transferAllAccount = await companyService.transferAllAccount(req.body);
     res.send(transferAllAccount)
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
  /**
   * get template info
   */
  const getTemplateInfo = catchAsync(async(req,res)=>{
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
      logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
      throw error;
    }
    const company_id = req.params.company_id;
    const template_id = req.params.template_id;
    /**
      * validate if the company id is valid
      */
    const is_company = await companyService.getCompanyById(company_id);
    
    if(!is_company) {
      let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
      logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
      throw error;
    }

    const template_info = await companyService.templateInfo(is_company,template_id);
    res.send(template_info)
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
    transferAllTemplateAccount,
    patchCompanyUser,
    getAllUserTemplate,
    patchCompnayTemplate,
    getTemplateInfo,
    patchCompnayTemplateVersion,
    getCompnayTemplateVersion,
    getCompnayTemplateVersionInfo
  }
  
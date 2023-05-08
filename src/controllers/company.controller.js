const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const {companyService, userService,templateBuilderService} = require('../services');
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
const { objectId, password } = require('../validations/custom.validation');
const ObjectId = require('mongodb').ObjectID;
const ApiError = require('../utils/ApiError');
const _ = require("underscore");
const {ACTIVE,INACTIVE, LOGGER_INVALID_TOKEN, STATUS_ACTIVE} = require("../common/staticValue.common");
const { reset } = require('nodemon');
const { createAdminTool, updateAdminTool } = require('../services/templateBuilder.service');

const {sendEmail} = require('../services/email.service');
const sectionBuilder = require('../models/sectionBuilder.model');


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

   if(is_company.licenses <= 0){
    let error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'Unable to create new user account');
    logger.error(`[Company Module] ${error}`)
    throw error;
   }
   
  req.body = getUserRole(req.body);

   //create new user under specific company
   const user_req = {...req.body};
   user_req.company_id = company_id;
   user_req.created_by = token;
   user_req.name = `${req.body.first_name} ${req.body.last_name}`
   user_req.status = 1;
   
   if(_.isEmpty(user_req.password)){
    const randPassword = ()=>{
      let lettersLength = 10;
      let numbersLength = 10;
      let j, x, i;
      let result = '';
      let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()-_=+[{]}|;:<,>.?/';
      let t1 = new Date().getTime();
      let numbers =  String(t1);
      
      for (i = 0; i < lettersLength; i++ ) {
          result += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      for (i = 0; i < numbersLength; i++ ) {
          result += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
      result = result.split("");
      for (i = result.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = result[i];
          result[i] = result[j];
          result[j] = x;
      }
      result = result.join("");
      return result
    } 

    user_req.password = randPassword();
   }
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






    const templateVersionData = {
      name: `${create_template.name}`,
      version: 1,
      stage: 1,
      notes: `this is version created for template ${create_template._id}`,
      template_id: create_template._id,
      created_by: token
    }   
    
    const templateVersion = await companyService.createTemplateVersion(templateVersionData);

    let  templateBuilderData =  {
      company_id: company_id,
      template_id:  create_template._id,
      version_id: templateVersion.id
    }
    
    await  templateBuilderService.createAdminTool(templateBuilderData);

    res.send({
      _id:create_template._id,
      name:create_template.name,
      notes:create_template.notes,
      company_id:create_template.company_id,
      projection:create_template.projection,
      active:create_template.active,
      status:status,
      templateVersion:templateVersion
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
});

/**
 * get specific tempalte builder
 */
const getCompanyadminTool = catchAsync(async (req,res)=>{
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
   const adminTool = await templateBuilderService.getAdminTool({company_id:company_id,template_id:template_id,version_id:version_id})




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
     projection: template.projection,
     company_logo:"https://theroishop.com/assets/roishop/wp-content/uploads/2019/08/ROI-Shop-Logo.png",
     status:templateVersion_status
   })
   
  })
  let response = {adminTool:adminTool[0],TemplateVersionInfo:container[0]};
   res.send(response)
});
const deleteSection = catchAsync(async (req,res)=>{
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
  const adminTool_id = req.params.adminTool_id;
  const section_id = req.params.section_id;
  const section = await sectionBuilder.findById(adminTool_id);
  const sectionContainer = [];
  section.sections.map(v=>{
    if(JSON.stringify(v._id) !== JSON.stringify(section_id)){
      sectionContainer.push(v);
    }
  })
  // section.sections=sectionContainer;

  const update = await  sectionBuilder.updateOne({_id:adminTool_id}, req.updateDoc,{new:true});


  let qkey = {_id:adminTool_id};
  let sectionEntry = await updateAdminTool({key:qkey,updateDoc:{$set:{'sections':sectionContainer}}},{ returnDocument: 'after' })

  let getSectionArea = await templateBuilderService.getAdminToolInfo(req);
    if(getSectionArea){
      res.send(getSectionArea)
    }else{
      let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
  // res.send({})

})

/**
 * updateCompanyAdminTool
 */
const updateCompanyAdminTool = catchAsync(async (req,res)=>{
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
  let sectionArea = await templateBuilderService.patchAdminTool(req);

  if(sectionArea){
    let getSectionArea = await templateBuilderService.getAdminToolInfo(req);
    if(getSectionArea){
      res.send(getSectionArea)
    }else{
      let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
  }else{
    let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
    logger.error(`[Invalid TOken] ${error}`);
    throw error;
  }



});


/**
 * updateSectionElement
 */
const updateSectionElement= catchAsync(async (req,res)=>{
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

  try {
    const  section_id = new ObjectId(req.params.section_id);
    const  adminTool_id = req.params.adminTool_id;
    const  element_id = req.params.element_id;
    const adminTool = await sectionBuilder.findById(adminTool_id);
    let sectionData = adminTool.sections;
    let grayContent =[];
    let quotes =[];
    let datacontent =[];
    if(_.has(req.body,"grayContent")){
      sectionData.map(v=>{
        if( JSON.stringify(section_id) === JSON.stringify(v._id)){
          v.grayContent.elements.map(e=>{
            if( JSON.stringify(element_id) === JSON.stringify(e._id)){
              e.address = (_.has(req.body.grayContent,"address"))?req.body.grayContent.address:e.address;
              e.choices = (_.has(req.body.grayContent,"choices"))?req.body.grayContent.choices:e.choices;
              e.decimalPlace = (_.has(req.body.grayContent,"decimalPlace"))?req.body.grayContent.decimalPlace:e.decimalPlace;
              e.currency = (_.has(req.body.grayContent,"currency"))?req.body.grayContent.currency:e.currency;
              e.tooltip = (_.has(req.body.grayContent,"tooltip"))?req.body.grayContent.tooltip:e.tooltip;
              e.appendedText = (_.has(req.body.grayContent,"appendedText"))?req.body.grayContent.appendedText:e.appendedText;
              e.prefilled = (_.has(req.body.grayContent,"prefilled"))?req.body.grayContent.prefilled:e.prefilled;
              e.dataType = (_.has(req.body.grayContent,"dataType"))?req.body.grayContent.address:e.dataType;
              e.text = (_.has(req.body.grayContent,"text"))?req.body.grayContent.dataType:e.text;
              e.toggle = (_.has(req.body.grayContent,"toggle"))?req.body.grayContent.toggle:e.toggle;
              e.classes = (_.has(req.body.grayContent,"classes"))?req.body.grayContent.classes:e.classes;
              e.title = (_.has(req.body.grayContent,"title"))?req.body.grayContent.title:e.title;
              e.sliderType = (_.has(req.body.grayContent,"sliderType"))?req.body.grayContent.sliderType:e.sliderType;
              e.icon = (_.has(req.body.grayContent,"icon"))?req.body.grayContent.icon:e.icon;
              e.rightSection = (_.has(req.body.grayContent,"rightSection"))?req.body.grayContent.rightSection:e.rightSection;
              e.isDisabled = (_.has(req.body.grayContent,"isDisabled"))?req.body.grayContent.isDisabled:e.isDisabled;
              e.isProcess = (_.has(req.body.grayContent,"isProcess"))?req.body.grayContent.isProcess:e.isProcess;
              e.forcedValue = (_.has(req.body.grayContent,"forcedValue"))?req.body.grayContent.forcedValue:e.forcedValue;
              e.format = (_.has(req.body.grayContent,"format"))?req.body.grayContent.format:e.format;
              e.formula = (_.has(req.body.grayContent,"formula"))?req.body.grayContent.formula:e.formula;
              e.value = (_.has(req.body.grayContent,"value"))?req.body.grayContent.value:e.value;           
            grayContent.push(e);
            }else{
              grayContent.push(e);
            }          

          });
          v.grayContent.elements = grayContent;
        }
      });
    }
    if(_.has(req.body,"quotes")){
      sectionData.map(v=>{
        if( JSON.stringify(section_id) === JSON.stringify(v._id)){
          v.headers.title.quotes.elements.map(e=>{
            if( JSON.stringify(element_id) === JSON.stringify(e._id)){              
              e.qoute.text = (_.has(req.body.quotes,"text"))?req.body.quotes.text:e.qoute.text;    
              e.qoute.author = (_.has(req.body.quotes,"author"))?req.body.quotes.author:e.qoute.author;   
              quotes.push(e);
            }else{
              quotes.push(e);
            }
          })
          v.headers.title.quotes.elements=quotes;
        }
      });
    }
   
    if(_.has(req.body,"content")){
      sectionData.map(v=>{
        if( JSON.stringify(section_id) === JSON.stringify(v._id)){
          v.headers.title.content.elements.map(e=>{
            if( JSON.stringify(element_id) === JSON.stringify(e._id)){  
              e.dataType = (_.has(req.body.content,"dataType")) ? req.body.content.dataType : e.dataType;
              e.span = (_.has(req.body.content,"span")) ? req.body.content.span : e.span;
              e.class = (_.has(req.body.content,"class")) ? req.body.content.class : e.class;
              e.mediaOrigin = (_.has(req.body.content,"mediaOrigin")) ? req.body.content.mediaOrigin : e.mediaOrigin;
              e.text = (_.has(req.body.content,"text")) ? req.body.content.text : e.text;
              e.link = (_.has(req.body.content,"link")) ? req.body.content.link : e.link;
              // console.log(e)
              datacontent.push(e);
            }else{
              datacontent.push(e);
            }
          })
          // console.log(v.headers.title.content)
          v.headers.title.content.elements=datacontent;
        }
        // console.log(v.headers.title.content)
      });
    }

    console.log("sectioncontent----",sectionData[0].headers.title.content);
    let qkey = {_id:adminTool_id};
    qkey.sections = { $elemMatch: { _id: section_id} }
    let sectionEntry = await updateAdminTool({key:qkey,updateDoc:{$set:{'sections.$':sectionData[0]}}},{ returnDocument: 'after' })
        
    let getSectionArea = await templateBuilderService.getAdminToolInfo(req);
    if(getSectionArea){
      res.send(getSectionArea)
    }else{
      let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
    
  } catch (error) {
    let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[patch admin tool] ${e}`)
        throw e;
  }

  
  // let sectionArea = await templateBuilderService.patchAdminTool(req);

  // if(sectionArea){
  //   let getSectionArea = await templateBuilderService.getAdminToolInfo(req);
  //   if(getSectionArea){
  //     res.send(getSectionArea)
  //   }else{
  //     let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
  //     logger.error(`[Invalid TOken] ${error}`);
  //     throw error;
  //   }
  // }else{
  //   let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
  //   logger.error(`[Invalid TOken] ${error}`);
  //   throw error;
  // }



});




/**
 * updateSectionElement
 */
const deleteSectionElement= catchAsync(async (req,res)=>{
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

  try {
    const  section_id = new ObjectId(req.params.section_id);
    const  target = req.params.target_name;
    const  adminTool_id = req.params.adminTool_id;
    const  element_id = req.params.element_id;
    const adminTool = await sectionBuilder.findById(adminTool_id);
    let sectionData = adminTool.sections;
    let grayContent =[];
    let quotes =[];
    let datacontent =[];
    console.log('-------target---------',target)
    if( target === "grayContent" ){
    // if(req.body.grayContent !==true){
    //   let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,'Gray content is delete disable');
    //     logger.error(`[patch admin tool] ${e}`)
    //     throw e;
    // }
    
      sectionData.map(v=>{
        if( JSON.stringify(section_id) === JSON.stringify(v._id)){
          v.grayContent.elements.map(e=>{
            if( JSON.stringify(element_id) !== JSON.stringify(e._id)){
              grayContent.push(e);
            }     

          });
          v.grayContent.elements = grayContent;
        }
      });
    }



    if(target==="quotes"){
      // if(req.body.quotes !==true){
      //   let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,'Quotes is delete disable');
      //     logger.error(`[patch admin tool] ${e}`)
      //     throw e;
      // }
      sectionData.map(v=>{
        if( JSON.stringify(section_id) === JSON.stringify(v._id)){
          v.headers.title.quotes.elements.map(e=>{
            if( JSON.stringify(element_id) !== JSON.stringify(e._id)){    
              quotes.push(e);
            }
          })
          v.headers.title.quotes.elements=quotes;
        }
      });
    }
   
    if (target==="content"){
      // if(req.body.content !==true){
      //   let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,'Content is delete disable');
      //     logger.error(`[patch admin tool] ${e}`)
      //     throw e;
      // }
      sectionData.map(v=>{
        if( JSON.stringify(section_id) === JSON.stringify(v._id)){
          v.headers.title.content.elements.map(e=>{
            if( JSON.stringify(element_id) !== JSON.stringify(e._id)){  
              datacontent.push(e);
            }
          })
          // console.log(v.headers.title.content)
          v.headers.title.content.elements=datacontent;
        }
        // console.log(v.headers.title.content)
      });
    }

    console.log("sectioncontent----",sectionData[0].headers.title.content);
    let qkey = {_id:adminTool_id};
    qkey.sections = { $elemMatch: { _id: section_id} }
    let sectionEntry = await updateAdminTool({key:qkey,updateDoc:{$set:{'sections.$':sectionData[0]}}},{ returnDocument: 'after' })
        
    let getSectionArea = await templateBuilderService.getAdminToolInfo(req);
    if(getSectionArea){
      res.send(getSectionArea)
    }else{
      let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
    
  } catch (error) {
    let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[patch admin tool] ${e}`)
        throw e;
  }

  
  // let sectionArea = await templateBuilderService.patchAdminTool(req);

  // if(sectionArea){
  //   let getSectionArea = await templateBuilderService.getAdminToolInfo(req);
  //   if(getSectionArea){
  //     res.send(getSectionArea)
  //   }else{
  //     let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
  //     logger.error(`[Invalid TOken] ${error}`);
  //     throw error;
  //   }
  // }else{
  //   let error = new ApiError(httpStatus.NOT_FOUND, 'Admin tool section not found');
  //   logger.error(`[Invalid TOken] ${error}`);
  //   throw error;
  // }



});

/**
 * create admin  tool
 */
const createCompanyAdminTool = catchAsync(async (req,res)=>{
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
  let qkey = {company_id:company_id,template_id:template_id,version_id:version_id};

  if(_.has(req.body,"_id")){
   let update_id = new ObjectId(req.body.section_id)
    qkey.sections = { $elemMatch: { _id: update_id} }
  }
  
  
  
  const adminTool = await templateBuilderService.getAdminTool(qkey)

  console.log(adminTool)

  if(!adminTool){
    let error = new ApiError(httpStatus.NOT_FOUND, 'TemplateBuilder not found');
    logger.error(`[Invalid TOken] ${error}`);
    throw error;
  }


  console.log(adminTool)
  let n_section;
  if(_.isEmpty(adminTool.sections)){
    //  insert new data
    delete qkey.sections;
    delete req.body._id;

    let sectionEntry = await templateBuilderService.updateAdminTool({key:qkey,updateDoc:{$push:{sections:req.body}}})
    n_section = sectionEntry;
    

  }else{
    // do update   
    console.log('exist--->',qkey)
    let sectionEntry = await templateBuilderService.updateAdminTool({key:qkey,updateDoc:{$set:{'sections.$':req.body}}})
    n_section = sectionEntry;
  }


  let updatedData = await templateBuilderService.getAdminTool(qkey);


  






  // console.log(n_section);
  res.send(updatedData)

});

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
      projection: template.projection,
      company_logo:"https://theroishop.com/assets/roishop/wp-content/uploads/2019/08/ROI-Shop-Logo.png",
      logo_description:"test logo because the s3 not yet ready",
      status:templateVersion_status
    })
    
   })
   res.send(container[0])
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


    //build template builder

    
    console.log("tempalateVersion->", req.body)
    
    const templateVersion = await companyService.createTemplateVersion(req.body);

    let  templateBuilderData =  {
      company_id: company_id,
      template_id:  template_id,
      version_id: templateVersion.id
    }

    console.log('TemplateBuilder->',templateBuilderData);
    const  templateBuilder  =  await  templateBuilderService.createAdminTool(templateBuilderData);
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

    const container = [];
    const template_container = [];

     const getTemplateList = await companyService.getAllUserTemplate(company_id);
    
     

     getTemplateList.map(v=>{
          let d=new Date(v.created_calculator.createdAt);     
          let monthIndex  =  d.getMonth();
          let monthName = months[monthIndex]
          let getDate = d.getDate();
              getDate = (String(Math.abs(getDate)).charAt(0) == getDate) ? `0${getDate}` : getDate;
          let getYear = d.getFullYear();
          let n_d = d.toLocaleString();
              n_d= n_d.split(', ');
              container.push({
                            user_id: v._id,
                            template_id: v.created_calculator._id,
                            template_name: v.templateVersion.name,                            
                            calculator_name: v.created_calculator.title,
                            username: v.email,
                            link: (v.created_calculator.verification_code == "" || v.created_calculator.verification_code == null || v.created_calculator.verification_code == "null") ? "" : `https://www.theroishop.com/enterprise/${v._id}/?roi=35acaf126d430c17d1a438bf8ae424ccc5d94885`,
                            createdAt: `${monthName} ${getDate},${getYear} ${n_d[1]}`,
                            visits: v.created_calculator.visits,
                            unique_ip: parseInt(v.created_calculator.unique_ip)
                          })
      // if(!_.isEmpty(v.templates)){
      

      
      //   })        
      // }
     
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
     let companyUserAccount;

     switch (is_user.role) {
      case "admin":
        companyUserAccount = await companyService.companyUserAccount(null);
        break;
     
      default:
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
      let userContainer = await companyService.companyUserAccount(company_id);
      let userArray = [];
      if(is_user.role=="company-manager"){
        userContainer.map(v=>{
          if(v.role=="company-agent"){
            userArray.push(v);
          }
        })
        companyUserAccount = userArray;
      }else{
        companyUserAccount = userContainer;
      }
      
      
        break;
     }

    //  if(is_user.role == "admin"){
    //    companyUserAccount = await companyService.companyUserAccount(null);
    //  }else{
    //   const company_id = req.params.company_id;
    //   /**
    //     * validate if the company id is valid
    //     */
    //   const is_company = await companyService.getCompanyById(company_id);
      
    //   if(!is_company) {
    //     let error = new ApiError(httpStatus.NOT_FOUND, 'Company id not found');
    //     logger.error(`[Invalid TOken] ${error}`);
    //     throw error;
    //   }
      
    //    companyUserAccount = await companyService.companyUserAccount(company_id);
    //  }

     
     
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
  });

  const getCompanylicenseStatus = catchAsync(async(req,res)=>{
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
     console.log(is_user.role)
    //  if(is_user.role == 'company-admin'){
      const countRemainingLicense = await companyService.getCompanylicenseStatus(is_company);
      res.send(countRemainingLicense);
    //  }else{
    //     let error = new ApiError(httpStatus.UNAUTHORIZED, 'Invalid access role');
    //    logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
    //    throw error;
    //  }
     
  })


  const deleteCompanyTemplateVersionInfo = catchAsync(async(req,res)=>{
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
      /**
      * validate template 
      */
      const is_template = await Template.findById(template_id);

      if(!is_template){
        let error = new ApiError(httpStatus.NOT_FOUND, 'Template ID not found');
        logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
        throw error;
      }
      const version_id = req.params.version_id;
      /**
      * validate template 
      */
     const is_template_version = await TemplateVersion.findById(version_id);
     if(!is_template_version){
        let error = new ApiError(httpStatus.NOT_FOUND, 'Template Version ID not found');
        logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
        throw error;
     }
     if(is_template_version.stage != 0){
        let error = new ApiError(httpStatus.UNPROCESSABLE_ENTITY, `Unable to delete Template version id ${version_id}`);
        logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
        throw error;
     }

     

     await is_template_version.remove()
    res.status(httpStatus.NO_CONTENT).send();

    res.send({})
  })

  const deleteTemplate = catchAsync(async(req,res)=>{
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
      /**
      * validate template 
      */
      const is_template = await Template.findById(template_id);

      if(!is_template){
        let error = new ApiError(httpStatus.NOT_FOUND, 'Template ID not found');
        logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
        throw error;
      }

      const haveActiveVersion  = await companyService.getActiveTemplateVersionByTemplateId(template_id);
      if(haveActiveVersion){
        let error = new ApiError(httpStatus.UNPROCESSABLE_ENTITY, `Unable to delete Template id ${template_id}, Please deactivate template version and Active Calculators`);
        logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
        throw error;
      }
      await is_template.remove()
      res.status(httpStatus.NO_CONTENT).send();
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
    getCompnayTemplateVersionInfo,
    getCompanylicenseStatus,
    deleteCompanyTemplateVersionInfo,
    deleteTemplate,
    getCompanyadminTool,
    createCompanyAdminTool,
    updateCompanyAdminTool,
    updateSectionElement,
    deleteSectionElement,
    deleteSection,
    
  }
  
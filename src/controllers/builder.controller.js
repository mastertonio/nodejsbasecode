const httpStatus = require("http-status");
const logger = require("../config/logger");
const { userService,templateService } = require("../services");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { jwtExtract } = require("./common.controller");
const sectionBuilder = require("../models/sectionBuilder.model");
const { companyService } = require("../services");
const { Company, TemplateVersion, Template } = require("../models");
const ObjectId = require('mongodb').ObjectID;
const _ = require("underscore");



const createROI = catchAsync(async(req,res)=>{
    /**
    * extracting JWT Token to get the User Id
    */
      const token = jwtExtract(req);

    /**
       * validating the user Account base on the response of the extraction
       */
      const is_user = await  userService.getUserById(token);
      if(!is_user){
        let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
        logger.error(`[Invalid TOken] ${error}`);
        throw error;
      }
    const templateVersion_id = req.params.templateVersion_id;
    const isTemplateVersionValid = await templateService.isValidateTemplateVersion(templateVersion_id);
    if(isTemplateVersionValid){
      let tplV_id = new ObjectId(req.params.templateVersion_id); 
      const build_template = await templateService.buildTemplate({templateVersion_id: tplV_id,template:req.body});
      res.send(build_template);
    }else{
      let error = new ApiError(httpStatus.NOT_FOUND, 'Template id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }

    
});

const getTemplateBuild = catchAsync(async(req,res)=>{
  try {
    /**
    * extracting JWT Token to get the User Id
    */
     const token = jwtExtract(req);

    /**
     * validating the user Account base on the response of the extraction
     */
    const is_user = await  userService.getUserById(token);
       if(!is_user){
         let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
         logger.error(`[Invalid TOken] ${error}`);
         throw error;
       }
    
    let versionId = new ObjectId(req.params.templateVersion_id);
    let templateBuilderId = new ObjectId(req.params.templateBuilder_id);

    // new ObjectId(data.roi_source_uid); 

    let getAdminTool = await sectionBuilder.find({version_id:versionId});
    //     return getAdminTool
    // const templateBuilder = await templateService.getTemplateBuild(que);
    if(!getAdminTool ||  _.isEmpty(getAdminTool)){
      let error = new ApiError(httpStatus.NOT_FOUND, 'No data found');
      logger.error(`[Invalid TOkenx] ${error}`);
      throw error;
    }
    let responseAdminTool= getAdminTool[0];
   


    let tempId = responseAdminTool.template_id;
    let companyId = new ObjectId(is_user.company_id);
    let company_info = await Company.find({_id:companyId});
      console.log('company_name----',company_info)

    
  const templateVersion = await   TemplateVersion.find({_id:versionId})
  const template = await  Template.findById(tempId);  
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
  // const nav = [];
  // let builderInfo = responseAdminTool.sections;
  // console.log(builderInfo.sectionTitle)
  // builderInfo.map(binfo=>{
  //   console.log(binfo.sectionTitle)
  // })

    
    res.send({
      templateBuilderInfo:container[0],
      data:{
        sidebar:{"brand": {
          "logo": "https://www.theroishop.com/company_specific_files/547/logo/logo.png",
          "companyName": company_info[0].name
        },
        navigationMenu:{}
      },
      content:responseAdminTool
      }
    })
  } catch (error) {
    logger.error(`[Invalid TOkenx] ${error}`);
    throw error;
  }
   
    
})


/**
 * const templateVersion_id = req.params.templateVersion_id;
    const que = {
      templateVersion_id:new ObjectId(req.params.templateVersion_id),
      _id: new ObjectId(req.params.templateBuilder_id)
    };
    const isTemplateVersionValid = await templateService.isValidTemplateBuilder(que);
    if(isTemplateVersionValid){
      const templateBuilder = await templateService.getTemplateBuild(que);
      res.send(templateBuilder)
    }else{
      let error = new ApiError(httpStatus.NOT_FOUND, 'Template id not found');
      logger.error(`[Invalid TOken] ${error}`);
      throw error;
    }
 */

//logo
const getLogo = catchAsync(async(req,res,next) =>{

});


//header
const getHeader = catchAsync(async(req,res,next)=>{
  
})

//menu
const getMenu = catchAsync(async(req,res,next)=>{

})


//section

module.exports = {
    getTemplateBuild,
    createROI
}
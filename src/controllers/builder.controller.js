const httpStatus = require("http-status");
const logger = require("../config/logger");
const { userService,templateService } = require("../services");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { jwtExtract } = require("./common.controller");
const ObjectId = require('mongodb').ObjectID;



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
    console.log(req.query)  
  } catch (error) {
    logger.error(`[Invalid TOken] ${error}`);
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
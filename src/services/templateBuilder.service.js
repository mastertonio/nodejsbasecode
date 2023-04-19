const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const commonService = require('./common.service');
const userService = require('./user.service');
const ObjectId = require('mongodb').ObjectID;

const {Company, Template, TemplateVersion, User,Calculator,SectionBuilder} = require('../models');
const logger = require('../config/logger');
const _ = require("underscore");
const { map } = require('underscore');
const { objectId } = require('../validations/custom.validation');
const { LOGGER_INVALID_TOKEN, INSUFFICIENT_LICENSE, LICENSE_ERROR, ROLE, USER_ERROR, NO_RECORD_FOUND } = require('../common/staticValue.common');
const sectionBuilder = require('../models/sectionBuilder.model');

const  createAdminTool = async(req)=>{
    try {
        let SCB = await SectionBuilder.create(req);
        logger.info(`[Company Module] successfully Inserted Company Section builder; ${JSON.stringify(SCB)}`);       
        return SCB;
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module Template Version] ${e}`)
        throw e;
    }
}
const getAdminTool  = async(req)=>{
    try {
        let getAdminTool = await sectionBuilder.find(req);
        return getAdminTool
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module Template Version] ${e}`)
        throw e;
    }
}
// const isSectionExist = async(req)  =>{
//     try {
//         const fetchSection =  await sectionBuilder.find(req.key);
//         return fetchSection;       

//     } catch (error) {
//         let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
//         logger.error(`[Company Module Template Version] ${e}`)
//         throw e;
//     }
// }
const updateAdminTool  = async(req)  =>{

    try {
        console.log(req.updateDoc)
        const update = await  sectionBuilder.updateOne(req.key, req.updateDoc,{new:true});
        
        if(!update){
            let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
            logger.error(`[Company Module ROI TemplateBuilder] ${e}`)
            return {success:false, message: e}
        } 
        return update;

    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module Template Version] ${e}`)
        throw e;
    }
}

module.exports = {
    createAdminTool,
    getAdminTool,
    updateAdminTool
}
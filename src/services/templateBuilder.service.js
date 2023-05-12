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
// const { templateBuilderService } = require('.');

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

const getAdminToolInfo  = async(req)=>{
    try {
        const  section_id = new ObjectId(req.params.section_id);
        const  adminTool_id = req.params.adminTool_id;
        const adminTool = await sectionBuilder.findById(adminTool_id);
        let sectionData = adminTool.sections;
        let sectionContainer = [];
        sectionData.map(v=>{
            // console.log(v._id)
        
            if( JSON.stringify(section_id) === JSON.stringify(v._id)){
                sectionContainer.push(v)
            }
        });
        return sectionContainer
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module AdminTool] ${e}`)
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

const patchAdminTool = async(req)  =>{
    // try {
        // const company_id = req.params.company_id;
        // const template_id = req.params.template_id;
        // const version_id = req.params.version_id;
        const  section_id = new ObjectId(req.params.section_id);
        const  adminTool_id = req.params.adminTool_id;
        const adminTool = await sectionBuilder.findById(adminTool_id);
        let sectionData = adminTool.sections;
        let sectionContainer = [];
        sectionData.map(v=>{
            // console.log(v._id)
        
            if( JSON.stringify(section_id) === JSON.stringify(v._id)){
                v.address= (_.has(req.body,"address")) ? req.body.address : v.address;
                v.sectionTitle= (_.has(req.body,"sectionTitle")) ? req.body.sectionTitle : v.sectionTitle;
                v.order= (_.has(req.body,"order")) ? req.body.order : v.order;
                
                if(_.has(req.body,"grayContent")){
                    v.grayContent.dataType = (_.has(req.body.grayContent,"dataType")) ?req.body.grayContent.dataType :v.grayContent.dataType;
                    v.grayContent.classes = (_.has(req.body.grayContent,"classes")) ?req.body.grayContent.classes :v.grayContent.classes;
                    
                    if(_.has(req.body.grayContent,"elements")){
                        console.log(req.body.grayContent.elements)
                        if(_.isEmpty(v.grayContent.elements)){
                            v.grayContent.elements = req.body.grayContent.elements;
                        }else{
                            v.grayContent.elements.push(req.body.grayContent.elements[0]);
                            // v.grayContent.elements.map(g=>{
                            //     if(JSON.stringify(g._id) === JSON.stringify(req.body.grayContent.elements[0]._id)){
                            //         v.grayContent.elements = req.body.grayContent.elements[0];
                            //     }else{
                            //         v.grayContent.elements.push(req.body.grayContent.elements[0]);
                            //     }
                            // })
                        }
                        
                    }
                }


                if(_.has(req.body,"headers")){
                    console.log('----x------->',req.body.headers.title);
                    v.headers.title.dataType = (_.has(req.body.headers.title,"dataType")) ? req.body.headers.title.dataType : v.headers.title.dataType;
                    v.headers.title.description = (_.has(req.body.headers.title,"description")) ? req.body.headers.title.description : v.headers.title.description;
                    v.headers.title.mainTitle = (_.has(req.body.headers.title,"mainTitle")) ?req.body.headers.title.mainTitle : v.headers.title.mainTitle;
                    v.headers.title.subTitle = (_.has(req.body.headers.title,"subTitle")) ?req.body.headers.title.subTitle : v.headers.title.subTitle;

                    // v.headers.title.quotes = (_.has(req.body.headers,"subTitle")) ?req.body.headers.subTitle : v.headers.title.subTitle;
                    /**
                     * Qoutes
                     */
                    if(_.has(req.body.headers,"quotes")){
                        v.headers.title.quotes.dataType = (_.has(req.body.headers.quotes ,"dataType")) ? req.body.headers.quotes.dataType : v.headers.title.quotes.dataType;
                        v.headers.title.quotes.position = (_.has(req.body.headers.quotes ,"position")) ? req.body.headers.quotes.position : v.headers.title.quotes.position;
                        if((_.has(req.body.headers.quotes ,"elements"))){
                            let dataElement = [];
                            if(_.isEmpty(v.headers.title.quotes.elements)){
                                v.headers.title.quotes.elements = req.body.headers.quotes.elements;
                            }else{
                                req.body.headers.quotes.elements.map(e=>{                                
                                    dataElement.push({
                                        dataType: (_.has(req.body.headers.quotes.elements),"dataType")?req.body.headers.quotes.elements.dataType:v.headers.title.quotes.elements.dataType,
                                        qoute:  (_.has(req.body.headers.quotes.elements),"qoute")?req.body.headers.quotes.elements.qoute:v.headers.title.quotes.elements.qoute,
                                    })
                                })
                            }
                            
                        }
                    }
                    /**
                     * content
                     */
                           

                }
                

                sectionContainer.push(v)
            }
        });

        // console.log(sectionContainer.grayContent.elements);


        let qkey = {_id:adminTool_id};

        // let update_id = new ObjectId(req.body.section_id)
            qkey.sections = { $elemMatch: { _id: section_id} }
  
        let sectionEntry = await updateAdminTool({key:qkey,updateDoc:{$set:{'sections.$':sectionContainer[0]}}},{ returnDocument: 'after' })
        return sectionEntry;
        // return {};

        // Object.assign(adminTool,UpdateBody);
        // await company.save();
        // return company;

    // } catch (error) {
    //     let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
    //     logger.error(`[patch admin tool] ${e}`)
    //     throw e;
    // }
}
const updateAdminTool  = async(req)  =>{
    console.log(req.updateDoc)
    try {
       
        const update = await  sectionBuilder.updateOne(req.key, req.updateDoc,{new:true});
        
        if(!update){
            let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
            logger.error(`[Company Module ROI TemplateBuilder] ${e}`)
            return {success:false, message: e}
        } 
        return update;

    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Update Admin Tool] ${e}`)
        throw e;
    }
}

module.exports = {
    createAdminTool,
    getAdminTool,
    updateAdminTool,
    patchAdminTool,
    getAdminToolInfo
}
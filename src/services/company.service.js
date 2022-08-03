const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const commonService = require('./common.service');
const userService = require('./user.service');
const ObjectId = require('mongodb').ObjectID;

const {Company, Template, TemplateVersion} = require('../models');
const logger = require('../config/logger');
const _ = require("underscore")

const getCompanyTemplateByCompanyId = async (_id) =>{
    if(_.isNull(_id)){
        return Template.find();
    }else{
        const o_id = new ObjectId(_id); 
        return Template.find({company_id:o_id});
    }
    
}

const getCompanyById = async (_id) =>{
    const o_id = new ObjectId(_id);
    return Company.findById({_id:o_id});
}

const fetchAllCompany = async() =>{
    // return Company.find();
    return Company.aggregate([
        {
            $project:
            {
                name: "$name",
                alias: "$alias",
                licenses: "$licenses",
                contract_file: "$contract_file",
                contract_start_date: "$contract_start_date",
                contract_end_date: "$contract_end_date",
                notes: "$notes",
                templates: "$templates",
                default_active_value: "$active",
                active:{
                    $cond : { if: { $eq: [ "$active", 1 ] }, then: 'active', else: 'inactive' }
                } 
            }
        }
    ])
}

/**
 * Create a company
 * @param {Object} userBody
 * @returns {Promise<Company>}
 */
 const createCompany = async (companyBody) => {
    try {
        let companyData = Company.create(companyBody);
        logger.info(`[Company Module] successfully Inserted; ${JSON.stringify(companyBody)}`);
        return companyData;
    } catch (error) {
        let e = new ApiError(httpStatus.NOT_FOUND, 'User not found');
        logger.error(`[Company Module] ${e}`)
        throw e;
    }
    
  }
/**
 * get company by id
 * @param {Object} 
 * @returns {Promise<Company>}
 */
const getCompany = async(uid,comp)=>{
    const user = userService.getUserById(uid);
    
    if(!user){
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const company = await getCompanyById(comp._id);
    return company;

}

/**
 * get all company
 * @param {Object} 
 * @returns {Promise<Company>}
 */
 const getAllCompany = async(uid)=>{
    const user =await userService.getUserById(uid);
    if(!user){
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    switch (user.role) {
        case "company-admin":            
            return getCompanyById(user.company_id);
        case "admin":
            return  fetchAllCompany();
    
        default:
            const error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
            return error            
    }

   

}

const patchCompany = async(uid,comp,UpdateBody)=>{
    const user = userService.getUserById(uid);
    
    if(!user){
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    console.log('--service---',UpdateBody)
    const company = await getCompanyById(comp._id);
    console.log(company)
    if(!company){
        throw new ApiError(httpStatus.NOT_FOUND, `no record found!`)
    }
    Object.assign(company,UpdateBody);
    await company.save();
    return company;
}

const createNewTempalete = async(req)=>{
    try {
        let TemplateData = Template.create(req);
        logger.info(`[Company Module] successfully Inserted Company Template; ${JSON.stringify(TemplateData)}`);
        return TemplateData;
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module Template] ${e}`)
        throw e;
    }
}

const createTemplateVersion = async(req)=>{
    try {
        let TemplateData = TemplateVersion.create(req);
        logger.info(`[Company Module] successfully Inserted Company Template Version; ${JSON.stringify(TemplateData)}`);
        return TemplateData;
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module Template Version] ${e}`)
        throw e;
    }
}


  

module.exports = {
    getCompanyTemplateByCompanyId,
    createNewTempalete,
    getCompanyById,
    createCompany,
    getCompany,
    getAllCompany,
    patchCompany,
    createTemplateVersion
}
const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const commonService = require('./common.service');
const userService = require('./user.service');
const ObjectId = require('mongodb').ObjectID;

const {Company} = require('../models');
const logger = require('../config/logger');

const getCompanyById = async (_id) =>{
    const o_id = new ObjectId(_id);
    return Company.findById({_id:o_id});
}

const fetchAllCompany = async() =>{
    return Company.find();
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


  

module.exports = {
    createCompany,
    getCompany,
    getAllCompany,
    patchCompany
}
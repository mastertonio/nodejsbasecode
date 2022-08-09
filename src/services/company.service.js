const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const commonService = require('./common.service');
const userService = require('./user.service');
const ObjectId = require('mongodb').ObjectID;

const {Company, Template, TemplateVersion, User,Calculator} = require('../models');
const logger = require('../config/logger');
const _ = require("underscore");
const { map } = require('underscore');
const { objectId } = require('../validations/custom.validation');

const getCompanyTemplateByCompanyId = async (_id) =>{
    if(_.isNull(_id)){
        return Template.find();
    }else{
        const o_id = new ObjectId(_id); 
        return Template.find({company_id:o_id});
    }
    
}

const getManagerByCompanyId = async (cid) =>{ 
    if(_.isNull(cid)){
        return User.find({role:"company-agent"});
    }else{        
        const _cid = new ObjectId(cid); 
        return User.find({
            $and:[
                {role:"company-agent"},
                {company_id: _cid}
            ]
        });
    }
    
}
const companyUserAccount = async (cid) =>{ 
    if(_.isNull(cid)){
        return User.find();
    }else{        
        const _cid = new ObjectId(cid); 
        const allList = await User.find({company_id: _cid});
        const manger = await User.find({company_id: _cid,role:"company-manager" });
        const haveCount = await  User.aggregate([
            {
                $match:{
                    company_id: _cid
                }
            },
            {
                $lookup: {
                    from: "calculators",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "calculatorCount"
                }
            },
            {
                "$unwind": "$calculatorCount"
            },
            {
                "$group": {
                    "_id": "$calculatorCount.user_id",
                    "name": {
                        $first: "$name"
                    },
                    "totalROIS": {
                        "$sum": 1
                    }
                }
            }
        ])

        
        const container = [];
        allList.map(v=>{
            let n_count = haveCount.map(k=>{
                let count =0;
                if(JSON.stringify(v._id) === JSON.stringify(k._id)){
                    count = k.totalROIS
                }   
               return count
            })

            let manger_info = manger.map(m=>{
                if(JSON.stringify(v.manager) === JSON.stringify(m._id)){
                    console.log(m.first_name)
                    return {_id:m._id, first_name:m.first_name, last_name:m.last_name, email:m.email}
                }   
                
               
            })

            container.push({
                _id:v._id,
                first_name:v.first_name,
                last_name:v.last_name,
                email:v.email,
                role:v.role,
                manager:(v.manager == null) ? "": manger_info,
                currency:(v.currency == null) ? 'USD': v.currency,
                status:(v.status ===1)?'active':'inactive',
                created_rois: n_count.reduce((partialSum, a) => partialSum + a, 0)

            })
        })

          return container;
    }
    
}



const getCompanyById = async (_id) =>{
    const o_id = new ObjectId(_id);
    return Company.findById({_id:o_id});
}

const fetchAllCompany = async() =>{
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
                contact_fname:{ $ifNull: ["$contact_fname","" ]},
                contact_lname:{ $ifNull: ["$contact_lname","" ]},
                contact_email:{ $ifNull: ["$contact_email","" ]},
                contact_phone:{ $ifNull: ["$contact_phone","" ]},
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

const company_user = async(req) => {
    try {
        let user_entry = User.create(req);
        logger.info(`[Company Module] successfully Inserted Company Template; ${JSON.stringify(user_entry)}`);
        return user_entry;
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module Template] ${e}`)
        throw e;
    }

}


 const transferAccount = async (data) =>{
    try{
        const source_uid = new ObjectId(data.roi_source_uid); 
        const new_uid = new ObjectId(data.roi_new_uid); 
        const updateDoc = {
            $set: {
                user_id: new_uid
            },
        };
        const update =  Calculator.updateMany({user_id:source_uid}, updateDoc);
        if(!update){
            let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
            logger.error(`[Company Module ROI Template] ${e}`)
            return {success:false, message: e}
        }
        return {success:true, message:"ok"}
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module ROI Template] ${e}`)
        throw e;
    }
 }
 const updateUserAccount = async (uid,data) =>{
    try{
        const user = await userService.getUserById(uid);
    
        if(!user){
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        Object.assign(user,data);
        await user.save();
        return user;
        
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module ROI Template] ${e}`)
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
    createTemplateVersion,
    company_user,
    getManagerByCompanyId,
    companyUserAccount,
    transferAccount,
    updateUserAccount
}
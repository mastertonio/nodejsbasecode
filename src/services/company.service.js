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
const { LOGGER_INVALID_TOKEN, INSUFFICIENT_LICENSE, LICENSE_ERROR, ROLE, USER_ERROR, NO_RECORD_FOUND } = require('../common/staticValue.common');
const { sendEmail, sendEmailHTMLBODY } = require('./email.service');
const sectionBuilder = require('../models/sectionBuilder.model');

const getCompanyTemplateByCompanyId = async (_id) =>{
    const conatainer =[];
    if(_.isNull(_id)){
        /**
         * Remove change of  specs
         *  const allTemplates =  Template.find();
         */
       
        const company_template = await Template.find({'active':1});
        const adminTool = await sectionBuilder.find();


        company_template.map(v=>{
            adminTool.map(a=>{
                if(JSON.stringify(v._id) === JSON.stringify(a.template_id)){
                    conatainer.push({
                                _id:v._id,
                                name: v.name,
                                notes: v.notes,
                                company_id: v.company_id,
                                version_id:  a.version_id,
                                admintool_id:  a._id,
                                active: v.active,
                                status: (v.active==1)?"active":"inactive"
                            })
                }
            })
           
        })
    }else{
        const o_id = new ObjectId(_id); 
        // const company_template =await Template.find({company_id:o_id});

        const company_template = await Template.find({company_id:o_id,'active':1});
        const adminTool = await sectionBuilder.find({company_id:o_id});


        company_template.map(v=>{
            adminTool.map(a=>{
                if(JSON.stringify(v._id) === JSON.stringify(a.template_id)){
                    conatainer.push({
                                _id:v._id,
                                name: v.name,
                                notes: v.notes,
                                company_id: v.company_id,
                                version_id:  a.version_id,
                                admintool_id:  a._id,
                                active: v.active,
                                status: (v.active==1)?"active":"inactive"
                            })
                }
            })
           
        })
    }
    return conatainer;
}
const getActiveTemplateVersionByTemplateId = async (temp_id) =>{
    const template_version = await TemplateVersion.find({template_id:temp_id});
    let flag = [];
    template_version.map(v=>{
        if(v.stage != 0){
            flag.push(v)
        }
    });
    return flag;
}
const getManagerByCompanyId = async (cid) =>{ 
   
    // if(_.isNull(cid)){
        return User.find({role:"company-manager",company_id: cid});
    // }
    
    // else{        
        // console.log('[cid]-->',cid)
        // const _cid = new ObjectId(cid); 
        
        // return User.find({
        //     $and:[
        //         {role:"company-manager"},
        //         {company_id: _cid}
        //     ]
        // });
    // }
    
}

const getAllUserTemplate = async (cid) =>{
    let _cid = new ObjectId(cid);
    return User.aggregate([
       
        {
            $lookup: {
                from: "calculators",
                localField: "_id",
                foreignField: "user_id",
                as: "created_calculator"
            }
        },{
            $unwind:{ 
                "path" : "$created_calculator"
            }
        },{
            $lookup: {
                from: "templateversions",
                localField: "created_calculator.template_version_id",
                foreignField: "_id",
                as: "templateVersion"
            }
        },{
            $unwind:{ 
                "path" : "$templateVersion"
            }
        },{
            $lookup: {
                from: "templates",
                localField: "templateVersion.template_id",
                foreignField: "_id",
                as: "templates"
            }
        },
        {
            $unwind:{
                "path": "$templates"

            }
        },
        {
            $match:{
                company_id: _cid
            }
        }

    ])
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
                    return {_id:m._id, first_name:m.first_name, last_name:m.last_name, email:m.email}
                }             
            });

            const managerinfo = manger_info.filter(function (el) {
                return el != null;
              });
              console.log(n_count);
            container.push({
                _id:v._id,
                first_name:v.first_name,
                last_name:v.last_name,
                email:v.email,
                role:v.role,
                manager_id:(v.manager == null) ? "":managerinfo[0]._id,
                manager_email:(v.manager == null) ? "":managerinfo[0].email,
                currency:(v.currency == null) ? 'USD': v.currency,
                status:(v.status ===1)?'active':'inactive',
                created_rois: n_count.reduce((partialSum, a) => partialSum + a, 0)

            })
        })

          return container;
    }
    
}

const updateTemplate = async (id,parameters) =>{
    const _id = new ObjectId(id)
    const _isTemplateValid = await Template.findById(_id);

   if(!_isTemplateValid){
    let error = new ApiError(httpStatus.NOT_FOUND, 'Templte id not found');
    logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
    throw error;
   }
   console.log(parameters)
    Object.assign(_isTemplateValid, parameters);
    await _isTemplateValid.save();
    return _isTemplateValid;
}

const getCompanyById = async (_id) =>{
    console.log(_id)
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
    try {

        const user = await userService.getUserById(uid);
        
        if(!user){
            let user_query_error = new ApiError(httpStatus.NOT_FOUND, USER_ERROR.NOT_FOUND);
            logger.error(user_query_error)
            throw user_query_error;
        }
       
        if(user.role != ROLE.ADMIN){
            let user_role_error = new ApiError(httpStatus.UNAUTHORIZED, USER_ERROR.UNAUTHORIZED);
            logger.error(user_role_error)
            throw user_role_error;
        }

        const company = await getCompanyById(comp._id);

        if(!company){
            let company_query_error = new ApiError(httpStatus.NOT_FOUND, NO_RECORD_FOUND);
            logger.error(company_query_error);
            throw company_query_error;
        }

        Object.assign(company,UpdateBody);
        await company.save();
        return company;

    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module] ${e}`)
        throw e;
    }
}

const createNewTempalete = async(req)=>{
    try {
        let TemplateData =await Template.create(req);
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
        let TemplateData = await TemplateVersion.create(req);
        logger.info(`[Company Module] successfully Inserted Company Template Version; ${JSON.stringify(TemplateData)}`);
        return TemplateData;
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module Template Version] ${e}`)
        throw e;
    }
}

const updateTemplateVersion = async(verion_id, parameters) =>{
    try {
        let TemplateVerion = await TemplateVersion.findById(verion_id);
        if(!TemplateVerion){
            let error = new ApiError(httpStatus.NOT_FOUND, 'Templte Version id not found');
            logger.error(`${LOGGER_INVALID_TOKEN} ${error}`);
            throw error;
        }
        Object.assign(TemplateVerion, parameters);
        await TemplateVerion.save();
        return TemplateVerion;
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module Template Version] ${e}`)
        throw e;
    }
}

const company_user = async(req) => {
    try {
        let user_entry = await User.create(req);
        logger.info(`[USER Module] successfully Inserted Company Template; ${JSON.stringify(user_entry)}`);
        if(!user_entry){
            let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,'Error upon inserting on User table');
            logger.error(`[USER Module ] ${e}`)
            throw e;
        }
        //  sendEmail(to, subject, text)

        await sendEmailHTMLBODY(req.email,'Welcome to the ROI Shop', `
        <table>
	        <tbody><tr>
                <td></td>
                <td bgcolor="#FFFFFF">
			<div>
			<table>
				<tbody><tr>
					<td>
						<h3>Welcome to The ROI Shop, <a href="${req.email}" target="_blank">${req.email}</a></h3>
						<p>An account with this email address has been successfully setup. Your account details are as follows:<br><br>
							<span style="margin-left:20px">Username: <a href="${req.email}" target="_blank">${req.email}</a> </span><br>
							<span style="margin-left:20px">Password: ${req.password} </span></p>
						<br>						
						<p>
							Begin creating ROIs right away! <a href="https://enterprise.theroishop.com" target="_blank">Click here to begin! »</a>
						</p>
						<table width="100%">
							<tbody><tr>
								<td>	
									<table align="left">
										<tbody><tr>
											<td>									
												<h5>Contact Info:</h5>												
												<p>Phone: <strong>770-739-4725</strong><br>
                                                Email: <strong><a>support@theroishop.com</a></strong></p>
                
											</td>
										</tr>
									</tbody></table>									
									<span></span>										
								</td>
							</tr>
						</tbody></table>						
					</td>
				</tr>
			</tbody></table>
			</div>
									
		</td>
		<td></td>
	</tr>
</tbody></table>
        `)
        
        const updateLicense = await Company.updateOne(
            {
                _id:req.company_id
            },[{
                $set:{
                    licenses:{
                        $subtract:["$licenses",1]
                    }
                }
     } ])
        
        
        // await Company.aggregate([
        //     {
        //         $project: {
        //             Actual_license: {
        //                 $subtract:["$licenses",1]
        //             }
        //         }


        //     }
        // ]);
        // console.log(updateLicense);
        return user_entry;
        
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[USER Module ] ${e}`)
        throw e;
    }

}


const transferAccount = async (data) =>{
    try{
        const source_uid = new ObjectId(data.roi_source_uid); 
        const new_uid = new ObjectId(data.roi_new_uid); 
        const template_id = new ObjectId(data.template_id); 
        
        const updateDoc = {
            $set: {
                user_id: new_uid
            },
        };
        const update = await  Calculator.updateOne({_id:template_id,user_id:source_uid}, updateDoc);
        console.log(update)
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

 const transferAllAccount = async (data) =>{
    try{
        const source_uid = new ObjectId(data.roi_source_uid); 
        const new_uid = new ObjectId(data.roi_new_uid); 
        const updateDoc = {
            $set: {
                user_id: new_uid
            },
        };
        const update = await  Calculator.updateMany({user_id:source_uid}, updateDoc);
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
        
        if(_.isUndefined(user.created_by)){
            data.created_by= user._id
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

 const templateInfo = async(company_id, template_id) =>{
    try {
        const comp_id = company_id._id;
        const templateId = new ObjectId(template_id);
        const template_info = await Template.find({_id:templateId,company_id:comp_id});
        if(!template_info){
            throw new ApiError(httpStatus.NOT_FOUND, 'Template ID not found');
        }
        
        return {
            _id:template_info[0]._id,
            name: template_info[0].name,
            notes: template_info[0].notes,
            company_id: template_info[0].company_id,
            active: template_info[0].active,
            status: (template_info[0].active==1)?"active":"inactive"
        };
    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`[Company Module ROI Template] ${e}`)
        throw e;
    }
 }
  
 const getCompanylicenseStatus = async(company) =>{
    try {
       
        if(company.licenses < 0 ){
            let e = new ApiError(httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS, INSUFFICIENT_LICENSE);
            logger.error(`${LICENSE_ERROR} ${e}`)
            throw e;
        }

        const user = await User.aggregate([
            {
                $match: {
                    company_id: company._id
                }
            },{
                $group:{
                    _id: null,
                    count:{
                        $sum:1
                    }
                }
            }
        ]);
        const ret_val = {};
        ret_val.user_count = user[0].count;
        ret_val.company_license = company.licenses+user[0].count;
        ret_val.company_name = company.name;
        ret_val.remarks = INSUFFICIENT_LICENSE;

        return ret_val;

    } catch (error) {
        let e = new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
        logger.error(`${LICENSE_ERROR} ${e}`)
        throw e;
    }
    

 }

module.exports = {
    getCompanylicenseStatus,
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
    transferAllAccount,
    updateUserAccount,
    getAllUserTemplate,
    updateTemplate,
    templateInfo,
    updateTemplateVersion,
    getActiveTemplateVersionByTemplateId
}
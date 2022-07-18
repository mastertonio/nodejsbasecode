const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const {companyService, userService} = require('../services');
const { create } = require('../models/token.model');
const { jwtExtract } = require('./common.controller');

const AWSs3 =  require('../services/s3.service');
const { info } = require('../config/logger');
const logger = require('../config/logger');



// AWS.config.update({
//   accessKeyId: s3_key_id,
//   secretAccessKey: s3_secret_key
// });
// let s3 = new AWS.S3();

// async function getFile(){
//    console.log(s3_company_bucket);
//   const data =  s3.getObject(
//     {
//         Bucket: s3_company_bucket,
//         Key: 'hello-world.pdf'
//       }
    
//   ).promise();
//   return data;
// }


// async function encode(){
//   let data = await getFile();
//   let buf = Buffer.from(data.Body);
//   let base64 = buf.toString('base64');
//   return base64
// }

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
    const awsService = await new AWSs3({name:req.body.file_name,data:null});
    const encode = await awsService.fetch_file;
    res.send({data:encode});
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
    if(req.files.contract_file !== 'undefined'){
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

const getAllCompany = catchAsync(async (req, res) =>{
    const token = jwtExtract(req);
    const getAll_company = await companyService.getAllCompany(token);
    res.send(getAll_company);
})

const patchCompany = catchAsync(async (req,res) => {
    console.log(req.body)
    const token = jwtExtract(req);
    
    const patch_company = await companyService.patchCompany(token, req.params, req.body);
    res.send(patch_company);
})
  
  module.exports = {
    createCompany,
    getFile,
    getCompany,
    getAllCompany,
    patchCompany
  }
  
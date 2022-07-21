const AWS = require('aws-sdk');
const httpStatus = require('http-status');
const {s3_key_id,s3_secret_key,s3_company_bucket} = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

class AWSs3{
    constructor(params){
        try {
            if(typeof params === 'undefined'){
                throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Cannot be called directly');
            }else{
                this.accessKeyId = s3_key_id;
                this.secretAccessKey = s3_secret_key;
                this.s3Bucket_company = s3_company_bucket;
                this.s3Key = params.name;
                this.s3Body = params.data;
            }            
        } catch (error) {
            throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, error);
        }
    }
    connection() {
        return new AWS.S3({
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
          })
          
    } 
    get upload_file(){
        const s3 = this.connection();
       return s3.upload({
            Bucket: s3_company_bucket,
            Key: this.s3Key,
            Body: this.s3Body,
          }).promise().then((file)=>{
            logger.info(`Successfully Connected to AWS bucket => ${JSON.stringify(file)}`)
            return file
          },(e)=>{
            let error = new ApiError(httpStatus.UNPROCESSABLE_ENTITY, e);
            logger.error(error);
            throw error;
          });
        }
    get upload_Avatar(){
        const s3 = this.connection();
        return s3.upload({
            Bucket: s3_avatar_bucket,
            Key: this.s3Key,
            Body: this.s3Body,
            }).promise().then((file)=>{
            logger.info(`Successfully Connected to AWS bucket => ${JSON.stringify(file)}`)
            return file
            },(e)=>{
            let error = new ApiError(httpStatus.UNPROCESSABLE_ENTITY, e);
            logger.error(error);
            throw error;
            });
        }
    get fetch_file(){
        const s3 = this.connection();
        return s3.getObject(
                {
                    Bucket: s3_company_bucket,
                    Key: this.s3Key
                }
                
            ).promise().then((file)=>{
                logger.info(`Successfully Connected to AWS bucket => ${JSON.stringify(file)}`)
                let buf = Buffer.from(file.Body);
                return buf.toString('base64');
            },(e)=>{
                let error = new ApiError(httpStatus.UNPROCESSABLE_ENTITY, e);
                logger.error(error);
                throw error;
              })
    }

}

module.exports = AWSs3;
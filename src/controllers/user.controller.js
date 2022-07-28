const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { jwtExtract } = require('./common.controller');
const AWSs3 =  require('../services/s3.service');
const fs = require('fs');
const path = require('path');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const uploadAvatar = catchAsync(async (req, res) => {
  /**
  * extracting JWT Token to get the User Id
  */
  const token = jwtExtract(req);
  let bucketLocation = ""; 
  /**
      * validating the user Account base on the response of the extraction
      */
  const is_user = await userService.getUserById(token);
  if(!is_user){
    let error = new ApiError(httpStatus.NOT_FOUND, 'User not found');
    logger.error(`[Invalid TOken] ${error}`);
    throw error;
  }
  /**
     * get the file and upload to s3bucket services
     */
   if(req.files.avatar !== 'undefined'){
    const file = req.files.avatar;
    const awsService = await new AWSs3(file);
    await awsService.upload_Avatar;
    bucketLocation = file.name;    

  }else{
    let error = new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Invalid Payload');
    logger.error(`[Invalid Payload] ${error}`);
    throw error;
  }
  const data = {};
  data.filname = bucketLocation
  data.uid = token;
  const upload_avatar = await userService.uploadAvatar(data);

  const awsService = await new AWSs3({name:upload_avatar.avatar,data:null,bucket:2});
  const encode = await awsService.fetch_file;
  console.log(encode)
  res.writeHead(200, {"Content-type":"image/jpg"});
  
  res.end(encode.Body)
  

  // res.status(200).contentType("image/jpeg").send(encode)
    // var options = {
    //     root: path.join('./uploads')
    // };
  

    // res.sendFile(data.filname, options, function (err) {
    //   if (err) {
    //       next(err);
    //   } else {
    //       console.log('Sent:', data.filname);
    //   }
    // });




})

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar
};

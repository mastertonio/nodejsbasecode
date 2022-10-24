const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { jwtExtract } = require("./common.controller");

const createROI = catchAsync(async(req,res)=>{
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


    res.send("create template builder");
});

module.exports = {

    createROI
}
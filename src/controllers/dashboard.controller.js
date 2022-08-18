const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const {dashboadService, userService} = require('../services');
const { jwtExtract, getCID } = require('./common.controller');
const { data } = require('../config/logger');
const _ = require('underscore');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getDashboard = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['title']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

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

  const comp_id = await getCID(req);

  const template_list = await dashboadService.getRoiTemplates(comp_id,is_user);




    const dashboard = await dashboadService.getDashboard(req.params.userId, filter, options);
    dashboard.template_list = template_list;
    res.send(dashboard);
  });

/**
 * udpate  template status
 */
const updateTemplateStatus = catchAsync(async (req, res) => {
  const status = await dashboadService.updateStatus(req.params.userId, req.body);
  res.send(status);
});

/**
 * get importance by calculator id
 */
const getImportance = catchAsync(async (req, res) =>{
  const importanceValue = await dashboadService.getImportance(req.params);
  res.send(importanceValue);
});

/**
 * update importance by calculator id
 */
const updateImportance = catchAsync(async (req, res) =>{
  const updateImportanceValue = await dashboadService.updateImportance(req.params, req.body);
  res.send(updateImportanceValue);
})

/**
 * update roi table
 */
const updateroiTable = catchAsync(async (req, res) =>{
  const updateroi_table = await dashboadService.updateroiTableService(req.params, req.body);
  res.send(updateroi_table);
});

/**
 * create calculator
 */
const createCalculator = catchAsync(async (req,res)=>{
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

   const comp_id = await getCID(req);
   req.body.cid = comp_id;


  const create_calculator = await dashboadService.createCalculator(token, req.body);
  res.send(create_calculator);
});

/**
 * deleteCalculators
 */

 const deleteCalculator = catchAsync(async (req,res)=>{
  const delete_calculator = await dashboadService.deleteCalculator(req.params);
  res.send(delete_calculator);
});

const cloneCalculators = catchAsync(async (req,res)=>{
  const clone_calculator = await dashboadService.cloneCalculator(req.params,  req.body);
  res.send(clone_calculator);
});

/**
 * get roi table
 */

const getSuperAdminRoiTable = catchAsync(async (req, res)=>{
  const uid = jwtExtract(req);
  const roiTable = await dashboadService.getSuperAdminRoiTable(req,uid);
  res.send(roiTable);
});
const getCompanyRoiTable = catchAsync(async (req, res)=>{
  const uid = jwtExtract(req);
  const cid = getCID(req);
  const roiTable = await dashboadService.getCompanyRoiTable(req,uid,cid);
  res.send(roiTable);
});

/**
 * fetch all tempaltes
 */

const getRoiTemplate = catchAsync(async (req, res)=>{
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

  const comp_id = await getCID(req);

  const roiTable = await dashboadService.getRoiTemplates(comp_id,is_user);
  const data = [];
  roiTable.map(v=>{
    if(!_.isEmpty(v.build)){
      v.build.map(k=>{
        if(k.stage == 1){
          
          data.push({id:v._id,...v,})
        }
      })
    }
    
    // if(!_.isEmpty(v.TemplateVersionData) && v.TemplateVersionData)
    // console.log(v.TemplateVersionData);
  });
  res.send(data);
});

/**
 * fetch all admin user
 */

const getRoiAdmin =catchAsync(async (req, res) =>{
  const uid = jwtExtract(req);
  const roiAdmin = await dashboadService.getRoiAdmin(uid);
  res.send(roiAdmin);
});

/**
 * fetch graph data
 */
 const getMyRoiGraph =catchAsync(async (req, res) =>{
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
   console.log(is_user)


  const comp_id = await getCID(req);

  const roiGraph = await dashboadService.getMyRoiGraph(is_user, comp_id);
  res.send(roiGraph);
});

/**
 * fetch graph data super admin
 */
 const getRoiGraphSuperAdmin =catchAsync(async (req, res) =>{
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

   if(is_user.role !="admin"){
    let error = new  ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
    logger.error(`[Invalid TOken] ${error}`);
    throw error;
  }

  const comp_id = await getCID(req);

  const roiGraph = await dashboadService.getSuperAdminRoiGraph(is_user, comp_id);
  res.send(roiGraph);
});
/**
 * fetch graph data Company admin || company manager
 */
 const getRoiGraphCompany =catchAsync(async (req, res) =>{
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
   const allowed = ["company-manager","company-admin"]
   const user_role = is_user.role;

  const role = allowed.some(element => {
    return element.toLowerCase() === user_role.toLowerCase();
  });
  if(!role){
    let error = new  ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
    logger.error(`[Invalid TOken] ${error}`);
    throw error;
  }

  const comp_id = await getCID(req);

  const roiGraph = await dashboadService.getCompanyRoiGraph(is_user, comp_id);
  res.send(roiGraph);
});
/**
 * fetch Ranking
 */
 
 const getRanking =catchAsync(async (req, res) =>{
  const uid = jwtExtract(req);
  const userRanking = await dashboadService.getRanking(uid);
  res.send(userRanking);
});

/**
 * dashboard
 * 
 */

 const dashboardData =catchAsync(async (req, res) =>{
  const uid = jwtExtract(req);
  const dashboard_data = await dashboadService.dashboardData(uid);
  res.send(dashboard_data);
});
module.exports = {
    getDashboard,
    updateTemplateStatus,
    getImportance,
    updateImportance,
    updateroiTable,
    createCalculator,
    deleteCalculator,
    cloneCalculators,
    getSuperAdminRoiTable,
    getRoiTemplate,
    getRoiAdmin,
    getMyRoiGraph,
    getRanking,
    dashboardData,
    getRoiGraphSuperAdmin,
    getRoiGraphCompany,
    getCompanyRoiTable

}

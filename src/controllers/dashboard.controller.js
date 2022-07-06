const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const {dashboadService} = require('../services');
const { jwtExtract } = require('./common.controller');


const getDashboard = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['title']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    console.log(options)
    const dashboard = await dashboadService.getDashboard(req.params.userId, filter, options);
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
  const create_calculator = await dashboadService.createCalculator(req.params, req.body);
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

const getRoiTable = catchAsync(async (req, res)=>{
  const uid = jwtExtract(req);
  const roiTable = await dashboadService.getRoiTable(req,uid);
  res.send(roiTable);
});

/**
 * fetch all tempaltes
 */

const getRoiTemplate = catchAsync(async (req, res)=>{
  const uid = jwtExtract(req);
  const roiTable = await dashboadService.getRoiTemplates(uid);
  res.send(roiTable);
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
 const getRoiGraph =catchAsync(async (req, res) =>{
  const uid = jwtExtract(req);
  const roiGraph = await dashboadService.getRoiGraph(uid);
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
    getRoiTable,
    getRoiTemplate,
    getRoiAdmin,
    getRoiGraph,
    getRanking,
    dashboardData
}

const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const {dashboadService} = require('../services');


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
  const roiTable = await dashboadService.getRoiTable(req);
  res.send(roiTable);
})

module.exports = {
    getDashboard,
    updateTemplateStatus,
    getImportance,
    updateImportance,
    updateroiTable,
    createCalculator,
    deleteCalculator,
    cloneCalculators,
    getRoiTable
}

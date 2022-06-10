const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {dashboadService} = require('../services');
const { create } = require('../models/token.model');


const getDashboard = catchAsync(async (req, res) => {
    const dashboard = await dashboadService.getDashboard(req.params.userId);
    res.status(httpStatus.CREATED).send(dashboard);
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

module.exports = {
    getDashboard,
    updateTemplateStatus,
    getImportance,
    updateImportance,
    updateroiTable
}

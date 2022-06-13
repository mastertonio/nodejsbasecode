const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {companyService} = require('../services');
const { create } = require('../models/token.model');
const { jwtExtract } = require('./common.controller');


const createCompany = catchAsync(async (req, res) =>{
    const token = jwtExtract(req);
    const create_company = await companyService.createCompany(token, req.body);
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
    getCompany,
    getAllCompany,
    patchCompany
  }
  
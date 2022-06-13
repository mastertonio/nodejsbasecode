const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const commonService = require('./common.service');
const userService = require('./user.service');
const ObjectId = require('mongodb').ObjectID;

const { Calculator, Company, Template, TemplateVersion, User} = require('../models');
const { mongoose } = require('../config/config');
const { now } = require('mongoose');

const getAllTemplate = async () => {
    return Template.find();
}

const calculatorsByUser = async (userId) => {
    let o_id = new ObjectId(userId);
    
    return  Calculator.aggregate([
        {
            $lookup: {
                from: 'templateversions',
                localField: 'template_version_id',
                foreignField: '_id',
                as: 'TemplateVersionData'
            }
        }
    ]);
}

const allUserByCompany = async () => {
    
    return User.aggregate([
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
    ]);
}

const getAllAdmin = async () => {
    return User.find({role: "admin"},{name:1})
}

const getActiveROI = async (userId) =>{
    let o_id = new ObjectId(userId);
    return Calculator.find({user_id: o_id, status:1})
}

const getAllROI = async (userId) =>{
    let o_id = new ObjectId(userId);
    return Calculator.find({user_id: o_id, status:1})
}

const getCalculatorByUID = async (calc_id) =>{
    let o_id = new ObjectId(calc_id);
    return Calculator.findOne({_id:o_id})
}

const getCalculatorByUser = async (uid) => {
    let o_id = new ObjectId(uid);
    return Calculator.findOne({user_id: o_id});
}

const updateStatus = async (userId,updateBody) => {
    const user = await userService.getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const template_status = await getCalculatorByUID(updateBody.calculator_id);
    if(!template_status) {
        throw new ApiError(httpStatus.NOT_FOUND, "Calculator Template not found")
    }
        
    Object.assign(template_status, {status:updateBody.status});
    await template_status.save();
    return template_status;
}

/***
 * remaining task
 * 1.) welcome [done]
 *  1.1) current roi [done]
 *  1.2) active roi [done]
 * 2.) template list [done]
 * 3.) graph
 */
const getDashboard = async (userId) => {
    const setChart = await commonService.setChart({type:'bargraph',uid:userId})
    const user = await userService.getUserById(userId);
    let roi_table = [];
    
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

    const calculatorsPerUser = await calculatorsByUser(userId);

    if(!calculatorsPerUser){
        throw new ApiError(httpStatus.NOT_FOUND, `No record found for user_id: ${userId} `);
    }
    
    calculatorsPerUser.map(v =>{
        console.log(v.user_id)
        if(v.user_id == userId){
            roi_table.push({
                id:Object(v._id),
                link: null,
                importance: Number(v.importance),
                name: v.title,
                source: v.TemplateVersionData[0].name,
                dateCreated: v.createdAt,
                views: Number(v.visits),
                uniqueViews: Number(v.unique_ip)
            });
        }
        roi_table.push({id:Object(v._id),
        link: null,
        importance: Number(v.importance),
        name: v.title,
        source: v.TemplateVersionData[0].name,
        dateCreated: v.createdAt,
        views: Number(v.visits),
        uniqueViews: Number(v.unique_ip)
        });
    })
    const ranking_UserByCompany = await allUserByCompany();

    const adminList = await getAllAdmin();
    const active_roi =  await getActiveROI(user._id);
    const all_roi = await getAllROI(user._id);
    const allTemplate = await getAllTemplate()
    
    let name = user.name;
    let data = {};


    //check the number of roi per account
    data.welcome = {
        account_name: name.toString().toUpperCase(),
        current_roi: all_roi.length,
        active_roi: active_roi.length
    };

    data.admin_list = adminList;
    
    /***
     * it will be replace in the future 
     * just leave this static data
     */
    data.viewcount = [
        {
            roi_name: "My Company",
            count: 0
        }
    ];


    data.ranking = ranking_UserByCompany;

    data.template_list = allTemplate;

    data.my_roi = roi_table

    data.chart = setChart;

    return data;
  };

  /**
   * 
   * @param {userId, templateId} req 
   * @returns Object
   */
  const getImportance = async (req) =>{
    const user = await userService.getUserById(req.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const template = await getCalculatorByUID(req.templateId);
    if(!template) {
        throw new ApiError(httpStatus.NOT_FOUND, "Calculator Template not found")
    }

    let response = {}
    response.importance_value = template.importance;
    return response;
  }

  const updateImportance = async (req,updateBody) =>{
    const user = await userService.getUserById(req.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const template = await getCalculatorByUID(req.templateId);
    if(!template) {
        throw new ApiError(httpStatus.NOT_FOUND, "Calculator Template not found")
    }

    Object.assign(template, {importance: updateBody.importance_value});
    await template.save();
    return template;
  };

  const updateroiTableService = async (req, updateBody) =>{
    const user = await userService.getUserById(req.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    
    /**
     * validate index key
     */
    // let bodyParamsValidator = await commonService.indexKeyValidator(Object.keys(updateBody));
    // console.log(bodyParamsValidator);

    // console.log(Object.keys(updateBody));

    let calculator = await getCalculatorByUID(req.templateId);
    if(!calculator){
        throw new ApiError(httpStatus.NOT_FOUND, `no record found!`)
    }

    Object.assign(calculator,updateBody);
    await calculator.save();
    return calculator;
  }

  const createCalculator = async(params,entryBody) =>{
    const user = await userService.getUserById(params.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    return  {
        "id": "1234556",
        "link": null,
        "importance": 0,
        "name": "asus laptop",
        "source": "the test",
        "dateCreated": "2022-05-19T13:53:56.969Z",
        "views": 2,
        "uniqueViews": 1
    };
  }



  module.exports = {
      getDashboard,
      updateStatus,
      getImportance,
      updateImportance,
      updateroiTableService,
      createCalculator
  }
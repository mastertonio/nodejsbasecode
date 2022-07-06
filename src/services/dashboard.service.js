const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const commonService = require('./common.service');
const userService = require('./user.service');
const ObjectId = require('mongodb').ObjectID;
const pick = require('../utils/pick');

const { Calculator, Company, Template, TemplateVersion, User} = require('../models');
const { data } = require('../config/logger');

const getAllTemplate = async () => {
    return Template.find();
}
const getCalculatorStatistic = async (uid) =>{
   return Calculator.aggregate([
    // {
    //     $match: {
    //         user_id:uid
    //     }
    // },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    }
  ])
}

const getAllCalculators = async (filter, options) => {
    return  Calculator.paginate(filter, options);
}


const getTemplateVersion = async (id) => {
    let o_id = new ObjectId(id);       
    return TemplateVersion.findById({_id: o_id});
}
const calculatorsByUser = async (userId,filter, options) => {
    let o_id = new ObjectId(userId);
    return  Calculator.aggregate([
        {
            $match: {
                user_id:o_id
            }
        },
        {
            $lookup: {
                from: 'templateversions',
                localField: 'template_version_id',
                foreignField: '_id',
                as: 'TemplateVersionData'
            }
        }
    ])
    /**
     * aggregate([
        {
            $match: {
                user_id:o_id
            }
        },
        {
            $lookup: {
                from: 'templateversions',
                localField: 'template_version_id',
                foreignField: '_id',
                as: 'TemplateVersionData'
            }
        }
    ])
     */
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
const getDashboard = async (userId,filter, options) => {
    // const setChart = await commonService.setChart({type:'bargraph',uid:userId})
    const user = await userService.getUserById(userId);
    let roi_table = [];
    
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

    const calculatorsPerUser = await calculatorsByUser(userId, filter, options);

    if(!calculatorsPerUser){
        throw new ApiError(httpStatus.NOT_FOUND, `No record found for user_id: ${userId} `);
    }
   
    calculatorsPerUser.map(v =>{
        console.log(v)
        roi_table.push({id:Object(v._id),
        link: v.linked_title,
        importance: Number(v.importance),
        name: v.title,
        source: v.TemplateVersionData[0].name,
        dateCreated: v.createdAt,
        views: Number(v.visits),
        uniqueViews: Number(v.unique_ip),
        status: v.status
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

    data.chart = {
        "chart": {
            "type": "column"
        },
        "title": {
            "text": "ROI CREATED"
        },
        "xAxis": {
            "categories": [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
            ],
            "crosshair": true
        },
        "yAxis": {
            "min": 0,
            "title": {
                "text": ""
            }
        },
        "series": [
            {
                "name": "ROI CREATED",
                "data": [
                    0,
                    0,
                    0,
                    0,
                    17,
                    3,
                    13,
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            }
        ]
    };

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
    
  

    let calculator = await getCalculatorByUID(req.templateId);
    if(!calculator){
        throw new ApiError(httpStatus.NOT_FOUND, `no record found!`)
    }

    Object.assign(calculator,updateBody);
    await calculator.save();
    return calculator;
  }

  const createCalculator = async(params,paramBody) =>{
    const user = await userService.getUserById(params.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    // const template_id = paramBody.template_id;
    const template_id = "628779c3ec4e045f4806f775";
    const templateVersion = await getTemplateVersion(template_id);    
    if(!templateVersion){
        throw new ApiError(httpStatus.NOT_FOUND, `no record found!`)
    }
    
    const data = {};
    const templateVersionID = new ObjectId("628779c3ec4e045f4806f775");
    data.user_id = params.userId;
    data.title = paramBody.name;
    // data.template_version_id = paramBody.templateVersion_id;
    data.template_version_id = templateVersionID;

    return Calculator.create(data);
  }

  const deleteCalculator = async(params) =>{
    const user = await userService.getUserById(params.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    //templateId user.remove();
    const template = await getCalculatorByUID(params.templateId);
    if(!template) {
        throw new ApiError(httpStatus.NOT_FOUND, "Calculator Template not found")
    }
   
    template.remove();
    return template;
  }

  

  const cloneCalculator = async(params, paramBody) =>{
    let o_id = new ObjectId(params.userId);     
    const user = await userService.getUserById(params.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    
    const template = await getCalculatorByUID(params.templateId);
    if(!template) {
        throw new ApiError(httpStatus.NOT_FOUND, "Calculator Template not found")
    }
    
    const t_version = new ObjectId(template.template_version_id)
    let data = {
        "position": template.position,
        "verification_code": template.verification_code,
        "email_protected": template.email_protected,
        "visits": template.visits,
        "unique_ip": template.unique_ip,
        "currency": template.currency,
        "is_sf_opportunity": template.is_sf_opportunity,
        "salesforce_id": template.salesforce_id,
        "sfdc_link": template.sfdc_link,
        "instance": template.instance,
        "folder":  template.folder,
        "linked_title": template.linked_title,
        "version": template.version,
        "status": template.status,
        "importance": template.importance,
        "cloned_from_parent":  template.cloned_from_parent,
        "user_id": o_id,
        "title": paramBody.title,
        "template_version_id": t_version,
    }
    
    return Calculator.create(data);
  }

  const getRoiTable = async(params,uid) =>{
    const data = [];
    const filter = pick(params.query, ['title']);
    const options = pick(params.query, ['sortBy', 'limit', 'page']);  
    const roi_table = await getAllCalculators(filter, options);

    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    roi_table.results.map(v=>{
        if(uid == v.user_id){
            
            data.push({
                id: v._id,
                link: v.linked_title,
                importance: Number(v.importance),
                name: v.title,
                source: v.template_version_id,
                dateCreated: v.createdAt,
                views: Number(v.visits),
                uniqueViews: Number(v.unique_ip),
                status: v.status
            })
        
        }
    });
    roi_table.results = data;
    return roi_table;
  }

  const getRoiTemplates = async(uid) =>{
    
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return  getAllTemplate();
  }

  const getRoiAdmin = async(uid) => {
    
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return getAllAdmin();
  }

  const getRoiGraph = async(uid) =>{
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    let o_id = new ObjectId(uid);     
    const statistic = await getCalculatorStatistic(o_id);
    
     return commonService.setChart({type:'bargraph',uid:uid, statistic})
    // return setChart;
  }

  const getRanking = async(uid) =>{
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return allUserByCompany();
  }


  const dashboardData = async(uid) =>{
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const active_roi =  await getActiveROI(user._id);
    const all_roi = await getAllROI(user._id);
    const name = user.name;
 

    /***
     * it will be replace in the future 
     * just leave this static data
     */
     const viewcount = [
        {
            roi_name: "My Company",
            count: 0
        }
    ];
    console.log(data)
    return {
        welcome:{
            account_name: name.toString().toUpperCase(),
            current_roi: all_roi.length,
            active_roi: active_roi.length
        },
        viewcount:viewcount
    };
  }


  module.exports = {
      getDashboard,
      updateStatus,
      getImportance,
      updateImportance,
      updateroiTableService,
      createCalculator,
      deleteCalculator,
      cloneCalculator,
      getRoiTable,
      getRoiTemplates,
      getRoiAdmin,
      getRoiGraph,
      getRanking,
      dashboardData
  }

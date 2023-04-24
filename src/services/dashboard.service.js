const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const commonService = require('./common.service');
const userService = require('./user.service');
const ObjectId = require('mongodb').ObjectID;
const pick = require('../utils/pick');
const _ = require('underscore');
const logger = require('../config/logger');
const { Calculator, Company, Template, TemplateVersion, User} = require('../models');
const { data } = require('../config/logger');
const { CostExplorer } = require('aws-sdk');
const { required } = require('joi');
const { map, get } = require('underscore');

const getAllTemplate = async (cond) => {
    let condition = [];

    console.log('get all tempalte cond ', cond)
    if(cond == null){
        condition =[{
            $lookup: {
                from: 'templateversions',
                localField: '_id',
                foreignField: 'template_id',
                as: 'build'
            }
        }]
    }else{
       
        let o_id = new ObjectId(cond);  
        condition =[{
            $match: {
                company_id:o_id
            }
        },{
            $lookup: {
                from: 'templateversions',
                localField: '_id',
                foreignField: 'template_id',
                as: 'build'
            }
        }]

        
    }

    return  await Template.aggregate(condition);

    
}
const getCalculatorStatistic = async (data) =>{
    let cond={};
    switch (data.access) {
        case 'admin':
            return  Calculator.aggregate([{
                $group: {
                  _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                  },
                  count: { $sum: 1 }
                }
              }]);
        case 'company-admin':
            const users = await User.find({company_id:data.cid});
            const _ids = [];
            users.map(v=>{
                _ids.push(v._id)
            })          

            cond = [{
                        $match: {
                                user_id:{$in:_ids}
                            }
                        },
                        {
                        $group: {
                            _id: "$user_id",
                            count: { $sum: 1 }
                        }
                    }];
           
            
            break;
        default:
            cond = [{
                $match: {
                    user_id:data.oid
                }
            },
            {
              $group: {
                _id: {
                  month: { $month: "$createdAt" },
                  year: { $year: "$createdAt" }
                },
                count: { $sum: 1 }
              }
            }];
            break;
    }
    let graph;
    if(data.access == "company-admin" || data.access=="company-manager"){
        const templateData = await Calculator.aggregate(cond);
        const usersData = await User.find({company_id:data.cid});
        const graph_data = [];
        const myData = await Calculator.aggregate([{
            $match: {
                user_id:data.oid
            }
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        }])
        usersData.map(v=>{
            let n_count = templateData.map(k=>{
                let count =0;
                if(JSON.stringify(v._id) === JSON.stringify(k._id)){
                    count = k.count;
                }
                return count
            });

            graph_data.push({
                _id:v._id,
                email:v.email,
                count:n_count.reduce((partialSum, a) => partialSum + a, 0)
                
            })

        });
        return graph_data;
    }else{
        const myData = await Calculator.aggregate(cond);
        graph = {company_data:[],my_graph:myData};
    }

}

const getAllCalculators = async (id) => {
    let o_id = new ObjectId(id);  
    return Calculator.aggregate([
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
    ]).sort({createdAt:-1})
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
    const allAdmin = await User.find({role: "admin"});
    const container = [];
    allAdmin.map(i=>{        
        container.push({_id:i._id, name:i.name? i.name:""})
    })
    return container
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
        account_name: name,
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

  const createCalculator = async(userId,paramBody) =>{

    const user = await userService.getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const template = await Template.find({company_id:paramBody.cid});
    if(!template){
        throw new ApiError(httpStatus.NOT_FOUND, `no record found on Template collection!`)
    }


    const template_id = new ObjectId(paramBody.template_id);
    // const templateVersion = await TemplateVersion.find({template_id: template_id,stage:1});   
    const templateVersion = await TemplateVersion.find({_id: template_id});   
    console.log(template_id)
    if(!templateVersion || _.isEmpty(templateVersion)){
        throw new ApiError(httpStatus.NOT_FOUND, `no record found  on Template version collection!`)
    }

    console.log(templateVersion)
    const templateVersion_data = {};
    templateVersion_data.user_id = userId;
    templateVersion_data.title = paramBody.name;
    templateVersion_data.template_version_id = templateVersion[0]._id;
    console.log(templateVersion_data)

    return Calculator.create(templateVersion_data);
    
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
    let response_data = {
        "position": template.position,
        "verification_code": template.verification_code,
        "email_protected": template.email_protected,
        "visits": 0,
        "unique_ip": 0,
        "currency": template.currency,
        "is_sf_opportunity": template.is_sf_opportunity,
        "salesforce_id": template.salesforce_id,
        "sfdc_link": template.sfdc_link,
        "instance": template.instance,
        "folder":  template.folder,
        "linked_title": template.linked_title,
        "version": template.version,
        "status": 0,
        "importance": 0,
        "cloned_from_parent":  template.cloned_from_parent,
        "user_id": o_id,
        "title": paramBody.title,
        "template_version_id": t_version,
    }
    
    return Calculator.create(response_data);
  }

  const getRoiTable = async(params,uid) =>{
    const data = [];
    const filter = pick(params.query, ['title']);
    const options = pick(params.query, ['sortBy', 'limit', 'page']);  
    
   
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    filter.user_id = new ObjectId(uid)
    options.sortBy = {createdAt:-1};
    let o_id = new ObjectId(uid);
    const roi_table = await  Calculator.aggregate([
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
    ]).sort({createdAt:-1})
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

    roi_table.map(v=>{    
       
        let d=new Date(v.createdAt);     
        let monthIndex  =  d.getMonth();
        let monthName = months[monthIndex]
        let getDate = d.getDate();
            getDate = (String(Math.abs(getDate)).charAt(0) == getDate) ? `0${getDate}` : getDate;
        let getYear = d.getFullYear();
        let n_d = d.toLocaleString();
            n_d= n_d.split(', ');
        // console.log()
            data.push({
                id: v._id,
                link: v.linked_title,
                importance: Number(v.importance),
                name: v.title,
                source_id: v.template_version_id,
                source_name: v.TemplateVersionData[0].name,
                dateCreated:`${monthName} ${getDate},${getYear} ${n_d[1]}`,
                views: Number(v.visits),
                uniqueViews: Number(v.unique_ip),
                status: v.status
            })
    });
    // roi_table.results = data;
    return data;
  }
  
  const getSuperAdminRoiTable = async(params,uid) =>{
    const data = [];
    const filter = pick(params.query, ['title']);
    const options = pick(params.query, ['sortBy', 'limit', 'page']);  
    
   
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    filter.user_id = new ObjectId(uid)
    options.sortBy = {createdAt:-1};
    let o_id = new ObjectId(uid);
    const roi_table = await  Calculator.aggregate([
        {
            $lookup: {
                from: 'templateversions',
                localField: 'template_version_id',
                foreignField: '_id',
                as: 'TemplateVersionData'
            }
        }
    ]).sort({createdAt:-1})
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

    roi_table.map(v=>{    
       
        let d=new Date(v.createdAt);     
        let monthIndex  =  d.getMonth();
        let monthName = months[monthIndex]
        let getDate = d.getDate();
            getDate = (String(Math.abs(getDate)).charAt(0) == getDate) ? `0${getDate}` : getDate;
        let getYear = d.getFullYear();
        let n_d = d.toLocaleString();
            n_d= n_d.split(', ');
        // console.log()
            data.push({
                id: v._id,
                link: v.linked_title,
                importance: Number(v.importance),
                name: v.title,
                source_id: v.template_version_id,
                source_name: v.TemplateVersionData[0].name,
                dateCreated:`${monthName} ${getDate},${getYear} ${n_d[1]}`,
                views: Number(v.visits),
                uniqueViews: Number(v.unique_ip),
                status: v.status
            })
    });
    // roi_table.results = data;
    return data;
  }
  const getCompanyRoiTable = async(params,uid,cid) =>{
    const data = [];
    
    let c_id = new ObjectId(cid);
    const templateVersion_collection = [];
    const templateData = await Template.aggregate([
                {
                    $match: {
                        company_id:c_id
                    }
                },{
                    $lookup: {
                        from: 'templateversions',
                        localField: '_id',
                        foreignField: 'template_id',
                        as: 'TemplateVersionData'
                    }
                }
                ]);
        
        // {company_id:c_id});
    templateData.map(t=>{
        if(!_.isEmpty(t.TemplateVersionData)){
            t.TemplateVersionData.map(tv=>{
                templateVersion_collection.push(tv._id)
            });
        }
    })
    let o_id = new ObjectId(uid);
    const roi_table = await  Calculator.aggregate([ {
            $match: {
                template_version_id:{$in:templateVersion_collection}
            }
        },{
            $lookup: {
                from: 'templateversions',
                localField: '_id',
                foreignField: 'template_version_id',
                as: 'TemplateVersionData'
            }
        }
    ]).sort({createdAt:-1})


    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

    roi_table.map(v=>{    
       
        let d=new Date(v.createdAt);     
        let monthIndex  =  d.getMonth();
        let monthName = months[monthIndex]
        let getDate = d.getDate();
            getDate = (String(Math.abs(getDate)).charAt(0) == getDate) ? `0${getDate}` : getDate;
        let getYear = d.getFullYear();
        let n_d = d.toLocaleString();
            n_d= n_d.split(', ');
        
            data.push({
                id: v._id,
                link: v.linked_title,
                importance: Number(v.importance),
                name: v.title,
                source_id: v.template_version_id,
                source_name: _.isEmpty(v.TemplateVersionData)?"":v.TemplateVersionData[0].name,
                dateCreated:`${monthName} ${getDate},${getYear} ${n_d[1]}`,
                views: Number(v.visits),
                uniqueViews: Number(v.unique_ip),
                status: v.status
            })
    });
    return data;

  }
  const getSCompanyRoiTable = async(params,uid) =>{
    const data = [];
    const filter = pick(params.query, ['title']);
    const options = pick(params.query, ['sortBy', 'limit', 'page']);  
    
   
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    filter.user_id = new ObjectId(uid)
    options.sortBy = {createdAt:-1};
    
    const roi_table = await getAllCalculators(uid);
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

    roi_table.map(v=>{    
       
        let d=new Date(v.createdAt);     
        let monthIndex  =  d.getMonth();
        let monthName = months[monthIndex]
        let getDate = d.getDate();
            getDate = (String(Math.abs(getDate)).charAt(0) == getDate) ? `0${getDate}` : getDate;
        let getYear = d.getFullYear();
        let n_d = d.toLocaleString();
            n_d= n_d.split(', ');
        // console.log()
            data.push({
                id: v._id,
                link: v.linked_title,
                importance: Number(v.importance),
                name: v.title,
                source_id: v.template_version_id,
                source_name: v.TemplateVersionData[0].name,
                dateCreated:`${monthName} ${getDate},${getYear} ${n_d[1]}`,
                views: Number(v.visits),
                uniqueViews: Number(v.unique_ip),
                status: v.status
            })
    });
    // roi_table.results = data;
    return data;
  }

  const getRoiTemplates = async(comp_id,user) =>{
    
    if(user.role == 'admin'){
        return  getAllTemplate(null);
    }else{
        return getAllTemplate(comp_id)
    }
    
  }

  const getRoiAdmin = async(uid) => {
    
    const user = await userService.getUserById(uid);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return getAllAdmin();
  }

  const getMyRoiGraph = async(uid,cid) =>{
    const graphData={};
    graphData.oid = new ObjectId(uid._id);
    graphData.cid = new ObjectId(cid);
    graphData.access = uid.role;

         
    const statistic = await Calculator.aggregate([
            {
                $match: {
                    user_id:graphData.oid
                }
            },{
            $group: {
            _id: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" }
            },
            count: { $sum: 1 }
            }
        }]);
    
    return commonService.setChart({type:'bargraph',uid:uid._id, statistic,role:uid.role});
    
  }
  const getCompanyRoiGraph = async(uid,cid) =>{
    const graphData={};
    graphData.oid = new ObjectId(uid._id);
    graphData.cid = new ObjectId(cid);
    graphData.access = uid.role;

    const statistic = await getCalculatorStatistic(graphData);
    console.log(statistic)

    return commonService.setChart({type:'bargraph',uid:uid._id, statistic,role:uid.role});
  }
  const getSuperAdminRoiGraph = async(uid,cid) =>{
    const graphData={};
    graphData.oid = new ObjectId(uid._id);
    graphData.cid = new ObjectId(cid);
    graphData.access = uid.role;

         
    const statistic = await Calculator.aggregate([{
            $group: {
            _id: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" }
            },
            count: { $sum: 1 }
            }
        }]);
    
    return commonService.setChart({type:'bargraph',uid:uid._id, statistic,role:uid.role});
    
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

    let account_name;
    if(_.isUndefined(name)){
        account_name = `${user.first_name.toString().toUpperCase()} ${user.last_name.toString().toUpperCase()}`
    }else{
        account_name = `${name.toString().toUpperCase()}`
    }
 

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
    console.log(user)
    return {
        welcome:{
            account_name: account_name,
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
      getSuperAdminRoiTable,
      getRoiTemplates,
      getRoiAdmin,
      getMyRoiGraph,
      getRanking,
      dashboardData,
      getCalculatorStatistic,
      getSuperAdminRoiGraph,
      getCompanyRoiGraph,
      getCompanyRoiTable,
      getRoiTable
  }

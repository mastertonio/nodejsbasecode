const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const commonService = require('./common.service');
const userService = require('./user.service');


const getDashboard = async (userId) => {
    const setChart = await commonService.setChart({type:'bargraph',uid:userId})
    const user = await userService.getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }
    let name = user.name;
    let data = {};

    data.welcome = {
        account_name: name.toString().toUpperCase(),
        current_roi: 1,
        active_roi:1
    };

    data.admin_list = [
        {
            uid: Object('6273ca41e773a40aeca0247e'),
            name: 'ANTHONY DERECHO'
        },
        {
            uid: Object('627cb4bf890f73d8bd4d3395'),
            name: 'JOHN DOE'
        }
    ];
    
    data.viewcount = [
        {
            roi_name: "My Company",
            count: 0
        }
    ];
    data.ranking = [
        {
            account_name: "John Doe",
            rois:1
        },
        {
            account_name: "Michael Farber",
            rois: 329
        }
    ];

    data.template_list = [
        {
            id: Object('1'),
            name: 'Sample template 1'
        },
        {
            id: Object('2'),
            name: 'Sample template 2'
        },
        {
            id: Object('3'),
            name: 'Sample template 3'
        }
    ];

    data.my_roi = [{
        id:Object('79228'),
        importance: 0,
        name: 'Sample template 1',
        source: '15five',
        dateCreated: '2022-05-05T09:32:24.605+00:00',
        views: 0,
        uniqueViews: 0
    },
    {
        id:Object('79228'),
        importance: 1,
        name: 'Sample template 2',
        source: '15five',
        dateCreated: '2022-05-05T10:32:24.605+00:00',
        views: 1,
        uniqueViews: 1
    },
    {
        id:Object('79228'),
        importance: 2,
        name: 'Sample template 3',
        source: '15five',
        dateCreated: '2022-05-05T11:32:24.605+00:00',
        views: 2,
        uniqueViews: 2
    }
      
    ]

    data.chart = setChart;

    return data;
  };



  module.exports = {
      getDashboard
  }
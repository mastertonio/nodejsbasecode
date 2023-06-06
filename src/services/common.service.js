const { array } = require("joi");
const { data } = require("../config/logger");
const logger = require("../config/logger");
const pick = require("../utils/pick");
const ObjectId = require('mongodb').ObjectID;

const dashboardData = async (data_col) => {
    const allowed = ["company-manager","company-admin"]
   const user_role = data_col.role;

  const role = allowed.some(element => {
    return element.toLowerCase() === user_role.toLowerCase();
  });
  const chartData={};
//   console.log(data_col.collection.statistic)


  if(role){
    let categories=[];
    let count = [];
    data_col.collection.statistic.map(v=>{
        console.log('---statistic--', v)
        categories.push(v.email);
        count.push(v.count)
    })
    chartData.categories=categories;
    chartData.count=count;
  }else{

    const d = new Date();
    let year = d.getFullYear();
    const ncollection = [];
    // console.log(data_col)
    data_col.collection.statistic.map(v=>{
       
        if(year == v._id.year){
            ncollection.push({
                month: v._id.month,
                count: v.count
            })
        }
    })

    let monthlyCount = [0,0,0,0,0,0,0,0,0,0,0,0];
    
    ncollection.map(v=>{
        monthlyCount[v.month-1] = v.count 
    });

    chartData.categories=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    chartData.count=monthlyCount;
  }


  return{
    chart: {
        type: 'column'
    },
    title: {
        text: 'ROI CREATED'
    },
   
    xAxis: {
        categories: chartData.categories,
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    series: [{
        name: 'ROI CREATED',
        data: chartData.count

    }]
};

    
    
}

const piegraph = async (uid) =>{
    return Object(uid);
}
const setChart = async (data) => {
    
   
    const n_data_col = {
        collection: data,
        role:data.role
    }
    
 switch (data.type) {
    case 'bargraph':
        return  dashboardData(n_data_col);
    case 'piegraph':
        return piegraph(data.uid);
 
    default:
        return dashboardData(data.uid);
 }
}

const indexKeyValidator = async (data) => {
    const listOfIndex = ["title","importance","status"];
    //is founded
    let container = [];
    data.map((i)=>{
        if(listOfIndex.indexOf(i) !== -1){
            container.push(1)
        }else{
            container.push(0)
        }
    });

    return container.every(n => n == 1);

}
const findMultipleid = async(docs,_ids)=>{
    try {
         const n_ids = [];
        _ids.map(v=>{
            let o_id = new ObjectId(v); 
            n_ids.push(o_id)
        })
        return docs.find({_id:{"$in":n_ids}});
    } catch (error) {
        logger.error(`[UNPROCESSABLE_ENTITY] - ${error}`)
       throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY,error);
    }
   
    
}

module.exports = {
setChart,
indexKeyValidator,
findMultipleid
}
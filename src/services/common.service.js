const { array } = require("joi");
const logger = require("../config/logger");
const pick = require("../utils/pick");
const ObjectId = require('mongodb').ObjectID;

const dashboardData = async (data_col) => {
    let data;
    let monthlyCount = [0,0,0,0,0,0,0,0,0,0,0,0];
    
    data_col.collection.map(v=>{
        monthlyCount[v.month-1] = v.count 
    })
    console.log(monthlyCount)
   
    data ={
        chart: {
            type: 'column'
        },
        title: {
            text: 'ROI CREATED'
        },
       
        xAxis: {
            categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ],
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
            data: monthlyCount
    
        }]
    };
    return data;
    
}

const piegraph = async (uid) =>{
    return Object(uid);
}
const setChart = async (data) => {
    
    const d = new Date();
    let year = d.getFullYear();
    const data_col = [];
    data.statistic.map(v=>{
        console.log(v._id.month)
        if(year == v._id.year){
            data_col.push({
                month: v._id.month,
                count: v.count
            })
        }
    })
    const n_data_col = {
        y:year,
        collection: data_col
    }
    console.log(n_data_col)
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
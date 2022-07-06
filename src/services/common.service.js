const pick = require("../utils/pick");

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


module.exports = {
setChart,
indexKeyValidator
}
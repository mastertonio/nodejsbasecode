const dashboardData = async (uid) => {
    let data;
    data ={
        chart: {
            type: 'column'
        },
        title: {
            text: 'ROI CREATED'
        },
        subtitle: {
            text: 'ROI Created Past Year'
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
            data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
    
        }]
    };
    return data;
    
}

const piegraph = async (uid) =>{
    return Object(uid);
}
const setChart = async (data) => {
 switch (data.type) {
    case 'bargraph':
        return  dashboardData(data.uid);
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
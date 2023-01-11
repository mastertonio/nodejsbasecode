const httpStatus = require("http-status");
const { data } = require("../config/logger");
const logger = require("../config/logger");
const { Template, TemplateBuilder, TemplateVersion } = require("../models");
const ApiError = require("../utils/ApiError");
const ObjectId = require('mongodb').ObjectID;
const { v4: uuidv4 } = require('uuid');


const buildTemplate = async(data) => {
    try {
        // console.log(data.template)
        const payload = data.template;
        const dataObject = {};
        const navList = [];
        const secList = [];
        const pods = [];
        const dashboardElements = {};
        let o_id = new ObjectId(data.templateVersion_id); 
        dataObject.templateVersion_id = o_id;        
        payload.sections.map((v,i)=>{
            // if(v.isDashboard){
            //     dashboardElements.writeup = v.elements[0].writeup;
            //     dashboardElements.writeup.projection = 2;
            //     pods.push(dashboardElements)
            // }
            // pods.push({
            //     pod_id:uuidv4(),
            //     pod_link:v.uuid,
            //     title:v.title,
            //     total:Number(0),
            //     conservativeFactor:{
            //         value: 0.51
            //     },                
            //     mode:{
            //         currency:false,
            //         slider:true,
            //         text:false,
            //     }               
            // });

            navList.push({
                link:v.uuid,
                title:v.title,
                listSequence:v.listSequence
            });

            // secList.push({
            //     _key: uuidv4(),
            //     section_id:v.uuid,
            //     sequence_no:v.listSequence,
            //     title:v.title,
            //     element: v.isDashboard ? pods : []
            // })
        });
        dataObject.sidebar={
            brand:{
                logo:"https://www.theroishop.com/company_specific_files/547/logo/logo.png",
                title: "Company Name"
            },
            navigationMenu:[
                {
                    title: "ROI Sections",
                    icon: "calculator",
                    menuSequence: 1,
                    navigationlist: navList
                },
                {
                    title: "My ROIs",
                    icon: "globe",
                    menuSequence: 2,
                    navigationlist: []
                }
            ]
        }
        dataObject.content = {
            "sections":[
                {
                    "section_id":"474ec71b-b82d-4de1-858a-6c20c3db0212",
                    "order":1,
                    "type":"dashboard",
                    "elements":{
                        "dashboard-header":{
                                            "element_id":"8ce4bc44-39fe-44a6-825e-d557367c49a4",
                                            "title":"ROI Dashboard",
                                            "projection":2,
                                            "currency":"usd",
                                            "currencySymbol":"$",
                                            "grandTotal":"0",
                                            "writeUp":'<hr><h3 style="font-size: 18px; font-weight: 700;">Select a section below to review your ROI</h3><p style="font-size: 16px;">To calculate your return on investment, begin with the first section below. The information entered therein will automatically populate corresponding fields in the other sections. You will be able to move from section to section to add and/or adjust values to best reflect your organization and process. To return to this screen, click the ROI Dashboard button to the left.</p>'
                                        },
                        "dashboard-cards":[
                                            {
                                                "element_id":"b21d10a0-fb05-429b-a72d-8d595e57e652",
                                                "order":1,
                                                "header":{
                                                    "title":"Discovery Notes",
                                                    "isVisible":true
                                                },
                                                "body":{
                                                    "type":"",
                                                    "total":0,
                                                    "isVisible":false,
                                                    "currency":"",
                                                    "currencySymbol":"",
                                                },
                                                "footer":{
                                                    "type":"",
                                                    "label": "",
                                                    "isVisible":true,
                                                    "value":0
                                                }
                                            },
                                            {
                                                "element_id":"50d4aee8-a0f7-45d1-b02d-e0ccba4f7f34",
                                                "order":1,
                                                "header":{
                                                    "title":"Improve Win Rate",
                                                    "isVisible":true
                                                },
                                                "body":{
                                                    "type":"sectionTotal",
                                                    "total":0,
                                                    "isVisible":true,
                                                    "currency":"usd",
                                                    "currencySymbol":"$",
                                                },
                                                "footer":{
                                                    "type":"slider",
                                                    "label": "Conservative Factor:",
                                                    "isVisible":true,
                                                    "value":5
                                                }
                                            }
                                        ]
                    }
                }
            ]
        };

        // console.log(dataObject)
        const build_template = await TemplateBuilder.create(dataObject);
        return build_template;
    } catch (error) {
        logger.error(`[Invalid TOken] ${error}`);
        throw error;
    }
}
const isValidateTemplateVersion = async(_id) =>{
    try {
        let o_id = new ObjectId(_id); 
        const isValid = TemplateVersion.findById(o_id);
        return (isValid) ? true : false;
    } catch (error) {
        logger.error(`[Invalid TOken] ${error}`);
        throw error;
    }
}

const isValidTemplateBuilder = async(data) =>{
    try {
        const isValid = await TemplateBuilder.find(data);
        return (isValid) ? true : false;
    } catch (error) {
        logger.error(`[Invalid TOken] ${error}`);
        throw error;
    }
}

const getTemplateBuild = async(data)=>{
    try {
        const tbuilder = await TemplateBuilder.find(data);
        return tbuilder[0];
    } catch (error) {
        logger.error(`[Invalid TOken] ${error}`);
        throw error;
    }
}

const isValidTemplateId = async(_id) =>{
    try {        
        let o_id = new ObjectId(_id); 
        const isValid = await Template.findById(o_id);
        return (isValid) ? true : false;
    } catch (error) {
        logger.error(`[Invalid TOken] ${error}`);
        throw error;
    }

}

// const getSidebar = async(_id)
module.exports = {
    isValidTemplateId,
    isValidateTemplateVersion,
    buildTemplate,
    isValidTemplateBuilder,
    getTemplateBuild
}

const createCompany = async () =>{
    return  Company.create(
     {
         "name": "The ROI Shop",
         "alias": "ROI",
         "active": 1,
         "licenses": 10,
         "templates": 1
       }  
    
     )
 }
 const createCalculator = async () =>{
     return  Calculator.create(
          {   "user_id": "628247b19e2a1d3a5ef8b9ad" ,  "title": "ROI for testing",  "position": "4",  "template_version_id": "628622c40fa60a1c4e025104"  ,  "verification_code": "bf3d553e18000ad887b96846a75d86ed6ca14b0f",  "email_protected": 0,  "visits": "2",  "unique_ip": "1",  "dt": "2022-05-16T12:46:41.259+00:00",  "currency": "usd",  "is_sf_opportunity": 0,  "salesforce_id": "null",  "sfdc_link": "null",  "instance": "null",  "folder": 0,  "linked_title": 0,  "version": 0,  "status": 1,  "importance": 0,  "cloned_from_parent": 0}
      )
  }
 


  const templates = () =>{
    return Template.create({
        "name": "The ROI Shop",
        "company_id":  "628778331f0d2a1dec275404",
        "active": 1
      })
}



const templates_v = () =>{
    return TemplateVersion.create({
        "name": "The ROI Shop",
        "template_id": "628620fc0fa60a1c4e0250fc",
        "stage": 1,
        "level": 1
      })
}



// const Company = require('../models/company.model');

const templates_v = () =>{
    return TemplateVersion.create({
        "name": "The ROI Shop",
        "template_id": "628620fc0fa60a1c4e0250fc",
        "stage": 1,
        "level": 1
      })
}

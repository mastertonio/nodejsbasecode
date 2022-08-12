const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCompanyUser = {
  params: Joi.object().keys({
    company_id: Joi.required().custom(objectId),
  }),
    body: Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().custom(password),
        currency: Joi.string().min(2).max(5).required(),
        role: Joi.string(),
        manager: Joi.custom(objectId),
        template: Joi.array().required()      
    }),
  };

  const createCompnayTemplateVersion = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      version: Joi.number().integer().required(),
      notes: Joi.string().required()
    })
  }

  const createCompnayTemplate = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      status: Joi.number().integer().required(),
      notes: Joi.string()

    })
  }

  const createCompany  = {
    body: Joi.object().keys({
        
        name: Joi.string().required(),
        alias: Joi.string(),
        licenses: Joi.number().integer().required(),
        contact_fname: Joi.string().required(),
        contact_lname: Joi.string().required(),
        contact_email: Joi.string().required(),
        contact_phone: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
        contract_start_date: Joi.date().iso(),
        contract_end_date: Joi.date().iso(),
        notes: Joi.string().required()
    })
  };
  

  const getCompany = {
    query: Joi.object().keys({
        data: Joi.object(),
      }),
  };
  const getCurrency = {
    query: Joi.object().keys({
        data: Joi.object(),
      }),
  };
  const getManager = {
    query: Joi.object().keys({
        data: Joi.object(),
      }),
  };
  const getAllCompanyUser = {
    query: Joi.object().keys({
        data: Joi.object(),
      }),
  };


  const listCompanyTemplate = {
    query: Joi.object().keys({
        data: Joi.object(),
      }),
  };
  const transferTemplate = {
    
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        roi_new_uid: Joi.required().custom(objectId),
        roi_source_uid: Joi.required().custom(objectId)
      })
  };

  const patchCompany = {
    params: Joi.object().keys({
      _id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        alias: Joi.string(),
        name: Joi.string(),
        active: Joi.number().integer(),
        licenses: Joi.number().integer()
      })
      .min(1),
  };

  const patchCompanyUser = {
    params: Joi.object().keys({
      userId: Joi.required().custom(objectId),
      company_id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        first_name: Joi.string(),
        last_name: Joi.string(),
        email: Joi.string().email(),
        password: Joi.string().custom(password),
        currency: Joi.string().min(2).max(5),
        manager: Joi.custom(objectId),
        template: Joi.array(),
        role: Joi.string()
      })
  };


module.exports = {
    createCompany,
    createCompanyUser,
    getCompany,
    patchCompany,
    createCompnayTemplate,
    createCompnayTemplateVersion,
    listCompanyTemplate,
    getCurrency,
    getManager,
    getAllCompanyUser,
    transferTemplate,
    patchCompanyUser
  };
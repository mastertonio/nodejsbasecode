const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCompanyUser = {
    body: Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().custom(password),
        currency: Joi.string().min(2).max(5).required(),
        userType: Joi.number().integer().required(),
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
        alias: Joi.string().required(),
        name: Joi.string().required(),
        active: Joi.number().integer(),
        licenses: Joi.number().integer()
    }),
  };
  

  const getCompany = {
    query: Joi.object().keys({
        data: Joi.object(),
      }),
  };
  const listCompanyTemplate = {
    query: Joi.object().keys({
        data: Joi.object(),
      }),
  };


  const patchCompany = {
    params: Joi.object().keys({
      _id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        alias: Joi.string().required(),
        name: Joi.string().required(),
        active: Joi.number().integer(),
        licenses: Joi.number().integer()
      })
      .min(1),
  };


module.exports = {
    createCompany,
    createCompanyUser,
    getCompany,
    patchCompany,
    createCompnayTemplate,
    createCompnayTemplateVersion,
    listCompanyTemplate
  };
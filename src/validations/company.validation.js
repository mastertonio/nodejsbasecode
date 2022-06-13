const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCompany = {
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
    getCompany,
    patchCompany
  };
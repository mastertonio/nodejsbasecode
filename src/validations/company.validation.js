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


module.exports = {
    createCompany,
    getCompany
  };
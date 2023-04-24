const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


const getDashboard = {
    query: Joi.object().keys({
      data: Joi.number().integer(),
    }),
  };

  const getROIS = {
    query: Joi.object().keys({
      title: Joi.string(),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
    }),
  };

module.exports = {
    getDashboard,
    getROIS
}
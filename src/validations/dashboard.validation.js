const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


const getDashboard = {
    query: Joi.object().keys({
      data: Joi.object(),
    }),
  };

module.exports = {
    getDashboard
}
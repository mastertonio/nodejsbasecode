const Joi = require("joi");
const { objectId } = require("./custom.validation");


const createROI = {
    
    params: Joi.object().keys({
      template_id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        
      })
  };


  module.exports = {
    createROI

  }
const Joi = require("joi");
const { objectId } = require("./custom.validation");


const createROI = {
    
    params: Joi.object().keys({
      templateVersion_id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        // sections: Joi.array(),
        // sideBar: Joi.object(),
        sections: Joi.array(),
      })
  };

  const getBuildTempalate = {
    params: Joi.object().keys({
      templateVersion_id: Joi.required().custom(objectId)
    }),
    query: Joi.object().keys({
      tag: Joi.string(),
    })
  }


  module.exports = {
    createROI,
    getBuildTempalate
  }
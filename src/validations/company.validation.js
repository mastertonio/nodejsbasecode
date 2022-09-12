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
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
      template_id: Joi.required().custom(objectId)
    }),
    body: Joi.object().keys({
      name: Joi.string().required(),
      version: Joi.number().integer().required(),
      notes: Joi.string().required()
    })
  }
 

  const getCompnayTemplateVersion = {
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
      template_id: Joi.required().custom(objectId)
    }),
    query: Joi.object().keys({
      data: Joi.object(),
    })
  }

  const getCompnayTemplateVersionInfo = {
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
      template_id: Joi.required().custom(objectId),
      version_id: Joi.required().custom(objectId)
    }),
    query: Joi.object().keys({
      data: Joi.object(),
    })
  }

  const patchCompnayTemplateVersion = {
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
      template_id: Joi.required().custom(objectId),
      version_id: Joi.required().custom(objectId)
    }),
    body: Joi.object().keys({
      name: Joi.string(),
      version: Joi.number().integer(),
      notes: Joi.string(),
      status: Joi.number().integer().valid(0,1)
    })
  }

  const createCompnayTemplate = {
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
    }),
    body: Joi.object().keys({
      name: Joi.string().required(),
      status: Joi.number().integer().required(),
      notes: Joi.string()

    })
  }

  const patchCompnayTemplate = {
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
      template_id: Joi.required().custom(objectId)
    }),
    body: Joi.object().keys({
      name: Joi.string(),
      status: Joi.number().integer(),
      notes: Joi.string()

    })
  }

  const createCompany  = {
    body: Joi.object().keys({        
        name: Joi.string().required(),
        alias: Joi.string(),
        licenses: Joi.number().integer().required(),
        active: Joi.number().integer().required(),
        contact_fname: Joi.string().required(),
        contact_lname: Joi.string().required(),
        contact_email: Joi.string().required(),
        contact_phone: Joi.string().min(10).max(15),
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
  const transferTemplates = {
    
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        roi_new_uid: Joi.required().custom(objectId),
        roi_source_uid: Joi.required().custom(objectId)
      })
  };

  const transferTemplate = {
    
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        roi_new_uid: Joi.required().custom(objectId),
        roi_source_uid: Joi.required().custom(objectId),
        template_id: Joi.required().custom(objectId)
      })
  };

  const patchCompany = {
    params: Joi.object().keys({
      _id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        active: Joi.number().integer(),
        name: Joi.string(),
        alias: Joi.string(),
        licenses: Joi.number().integer(),
        contact_fname: Joi.string(),
        contact_lname: Joi.string(),
        contact_email: Joi.string(),
        contact_phone: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/),
        contract_start_date: Joi.date().iso(),
        contract_end_date: Joi.date().iso(),
        notes: Joi.string()
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
        status: Joi.number().integer().valid(1,0),
        role: Joi.string()
      })
  };

  const getTemplateInfo = {
    query: Joi.object().keys({
        data: Joi.object(),
      }),
  };

  const deleteTemplateVersion = {
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
      template_id: Joi.required().custom(objectId),
      version_id: Joi.required().custom(objectId)
    })
  }

  const deleteTemplate = {
    params: Joi.object().keys({
      company_id: Joi.required().custom(objectId),
      template_id: Joi.required().custom(objectId)
    })
  }




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
    transferTemplates,
    patchCompanyUser,
    patchCompnayTemplate,
    getTemplateInfo,
    patchCompnayTemplateVersion,
    getCompnayTemplateVersion,
    getCompnayTemplateVersionInfo,
    deleteTemplateVersion,
    deleteTemplate
  };
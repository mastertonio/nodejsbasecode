const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const builder = require('../../validations/templateBuilder.validation');

const {builderController} = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('createROI'), validate(builder.createROI), builderController.createROI);

router
  .route('/:templateVersion_id') 
  .get(auth('getBuildTemplate'), validate(builder.getBuildTempalate), builderController.getTemplateBuild)


//logo



//header


//menu



//section





module.exports = router;

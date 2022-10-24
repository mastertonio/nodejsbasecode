const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const builder = require('../../validations/templateBuilder.validation');

const {builderController} = require('../../controllers');

const router = express.Router();

router
  .route('/:template_id')
  .post(auth('createROI'), validate(builder.createROI), builderController.createROI);



module.exports = router;

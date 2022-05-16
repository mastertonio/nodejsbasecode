const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {dashboadService} = require('../services');


const getDashboard = catchAsync(async (req, res) => {
    const user = await dashboadService.getDashboard(req.params.userId);
    res.status(httpStatus.CREATED).send(user);
  });

module.exports = {
    getDashboard
}

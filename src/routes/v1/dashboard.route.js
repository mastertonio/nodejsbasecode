const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dashboardValidation = require('../../validations/dashboard.validation');
const dashboardController = require('../../controllers/dashboard.controller');

const router = express.Router();

router
  .route('/:userId')
  // .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getDashboard)
  .put(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.updateTemplateStatus)
  .post(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.createCalculator);

router
  .route('/')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.dashboardData);
router
  .route('/ranking/list')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getRanking);
/**
 * ROI LIST
 */
router
  .route('/super/admin/roi/list')
  .get(auth('getDashboard'), validate(dashboardValidation.getROIS), dashboardController.getSuperAdminRoiTable)

  router
  .route('/company/roi/list')
  .get(auth('getDashboard'), validate(dashboardValidation.getROIS), dashboardController.getCompanyRoiTable)



router
  .route('/template/list')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getRoiTemplate)
router
  .route('/admin/list')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getRoiAdmin);

router
  .route('/data/graph')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getMyRoiGraph)
router
  .route('/data/super/admin/graph')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getRoiGraphSuperAdmin)
  router
  .route('/data/company/graph')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getRoiGraphCompany)

router
  .route('/roi/:templateId/:userId')
  .get(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.getImportance)
  .put(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.updateImportance)
  .patch(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.updateroiTable)
  .delete(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.deleteCalculator)
  .post(auth('getDashboard'), validate(dashboardValidation.getDashboard), dashboardController.cloneCalculators)



module.exports = router;



/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Display data analytic and all ROI's
 */

/**
 * @swagger
 * /dashboard/{id}:
 *   get:
 *     summary: Generate dashboard data
 *     description: Logged in users can fetch calculator.
 *     tags: [Dashboard, Calculator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Dashboard'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 * 
 * 
 */

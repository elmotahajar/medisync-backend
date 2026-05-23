const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapportController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.use(verifyToken, authorizeRoles('admin'));

router.get('/',               rapportController.getRapport);
router.get('/export/excel',   rapportController.exporterExcel);

module.exports = router;
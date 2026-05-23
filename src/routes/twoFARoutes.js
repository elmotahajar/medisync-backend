const express = require('express');
const router = express.Router();
const twoFA = require('../controllers/twoFAController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.post('/setup',    verifyToken, authorizeRoles('admin'), twoFA.setup2FA);
router.post('/verify',   verifyToken, authorizeRoles('admin'), twoFA.verify2FA);
router.post('/validate', twoFA.validate2FA); // pas de token ici (avant login complet)

module.exports = router;
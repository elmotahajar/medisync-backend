const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getDossier,
  getOrdonnances,
  getHistorique,
  uploadDocument
} = require('../controllers/patientController');

router.get('/dossier', auth, getDossier);
router.get('/ordonnances', auth, getOrdonnances);
router.get('/historique', auth, getHistorique);
router.post('/documents', auth, upload.single('document'), uploadDocument);

module.exports = router;
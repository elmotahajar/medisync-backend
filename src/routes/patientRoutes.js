const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDossier,
  getOrdonnances,
  getHistorique,
  uploadDocument
} = require('../controllers/patientController');

router.get('/dossier', auth, getDossier);
router.get('/ordonnances', auth, getOrdonnances);
router.get('/historique', auth, getHistorique);
router.post('/documents', auth, uploadDocument);

module.exports = router;
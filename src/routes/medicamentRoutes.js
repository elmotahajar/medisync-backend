// src/routes/medicamentRoutes.js
const express = require('express');
const router = express.Router();
const medicamentController = require('../controllers/medicamentController');
const auth = require('../middleware/auth');

// Recherche médicaments (réservé au médecin)
router.get('/recherche', auth, medicamentController.rechercheMedicament);

module.exports = router;
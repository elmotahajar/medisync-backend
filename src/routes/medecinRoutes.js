// src/routes/medecinRoutes.js
const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');
const auth = require('../middleware/auth'); // middleware JWT de Hajar

// ─────────────────────────────────────────
// PROFIL
// ─────────────────────────────────────────
router.get('/profil',    auth, medecinController.getProfil);
router.put('/profil',    auth, medecinController.updateProfil);

// ─────────────────────────────────────────
// PLANNING — DISPONIBILITÉS
// ─────────────────────────────────────────
router.get('/planning',                auth, medecinController.getPlanning);
router.post('/disponibilite',          auth, medecinController.ajouterDisponibilite);
router.delete('/disponibilite/:id',    auth, medecinController.supprimerDisponibilite);

// ─────────────────────────────────────────
// CONGÉS
// ─────────────────────────────────────────
router.get('/conges',          auth, medecinController.getConges);
router.post('/conge',          auth, medecinController.ajouterConge);
router.delete('/conge/:id',    auth, medecinController.supprimerConge);

// ─────────────────────────────────────────
// PATIENTS DU JOUR
// ─────────────────────────────────────────
router.get('/patients-jour',   auth, medecinController.getPatientsJour);

// ─────────────────────────────────────────
// COMPTES RENDUS
// ─────────────────────────────────────────
router.post('/compte-rendu',              auth, medecinController.creerCompteRendu);
router.get('/compte-rendu/:patientId',    auth, medecinController.getComptesRenduPatient);

// ─────────────────────────────────────────
// PRESCRIPTIONS
// ─────────────────────────────────────────
router.post('/prescription',              auth, medecinController.creerPrescription);
router.get('/prescriptions/:patientId',   auth, medecinController.getPrescriptionsPatient);

module.exports = router;
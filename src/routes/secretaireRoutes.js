const express = require('express');
const router = express.Router();
const secretaireController = require('../controllers/secretaireController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Toutes les routes nécessitent un JWT valide et le rôle 'secretaire' (ou 'admin')
router.use(verifyToken);
router.use(authorizeRoles('secretaire', 'admin'));

// ── Gestion des patients ──────────────────────────────────────────────────────
router.post('/patients', secretaireController.creerComptePatient);
router.get('/patients', secretaireController.listerPatients);

// ── Feuilles de soins ─────────────────────────────────────────────────────────
router.post('/feuilles-soins', secretaireController.creerFeuilleSoins);
router.get('/feuilles-soins', secretaireController.listerFeuilleSoins);
router.patch('/feuilles-soins/:id/valider', secretaireController.validerFeuilleSoins);

// ── Facturation ───────────────────────────────────────────────────────────────
router.post('/factures', secretaireController.emettreFacture);
router.get('/factures', secretaireController.listerFactures);
router.patch('/factures/:id/payer', secretaireController.enregistrerPaiement);
router.get('/factures/:id/pdf', secretaireController.exporterFacturePDF);

module.exports = router;
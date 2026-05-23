const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Toutes les routes admin nécessitent un JWT valide et le rôle 'admin'
router.use(verifyToken);
router.use(authorizeRoles('admin'));

// ── Tableau de bord ───────────────────────────────────────────────────────────
// GET /admin/dashboard?periode=today|week|month
router.get('/dashboard', adminController.getDashboard);

// GET /admin/statistiques/revenus
router.get('/statistiques/revenus', adminController.getStatistiquesRevenus);

// ── Gestion du personnel ──────────────────────────────────────────────────────
// GET  /admin/personnel?role=medecin|secretaire
router.get('/personnel', adminController.listerPersonnel);
// POST /admin/personnel
router.post('/personnel', adminController.creerPersonnel);
// GET  /admin/personnel/:id
router.get('/personnel/:id', adminController.getPersonnel);
// PUT  /admin/personnel/:id
router.put('/personnel/:id', adminController.modifierPersonnel);
// DELETE /admin/personnel/:id  (soft delete)
router.delete('/personnel/:id', adminController.desactiverPersonnel);

// ── Planning médecin ──────────────────────────────────────────────────────────
// GET /admin/medecins/:id/planning?debut=YYYY-MM-DD&fin=YYYY-MM-DD
router.get('/medecins/:id/planning', adminController.getPlanningMedecin);

// ── Finances ──────────────────────────────────────────────────────────────────
// GET /admin/finances/rapport?type=daily|monthly|yearly&annee=2025&mois=6
router.get('/finances/rapport', adminController.getRapportFinancier);

module.exports = router;
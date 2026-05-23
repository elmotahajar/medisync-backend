const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createRendezVous, 
  getRendezVous, 
  updateRendezVous,
  cancelRendezVous 
} = require('../controllers/rendezVousController');
const auth = require('../middleware/auth');

router.post('/', auth, createRendezVous);
router.get('/', auth, getRendezVous);
router.put('/:id', auth, updateRendezVous);
router.delete('/:id', auth, cancelRendezVous);
// Ajoute cette ligne avec les autres routes
router.post('/urgence', auth, rendezVousController.creerRdvUrgence);

module.exports = router;
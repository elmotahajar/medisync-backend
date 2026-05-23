const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createRendezVous, 
  getRendezVous, 
  updateRendezVous,
  cancelRendezVous,
  createRendezVousTiers
} = require('../controllers/rendezVousController');

router.post('/', auth, createRendezVous);
router.get('/', auth, getRendezVous);
router.put('/:id', auth, updateRendezVous);
router.delete('/:id', auth, cancelRendezVous);
router.post('/tiers', auth, createRendezVousTiers);

module.exports = router;
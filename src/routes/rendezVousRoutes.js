const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createRendezVous, 
  getRendezVous, 
  updateRendezVous,
  cancelRendezVous 
} = require('../controllers/rendezVousController');

router.post('/', auth, createRendezVous);
router.get('/', auth, getRendezVous);
router.put('/:id', auth, updateRendezVous);
router.delete('/:id', auth, cancelRendezVous);

module.exports = router;
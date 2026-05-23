const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createFeedback,
  getFeedbacksMedecin,
  signalerProbleme
} = require('../controllers/feedbackController');

router.post('/', auth, createFeedback);
router.get('/medecin/:medecinId', auth, getFeedbacksMedecin);
router.post('/signalement', auth, signalerProbleme);

module.exports = router;
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { SalleConsultation } = require('../models');

router.use(verifyToken, authorizeRoles('admin', 'secretaire'));

router.get('/',        async (req, res) => res.json(await SalleConsultation.findAll()));
router.post('/',       async (req, res) => res.json(await SalleConsultation.create(req.body)));
router.put('/:id',     async (req, res) => {
  const salle = await SalleConsultation.findByPk(req.params.id);
  if (!salle) return res.status(404).json({ message: 'Salle introuvable.' });
  await salle.update(req.body);
  res.json(salle);
});
router.delete('/:id',  async (req, res) => {
  const salle = await SalleConsultation.findByPk(req.params.id);
  if (!salle) return res.status(404).json({ message: 'Salle introuvable.' });
  await salle.destroy();
  res.json({ message: 'Salle supprimée.' });
});

module.exports = router;
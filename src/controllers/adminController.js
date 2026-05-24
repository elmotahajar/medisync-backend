const { Utilisateur, RendezVous, Facture, Medecin, Secretaire, Patient, Administrateur, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// GET /admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalPatients = await Patient.count();
    const totalMedecins = await Medecin.count();
    const totalSecretaires = await Secretaire.count();
    const totalRdv = await RendezVous.count();

    return res.json({
      indicateurs: {
        totalPatients,
        totalMedecins,
        totalSecretaires,
        totalRdv,
      }
    });
  } catch (error) {
    console.error('getDashboard:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /admin/personnel
exports.listerPersonnel = async (req, res) => {
  try {
    const medecins = await Medecin.findAll({
      include: [{ model: Utilisateur, attributes: ['id', 'nom', 'prenom', 'email', 'telephone'] }]
    });
    const secretaires = await Secretaire.findAll({
      include: [{ model: Utilisateur, attributes: ['id', 'nom', 'prenom', 'email', 'telephone'] }]
    });
    return res.json({ medecins, secretaires });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /admin/personnel
exports.creerPersonnel = async (req, res) => {
  try {
    const { nom, prenom, email, role, specialite, tarif, telephone, secteur, matricule } = req.body;

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const tempPassword = Math.random().toString(36).slice(-8) + 'Med1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await Utilisateur.create({
      nom, prenom, email,
      motDePasse: hashedPassword,
      telephone: telephone || null,
      dateCreation: new Date(),
    });

    if (role === 'medecin') {
      await Medecin.create({
        id_utilisateur: user.id,
        specialite: specialite || null,
        tarif: tarif || null,
        secteur: secteur || 1,
        numeroOrdre: `ORD-${user.id}`,
      });
    } else if (role === 'secretaire') {
      await Secretaire.create({
        id_utilisateur: user.id,
        matricule: matricule || `MAT-${user.id}`,
      });
    } else if (role === 'admin') {
      await Administrateur.create({ id_utilisateur: user.id });
    }

    return res.status(201).json({
      message: `Compte ${role} créé avec succès.`,
      tempPassword,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /admin/personnel/:id
exports.getPersonnel = async (req, res) => {
  try {
    const membre = await Utilisateur.findByPk(req.params.id, {
      attributes: { exclude: ['motDePasse'] },
    });
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });
    return res.json(membre);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /admin/personnel/:id
exports.modifierPersonnel = async (req, res) => {
  try {
    const membre = await Utilisateur.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });

    const { nom, prenom, email, telephone } = req.body;
    await membre.update({ nom, prenom, email, telephone });

    return res.json({ message: 'Profil mis à jour.', membre });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /admin/personnel/:id
exports.desactiverPersonnel = async (req, res) => {
  try {
    const membre = await Utilisateur.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });
    await membre.destroy();
    return res.json({ message: 'Compte supprimé.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /admin/finances/rapport
exports.getRapportFinancier = async (req, res) => {
  try {
    const factures = await Facture.findAll({
      order: [['date', 'DESC']],
    });

    const totalEmis = factures.reduce((s, f) => s + (f.montantTotal || 0), 0);

    return res.json({
      nbFactures: factures.length,
      totalEmis: totalEmis.toFixed(2),
      factures,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /admin/statistiques/revenus
exports.getStatistiquesRevenus = async (req, res) => {
  try {
    return res.json([]);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /admin/medecins/:id/planning
exports.getPlanningMedecin = async (req, res) => {
  try {
    const rdvs = await RendezVous.findAll({
      where: { dateHeure: { [Op.gte]: new Date() } },
      order: [['dateHeure', 'ASC']],
    });
    return res.json(rdvs);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
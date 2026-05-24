const Medecin = require('../models/Medecin');
const Disponibilite = require('../models/Disponibilite');
const RendezVous = require('../models/RendezVous');
const User = require('../models/User');
const { Op } = require('sequelize');

// GET /medecin/profil
exports.getProfil = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    const medecin = await Medecin.findOne({ where: { id_utilisateur: req.user.id } });
    if (!medecin) return res.status(404).json({ message: 'Profil médecin introuvable' });

    res.json({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      specialite: medecin.specialite,
      numeroOrdre: medecin.numeroOrdre,
      tarif: medecin.tarif,
      secteur: medecin.secteur,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// PUT /medecin/profil
exports.updateProfil = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({ where: { id_utilisateur: req.user.id } });
    if (!medecin) return res.status(404).json({ message: 'Profil médecin introuvable' });

    const { specialite, tarif, secteur } = req.body;
    await medecin.update({ specialite, tarif, secteur });

    res.json({ message: 'Profil mis à jour', medecin });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// GET /medecin/planning
exports.getPlanning = async (req, res) => {
  try {
    const disponibilites = await Disponibilite.findAll({
      where: { id_medecin: req.user.id },
      order: [['jour', 'ASC'], ['heureDebut', 'ASC']],
    });
    res.json(disponibilites);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// POST /medecin/disponibilite
exports.ajouterDisponibilite = async (req, res) => {
  try {
    const { jour, heureDebut, heureFin, estConge } = req.body;

    const dispo = await Disponibilite.create({
      id_medecin: req.user.id,
      jour,
      heureDebut,
      heureFin,
      estConge: estConge || false,
    });

    res.status(201).json({ message: 'Disponibilité ajoutée', dispo });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// DELETE /medecin/disponibilite/:id
exports.supprimerDisponibilite = async (req, res) => {
  try {
    const dispo = await Disponibilite.findOne({
      where: { id: req.params.id, id_medecin: req.user.id }
    });
    if (!dispo) return res.status(404).json({ message: 'Disponibilité introuvable' });

    await dispo.destroy();
    res.json({ message: 'Disponibilité supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// GET /medecin/conges
exports.getConges = async (req, res) => {
  try {
    const conges = await Disponibilite.findAll({
      where: { id_medecin: req.user.id, estConge: true },
    });
    res.json(conges);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// POST /medecin/conge
exports.ajouterConge = async (req, res) => {
  try {
    const { jour, heureDebut, heureFin } = req.body;
    const conge = await Disponibilite.create({
      id_medecin: req.user.id,
      jour,
      heureDebut,
      heureFin,
      estConge: true,
    });
    res.status(201).json({ message: 'Congé ajouté', conge });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// DELETE /medecin/conge/:id
exports.supprimerConge = async (req, res) => {
  try {
    const conge = await Disponibilite.findOne({
      where: { id: req.params.id, id_medecin: req.user.id, estConge: true }
    });
    if (!conge) return res.status(404).json({ message: 'Congé introuvable' });

    await conge.destroy();
    res.json({ message: 'Congé supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// GET /medecin/patients-jour
exports.getPatientsJour = async (req, res) => {
  try {
    const aujourd_hui = new Date().toISOString().split('T')[0];

    const rendezVous = await RendezVous.findAll({
      where: {
        dateHeure: {
          [Op.between]: [
            `${aujourd_hui} 00:00:00`,
            `${aujourd_hui} 23:59:59`
          ]
        }
      },
      order: [['dateHeure', 'ASC']],
    });

    res.json(rendezVous);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// POST /medecin/compte-rendu
exports.creerCompteRendu = async (req, res) => {
  res.status(501).json({ message: 'Non implémenté' });
};

// GET /medecin/compte-rendu/:patientId
exports.getComptesRenduPatient = async (req, res) => {
  res.status(501).json({ message: 'Non implémenté' });
};

// POST /medecin/prescription
exports.creerPrescription = async (req, res) => {
  res.status(501).json({ message: 'Non implémenté' });
};

// GET /medecin/prescriptions/:patientId
exports.getPrescriptionsPatient = async (req, res) => {
  res.status(501).json({ message: 'Non implémenté' });
};
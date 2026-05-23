// src/controllers/medecinController.js
const Medecin = require('../models/Medecin');
const Disponibilite = require('../models/Disponibilite');
const Conge = require('../models/Conge');
const CompteRendu = require('../models/CompteRendu');
const Prescription = require('../models/Prescription');
const RendezVous = require('../models/RendezVous');
const User = require('../models/User');
const { Op } = require('sequelize');

// ─────────────────────────────────────────
// 1. PROFIL MÉDECIN
// ─────────────────────────────────────────

// GET /medecin/profil
exports.getProfil = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'utilisateur',
        attributes: ['nom', 'prenom', 'email'] }],
    });
    if (!medecin) return res.status(404).json({ message: 'Profil médecin introuvable' });
    res.json(medecin);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// PUT /medecin/profil
exports.updateProfil = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({ where: { userId: req.user.id } });
    if (!medecin) return res.status(404).json({ message: 'Profil médecin introuvable' });

    const {
      specialite, tarifConsultation, secteur,
      languesParlees, horairesDisponibilite,
      dureeCreneauMinutes, biographie
    } = req.body;

    await medecin.update({
      specialite, tarifConsultation, secteur,
      languesParlees, horairesDisponibilite,
      dureeCreneauMinutes, biographie
    });

    res.json({ message: 'Profil mis à jour', medecin });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─────────────────────────────────────────
// 2. PLANNING — DISPONIBILITÉS
// ─────────────────────────────────────────

// GET /medecin/planning?date=2026-05-22
exports.getPlanning = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({ where: { userId: req.user.id } });
    if (!medecin) return res.status(404).json({ message: 'Médecin introuvable' });

    const { date } = req.query;

    const disponibilites = await Disponibilite.findAll({
      where: {
        medecinId: medecin.id,
        ...(date && { date }),
      },
      order: [['date', 'ASC'], ['heureDebut', 'ASC']],
    });

    res.json(disponibilites);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// POST /medecin/disponibilite
exports.ajouterDisponibilite = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({ where: { userId: req.user.id } });
    if (!medecin) return res.status(404).json({ message: 'Médecin introuvable' });

    const { date, heureDebut, heureFin } = req.body;

    // Vérifier chevauchement
    const chevauchement = await Disponibilite.findOne({
      where: {
        medecinId: medecin.id,
        date,
        [Op.or]: [
          { heureDebut: { [Op.between]: [heureDebut, heureFin] } },
          { heureFin:   { [Op.between]: [heureDebut, heureFin] } },
        ],
      },
    });

    if (chevauchement) {
      return res.status(400).json({ message: 'Créneau qui chevauche une disponibilité existante' });
    }

    const dispo = await Disponibilite.create({
      medecinId: medecin.id,
      date,
      heureDebut,
      heureFin,
      estDisponible: true,
    });

    res.status(201).json({ message: 'Disponibilité ajoutée', dispo });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// DELETE /medecin/disponibilite/:id
exports.supprimerDisponibilite = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({ where: { userId: req.user.id } });
    const dispo = await Disponibilite.findOne({
      where: { id: req.params.id, medecinId: medecin.id }
    });

    if (!dispo) return res.status(404).json({ message: 'Disponibilité introuvable' });

    await dispo.destroy();
    res.json({ message: 'Disponibilité supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─────────────────────────────────────────
// 3. CONGÉS
// ─────────────────────────────────────────

// GET /medecin/conges
exports.getConges = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({ where: { userId: req.user.id } });
    const conges = await Conge.findAll({
      where: { medecinId: medecin.id },
      order: [['dateDebut', 'ASC']],
    });
    res.json(conges);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// POST /medecin/conge
exports.ajouterConge = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({ where: { userId: req.user.id } });
    const { dateDebut, dateFin, motif } = req.body;

    const conge = await Conge.create({
      medecinId: medecin.id,
      dateDebut,
      dateFin,
      motif,
    });

    res.status(201).json({ message: 'Congé ajouté', conge });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// DELETE /medecin/conge/:id
exports.supprimerConge = async (req, res) => {
  try {
    const medecin = await Medecin.findOne({ where: { userId: req.user.id } });
    const conge = await Conge.findOne({
      where: { id: req.params.id, medecinId: medecin.id }
    });

    if (!conge) return res.status(404).json({ message: 'Congé introuvable' });

    await conge.destroy();
    res.json({ message: 'Congé supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─────────────────────────────────────────
// 4. PATIENTS DU JOUR
// ─────────────────────────────────────────

// GET /medecin/patients-jour
exports.getPatientsJour = async (req, res) => {
  try {
    const aujourd_hui = new Date().toISOString().split('T')[0];

    const rendezVous = await RendezVous.findAll({
      where: {
        medecinId: req.user.id,
        date: aujourd_hui,
      },
      include: [{
        model: User,
        as: 'patient',
        attributes: ['id', 'nom', 'prenom', 'email'],
      }],
      order: [['heure', 'ASC']],
    });

    res.json(rendezVous);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─────────────────────────────────────────
// 5. COMPTES RENDUS
// ─────────────────────────────────────────

// POST /medecin/compte-rendu
exports.creerCompteRendu = async (req, res) => {
  try {
    const {
      rendezVousId, patientId, motifConsultation,
      diagnostic, observations, traitement, prochainRdv
    } = req.body;

    const compteRendu = await CompteRendu.create({
      rendezVousId,
      medecinId: req.user.id,
      patientId,
      motifConsultation,
      diagnostic,
      observations,
      traitement,
      prochainRdv,
      dateConsultation: new Date(),
    });

    res.status(201).json({ message: 'Compte rendu créé', compteRendu });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// GET /medecin/compte-rendu/:patientId
exports.getComptesRenduPatient = async (req, res) => {
  try {
    const comptesRendus = await CompteRendu.findAll({
      where: {
        medecinId: req.user.id,
        patientId: req.params.patientId,
      },
      order: [['dateConsultation', 'DESC']],
    });
    res.json(comptesRendus);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─────────────────────────────────────────
// 6. PRESCRIPTIONS
// ─────────────────────────────────────────

// POST /medecin/prescription
exports.creerPrescription = async (req, res) => {
  try {
    const {
      compteRenduId, patientId,
      medicaments, dateExpiration, notes
    } = req.body;

    const prescription = await Prescription.create({
      compteRenduId,
      medecinId: req.user.id,
      patientId,
      medicaments,
      dateEmission: new Date(),
      dateExpiration,
      notes,
    });

    res.status(201).json({ message: 'Prescription créée', prescription });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// GET /medecin/prescriptions/:patientId
exports.getPrescriptionsPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: {
        medecinId: req.user.id,
        patientId: req.params.patientId,
      },
      order: [['dateEmission', 'DESC']],
    });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};
// GET /api/medecin/recherche?specialite=&ville=&langue=&disponibilite=
exports.rechercheMedecin = async (req, res) => {
  try {
    const { specialite, ville, langue, disponibilite } = req.query;

    const where = { isActif: true };

    if (specialite) {
      where.specialite = { [Op.like]: `%${specialite}%` };
    }

    if (langue) {
      where.languesParlees = { [Op.like]: `%${langue}%` };
    }

    const medecins = await Medecin.findAll({
      where,
      include: [
        {
          model: User,
          as: 'utilisateur',
          attributes: ['nom', 'prenom', 'email'],
          where: ville ? { ville: { [Op.like]: `%${ville}%` } } : {},
        },
        ...(disponibilite ? [{
          model: Disponibilite,
          as: 'disponibilites',
          where: {
            date: disponibilite,
            estDisponible: true,
          },
          required: true,
        }] : []),
      ],
    });

    res.json(medecins);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};
// GET /api/medecin/disponibilites/:medecinId?date=2026-05-22
exports.getDisponibilitesPubliques = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'La date est obligatoire' });
    }

    // Vérifier si le médecin est en congé ce jour
    const enConge = await Conge.findOne({
      where: {
        medecinId,
        dateDebut: { [Op.lte]: date },
        dateFin:   { [Op.gte]: date },
      },
    });

    if (enConge) {
      return res.json({ 
        disponible: false, 
        message: 'Médecin en congé ce jour', 
        creneaux: [] 
      });
    }

    // Récupérer les créneaux disponibles
    const creneaux = await Disponibilite.findAll({
      where: {
        medecinId,
        date,
        estDisponible: true,
      },
      order: [['heureDebut', 'ASC']],
    });

    res.json({ disponible: true, creneaux });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};
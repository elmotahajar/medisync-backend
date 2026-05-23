const { User, RendezVous, Facture, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────────
// 1. TABLEAU DE BORD — STATISTIQUES
// ─────────────────────────────────────────────

/**
 * GET /admin/dashboard
 * Retourne les indicateurs clés de l'établissement.
 * Paramètre optionnel : ?periode=today|week|month (défaut: month)
 */
exports.getDashboard = async (req, res) => {
  try {
    const { periode = 'month' } = req.query;

    // Calcul de la date de début selon la période
    const now = new Date();
    let dateDebut;
    if (periode === 'today') {
      dateDebut = new Date(now.setHours(0, 0, 0, 0));
    } else if (periode === 'week') {
      dateDebut = new Date(now.setDate(now.getDate() - 7));
    } else {
      // month par défaut
      dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Nombre total de rendez-vous sur la période
    const totalRdv = await RendezVous.count({
      where: { dateHeure: { [Op.gte]: dateDebut } },
    });

    // Taux de no-show (statut NO_SHOW)
    const noShowCount = await RendezVous.count({
      where: {
        dateHeure: { [Op.gte]: dateDebut },
        statut: 'NO_SHOW',
      },
    });
    const tauxNoShow = totalRdv > 0 ? ((noShowCount / totalRdv) * 100).toFixed(1) : 0;

    // Consultations par médecin
    const consultationsParMedecin = await RendezVous.findAll({
      attributes: [
        'medecinId',
        [sequelize.fn('COUNT', sequelize.col('RendezVous.id')), 'nbConsultations'],
      ],
      where: { dateHeure: { [Op.gte]: dateDebut } },
      include: [
        {
          model: User,
          as: 'medecin',
          attributes: ['nom', 'prenom', 'specialite'],
        },
      ],
      group: ['medecinId'],
      order: [[sequelize.literal('nbConsultations'), 'DESC']],
    });

    // Revenus sur la période (factures payées)
    const revenusData = await Facture.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('montantPaye')), 'totalRevenu'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'nbFactures'],
      ],
      where: {
        dateEmission: { [Op.gte]: dateDebut },
        statut: 'PAYEE',
      },
    });

    // Impayés
    const impayesData = await Facture.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('montantTotal')), 'totalImpayes'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'nbImpayes'],
      ],
      where: {
        statut: { [Op.in]: ['EN_ATTENTE', 'IMPAYEE'] },
      },
    });

    // Nouveaux patients sur la période
    const nouveauxPatients = await User.count({
      where: {
        role: 'patient',
        createdAt: { [Op.gte]: dateDebut },
      },
    });

    // Total patients, médecins, secrétaires
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalMedecins = await User.count({ where: { role: 'medecin' } });
    const totalSecretaires = await User.count({ where: { role: 'secretaire' } });

    return res.json({
      periode,
      dateDebut,
      indicateurs: {
        totalRdv,
        noShowCount,
        tauxNoShow: `${tauxNoShow}%`,
        totalRevenu: parseFloat(revenusData?.dataValues?.totalRevenu || 0).toFixed(2),
        nbFacturesPayees: parseInt(revenusData?.dataValues?.nbFactures || 0),
        totalImpayes: parseFloat(impayesData?.dataValues?.totalImpayes || 0).toFixed(2),
        nbImpayes: parseInt(impayesData?.dataValues?.nbImpayes || 0),
        nouveauxPatients,
        totalPatients,
        totalMedecins,
        totalSecretaires,
      },
      consultationsParMedecin,
    });
  } catch (error) {
    console.error('getDashboard:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * GET /admin/statistiques/revenus
 * Revenus agrégés par mois (12 derniers mois) pour les graphiques.
 */
exports.getStatistiquesRevenus = async (req, res) => {
  try {
    const revenus = await Facture.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('dateEmission')), 'mois'],
        [sequelize.fn('YEAR', sequelize.col('dateEmission')), 'annee'],
        [sequelize.fn('SUM', sequelize.col('montantPaye')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'nbFactures'],
      ],
      where: {
        dateEmission: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
      group: [
        sequelize.fn('YEAR', sequelize.col('dateEmission')),
        sequelize.fn('MONTH', sequelize.col('dateEmission')),
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('dateEmission')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('dateEmission')), 'ASC'],
      ],
    });
    return res.json(revenus);
  } catch (error) {
    console.error('getStatistiquesRevenus:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// 2. GESTION DES MÉDECINS & PERSONNEL
// ─────────────────────────────────────────────

/**
 * GET /admin/personnel
 * Lister tout le personnel (médecins + secrétaires).
 * Filtre optionnel : ?role=medecin|secretaire
 */
exports.listerPersonnel = async (req, res) => {
  try {
    const where = { role: { [Op.in]: ['medecin', 'secretaire', 'admin'] } };
    if (req.query.role) where.role = req.query.role;

    const personnel = await User.findAll({
      where,
      attributes: { exclude: ['motDePasse'] },
      order: [['role', 'ASC'], ['nom', 'ASC']],
    });
    return res.json(personnel);
  } catch (error) {
    console.error('listerPersonnel:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * POST /admin/personnel
 * Créer un compte médecin, secrétaire ou admin.
 * Body : { nom, prenom, email, role, specialite?, tarif?, telephone? }
 */
exports.creerPersonnel = async (req, res) => {
  try {
    const { nom, prenom, email, role, specialite, tarif, telephone, horaires } = req.body;

    const rolesAutorises = ['medecin', 'secretaire', 'admin'];
    if (!rolesAutorises.includes(role)) {
      return res.status(400).json({ message: `Rôle invalide. Valeurs acceptées : ${rolesAutorises.join(', ')}` });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const tempPassword = Math.random().toString(36).slice(-8) + 'Med1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const membre = await User.create({
      nom,
      prenom,
      email,
      role,
      specialite: specialite || null,
      tarif: tarif || null,
      telephone: telephone || null,
      horaires: horaires || null,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: `Compte ${role} créé avec succès.`,
      membre: { id: membre.id, nom: membre.nom, prenom: membre.prenom, email: membre.email, role: membre.role },
      tempPassword,
    });
  } catch (error) {
    console.error('creerPersonnel:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * GET /admin/personnel/:id
 * Obtenir le profil complet d'un membre du personnel.
 */
exports.getPersonnel = async (req, res) => {
  try {
    const membre = await User.findByPk(req.params.id, {
      attributes: { exclude: ['motDePasse'] },
    });
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });
    return res.json(membre);
  } catch (error) {
    console.error('getPersonnel:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * PUT /admin/personnel/:id
 * Modifier les informations d'un membre du personnel.
 */
exports.modifierPersonnel = async (req, res) => {
  try {
    const membre = await User.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });

    const { nom, prenom, email, specialite, tarif, telephone, horaires, actif } = req.body;

    await membre.update({
      nom: nom || membre.nom,
      prenom: prenom || membre.prenom,
      email: email || membre.email,
      specialite: specialite !== undefined ? specialite : membre.specialite,
      tarif: tarif !== undefined ? tarif : membre.tarif,
      telephone: telephone !== undefined ? telephone : membre.telephone,
      horaires: horaires !== undefined ? horaires : membre.horaires,
      actif: actif !== undefined ? actif : membre.actif,
    });

    return res.json({ message: 'Profil mis à jour.', membre });
  } catch (error) {
    console.error('modifierPersonnel:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * DELETE /admin/personnel/:id
 * Désactiver (soft delete) un compte.
 */
exports.desactiverPersonnel = async (req, res) => {
  try {
    const membre = await User.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });

    // Soft delete : on désactive plutôt que de supprimer (conservation de l'historique)
    await membre.update({ actif: false });

    return res.json({ message: `Compte ${membre.role} désactivé.` });
  } catch (error) {
    console.error('desactiverPersonnel:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * GET /admin/medecins/:id/planning
 * Consulter le planning d'un médecin (rendez-vous à venir).
 */
exports.getPlanningMedecin = async (req, res) => {
  try {
    const { debut, fin } = req.query;
    const where = { medecinId: req.params.id };
    if (debut && fin) {
      where.dateHeure = { [Op.between]: [new Date(debut), new Date(fin)] };
    } else {
      where.dateHeure = { [Op.gte]: new Date() };
    }

    const rdvs = await RendezVous.findAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['dateHeure', 'ASC']],
    });
    return res.json(rdvs);
  } catch (error) {
    console.error('getPlanningMedecin:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// 3. GESTION FINANCIÈRE
// ─────────────────────────────────────────────

/**
 * GET /admin/finances/rapport
 * Rapport financier : journalier, mensuel ou annuel.
 * Query : ?type=daily|monthly|yearly&annee=2025&mois=6
 */
exports.getRapportFinancier = async (req, res) => {
  try {
    const { type = 'monthly', annee = new Date().getFullYear(), mois } = req.query;
    let dateDebut, dateFin;

    if (type === 'daily') {
      dateDebut = new Date();
      dateDebut.setHours(0, 0, 0, 0);
      dateFin = new Date();
      dateFin.setHours(23, 59, 59, 999);
    } else if (type === 'monthly') {
      const m = mois ? parseInt(mois) - 1 : new Date().getMonth();
      dateDebut = new Date(annee, m, 1);
      dateFin = new Date(annee, m + 1, 0, 23, 59, 59);
    } else {
      // yearly
      dateDebut = new Date(annee, 0, 1);
      dateFin = new Date(annee, 11, 31, 23, 59, 59);
    }

    const factures = await Facture.findAll({
      where: { dateEmission: { [Op.between]: [dateDebut, dateFin] } },
      include: [
        { model: User, as: 'patient', attributes: ['nom', 'prenom'] },
      ],
      order: [['dateEmission', 'DESC']],
    });

    const totalEmis = factures.reduce((s, f) => s + f.montantTotal, 0);
    const totalEncaisse = factures.reduce((s, f) => s + f.montantPaye, 0);
    const totalImpayes = factures
      .filter((f) => f.statut !== 'PAYEE')
      .reduce((s, f) => s + (f.montantTotal - f.montantPaye), 0);

    return res.json({
      periode: { type, dateDebut, dateFin },
      resume: {
        nbFactures: factures.length,
        totalEmis: totalEmis.toFixed(2),
        totalEncaisse: totalEncaisse.toFixed(2),
        totalImpayes: totalImpayes.toFixed(2),
        tauxRecouvrement: totalEmis > 0
          ? ((totalEncaisse / totalEmis) * 100).toFixed(1) + '%'
          : '0%',
      },
      factures,
    });
  } catch (error) {
    console.error('getRapportFinancier:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
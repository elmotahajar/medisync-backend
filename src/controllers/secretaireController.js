const { User, RendezVous, Facture, FeuilleSoins } = require('../models');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// 1. CRÉATION DE COMPTE PATIENT
// ─────────────────────────────────────────────

/**
 * POST /secretaire/patients
 * La secrétaire crée un compte patient manuellement.
 */
exports.creerComptePatient = async (req, res) => {
  try {
    const { nom, prenom, email } = req.body;

    // Vérification unicité email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    // Mot de passe temporaire (le patient devra le changer à la première connexion)
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const patient = await User.create({
        nom,
        prenom,
        email,
        password: hashedPassword,
        role: 'patient',
    });

    // TODO: envoyer l'email avec le mot de passe temporaire (nodemailer)

    return res.status(201).json({
      message: 'Compte patient créé avec succès.',
      patient: {
        id: patient.id,
        nom: patient.nom,
        prenom: patient.prenom,
        email: patient.email,
      },
      // En développement on retourne le mot de passe temporaire (à supprimer en prod)
      tempPassword,
    });
  } catch (error) {
    console.error('creerComptePatient:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * GET /secretaire/patients
 * Lister tous les patients.
 */
exports.listerPatients = async (req, res) => {
  try {
    const patients = await User.findAll({
      where: { role: 'patient' },
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone', 'dateNaissance', 'createdAt'],
      order: [['nom', 'ASC']],
    });
    return res.json(patients);
  } catch (error) {
    console.error('listerPatients:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// 2. FEUILLES DE SOINS
// ─────────────────────────────────────────────

/**
 * POST /secretaire/feuilles-soins
 * Créer une feuille de soins après consultation.
 * Body : { patientId, medecinId, rendezVousId, actes: [{code, libelle, quantite, prixUnitaire}], observations }
 */
exports.creerFeuilleSoins = async (req, res) => {
  try {
    const { patientId, medecinId, rendezVousId, actes, observations } = req.body;
    const secretaireId = req.user.id;

    if (!actes || actes.length === 0) {
      return res.status(400).json({ message: 'Au moins un acte est requis.' });
    }

    const totalHonoraires = actes.reduce(
      (sum, acte) => sum + acte.quantite * acte.prixUnitaire,
      0
    );

    const feuille = await FeuilleSoins.create({
      patientId,
      medecinId,
      rendezVousId: rendezVousId || null,
      secretaireId,
      actes,
      totalHonoraires,
      observations: observations || null,
      date: new Date(),
      statut: 'BROUILLON',
    });

    return res.status(201).json({ message: 'Feuille de soins créée.', feuille });
  } catch (error) {
    console.error('creerFeuilleSoins:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * PATCH /secretaire/feuilles-soins/:id/valider
 * Valider une feuille de soins (statut BROUILLON → VALIDEE).
 */
exports.validerFeuilleSoins = async (req, res) => {
  try {
    const feuille = await FeuilleSoins.findByPk(req.params.id);
    if (!feuille) return res.status(404).json({ message: 'Feuille de soins introuvable.' });

    feuille.statut = 'VALIDEE';
    await feuille.save();

    return res.json({ message: 'Feuille de soins validée.', feuille });
  } catch (error) {
    console.error('validerFeuilleSoins:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * GET /secretaire/feuilles-soins
 * Lister les feuilles de soins (filtres optionnels : patientId, statut).
 */
exports.listerFeuilleSoins = async (req, res) => {
  try {
    const where = {};
    if (req.query.patientId) where.patientId = req.query.patientId;
    if (req.query.statut) where.statut = req.query.statut;

    const feuilles = await FeuilleSoins.findAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'nom', 'prenom'] },
        { model: User, as: 'medecin', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['date', 'DESC']],
    });
    return res.json(feuilles);
  } catch (error) {
    console.error('listerFeuilleSoins:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// 3. FACTURATION
// ─────────────────────────────────────────────

/**
 * POST /secretaire/factures
 * Émettre une facture à partir d'une feuille de soins ou manuellement.
 * Body : { patientId, rendezVousId?, actes, dateEcheance?, notes? }
 */
exports.emettreFacture = async (req, res) => {
  try {
    const { patientId, rendezVousId, actes, dateEcheance, notes } = req.body;
    const secretaireId = req.user.id;

    if (!actes || actes.length === 0) {
      return res.status(400).json({ message: 'Au moins un acte est requis.' });
    }

    const montantTotal = actes.reduce(
      (sum, acte) => sum + (acte.quantite || 1) * acte.prix,
      0
    );

    const facture = await Facture.create({
      patientId,
      rendezVousId: rendezVousId || null,
      secretaireId,
      montantTotal,
      actes,
      dateEcheance: dateEcheance || null,
      notes: notes || null,
      statut: 'EN_ATTENTE',
    });

    return res.status(201).json({ message: 'Facture émise.', facture });
  } catch (error) {
    console.error('emettreFacture:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * GET /secretaire/factures
 * Lister toutes les factures (filtres optionnels : patientId, statut).
 */
exports.listerFactures = async (req, res) => {
  try {
    const where = {};
    if (req.query.patientId) where.patientId = req.query.patientId;
    if (req.query.statut) where.statut = req.query.statut;

    const factures = await Facture.findAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'nom', 'prenom', 'email'] },
      ],
      order: [['dateEmission', 'DESC']],
    });
    return res.json(factures);
  } catch (error) {
    console.error('listerFactures:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * PATCH /secretaire/factures/:id/payer
 * Enregistrer un paiement partiel ou total.
 * Body : { montantPaye }
 */
exports.enregistrerPaiement = async (req, res) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) return res.status(404).json({ message: 'Facture introuvable.' });

    const { montantPaye } = req.body;
    facture.montantPaye = (facture.montantPaye || 0) + montantPaye;
    facture.statut = facture.montantPaye >= facture.montantTotal ? 'PAYEE' : 'EN_ATTENTE';
    await facture.save();

    return res.json({ message: 'Paiement enregistré.', facture });
  } catch (error) {
    console.error('enregistrerPaiement:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * GET /secretaire/factures/:id/pdf
 * Générer et télécharger la facture au format PDF.
 */
exports.exporterFacturePDF = async (req, res) => {
  try {
    const facture = await Facture.findByPk(req.params.id, {
      include: [
        { model: User, as: 'patient', attributes: ['nom', 'prenom', 'email', 'adresse'] },
      ],
    });
    if (!facture) return res.status(404).json({ message: 'Facture introuvable.' });

    // Dossier de sortie
    const outputDir = path.join(__dirname, '../../uploads/factures');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `facture_${facture.id}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    // Génération PDF avec PDFKit
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ── En-tête ──
    doc.fontSize(20).font('Helvetica-Bold').text('MediSync — Facture Médicale', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(`Numéro de facture : #${facture.id}`);
    doc.text(`Date d'émission : ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`);
    if (facture.dateEcheance) {
      doc.text(`Date d'échéance : ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`);
    }
    doc.moveDown();

    // ── Patient ──
    doc.fontSize(13).font('Helvetica-Bold').text('Patient :');
    doc.fontSize(11).font('Helvetica')
      .text(`${facture.patient.prenom} ${facture.patient.nom}`)
      .text(facture.patient.email)
      .text(facture.patient.adresse || '');
    doc.moveDown();

    // ── Tableau des actes ──
    doc.fontSize(13).font('Helvetica-Bold').text('Actes réalisés :');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colX = [50, 250, 350, 430];
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Libellé', colX[0], tableTop);
    doc.text('Quantité', colX[1], tableTop);
    doc.text('Prix unitaire', colX[2], tableTop);
    doc.text('Total', colX[3], tableTop);
    doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke();
    doc.moveDown(0.5);

    let totalCalcule = 0;
    doc.font('Helvetica').fontSize(10);
    for (const acte of facture.actes) {
      const rowY = doc.y;
      const qty = acte.quantite || 1;
      const prix = acte.prix || 0;
      const total = qty * prix;
      totalCalcule += total;
      doc.text(acte.libelle, colX[0], rowY);
      doc.text(String(qty), colX[1], rowY);
      doc.text(`${prix.toFixed(2)} MAD`, colX[2], rowY);
      doc.text(`${total.toFixed(2)} MAD`, colX[3], rowY);
      doc.moveDown(0.5);
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Totaux ──
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Montant total : ${facture.montantTotal.toFixed(2)} MAD`, { align: 'right' });
    doc.text(`Montant payé : ${facture.montantPaye.toFixed(2)} MAD`, { align: 'right' });
    doc.text(
      `Reste à payer : ${(facture.montantTotal - facture.montantPaye).toFixed(2)} MAD`,
      { align: 'right' }
    );
    doc.moveDown();

    // ── Statut ──
    doc.fontSize(11).font('Helvetica')
      .fillColor(facture.statut === 'PAYEE' ? 'green' : 'red')
      .text(`Statut : ${facture.statut}`, { align: 'right' });

    doc.fillColor('black').moveDown(2);
    doc.fontSize(9).text('MediSync — Système de Gestion de Clinique Médicale', { align: 'center' });

    doc.end();

    // Attendre que l'écriture soit terminée
    writeStream.on('finish', async () => {
      // Sauvegarder le chemin en base
      facture.pdfPath = filePath;
      await facture.save();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      fs.createReadStream(filePath).pipe(res);
    });

    writeStream.on('error', (err) => {
      console.error('Erreur écriture PDF:', err);
      res.status(500).json({ message: 'Erreur lors de la génération du PDF.' });
    });
  } catch (error) {
    console.error('exporterFacturePDF:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

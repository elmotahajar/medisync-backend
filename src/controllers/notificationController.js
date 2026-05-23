// src/controllers/notificationController.js
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const RendezVous = require('../models/RendezVous');
const User = require('../models/User');
const { Op } = require('sequelize');

// ─────────────────────────────────────────
// 1. CONFIGURATION EMAIL
// ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // ton email Gmail
    pass: process.env.EMAIL_PASSWORD, // mot de passe d'application Gmail
  },
});

// ─────────────────────────────────────────
// 2. FONCTION ENVOI EMAIL
// ─────────────────────────────────────────
const envoyerEmail = async (destinataire, sujet, contenu) => {
  try {
    await transporter.sendMail({
      from: `"MediSync" <${process.env.EMAIL_USER}>`,
      to: destinataire,
      subject: sujet,
      html: contenu,
    });
    console.log(`✅ Email envoyé à ${destinataire}`);
  } catch (err) {
    console.error(`❌ Erreur envoi email :`, err.message);
  }
};

// ─────────────────────────────────────────
// 3. TEMPLATE EMAIL RAPPEL
// ─────────────────────────────────────────
const templateRappel = (patient, rdv, delai) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #2196F3; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">MediSync</h1>
    </div>
    <div style="padding: 30px; background-color: #f9f9f9;">
      <h2>Rappel de rendez-vous</h2>
      <p>Bonjour <strong>${patient.prenom} ${patient.nom}</strong>,</p>
      <p>Nous vous rappelons votre rendez-vous prévu <strong>${delai}</strong> :</p>
      <div style="background-color: white; padding: 20px; border-left: 4px solid #2196F3;">
        <p>📅 <strong>Date :</strong> ${rdv.date}</p>
        <p>🕐 <strong>Heure :</strong> ${rdv.heure}</p>
        <p>👨‍⚕️ <strong>Médecin :</strong> Dr. ${rdv.medecin}</p>
        <p>📋 <strong>Motif :</strong> ${rdv.motif}</p>
      </div>
      <p style="margin-top: 20px;">
        En cas d'empêchement, merci d'annuler votre rendez-vous depuis votre espace patient.
      </p>
    </div>
    <div style="background-color: #eeeeee; padding: 15px; text-align: center;">
      <p style="color: #999; font-size: 12px;">MediSync — Système de Gestion de Clinique Médicale</p>
    </div>
  </div>
`;

// ─────────────────────────────────────────
// 4. VÉRIFICATION ET ENVOI DES RAPPELS
// ─────────────────────────────────────────
const envoyerRappels = async () => {
  try {
    const maintenant = new Date();

    // Fenêtre 24h : entre 23h50 et 24h10 avant le RDV
    const debut24h = new Date(maintenant.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000);
    const fin24h   = new Date(maintenant.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000);

    // Fenêtre 1h : entre 50min et 70min avant le RDV
    const debut1h  = new Date(maintenant.getTime() + 50 * 60 * 1000);
    const fin1h    = new Date(maintenant.getTime() + 70 * 60 * 1000);

    // Chercher RDV dans la fenêtre 24h
    const rdvs24h = await RendezVous.findAll({
      where: {
        dateHeure: { [Op.between]: [debut24h, fin24h] },
        statut: 'confirme',
        rappel24hEnvoye: false,
      },
      include: [{ model: User, as: 'patient' }],
    });

    // Chercher RDV dans la fenêtre 1h
    const rdvs1h = await RendezVous.findAll({
      where: {
        dateHeure: { [Op.between]: [debut1h, fin1h] },
        statut: 'confirme',
        rappel1hEnvoye: false,
      },
      include: [{ model: User, as: 'patient' }],
    });

    // Envoyer rappels 24h
    for (const rdv of rdvs24h) {
      const contenu = templateRappel(
        rdv.patient,
        {
          date: new Date(rdv.dateHeure).toLocaleDateString('fr-FR'),
          heure: new Date(rdv.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          medecin: rdv.medecinNom || 'votre médecin',
          motif: rdv.motif || 'Consultation',
        },
        'dans 24 heures'
      );

      await envoyerEmail(
        rdv.patient.email,
        '⏰ Rappel — Votre rendez-vous demain | MediSync',
        contenu
      );

      await rdv.update({ rappel24hEnvoye: true });
    }

    // Envoyer rappels 1h
    for (const rdv of rdvs1h) {
      const contenu = templateRappel(
        rdv.patient,
        {
          date: new Date(rdv.dateHeure).toLocaleDateString('fr-FR'),
          heure: new Date(rdv.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          medecin: rdv.medecinNom || 'votre médecin',
          motif: rdv.motif || 'Consultation',
        },
        'dans 1 heure'
      );

      await envoyerEmail(
        rdv.patient.email,
        '⏰ Rappel — Votre rendez-vous dans 1h | MediSync',
        contenu
      );

      await rdv.update({ rappel1hEnvoye: true });
    }

    console.log(`✅ Rappels envoyés — 24h: ${rdvs24h.length} | 1h: ${rdvs1h.length}`);

  } catch (err) {
    console.error('❌ Erreur envoi rappels :', err.message);
  }
};

// ─────────────────────────────────────────
// 5. TÂCHE AUTOMATIQUE — toutes les 30 min
// ─────────────────────────────────────────
const demarrerTacheNotifications = () => {
  cron.schedule('*/30 * * * *', () => {
    console.log('🔔 Vérification des rappels RDV...');
    envoyerRappels();
  });
  console.log('✅ Tâche notifications démarrée');
};

// ─────────────────────────────────────────
// 6. ENVOI MANUEL (ex: confirmation RDV)
// ─────────────────────────────────────────
exports.envoyerConfirmationRdv = async (patientEmail, patientNom, rdvDetails) => {
  const contenu = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">MediSync</h1>
      </div>
      <div style="padding: 30px;">
        <h2>✅ Rendez-vous confirmé !</h2>
        <p>Bonjour <strong>${patientNom}</strong>,</p>
        <p>Votre rendez-vous a bien été enregistré :</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #4CAF50;">
          <p>📅 <strong>Date :</strong> ${rdvDetails.date}</p>
          <p>🕐 <strong>Heure :</strong> ${rdvDetails.heure}</p>
          <p>👨‍⚕️ <strong>Médecin :</strong> ${rdvDetails.medecin}</p>
          <p>📋 <strong>Motif :</strong> ${rdvDetails.motif}</p>
        </div>
      </div>
    </div>
  `;

  await envoyerEmail(
    patientEmail,
    '✅ Confirmation de votre rendez-vous | MediSync',
    contenu
  );
};

module.exports = { 
  demarrerTacheNotifications, 
  envoyerConfirmationRdv: exports.envoyerConfirmationRdv, 
  envoyerRappels 
};
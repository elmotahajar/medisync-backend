const transporter = require('../config/email');

// Envoyer confirmation RDV
exports.envoyerConfirmationRDV = async (email, rdv) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'MediSync - Confirmation de votre rendez-vous',
      html: `
        <h2>Votre rendez-vous est confirmé !</h2>
        <p>Bonjour,</p>
        <p>Votre rendez-vous a été confirmé avec les détails suivants :</p>
        <ul>
          <li><strong>Date :</strong> ${rdv.date}</li>
          <li><strong>Heure :</strong> ${rdv.heure}</li>
          <li><strong>Motif :</strong> ${rdv.motif}</li>
        </ul>
        <p>Merci de vous présenter 10 minutes avant l'heure prévue.</p>
        <p>L'équipe MediSync</p>
      `
    });
    console.log('✅ Email de confirmation envoyé');
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
  }
};

// Envoyer rappel RDV
exports.envoyerRappelRDV = async (email, rdv, heuresAvant) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `MediSync - Rappel : votre rendez-vous dans ${heuresAvant}h`,
      html: `
        <h2>Rappel de votre rendez-vous</h2>
        <p>Bonjour,</p>
        <p>Votre rendez-vous est dans <strong>${heuresAvant} heure(s)</strong> :</p>
        <ul>
          <li><strong>Date :</strong> ${rdv.date}</li>
          <li><strong>Heure :</strong> ${rdv.heure}</li>
          <li><strong>Motif :</strong> ${rdv.motif}</li>
        </ul>
        <p>L'équipe MediSync</p>
      `
    });
    console.log(`✅ Rappel ${heuresAvant}h envoyé`);
  } catch (error) {
    console.error('❌ Erreur envoi rappel:', error);
  }
};

// Envoyer notification annulation
exports.envoyerAnnulationRDV = async (email, rdv) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'MediSync - Annulation de votre rendez-vous',
      html: `
        <h2>Votre rendez-vous a été annulé</h2>
        <p>Bonjour,</p>
        <p>Votre rendez-vous du <strong>${rdv.date}</strong> à <strong>${rdv.heure}</strong> a été annulé.</p>
        <p>Pour prendre un nouveau rendez-vous, connectez-vous sur MediSync.</p>
        <p>L'équipe MediSync</p>
      `
    });
    console.log('✅ Email annulation envoyé');
  } catch (error) {
    console.error('❌ Erreur envoi annulation:', error);
  }
};
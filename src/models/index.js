const sequelize = require('../config');

const User           = require('./User');
const Patient        = require('./Patient');
const Medecin        = require('./Medecin');
const Secretaire     = require('./Secretaire');
const Administrateur = require('./Administrateur');
const RendezVous     = require('./RendezVous');
const Facture        = require('./Facture');
const FeuilleSoins   = require('./FeuilleSoins');
const AuditLog       = require('./AuditLog');
const SalleConsultation = require('./SalleConsultation');
const Tarif          = require('./Tarif');

// ── Associations ────────────────────────────
Patient.belongsTo(User,        { foreignKey: 'id_utilisateur' });
Medecin.belongsTo(User,        { foreignKey: 'id_utilisateur' });
Secretaire.belongsTo(User,     { foreignKey: 'id_utilisateur' });
Administrateur.belongsTo(User, { foreignKey: 'id_utilisateur' });

RendezVous.belongsTo(Patient,  { foreignKey: 'id_patient' });
Facture.belongsTo(Secretaire,  { foreignKey: 'id_secretaire' });

module.exports = {
  sequelize,
  Utilisateur: User,
  Patient,
  Medecin,
  Secretaire,
  Administrateur,
  RendezVous,
  Facture,
  FeuilleSoins,
  AuditLog,
  SalleConsultation,
  Tarif,
};
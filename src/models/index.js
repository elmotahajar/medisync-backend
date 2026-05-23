const sequelize = require('../config');
const User = require('./User');
const RendezVous = require('./RendezVous');
const Facture = require('./Facture');
const FeuilleSoins = require('./FeuilleSoins');

// ── Associations RendezVous ──────────────────
RendezVous.belongsTo(User, { as: 'patient',    foreignKey: 'patientId' });
RendezVous.belongsTo(User, { as: 'medecin',    foreignKey: 'medecinId' });

// ── Associations Facture ─────────────────────
Facture.belongsTo(User, { as: 'patient',       foreignKey: 'patientId' });
Facture.belongsTo(User, { as: 'secretaire',    foreignKey: 'secretaireId' });

// ── Associations FeuilleSoins ────────────────
FeuilleSoins.belongsTo(User, { as: 'patient',  foreignKey: 'patientId' });
FeuilleSoins.belongsTo(User, { as: 'medecin',  foreignKey: 'medecinId' });
FeuilleSoins.belongsTo(User, { as: 'secretaire', foreignKey: 'secretaireId' });

module.exports = { sequelize, User, RendezVous, Facture, FeuilleSoins };
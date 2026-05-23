const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Facture = sequelize.define('Facture', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Lien vers le patient (User)
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  // Lien vers le rendez-vous concerné
  rendezVousId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'RendezVous', key: 'id' },
  },
  // Lien vers la secrétaire qui a émis la facture
  secretaireId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  montantTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  montantPaye: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  statut: {
    type: DataTypes.ENUM('EN_ATTENTE', 'PAYEE', 'IMPAYEE', 'ANNULEE'),
    defaultValue: 'EN_ATTENTE',
  },
  // Actes réalisés (JSON : [{ code, libelle, prix }])
  actes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  dateEmission: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  dateEcheance: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Chemin vers le PDF généré (stocké sur le serveur)
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Factures',
  timestamps: true,
});

module.exports = Facture;
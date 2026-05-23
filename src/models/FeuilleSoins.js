const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
 
const FeuilleSoins = sequelize.define('FeuilleSoins', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  medecinId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  rendezVousId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'RendezVous', key: 'id' },
  },
  secretaireId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  // Liste des actes : [{ code, libelle, quantite, prixUnitaire }]
  actes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  totalHonoraires: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('BROUILLON', 'VALIDEE', 'TRANSMISE'),
    defaultValue: 'BROUILLON',
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'FeuilleSoins',
  timestamps: true,
});
 
module.exports = FeuilleSoins;

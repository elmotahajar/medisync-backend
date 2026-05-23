const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const SalleConsultation = sequelize.define('SalleConsultation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  // ex: "Salle A", "Cabinet 3"
  numero: { type: DataTypes.STRING, allowNull: true },
  equipements: { type: DataTypes.JSON, defaultValue: [] },
  // ex: ["ECG", "Tensiomètre"]
  statut: {
    type: DataTypes.ENUM('DISPONIBLE', 'OCCUPEE', 'MAINTENANCE'),
    defaultValue: 'DISPONIBLE',
  },
  etage: { type: DataTypes.STRING, allowNull: true },
  capacite: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: 'Salles', timestamps: true });

module.exports = SalleConsultation;
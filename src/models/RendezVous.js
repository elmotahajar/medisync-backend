const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RendezVous = sequelize.define('RendezVous', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dateHeure: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  duree: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  motif: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  statut: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estPourTiers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  id_dossier_medical: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_patient: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_creneau: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'rendezvous',
  timestamps: false,
});

module.exports = RendezVous;
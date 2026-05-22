const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Dossier = sequelize.define('Dossier', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  historique: {
    type: DataTypes.TEXT,
  },
  allergies: {
    type: DataTypes.TEXT,
  },
  antecedents: {
    type: DataTypes.TEXT,
  },
  ordonnances: {
    type: DataTypes.JSON,
  },
  documents: {
    type: DataTypes.JSON,
  },
});

module.exports = Dossier;
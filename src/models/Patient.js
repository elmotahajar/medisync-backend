const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Patient = sequelize.define('Patient', {
  id_utilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  numeroSecu: {
    type: DataTypes.STRING,
  },
  dateNaissance: {
    type: DataTypes.DATE,
  },
  adresse: {
    type: DataTypes.STRING,
  },
  oauthProvider: {
    type: DataTypes.STRING,
  },
  id_tiers_rattache: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'patient',
  timestamps: false,
});

module.exports = Patient;
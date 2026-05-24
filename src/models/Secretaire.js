const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Secretaire = sequelize.define('Secretaire', {
  id_utilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  matricule: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'secretaire',
  timestamps: false,
});

module.exports = Secretaire;
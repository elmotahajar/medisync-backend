const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medecin = sequelize.define('Medecin', {
  id_utilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  specialite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numeroOrdre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tarif: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  secteur: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'medecin',
  timestamps: false,
});

module.exports = Medecin;
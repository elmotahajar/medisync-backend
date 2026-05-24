const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Disponibilite = sequelize.define('Disponibilite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  jour: {
    type: DataTypes.STRING,
  },
  heureDebut: {
    type: DataTypes.TIME,
  },
  heureFin: {
    type: DataTypes.TIME,
  },
  estConge: {
    type: DataTypes.BOOLEAN,
  },
  id_medecin: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'disponibilite',
  timestamps: false,
});

module.exports = Disponibilite;
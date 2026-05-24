const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Conge = sequelize.define('Conge', {
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
    defaultValue: true,
  },
  id_medecin: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'disponibilite',  // ✅ même table que Disponibilite
  timestamps: false,
});

module.exports = Conge;
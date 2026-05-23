const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Disponibilite = sequelize.define('Disponibilite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  jour: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  heureDebut: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  heureFin: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  estConge: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  id_medecin: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'disponibilite',
  timestamps: false,
});

module.exports = Disponibilite;
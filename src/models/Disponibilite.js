// src/models/Disponibilite.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Medecin = require('./Medecin');

const Disponibilite = sequelize.define('Disponibilite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  medecinId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Medecin,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  date: {
    type: DataTypes.DATEONLY, // ex: "2026-05-22"
    allowNull: false,
  },

  heureDebut: {
    type: DataTypes.TIME, // ex: "09:00:00"
    allowNull: false,
  },

  heureFin: {
    type: DataTypes.TIME, // ex: "09:30:00"
    allowNull: false,
  },

  estDisponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // false = créneau bloqué manuellement
  },

}, {
  tableName: 'disponibilites',
  timestamps: true,
});

// Association
Disponibilite.belongsTo(Medecin, { foreignKey: 'medecinId', as: 'medecin' });
Medecin.hasMany(Disponibilite,   { foreignKey: 'medecinId', as: 'disponibilites' });

module.exports = Disponibilite;
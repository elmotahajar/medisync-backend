// src/models/Conge.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Medecin = require('./Medecin');

const Conge = sequelize.define('Conge', {
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

  dateDebut: {
    type: DataTypes.DATEONLY, // ex: "2026-06-01"
    allowNull: false,
  },

  dateFin: {
    type: DataTypes.DATEONLY, // ex: "2026-06-10"
    allowNull: false,
  },

  motif: {
    type: DataTypes.STRING,
    allowNull: true, // ex: "Vacances", "Formation", "Maladie"
  },

}, {
  tableName: 'conges',
  timestamps: true,
});

// Association
Conge.belongsTo(Medecin, { foreignKey: 'medecinId', as: 'medecin' });
Medecin.hasMany(Conge,   { foreignKey: 'medecinId', as: 'conges' });

module.exports = Conge;
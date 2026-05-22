const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const RendezVous = sequelize.define('RendezVous', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  medecinId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  heure: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  motif: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('confirmé', 'annulé', 'en attente'),
    defaultValue: 'en attente',
  },
  duree: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
});

module.exports = RendezVous;
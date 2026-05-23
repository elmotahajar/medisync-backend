// src/models/CompteRendu.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const User = require('./User');
const RendezVous = require('./RendezVous');

const CompteRendu = sequelize.define('CompteRendu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  rendezVousId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: RendezVous,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  medecinId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },

  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },

  motifConsultation: {
    type: DataTypes.STRING,
    allowNull: false, // ex: "Suivi", "Consultation générale", "Urgence"
  },

  diagnostic: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  observations: {
    type: DataTypes.TEXT,
    allowNull: true, // notes libres du médecin
  },

  traitement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  dateConsultation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

  prochainRdv: {
    type: DataTypes.DATEONLY,
    allowNull: true, // si le médecin planifie un suivi
  },

}, {
  tableName: 'comptes_rendus',
  timestamps: true,
});

// Associations
CompteRendu.belongsTo(RendezVous, { foreignKey: 'rendezVousId', as: 'rendezVous' });
CompteRendu.belongsTo(User, { foreignKey: 'medecinId',  as: 'medecin' });
CompteRendu.belongsTo(User, { foreignKey: 'patientId',  as: 'patient' });

RendezVous.hasOne(CompteRendu, { foreignKey: 'rendezVousId', as: 'compteRendu' });

module.exports = CompteRendu;
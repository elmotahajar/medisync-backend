// src/models/Prescription.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const User = require('./User');
const CompteRendu = require('./CompteRendu');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  compteRenduId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CompteRendu,
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

  medicaments: {
    type: DataTypes.JSON,
    allowNull: false,
    /* Structure attendue :
      [
        {
          nom: "Paracétamol",
          dosage: "500mg",
          frequence: "3 fois par jour",
          duree: "5 jours",
          instructions: "À prendre après les repas"
        },
        ...
      ]
    */
  },

  dateEmission: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

  dateExpiration: {
    type: DataTypes.DATEONLY,
    allowNull: true, // 3 mois par défaut en général
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  tableName: 'prescriptions',
  timestamps: true,
});

// Associations
Prescription.belongsTo(CompteRendu, { foreignKey: 'compteRenduId', as: 'compteRendu' });
Prescription.belongsTo(User, { foreignKey: 'medecinId', as: 'medecin' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

CompteRendu.hasMany(Prescription, { foreignKey: 'compteRenduId', as: 'prescriptions' });

module.exports = Prescription;
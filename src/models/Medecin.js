// src/models/Medecin.js
const { DataTypes } = require('sequelize');
// ✅ Ligne correcte (comme dans User.js)
const sequelize = require('../config'); // adapte le chemin si besoin
const User = require('./User');

const Medecin = sequelize.define('Medecin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Clé étrangère vers User
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  specialite: {
    type: DataTypes.STRING,
    allowNull: false, // ex: "Cardiologue", "Généraliste"
  },

  numeroOrdre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // numéro d'ordre médical unique
  },

  tarifConsultation: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  secteur: {
    type: DataTypes.ENUM('1', '2', '3'),
    allowNull: false,
    defaultValue: '1', // secteur tarifaire (cahier des charges §4)
  },

  languesParlees: {
    type: DataTypes.JSON, // ex: ["Français", "Arabe", "Anglais"]
    defaultValue: [],
  },

  // Horaires de disponibilité hebdomadaires
  horairesDisponibilite: {
    type: DataTypes.JSON,
    /* Structure attendue :
      {
        lundi:    { debut: "08:00", fin: "17:00", actif: true },
        mardi:    { debut: "08:00", fin: "17:00", actif: true },
        mercredi: { debut: "08:00", fin: "12:00", actif: true },
        jeudi:    { debut: "08:00", fin: "17:00", actif: true },
        vendredi: { debut: "08:00", fin: "16:00", actif: true },
        samedi:   { debut: null,    fin: null,     actif: false },
        dimanche: { debut: null,    fin: null,     actif: false }
      }
    */
    defaultValue: {},
  },

  dureeCreneauMinutes: {
    type: DataTypes.ENUM('15', '30', '60'),
    allowNull: false,
    defaultValue: '30', // durée par défaut d'un créneau (§4 cahier des charges)
  },

  biographie: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  isActif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  tableName: 'medecins',
  timestamps: true, // createdAt / updatedAt automatiques
});

// --- Associations ---
Medecin.belongsTo(User, { foreignKey: 'userId', as: 'utilisateur' });
User.hasOne(Medecin,    { foreignKey: 'userId', as: 'profilMedecin' });

module.exports = Medecin;
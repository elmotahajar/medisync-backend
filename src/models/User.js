const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const User = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('patient', 'medecin', 'secretaire', 'admin'),
    allowNull: false,
    defaultValue: 'patient',
  },
}, {
  tableName: 'utilisateur',
  timestamps: false,
});

module.exports = User;
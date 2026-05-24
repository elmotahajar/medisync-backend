const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Administrateur = sequelize.define('Administrateur', {
  id_utilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  totpSecret: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'administrateur',
  timestamps: false,
});

module.exports = Administrateur;
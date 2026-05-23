const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Tarif = sequelize.define('Tarif', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medecinId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null = tarif global
    references: { model: 'Users', key: 'id' },
  },
  secteur: {
    type: DataTypes.ENUM('SECTEUR_1', 'SECTEUR_2', 'SECTEUR_3'),
    allowNull: false,
  },
  codeActe: { type: DataTypes.STRING, allowNull: false },
  // ex: "CS", "CSD", "V"
  libelleActe: { type: DataTypes.STRING, allowNull: false },
  prix: { type: DataTypes.FLOAT, allowNull: false },
  actif: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'Tarifs', timestamps: true });

module.exports = Tarif;
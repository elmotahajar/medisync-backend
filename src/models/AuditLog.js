const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  // ex: "ACCES_DOSSIER", "MODIFICATION_USER", "SUPPRESSION"
  ressource: { type: DataTypes.STRING, allowNull: true },
  // ex: "Patient#42", "Facture#7"
  details: { type: DataTypes.JSON, allowNull: true },
  ip: { type: DataTypes.STRING, allowNull: true },
  statut: {
    type: DataTypes.ENUM('SUCCES', 'ECHEC'),
    defaultValue: 'SUCCES',
  },
}, { tableName: 'AuditLogs', timestamps: true });

module.exports = AuditLog;
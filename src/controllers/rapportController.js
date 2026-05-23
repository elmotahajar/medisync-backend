const { Facture, User } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper : calcul période
const getPeriode = (type, annee, mois) => {
  if (type === 'daily') {
    const d = new Date();
    return {
      debut: new Date(d.setHours(0,0,0,0)),
      fin: new Date(d.setHours(23,59,59,999)),
    };
  }
  if (type === 'monthly') {
    const m = mois ? parseInt(mois) - 1 : new Date().getMonth();
    return {
      debut: new Date(annee, m, 1),
      fin: new Date(annee, m + 1, 0, 23, 59, 59),
    };
  }
  // yearly
  return {
    debut: new Date(annee, 0, 1),
    fin: new Date(annee, 11, 31, 23, 59, 59),
  };
};

/**
 * GET /admin/rapports?type=daily|monthly|yearly&annee=2025&mois=6
 */
exports.getRapport = async (req, res) => {
  try {
    const { type = 'monthly', annee = new Date().getFullYear(), mois } = req.query;
    const { debut, fin } = getPeriode(type, annee, mois);

    const factures = await Facture.findAll({
      where: { dateEmission: { [Op.between]: [debut, fin] } },
      include: [{ model: User, as: 'patient', attributes: ['nom', 'prenom'] }],
    });

    const totalEmis = factures.reduce((s, f) => s + f.montantTotal, 0);
    const totalEncaisse = factures.reduce((s, f) => s + f.montantPaye, 0);
    const impayees = factures.filter(f => f.statut !== 'PAYEE');
    const totalImpayes = impayees.reduce((s, f) => s + (f.montantTotal - f.montantPaye), 0);

    return res.json({
      periode: { type, debut, fin },
      resume: {
        nbFactures: factures.length,
        totalEmis: totalEmis.toFixed(2),
        totalEncaisse: totalEncaisse.toFixed(2),
        totalImpayes: totalImpayes.toFixed(2),
        nbImpayes: impayees.length,
        tauxRecouvrement: totalEmis > 0
          ? ((totalEncaisse / totalEmis) * 100).toFixed(1) + '%'
          : '0%',
      },
      factures,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * GET /admin/rapports/export/excel
 */
exports.exporterExcel = async (req, res) => {
  try {
    const { type = 'monthly', annee = new Date().getFullYear(), mois } = req.query;
    const { debut, fin } = getPeriode(type, annee, mois);

    const factures = await Facture.findAll({
      where: { dateEmission: { [Op.between]: [debut, fin] } },
      include: [{ model: User, as: 'patient', attributes: ['nom', 'prenom'] }],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rapport Financier');

    // En-têtes
    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Patient', key: 'patient', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Montant Total', key: 'total', width: 15 },
      { header: 'Montant Payé', key: 'paye', width: 15 },
      { header: 'Reste', key: 'reste', width: 15 },
      { header: 'Statut', key: 'statut', width: 12 },
    ];

    // Style en-tête
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: '2563EB' },
    };

    // Données
    factures.forEach(f => {
      sheet.addRow({
        id: f.id,
        patient: `${f.patient?.prenom} ${f.patient?.nom}`,
        date: new Date(f.dateEmission).toLocaleDateString('fr-FR'),
        total: parseFloat(f.montantTotal).toFixed(2),
        paye: parseFloat(f.montantPaye).toFixed(2),
        reste: (f.montantTotal - f.montantPaye).toFixed(2),
        statut: f.statut,
      });
    });

    // Total
    sheet.addRow({});
    sheet.addRow({
      patient: 'TOTAL',
      total: factures.reduce((s, f) => s + f.montantTotal, 0).toFixed(2),
      paye: factures.reduce((s, f) => s + f.montantPaye, 0).toFixed(2),
    });

    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',
      `attachment; filename="rapport_${type}_${annee}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
// src/controllers/medicamentController.js
const fetch = require('node-fetch');

// GET /api/medicaments/recherche?nom=paracetamol
exports.rechercheMedicament = async (req, res) => {
  try {
    const { nom } = req.query;

    if (!nom || nom.length < 2) {
      return res.status(400).json({ message: 'Nom du médicament trop court' });
    }

    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${nom}"&limit=10`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.json({ medicaments: [] });
    }

    const medicaments = data.results.map(item => ({
      nom: item.openfda?.brand_name?.[0] || 'Inconnu',
      substance: item.openfda?.substance_name?.[0] || 'Inconnu',
      fabricant: item.openfda?.manufacturer_name?.[0] || 'Inconnu',
      dosage: item.dosage_and_administration?.[0] || 'Voir notice',
    }));

    res.json({ medicaments });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};
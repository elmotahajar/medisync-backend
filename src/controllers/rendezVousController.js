const { DataTypes } = require('sequelize');

let RendezVous = [];
let nextId = 1;

// Créer un rendez-vous
exports.createRendezVous = async (req, res) => {
  try {
    const { medecinId, date, heure, motif } = req.body;
    const patientId = req.user.id;

    const rdv = {
      id: nextId++,
      patientId,
      medecinId,
      date,
      heure,
      motif,
      statut: 'confirmé'
    };

    RendezVous.push(rdv);

    res.status(201).json({
      message: 'Rendez-vous créé avec succès !',
      rendezVous: rdv
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Obtenir tous les rendez-vous
exports.getRendezVous = async (req, res) => {
  try {
    const userRdv = RendezVous.filter(rdv => 
      rdv.patientId === req.user.id || req.user.role === 'medecin' || req.user.role === 'secretaire'
    );
    res.json({ rendezVous: userRdv });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Modifier un rendez-vous
exports.updateRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, heure, motif } = req.body;

    const index = RendezVous.findIndex(rdv => rdv.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    RendezVous[index] = { ...RendezVous[index], date, heure, motif };

    res.json({
      message: 'Rendez-vous modifié avec succès !',
      rendezVous: RendezVous[index]
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Annuler un rendez-vous
exports.cancelRendezVous = async (req, res) => {
  try {
    const { id } = req.params;

    const index = RendezVous.findIndex(rdv => rdv.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    RendezVous[index].statut = 'annulé';

    res.json({ message: 'Rendez-vous annulé avec succès !' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
// POST /api/rendez-vous/urgence
exports.creerRdvUrgence = async (req, res) => {
  try {
    const { patientId, medecinId, motif, notes } = req.body;

    if (!patientId || !medecinId) {
      return res.status(400).json({ message: 'patientId et medecinId sont obligatoires' });
    }

    // Heure actuelle + 15 minutes
    const maintenant = new Date();
    const dateHeure = new Date(maintenant.getTime() + 15 * 60 * 1000);

    const rdvUrgence = await RendezVous.create({
      patientId,
      medecinId,
      dateHeure,
      motif: motif || 'Urgence',
      statut: 'confirme',
      typeConsultation: 'urgence',
      notes: notes || '',
      rappel24hEnvoye: true, // pas de rappel pour urgence
      rappel1hEnvoye: true,
    });

    res.status(201).json({ 
      message: '🚨 RDV urgence créé avec succès', 
      rdv: rdvUrgence,
      heure: dateHeure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};
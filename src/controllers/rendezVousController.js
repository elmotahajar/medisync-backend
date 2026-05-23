const { envoyerConfirmationRDV, envoyerAnnulationRDV } = require('./emailController');

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
    await envoyerConfirmationRDV(req.user.email, rdv);

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
    await envoyerAnnulationRDV(req.user.email, RendezVous[index]);

    res.json({ message: 'Rendez-vous annulé avec succès !' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Créer un rendez-vous pour un tiers
exports.createRendezVousTiers = async (req, res) => {
  try {
    const { medecinId, date, heure, motif, tiers } = req.body;
    const patientId = req.user.id;

    const rdv = {
      id: nextId++,
      patientId,
      medecinId,
      date,
      heure,
      motif,
      statut: 'confirmé',
      tiers: {
        nom: tiers.nom,
        prenom: tiers.prenom,
        dateNaissance: tiers.dateNaissance,
        relation: tiers.relation
      }
    };

    RendezVous.push(rdv);
    await envoyerConfirmationRDV(req.user.email, rdv);

    res.status(201).json({
      message: 'Rendez-vous créé pour le tiers avec succès !',
      rendezVous: rdv
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
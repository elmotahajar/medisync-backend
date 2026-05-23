// Obtenir le dossier médical du patient
exports.getDossier = async (req, res) => {
  try {
    const patientId = req.user.id;
    res.json({
      message: 'Dossier médical',
      dossier: {
        patientId,
        historique: [],
        allergies: [],
        antecedents: [],
        ordonnances: [],
        documents: []
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Obtenir les ordonnances du patient
exports.getOrdonnances = async (req, res) => {
  try {
    const patientId = req.user.id;
    res.json({
      message: 'Ordonnances',
      ordonnances: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Obtenir l'historique des consultations
exports.getHistorique = async (req, res) => {
  try {
    const patientId = req.user.id;
    res.json({
      message: 'Historique des consultations',
      historique: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Uploader un document médical
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    const patientId = req.user.id;
    const document = {
      patientId,
      nom: req.file.originalname,
      type: req.file.mimetype,
      taille: req.file.size,
      chemin: req.file.path,
      dateUpload: new Date()
    };

    res.status(201).json({
      message: 'Document uploadé avec succès !',
      document
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
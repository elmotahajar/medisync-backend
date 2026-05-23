let Feedbacks = [];
let nextId = 1;

// Laisser un feedback
exports.createFeedback = async (req, res) => {
  try {
    const { medecinId, note, commentaire } = req.body;
    const patientId = req.user.id;

    if (note < 1 || note > 5) {
      return res.status(400).json({ message: 'La note doit être entre 1 et 5' });
    }

    const feedback = {
      id: nextId++,
      patientId,
      medecinId,
      note,
      commentaire,
      date: new Date()
    };

    Feedbacks.push(feedback);

    res.status(201).json({
      message: 'Feedback envoyé avec succès !',
      feedback
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Obtenir les feedbacks d'un médecin
exports.getFeedbacksMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const feedbacks = Feedbacks.filter(f => f.medecinId === parseInt(medecinId));
    
    const moyenneNote = feedbacks.length > 0 
      ? feedbacks.reduce((acc, f) => acc + f.note, 0) / feedbacks.length 
      : 0;

    res.json({
      feedbacks,
      moyenneNote: moyenneNote.toFixed(1),
      totalAvis: feedbacks.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Signaler un problème
exports.signalerProbleme = async (req, res) => {
  try {
    const { medecinId, description } = req.body;
    const patientId = req.user.id;

    res.status(201).json({
      message: 'Problème signalé avec succès !',
      signalement: { patientId, medecinId, description, date: new Date() }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');
const medecinRoutes = require('./routes/medecinRoutes'); // ✅ ajoute cette ligne
const { demarrerTacheNotifications } = require('./controllers/notificationController');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MediSync API is running !' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rendez-vous', rendezVousRoutes);
app.use('/api/medecin', medecinRoutes); // ✅ ajoute cette ligne

const PORT = process.env.PORT || 3000;
demarrerTacheNotifications();
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
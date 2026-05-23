const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');
const patientRoutes = require('./routes/patientRoutes');
const secretaireRoutes = require('./routes/secretaireRoutes');
const adminRoutes = require('./routes/adminRoutes');
const medecinRoutes = require('./routes/medecinRoutes');
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
app.use('/api/patient', patientRoutes);
app.use('/api/secretaire', secretaireRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medecin', medecinRoutes);

const PORT = process.env.PORT || 3000;
demarrerTacheNotifications();
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
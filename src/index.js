const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
const express = require('express');
const router = express.Router();

// Rotas temporárias de dashboard
router.get('/', (req, res) => {
  res.json({ message: 'Dashboard - em desenvolvimento' });
});

router.get('/stats', (req, res) => {
  res.json({ message: 'Estatísticas do dashboard - em desenvolvimento' });
});

router.get('/recent-patients', (req, res) => {
  res.json({ message: 'Pacientes recentes - em desenvolvimento' });
});

router.get('/recent-appointments', (req, res) => {
  res.json({ message: 'Agendamentos recentes - em desenvolvimento' });
});

router.get('/documents-by-category', (req, res) => {
  res.json({ message: 'Documentos por categoria - em desenvolvimento' });
});

module.exports = router;
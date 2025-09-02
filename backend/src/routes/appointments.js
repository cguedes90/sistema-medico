const express = require('express');
const router = express.Router();

// Rotas temporárias - será substituído pelo arquivo completo
router.get('/', (req, res) => {
  res.json({ message: 'Rotas de agendamentos - em desenvolvimento' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Rota de agendamento por ID - em desenvolvimento' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Rota de criação de agendamento - em desenvolvimento' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Rota de atualização de agendamento - em desenvolvimento' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Rota de exclusão de agendamento - em desenvolvimento' });
});

module.exports = router;
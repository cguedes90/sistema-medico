const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { auth, requireRole } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(auth);

// Rotas para receitas digitais
router.post('/', 
  requireRole(['admin', 'doctor']), 
  prescriptionController.create
);

router.get('/', prescriptionController.getAll);

router.get('/stats', prescriptionController.getStats);

router.get('/:id', prescriptionController.getById);

router.post('/verify', prescriptionController.verify);

router.put('/:id/dispense', 
  requireRole(['admin', 'doctor', 'nurse']), 
  prescriptionController.dispense
);

router.put('/:id/cancel', 
  requireRole(['admin', 'doctor']), 
  prescriptionController.cancel
);

router.get('/patient/:patient_id', prescriptionController.getByPatient);

module.exports = router;
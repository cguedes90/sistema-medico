const express = require('express');
const router = express.Router();
const medicalCertificateController = require('../controllers/medicalCertificateController');
const auth = require('../middleware/auth');

// Criar atestado médico
router.post('/', auth, medicalCertificateController.create);

// Listar atestados médicos
router.get('/', auth, medicalCertificateController.getAll);

// Buscar atestado médico por ID
router.get('/:id', auth, medicalCertificateController.getById);

// Cancelar atestado médico
router.put('/:id/cancel', auth, medicalCertificateController.cancel);

// Verificar atestado médico (público)
router.post('/verify', medicalCertificateController.verify);

// Note: Delete method not implemented yet

module.exports = router;
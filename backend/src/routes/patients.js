const express = require('express');
const { body } = require('express-validator');
const patientController = require('../controllers/patientController');
const { auth, requireDoctor } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validações
const createPatientValidation = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail(),
  
  body('cpf')
    .notEmpty()
    .withMessage('CPF é obrigatório')
    .isLength({ min: 11, max: 14 })
    .withMessage('CPF inválido'),
  
  body('rg')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('RG inválido'),
  
  body('birth_date')
    .notEmpty()
    .withMessage('Data de nascimento é obrigatória')
    .isISO8601()
    .withMessage('Data de nascimento inválida'),
  
  body('gender')
    .notEmpty()
    .withMessage('Gênero é obrigatório')
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gênero inválido'),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  
  body('blood_type')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Tipo sanguíneo inválido'),
  
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Alergias deve ser um array'),
  
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medicamentos deve ser um array'),
  
  body('pre_existing_conditions')
    .optional()
    .isArray()
    .withMessage('Condições pré-existentes deve ser um array'),
  
  body('family_history')
    .optional()
    .isArray()
    .withMessage('Histórico familiar deve ser um array'),
  
  body('privacy_consent')
    .optional()
    .isBoolean()
    .withMessage('Consentimento de privacidade deve ser booleano')
];

const updatePatientValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail(),
  
  body('cpf')
    .optional()
    .isLength({ min: 11, max: 14 })
    .withMessage('CPF inválido'),
  
  body('rg')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('RG inválido'),
  
  body('birth_date')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento inválida'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gênero inválido'),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  
  body('blood_type')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Tipo sanguíneo inválido'),
  
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Alergias deve ser um array'),
  
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medicamentos deve ser um array'),
  
  body('pre_existing_conditions')
    .optional()
    .isArray()
    .withMessage('Condições pré-existentes deve ser um array'),
  
  body('family_history')
    .optional()
    .isArray()
    .withMessage('Histórico familiar deve ser um array'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'deceased'])
    .withMessage('Status inválido'),
  
  body('privacy_consent')
    .optional()
    .isBoolean()
    .withMessage('Consentimento de privacidade deve ser booleano')
];

// Rotas públicas (apenas leitura)
router.get('/', auth, asyncHandler(patientController.getAllPatients));
router.get('/:id', auth, asyncHandler(patientController.getPatientById));
router.get('/:id/timeline', auth, asyncHandler(patientController.getPatientTimeline));
router.get('/:id/report', auth, asyncHandler(patientController.generatePatientReport));

// Rotas privadas (escrita)
router.post('/', 
  auth, 
  requireDoctor, 
  createPatientValidation, 
  asyncHandler(patientController.createPatient)
);

router.put('/:id', 
  auth, 
  requireDoctor, 
  updatePatientValidation, 
  asyncHandler(patientController.updatePatient)
);

router.delete('/:id', 
  auth, 
  requireDoctor, 
  asyncHandler(patientController.deletePatient)
);

module.exports = router;
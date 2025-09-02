const express = require('express');
const { body } = require('express-validator');
const noteController = require('../controllers/noteController');
const { auth, requireDoctor } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validações
const createNoteValidation = [
  body('patient_id')
    .isUUID()
    .withMessage('ID do paciente inválido'),
  
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),
  
  body('content')
    .notEmpty()
    .withMessage('Conteúdo é obrigatório')
    .isLength({ min: 10 })
    .withMessage('Conteúdo deve ter no mínimo 10 caracteres'),
  
  body('type')
    .isIn(['consultation', 'examination', 'prescription', 'procedure', 'follow_up', 'emergency', 'general', 'lab_result', 'imaging', 'surgery'])
    .withMessage('Tipo inválido'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Prioridade inválida'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Status inválido'),
  
  body('appointment_id')
    .optional()
    .isUUID()
    .withMessage('ID do agendamento inválido'),
  
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Sintomas deve ser um array'),
  
  body('diagnosis')
    .optional()
    .isArray()
    .withMessage('Diagnóstico deve ser um array'),
  
  body('treatment_plan')
    .optional()
    .isObject()
    .withMessage('Plano de tratamento deve ser um objeto'),
  
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medicamentos deve ser um array'),
  
  body('vital_signs')
    .optional()
    .isObject()
    .withMessage('Sinais vitais deve ser um objeto'),
  
  body('is_confidential')
    .optional()
    .isBoolean()
    .withMessage('É confidencial deve ser booleano'),
  
  body('follow_up_required')
    .optional()
    .isBoolean()
    .withMessage('Requer acompanhamento deve ser booleano'),
  
  body('follow_up_date')
    .optional()
    .isISO8601()
    .withMessage('Data de acompanhamento inválida')
];

const updateNoteValidation = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),
  
  body('content')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Conteúdo deve ter no mínimo 10 caracteres'),
  
  body('type')
    .optional()
    .isIn(['consultation', 'examination', 'prescription', 'procedure', 'follow_up', 'emergency', 'general', 'lab_result', 'imaging', 'surgery'])
    .withMessage('Tipo inválido'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Prioridade inválida'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Status inválido'),
  
  body('appointment_id')
    .optional()
    .isUUID()
    .withMessage('ID do agendamento inválido'),
  
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Sintomas deve ser um array'),
  
  body('diagnosis')
    .optional()
    .isArray()
    .withMessage('Diagnóstico deve ser um array'),
  
  body('treatment_plan')
    .optional()
    .isObject()
    .withMessage('Plano de tratamento deve ser um objeto'),
  
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medicamentos deve ser um array'),
  
  body('vital_signs')
    .optional()
    .isObject()
    .withMessage('Sinais vitais deve ser um objeto'),
  
  body('is_confidential')
    .optional()
    .isBoolean()
    .withMessage('É confidencial deve ser booleano'),
  
  body('follow_up_required')
    .optional()
    .isBoolean()
    .withMessage('Requer acompanhamento deve ser booleano'),
  
  body('follow_up_date')
    .optional()
    .isISO8601()
    .withMessage('Data de acompanhamento inválida')
];

// Rotas públicas (apenas leitura)
router.get('/', auth, asyncHandler(noteController.getAllNotes));
router.get('/:id', auth, asyncHandler(noteController.getNoteById));
router.get('/patient/:patient_id', auth, asyncHandler(noteController.getPatientNotes));
router.get('/author/:author_id', auth, asyncHandler(noteController.getAuthorNotes));
router.get('/search', auth, asyncHandler(noteController.searchNotes));

// Rotas privadas (escrita)
router.post('/', 
  auth, 
  requireDoctor, 
  createNoteValidation, 
  asyncHandler(noteController.createNote)
);

router.put('/:id', 
  auth, 
  requireDoctor, 
  updateNoteValidation, 
  asyncHandler(noteController.updateNote)
);

router.delete('/:id', 
  auth, 
  requireDoctor, 
  asyncHandler(noteController.deleteNote)
);

module.exports = router;
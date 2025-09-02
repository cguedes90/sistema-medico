const express = require('express');
const { body } = require('express-validator');
const documentController = require('../controllers/documentController');
const { auth, requireDoctor } = require('../middleware/auth');
const { asyncUpload } = require('../services/fileUploadService');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validações
const uploadDocumentValidation = [
  body('patient_id')
    .isUUID()
    .withMessage('ID do paciente inválido'),
  
  body('category')
    .isIn(['exame', 'receita', 'laudo', 'atestado', 'prontuario', 'imagem', 'outro'])
    .withMessage('Categoria inválida'),
  
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags deve ser um array'),
  
  body('is_sensitive')
    .optional()
    .isBoolean()
    .withMessage('É sensível deve ser booleano')
];

const updateDocumentValidation = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  
  body('category')
    .optional()
    .isIn(['exame', 'receita', 'laudo', 'atestado', 'prontuario', 'imagem', 'outro'])
    .withMessage('Categoria inválida'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags deve ser um array'),
  
  body('is_sensitive')
    .optional()
    .isBoolean()
    .withMessage('É sensível deve ser booleano'),
  
  body('access_level')
    .optional()
    .isIn(['public', 'private', 'confidential'])
    .withMessage('Nível de acesso inválido')
];

// Rotas públicas (apenas leitura)
router.get('/', auth, asyncHandler(documentController.getAllDocuments));
router.get('/:id', auth, asyncHandler(documentController.getDocumentById));
router.get('/patient/:patient_id', auth, asyncHandler(documentController.getPatientDocuments));

// Rotas privadas (escrita)
router.post('/upload', 
  auth, 
  requireDoctor, 
  uploadDocumentValidation, 
  asyncUpload, 
  asyncHandler(documentController.uploadDocument)
);

router.put('/:id', 
  auth, 
  requireDoctor, 
  updateDocumentValidation, 
  asyncHandler(documentController.updateDocument)
);

router.delete('/:id', 
  auth, 
  requireDoctor, 
  asyncHandler(documentController.deleteDocument)
);

router.get('/:id/download', 
  auth, 
  asyncHandler(documentController.downloadDocument)
);

module.exports = router;
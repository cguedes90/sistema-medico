const express = require('express');
const aiController = require('../controllers/aiController');
const { auth, requireDoctor } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Analisar documento médico
router.post('/analyze-document/:document_id', 
  auth, 
  requireDoctor, 
  asyncHandler(aiController.analyzeDocument)
);

// Gerar insights do histórico do paciente
router.post('/generate-insights/:patient_id', 
  auth, 
  requireDoctor, 
  asyncHandler(aiController.generatePatientInsights)
);

// Gerar recomendações personalizadas
router.post('/recommendations/:patient_id', 
  auth, 
  requireDoctor, 
  asyncHandler(aiController.generateRecommendations)
);

// Analisar sintomas
router.post('/analyze-symptoms', 
  auth, 
  requireDoctor, 
  asyncHandler(aiController.analyzeSymptoms)
);

module.exports = router;
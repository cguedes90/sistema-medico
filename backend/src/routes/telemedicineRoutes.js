const express = require('express');
const router = express.Router();
const telemedicineController = require('../controllers/telemedicineController');
const { auth, requireRole } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(auth);

// Rotas para sessões de telemedicina
router.post('/sessions', 
  requireRole(['admin', 'doctor']), 
  telemedicineController.createSession
);

router.get('/sessions', telemedicineController.getAllSessions);

router.get('/sessions/stats', telemedicineController.getStats);

router.get('/sessions/:id', telemedicineController.getSessionById);

router.put('/sessions/:id/start', 
  requireRole(['admin', 'doctor']), 
  telemedicineController.startSession
);

router.put('/sessions/:id/end', 
  requireRole(['admin', 'doctor']), 
  telemedicineController.endSession
);

router.get('/sessions/patient/:patient_id', telemedicineController.getSessionsByPatient);

// Rotas para chat
router.post('/sessions/:session_id/messages', telemedicineController.sendMessage);

router.get('/sessions/:session_id/messages', telemedicineController.getChatMessages);

router.put('/sessions/:session_id/messages/read', telemedicineController.markMessagesAsRead);

module.exports = router;
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// GET /api/appointments - Listar todos os agendamentos
router.get('/', 
  auth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('patient_id').optional().isUUID(),
    query('doctor_id').optional().isUUID(),
    query('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
    query('type').optional().isIn(['consultation', 'examination', 'procedure', 'follow_up', 'emergency']),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601()
  ],
  appointmentController.getAllAppointments
);

// GET /api/appointments/:id - Obter agendamento por ID
router.get('/:id', 
  auth,
  [
    param('id').isUUID()
  ],
  appointmentController.getAppointmentById
);

// POST /api/appointments - Criar novo agendamento
router.post('/', 
  auth,
  [
    body('patient_id').isUUID().withMessage('ID do paciente inválido'),
    body('doctor_id').isUUID().withMessage('ID do médico inválido'),
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('start_time').isISO8601().withMessage('Data de início inválida'),
    body('end_time').isISO8601().withMessage('Data de término inválida'),
    body('type').optional().isIn(['consultation', 'examination', 'procedure', 'follow_up', 'emergency']),
    body('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('duration').optional().isInt({ min: 1 }),
    body('reason').optional().isString(),
    body('notes').optional().isString()
  ],
  appointmentController.createAppointment
);

// PUT /api/appointments/:id - Atualizar agendamento
router.put('/:id', 
  auth,
  [
    param('id').isUUID(),
    body('title').optional().notEmpty(),
    body('start_time').optional().isISO8601(),
    body('end_time').optional().isISO8601(),
    body('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
    body('type').optional().isIn(['consultation', 'examination', 'procedure', 'follow_up', 'emergency']),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('duration').optional().isInt({ min: 1 }),
    body('reason').optional().isString(),
    body('notes').optional().isString()
  ],
  appointmentController.updateAppointment
);

// DELETE /api/appointments/:id - Excluir agendamento
router.delete('/:id', 
  auth,
  [
    param('id').isUUID()
  ],
  appointmentController.deleteAppointment
);

// GET /api/appointments/upcoming - Obter próximos agendamentos
router.get('/upcoming', 
  auth,
  [
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  appointmentController.getUpcomingAppointments
);

// GET /api/appointments/today - Obter agendamentos de hoje
router.get('/today', 
  auth,
  appointmentController.getTodayAppointments
);

// POST /api/appointments/:id/cancel - Cancelar agendamento
router.post('/:id/cancel', 
  auth,
  [
    param('id').isUUID(),
    body('reason').optional().isString()
  ],
  appointmentController.cancelAppointment
);

// POST /api/appointments/:id/confirm - Confirmar agendamento
router.post('/:id/confirm', 
  auth,
  [
    param('id').isUUID()
  ],
  appointmentController.confirmAppointment
);

// GET /api/appointments/calendar - Obter agendamentos para calendário
router.get('/calendar', 
  auth,
  [
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601()
  ],
  appointmentController.getCalendarAppointments
);

module.exports = router;
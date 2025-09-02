const { TelemedicineSession, TelemedicineChat, Patient, User, Appointment } = require('../models');
const { Op } = require('sequelize');

const telemedicineController = {
  // Criar nova sessão de telemedicina
  createSession: async (req, res) => {
    try {
      const { appointment_id, patient_id } = req.body;
      const doctor_id = req.user.id;

      // Verificar se o agendamento existe
      const appointment = await Appointment.findByPk(appointment_id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      // Verificar se já existe uma sessão para este agendamento
      const existingSession = await TelemedicineSession.findOne({
        where: { appointment_id }
      });

      if (existingSession) {
        return res.json({
          success: true,
          message: 'Sessão já existe para este agendamento',
          data: existingSession
        });
      }

      // Criar nova sessão
      const session = await TelemedicineSession.create({
        appointment_id,
        doctor_id,
        patient_id,
        status: 'scheduled'
      });

      // Buscar sessão completa com relacionamentos
      const fullSession = await TelemedicineSession.findByPk(session.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment' }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Sessão de telemedicina criada com sucesso',
        data: fullSession
      });
    } catch (error) {
      console.error('Erro ao criar sessão de telemedicina:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Iniciar sessão (entrar na sala)
  startSession: async (req, res) => {
    try {
      const { id } = req.params;
      const { room_url } = req.body;

      const session = await TelemedicineSession.findByPk(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      if (session.status !== 'scheduled' && session.status !== 'waiting') {
        return res.status(400).json({
          success: false,
          message: 'Sessão não pode ser iniciada neste estado'
        });
      }

      // Atualizar sessão para ativa
      await session.update({
        status: 'active',
        started_at: new Date(),
        room_url: room_url || session.room_url
      });

      const updatedSession = await TelemedicineSession.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment' }
        ]
      });

      res.json({
        success: true,
        message: 'Sessão iniciada com sucesso',
        data: updatedSession
      });
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Finalizar sessão
  endSession: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        session_notes, 
        quality_rating, 
        technical_issues, 
        follow_up_required, 
        follow_up_date 
      } = req.body;

      const session = await TelemedicineSession.findByPk(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      if (session.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Apenas sessões ativas podem ser finalizadas'
        });
      }

      // Atualizar sessão para finalizada
      await session.update({
        status: 'completed',
        ended_at: new Date(),
        session_notes,
        quality_rating,
        technical_issues,
        follow_up_required,
        follow_up_date
      });

      const updatedSession = await TelemedicineSession.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment' }
        ]
      });

      res.json({
        success: true,
        message: 'Sessão finalizada com sucesso',
        data: updatedSession
      });
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Listar sessões
  getAllSessions: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, date_from, date_to } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (date_from || date_to) {
        where.createdAt = {};
        if (date_from) where.createdAt[Op.gte] = new Date(date_from);
        if (date_to) where.createdAt[Op.lte] = new Date(date_to);
      }

      const sessions = await TelemedicineSession.findAndCountAll({
        where,
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: sessions.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: sessions.count,
          total_pages: Math.ceil(sessions.count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Buscar sessão por ID
  getSessionById: async (req, res) => {
    try {
      const { id } = req.params;

      const session = await TelemedicineSession.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment' },
          { 
            model: TelemedicineChat, 
            as: 'chatMessages',
            include: [
              { model: User, as: 'sender' }
            ],
            order: [['createdAt', 'ASC']]
          }
        ]
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Enviar mensagem no chat
  sendMessage: async (req, res) => {
    try {
      const { session_id } = req.params;
      const { message, message_type = 'text', file_url } = req.body;
      const sender_id = req.user.id;

      // Verificar se a sessão existe e está ativa
      const session = await TelemedicineSession.findByPk(session_id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      // Determinar tipo de remetente
      const sender_type = session.doctor_id === sender_id ? 'doctor' : 'patient';

      // Criar mensagem
      const chatMessage = await TelemedicineChat.create({
        session_id,
        sender_id,
        sender_type,
        message,
        message_type,
        file_url
      });

      // Buscar mensagem completa com relacionamentos
      const fullMessage = await TelemedicineChat.findByPk(chatMessage.id, {
        include: [
          { model: User, as: 'sender' }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: fullMessage
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Buscar mensagens do chat
  getChatMessages: async (req, res) => {
    try {
      const { session_id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const messages = await TelemedicineChat.findAndCountAll({
        where: { session_id },
        include: [
          { model: User, as: 'sender' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'ASC']]
      });

      res.json({
        success: true,
        data: messages.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: messages.count,
          total_pages: Math.ceil(messages.count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Marcar mensagens como lidas
  markMessagesAsRead: async (req, res) => {
    try {
      const { session_id } = req.params;
      const user_id = req.user.id;

      await TelemedicineChat.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            session_id,
            sender_id: { [Op.ne]: user_id },
            is_read: false
          }
        }
      );

      res.json({
        success: true,
        message: 'Mensagens marcadas como lidas'
      });
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Estatísticas de telemedicina
  getStats: async (req, res) => {
    try {
      const totalSessions = await TelemedicineSession.count();
      const activeSessions = await TelemedicineSession.count({ where: { status: 'active' } });
      const completedSessions = await TelemedicineSession.count({ where: { status: 'completed' } });
      const scheduledSessions = await TelemedicineSession.count({ where: { status: 'scheduled' } });

      // Sessões dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSessions = await TelemedicineSession.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });

      // Duração média das sessões
      const completedSessionsWithDuration = await TelemedicineSession.findAll({
        where: { 
          status: 'completed',
          duration_minutes: { [Op.ne]: null }
        },
        attributes: ['duration_minutes']
      });

      const averageDuration = completedSessionsWithDuration.length > 0
        ? completedSessionsWithDuration.reduce((sum, session) => sum + session.duration_minutes, 0) / completedSessionsWithDuration.length
        : 0;

      res.json({
        success: true,
        data: {
          total: totalSessions,
          active: activeSessions,
          completed: completedSessions,
          scheduled: scheduledSessions,
          recent: recentSessions,
          average_duration_minutes: Math.round(averageDuration)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de telemedicina:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Buscar sessões por paciente
  getSessionsByPatient: async (req, res) => {
    try {
      const { patient_id } = req.params;
      const { status } = req.query;

      const where = { patient_id };
      if (status) where.status = status;

      const sessions = await TelemedicineSession.findAll({
        where,
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment' }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Erro ao buscar sessões do paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = telemedicineController;
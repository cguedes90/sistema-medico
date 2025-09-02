const { Note, Patient, User, Appointment } = require('../models');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

// Obter todas as anotações
const getAllNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, patient_id, author_id, type, priority, status, search, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { deleted_at: null };
    
    if (patient_id) {
      whereClause.patient_id = patient_id;
    }
    
    if (author_id) {
      whereClause.author_id = author_id;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (priority) {
      whereClause.priority = priority;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.$or = [
        { title: { $ilike: `%${search}%` } },
        { content: { $ilike: `%${search}%` } }
      ];
    }

    const { count, rows: notes } = await Note.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'scheduled_for', 'type', 'status']
        }
      ],
      attributes: { exclude: ['deleted_at'] },
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao obter anotações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter anotações'
    });
  }
};

// Obter anotação por ID
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'scheduled_for', 'type', 'status']
        }
      ],
      attributes: { exclude: ['deleted_at'] }
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Anotação não encontrada'
      });
    }

    res.json({
      success: true,
      data: { note }
    });

  } catch (error) {
    logger.error('Erro ao obter anotação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter anotação'
    });
  }
};

// Criar nova anotação
const createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const noteData = {
      ...req.body,
      author_id: req.user.id
    };

    // Validar paciente
    const patient = await Patient.findByPk(noteData.patient_id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    // Validar agendamento (se fornecido)
    if (noteData.appointment_id) {
      const appointment = await Appointment.findByPk(noteData.appointment_id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Agendamento não encontrado'
        });
      }
      
      // Verificar se o agendamento pertence ao paciente
      if (appointment.patient_id !== noteData.patient_id) {
        return res.status(400).json({
          success: false,
          error: 'O agendamento não pertence a este paciente'
        });
      }
    }

    const note = await Note.create(noteData);

    logger.info(`Nova anotação criada: ${note.title} para paciente ${patient.name}`);

    res.status(201).json({
      success: true,
      message: 'Anotação criada com sucesso',
      data: { note }
    });

  } catch (error) {
    logger.error('Erro ao criar anotação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar anotação'
    });
  }
};

// Atualizar anotação
const updateNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const note = await Note.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient'
        }
      ]
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Anotação não encontrada'
      });
    }

    // Verificar permissão
    if (note.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Você não tem permissão para atualizar esta anotação.'
      });
    }

    // Validar agendamento (se fornecido)
    if (updateData.appointment_id) {
      const appointment = await Appointment.findByPk(updateData.appointment_id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Agendamento não encontrado'
        });
      }
      
      // Verificar se o agendamento pertence ao paciente
      if (appointment.patient_id !== note.patient_id) {
        return res.status(400).json({
          success: false,
          error: 'O agendamento não pertence a este paciente'
        });
      }
    }

    await note.update(updateData);

    logger.info(`Anotação atualizada: ${note.title} para paciente ${note.patient.name}`);

    res.json({
      success: true,
      message: 'Anotação atualizada com sucesso',
      data: { note }
    });

  } catch (error) {
    logger.error('Erro ao atualizar anotação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar anotação'
    });
  }
};

// Excluir anotação
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient'
        }
      ]
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Anotação não encontrada'
      });
    }

    // Verificar permissão
    if (note.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Você não tem permissão para excluir esta anotação.'
      });
    }

    await note.update({ deleted_at: new Date() });

    logger.info(`Anotação excluída: ${note.title} para paciente ${note.patient.name}`);

    res.json({
      success: true,
      message: 'Anotação excluída com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao excluir anotação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir anotação'
    });
  }
};

// Obter anotações do paciente
const getPatientNotes = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { type, priority, status, sort = 'created_at', order = 'DESC' } = req.query;

    const whereClause = { 
      patient_id,
      deleted_at: null 
    };

    if (type) {
      whereClause.type = type;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (status) {
      whereClause.status = status;
    }

    const notes = await Note.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'scheduled_for', 'type', 'status']
        }
      ],
      attributes: { exclude: ['deleted_at'] },
      order: [[sort, order]]
    });

    res.json({
      success: true,
      data: { notes }
    });

  } catch (error) {
    logger.error('Erro ao obter anotações do paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter anotações do paciente'
    });
  }
};

// Obter anotações do autor
const getAuthorNotes = async (req, res) => {
  try {
    const { author_id } = req.params;
    const { type, priority, status, sort = 'created_at', order = 'DESC' } = req.query;

    const whereClause = { 
      author_id,
      deleted_at: null 
    };

    if (type) {
      whereClause.type = type;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (status) {
      whereClause.status = status;
    }

    const notes = await Note.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'scheduled_for', 'type', 'status']
        }
      ],
      attributes: { exclude: ['deleted_at'] },
      order: [[sort, order]]
    });

    res.json({
      success: true,
      data: { notes }
    });

  } catch (error) {
    logger.error('Erro ao obter anotações do autor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter anotações do autor'
    });
  }
};

// Buscar anotações
const searchNotes = async (req, res) => {
  try {
    const { q, patient_id, type, priority, limit = 20 } = req.query;

    const whereClause = { deleted_at: null };
    
    if (patient_id) {
      whereClause.patient_id = patient_id;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (priority) {
      whereClause.priority = priority;
    }

    if (q) {
      whereClause.$or = [
        { title: { $ilike: `%${q}%` } },
        { content: { $ilike: `%${q}%` } },
        { symptoms: { $contains: [q] } },
        { diagnosis: { $contains: [q] } }
      ];
    }

    const notes = await Note.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      attributes: { exclude: ['deleted_at'] },
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { notes }
    });

  } catch (error) {
    logger.error('Erro ao buscar anotações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar anotações'
    });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getPatientNotes,
  getAuthorNotes,
  searchNotes
};
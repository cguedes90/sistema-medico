const { Appointment, Patient, User } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Obter todos os agendamentos
exports.getAllAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      patient_id,
      doctor_id,
      status,
      type,
      start_date,
      end_date,
      sort = 'start_time',
      order = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtrar por paciente
    if (patient_id) where.patient_id = patient_id;

    // Filtrar por médico
    if (doctor_id) where.doctor_id = doctor_id;

    // Filtrar por status
    if (status) where.status = status;

    // Filtrar por tipo
    if (type) where.type = type;

    // Filtrar por período
    if (start_date || end_date) {
      where.start_time = {};
      if (start_date) where.start_time[Op.gte] = new Date(start_date);
      if (end_date) where.start_time[Op.lte] = new Date(end_date);
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email', 'specialty']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['created_by']
      },
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter agendamentos',
      error: error.message
    });
  }
};

// Obter agendamento por ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [
            {
              model: User,
              as: 'primaryPhysician',
              attributes: ['id', 'name', 'email', 'specialty']
            }
          ]
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email', 'specialty', 'crm']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter agendamento',
      error: error.message
    });
  }
};

// Criar novo agendamento
exports.createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const appointmentData = {
      ...req.body,
      created_by: req.user.id
    };

    const appointment = await Appointment.create(appointmentData);

    // Buscar agendamento criado com relacionamentos
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email', 'specialty']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso',
      data: createdAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar agendamento',
      error: error.message
    });
  }
};

// Atualizar agendamento
exports.updateAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'admin' && appointment.doctor_id !== req.user.id && appointment.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    await appointment.update(req.body);

    // Buscar agendamento atualizado
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email', 'specialty']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar agendamento',
      error: error.message
    });
  }
};

// Excluir agendamento
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'admin' && appointment.doctor_id !== req.user.id && appointment.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    await appointment.destroy();

    res.json({
      success: true,
      message: 'Agendamento excluído com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir agendamento',
      error: error.message
    });
  }
};

// Obter próximos agendamentos
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const now = new Date();

    const appointments = await Appointment.findAll({
      where: {
        start_time: {
          [Op.gte]: now
        },
        status: {
          [Op.in]: ['scheduled', 'confirmed']
        }
      },
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email', 'specialty']
        }
      ],
      order: [['start_time', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter próximos agendamentos',
      error: error.message
    });
  }
};

// Obter agendamentos de hoje
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.findAll({
      where: {
        start_time: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email', 'specialty']
        }
      ],
      order: [['start_time', 'ASC']]
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter agendamentos de hoje',
      error: error.message
    });
  }
};

// Cancelar agendamento
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'admin' && appointment.doctor_id !== req.user.id && appointment.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    await appointment.update({
      status: 'cancelled',
      notes: reason ? `${appointment.notes || ''}\nMotivo do cancelamento: ${reason}` : appointment.notes
    });

    res.json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar agendamento',
      error: error.message
    });
  }
};

// Confirmar agendamento
exports.confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'admin' && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    await appointment.update({
      status: 'confirmed'
    });

    res.json({
      success: true,
      message: 'Agendamento confirmado com sucesso',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar agendamento',
      error: error.message
    });
  }
};

// Obter agendamentos para calendário
exports.getCalendarAppointments = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date && end_date) {
      where.start_time = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email', 'specialty']
        }
      ],
      attributes: ['id', 'title', 'start_time', 'end_time', 'status', 'type', 'priority']
    });

    // Formatar para calendário
    const calendarEvents = appointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.title} - ${appointment.patient.name}`,
      start: appointment.start_time,
      end: appointment.end_time,
      status: appointment.status,
      type: appointment.type,
      priority: appointment.priority,
      patient: appointment.patient,
      doctor: appointment.doctor
    }));

    res.json({
      success: true,
      data: calendarEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter agendamentos do calendário',
      error: error.message
    });
  }
};
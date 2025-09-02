const { Patient, User } = require('../models');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

// Obter todos os pacientes
const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { deleted_at: null };
    
    if (search) {
      whereClause.$or = [
        { name: { $ilike: `%${search}%` } },
        { email: { $ilike: `%${search}%` } },
        { cpf: { $ilike: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'primaryPhysician',
          attributes: ['id', 'name', 'crm', 'specialty']
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
        patients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao obter pacientes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter pacientes'
    });
  }
};

// Obter paciente por ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          as: 'primaryPhysician',
          attributes: ['id', 'name', 'crm', 'specialty', 'phone']
        }
      ],
      attributes: { exclude: ['deleted_at'] }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    res.json({
      success: true,
      data: { patient }
    });

  } catch (error) {
    logger.error('Erro ao obter paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter paciente'
    });
  }
};

// Criar novo paciente
const createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const patientData = req.body;

    // Verificar se CPF já existe
    const existingCpf = await Patient.findOne({ 
      where: { 
        cpf: patientData.cpf,
        deleted_at: null 
      } 
    });

    if (existingCpf) {
      return res.status(409).json({
        success: false,
        error: 'CPF já cadastrado'
      });
    }

    // Verificar se RG já existe
    if (patientData.rg) {
      const existingRg = await Patient.findOne({ 
        where: { 
          rg: patientData.rg,
          deleted_at: null 
        } 
      });

      if (existingRg) {
        return res.status(409).json({
          success: false,
          error: 'RG já cadastrado'
        });
      }
    }

    // Verificar se e-mail já existe
    if (patientData.email) {
      const existingEmail = await Patient.findOne({ 
        where: { 
          email: patientData.email,
          deleted_at: null 
        } 
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: 'E-mail já cadastrado'
        });
      }
    }

    const patient = await Patient.create(patientData);

    logger.info(`Novo paciente criado: ${patient.name} (${patient.cpf})`);

    res.status(201).json({
      success: true,
      message: 'Paciente criado com sucesso',
      data: { patient }
    });

  } catch (error) {
    logger.error('Erro ao criar paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar paciente'
    });
  }
};

// Atualizar paciente
const updatePatient = async (req, res) => {
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

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    // Verificar se CPF já existe (se for alterado)
    if (updateData.cpf && updateData.cpf !== patient.cpf) {
      const existingCpf = await Patient.findOne({ 
        where: { 
          cpf: updateData.cpf,
          deleted_at: null 
        } 
      });

      if (existingCpf) {
        return res.status(409).json({
          success: false,
          error: 'CPF já cadastrado'
        });
      }
    }

    // Verificar se RG já existe (se for alterado)
    if (updateData.rg && updateData.rg !== patient.rg) {
      const existingRg = await Patient.findOne({ 
        where: { 
          rg: updateData.rg,
          deleted_at: null 
        } 
      });

      if (existingRg) {
        return res.status(409).json({
          success: false,
          error: 'RG já cadastrado'
        });
      }
    }

    // Verificar se e-mail já existe (se for alterado)
    if (updateData.email && updateData.email !== patient.email) {
      const existingEmail = await Patient.findOne({ 
        where: { 
          email: updateData.email,
          deleted_at: null 
        } 
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: 'E-mail já cadastrado'
        });
      }
    }

    await patient.update(updateData);

    logger.info(`Paciente atualizado: ${patient.name} (${patient.cpf})`);

    res.json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      data: { patient }
    });

  } catch (error) {
    logger.error('Erro ao atualizar paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar paciente'
    });
  }
};

// Excluir paciente (soft delete)
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    await patient.update({ deleted_at: new Date() });

    logger.info(`Paciente excluído: ${patient.name} (${patient.cpf})`);

    res.json({
      success: true,
      message: 'Paciente excluído com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao excluir paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir paciente'
    });
  }
};

// Obter timeline do paciente
const getPatientTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    // Usar a view patient_timeline
    const timeline = await sequelize.query(
      `SELECT * FROM patient_timeline 
       WHERE patient_id = :patient_id 
       ORDER BY event_date DESC 
       LIMIT :limit OFFSET :offset`,
      {
        replacements: { 
          patient_id: id, 
          limit: parseInt(limit), 
          offset: parseInt(offset) 
        },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: { timeline }
    });

  } catch (error) {
    logger.error('Erro ao obter timeline do paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter timeline do paciente'
    });
  }
};

// Gerar relatório do paciente
const generatePatientReport = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          as: 'primaryPhysician',
          attributes: ['id', 'name', 'crm', 'specialty']
        }
      ],
      attributes: { exclude: ['deleted_at'] }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    // Contar agendamentos
    const appointmentsCount = await sequelize.query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE patient_id = :patient_id AND deleted_at IS NULL`,
      {
        replacements: { patient_id: id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Contar documentos
    const documentsCount = await sequelize.query(
      `SELECT COUNT(*) as count FROM documents 
       WHERE patient_id = :patient_id AND deleted_at IS NULL`,
      {
        replacements: { patient_id: id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Contar anotações
    const notesCount = await sequelize.query(
      `SELECT COUNT(*) as count FROM notes 
       WHERE patient_id = :patient_id AND deleted_at IS NULL`,
      {
        replacements: { patient_id: id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Próximos agendamentos
    const upcomingAppointments = await sequelize.query(
      `SELECT * FROM appointments 
       WHERE patient_id = :patient_id AND deleted_at IS NULL 
       AND scheduled_for > CURRENT_TIMESTAMP 
       AND status IN ('scheduled', 'confirmed')
       ORDER BY scheduled_for ASC 
       LIMIT 5`,
      {
        replacements: { patient_id: id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const report = {
      patient,
      statistics: {
        appointmentsCount: appointmentsCount[0].count,
        documentsCount: documentsCount[0].count,
        notesCount: notesCount[0].count,
        upcomingAppointments
      }
    };

    logger.info(`Relatório gerado para paciente: ${patient.name}`);

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    logger.error('Erro ao gerar relatório do paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar relatório do paciente'
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientTimeline,
  generatePatientReport
};
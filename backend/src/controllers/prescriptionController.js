const { Prescription, Patient, User, Appointment } = require('../models');
const QRCode = require('qrcode');
const crypto = require('crypto');

const prescriptionController = {
  // Criar nova receita
  create: async (req, res) => {
    try {
      const { 
        patient_id, 
        appointment_id,
        medications, 
        diagnosis, 
        instructions,
        valid_until,
        notes 
      } = req.body;

      const doctor_id = req.user.id;

      // Verificar se o paciente existe
      const patient = await Patient.findByPk(patient_id);
      if (!patient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Paciente não encontrado' 
        });
      }

      // Criar a receita
      const prescription = await Prescription.create({
        patient_id,
        doctor_id,
        appointment_id,
        medications,
        diagnosis,
        instructions,
        valid_until,
        notes
      });

      // Gerar QR Code para verificação
      const verificationData = {
        id: prescription.id,
        prescription_number: prescription.prescription_number,
        verification_code: prescription.verification_code,
        patient_id: patient_id,
        doctor_id: doctor_id
      };

      const qrCodeData = await QRCode.toDataURL(JSON.stringify(verificationData));
      
      // Atualizar com QR Code
      await prescription.update({ qr_code: qrCodeData });

      // Buscar receita completa com relacionamentos
      const fullPrescription = await Prescription.findByPk(prescription.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment', required: false }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Receita criada com sucesso',
        data: fullPrescription
      });
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Listar todas as receitas
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, patient_id } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (patient_id) where.patient_id = patient_id;

      const prescriptions = await Prescription.findAndCountAll({
        where,
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment', required: false }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: prescriptions.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: prescriptions.count,
          total_pages: Math.ceil(prescriptions.count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Buscar receita por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const prescription = await Prescription.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment', required: false }
        ]
      });

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Receita não encontrada'
        });
      }

      res.json({
        success: true,
        data: prescription
      });
    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Verificar receita por código
  verify: async (req, res) => {
    try {
      const { verification_code, prescription_number } = req.body;

      const prescription = await Prescription.findOne({
        where: {
          verification_code,
          prescription_number
        },
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' }
        ]
      });

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Receita não encontrada ou código inválido'
        });
      }

      // Verificar se a receita ainda é válida
      const now = new Date();
      if (prescription.valid_until < now) {
        return res.status(400).json({
          success: false,
          message: 'Receita expirada',
          expired: true
        });
      }

      res.json({
        success: true,
        message: 'Receita válida',
        data: {
          id: prescription.id,
          prescription_number: prescription.prescription_number,
          patient: prescription.patient,
          doctor: prescription.doctor,
          medications: prescription.medications,
          diagnosis: prescription.diagnosis,
          instructions: prescription.instructions,
          status: prescription.status,
          valid_until: prescription.valid_until,
          created_at: prescription.createdAt
        }
      });
    } catch (error) {
      console.error('Erro ao verificar receita:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Dispensar receita (farmácia)
  dispense: async (req, res) => {
    try {
      const { id } = req.params;
      const { pharmacy_dispensed, notes } = req.body;

      const prescription = await Prescription.findByPk(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Receita não encontrada'
        });
      }

      // Verificar se a receita ainda é válida
      const now = new Date();
      if (prescription.valid_until < now) {
        return res.status(400).json({
          success: false,
          message: 'Receita expirada'
        });
      }

      if (prescription.status === 'dispensed') {
        return res.status(400).json({
          success: false,
          message: 'Receita já foi dispensada'
        });
      }

      // Atualizar status para dispensada
      await prescription.update({
        status: 'dispensed',
        pharmacy_dispensed,
        dispensed_at: new Date(),
        notes: notes ? `${prescription.notes || ''}\n\nDispensação: ${notes}` : prescription.notes
      });

      const updatedPrescription = await Prescription.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' }
        ]
      });

      res.json({
        success: true,
        message: 'Receita dispensada com sucesso',
        data: updatedPrescription
      });
    } catch (error) {
      console.error('Erro ao dispensar receita:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Cancelar receita
  cancel: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const prescription = await Prescription.findByPk(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Receita não encontrada'
        });
      }

      if (prescription.status === 'dispensed') {
        return res.status(400).json({
          success: false,
          message: 'Não é possível cancelar uma receita já dispensada'
        });
      }

      // Atualizar status para cancelada
      await prescription.update({
        status: 'cancelled',
        notes: `${prescription.notes || ''}\n\nCancelamento: ${reason || 'Sem motivo informado'}`
      });

      const updatedPrescription = await Prescription.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' }
        ]
      });

      res.json({
        success: true,
        message: 'Receita cancelada com sucesso',
        data: updatedPrescription
      });
    } catch (error) {
      console.error('Erro ao cancelar receita:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Buscar receitas por paciente
  getByPatient: async (req, res) => {
    try {
      const { patient_id } = req.params;
      const { status } = req.query;

      const where = { patient_id };
      if (status) where.status = status;

      const prescriptions = await Prescription.findAll({
        where,
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor' },
          { model: Appointment, as: 'appointment', required: false }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: prescriptions
      });
    } catch (error) {
      console.error('Erro ao buscar receitas do paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Estatísticas de receitas
  getStats: async (req, res) => {
    try {
      const totalPrescriptions = await Prescription.count();
      const activePrescriptions = await Prescription.count({ where: { status: 'active' } });
      const dispensedPrescriptions = await Prescription.count({ where: { status: 'dispensed' } });
      const expiredPrescriptions = await Prescription.count({ where: { status: 'expired' } });
      const cancelledPrescriptions = await Prescription.count({ where: { status: 'cancelled' } });

      // Receitas dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPrescriptions = await Prescription.count({
        where: {
          createdAt: {
            [require('sequelize').Op.gte]: thirtyDaysAgo
          }
        }
      });

      res.json({
        success: true,
        data: {
          total: totalPrescriptions,
          active: activePrescriptions,
          dispensed: dispensedPrescriptions,
          expired: expiredPrescriptions,
          cancelled: cancelledPrescriptions,
          recent: recentPrescriptions
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de receitas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = prescriptionController;
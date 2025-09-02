const { MedicalCertificate, User, Appointment } = require('../models');
const QRCode = require('qrcode');
const { Op } = require('sequelize');

const medicalCertificateController = {
  create: async (req, res) => {
    try {
      const {
        patient_id,
        appointment_id,
        certificate_type,
        diagnosis,
        rest_days,
        start_date,
        end_date,
        observations,
        restrictions
      } = req.body;

      const doctor_id = req.user.id;

      // Verificar se o paciente existe
      const patient = await User.findByPk(patient_id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
      }

      // Criar o atestado
      const certificate = await MedicalCertificate.create({
        patient_id,
        doctor_id,
        appointment_id: appointment_id || null,
        certificate_type,
        diagnosis,
        rest_days: rest_days || 0,
        start_date: start_date || new Date(),
        end_date,
        observations,
        restrictions
      });

      // Gerar QR Code
      const qrData = {
        certificate_id: certificate.id,
        certificate_number: certificate.certificate_number,
        verification_code: certificate.verification_code,
        patient_name: patient.name,
        issued_at: certificate.issued_at
      };
      
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      
      await certificate.update({
        qr_code: qrCodeUrl
      });

      // Buscar dados completos para resposta
      const fullCertificate = await MedicalCertificate.findByPk(certificate.id, {
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['id', 'name', 'email', 'cpf']
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'name', 'specialty', 'crm']
          },
          {
            model: Appointment,
            as: 'appointment',
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Atestado médico criado com sucesso',
        data: fullCertificate
      });
    } catch (error) {
      console.error('Erro ao criar atestado médico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        patient_id,
        certificate_type,
        date_from,
        date_to
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (patient_id) {
        whereClause.patient_id = patient_id;
      }

      if (certificate_type) {
        whereClause.certificate_type = certificate_type;
      }

      if (date_from && date_to) {
        whereClause.issued_at = {
          [Op.between]: [new Date(date_from), new Date(date_to)]
        };
      }

      const certificates = await MedicalCertificate.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['id', 'name', 'email', 'cpf']
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'name', 'specialty', 'crm']
          },
          {
            model: Appointment,
            as: 'appointment',
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['issued_at', 'DESC']]
      });

      res.json({
        success: true,
        data: certificates.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: certificates.count,
          totalPages: Math.ceil(certificates.count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar atestados médicos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const certificate = await MedicalCertificate.findByPk(id, {
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['id', 'name', 'email', 'cpf', 'phone', 'birth_date']
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'name', 'specialty', 'crm', 'email']
          },
          {
            model: Appointment,
            as: 'appointment',
            required: false
          }
        ]
      });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Atestado médico não encontrado'
        });
      }

      res.json({
        success: true,
        data: certificate
      });
    } catch (error) {
      console.error('Erro ao buscar atestado médico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  cancel: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const certificate = await MedicalCertificate.findByPk(id);
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Atestado médico não encontrado'
        });
      }

      if (certificate.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Atestado já está cancelado'
        });
      }

      await certificate.update({
        status: 'cancelled',
        cancelled_at: new Date(),
        cancelled_reason: reason || 'Cancelado pelo médico'
      });

      res.json({
        success: true,
        message: 'Atestado médico cancelado com sucesso',
        data: certificate
      });
    } catch (error) {
      console.error('Erro ao cancelar atestado médico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  verify: async (req, res) => {
    try {
      const { verification_code, certificate_number } = req.body;

      if (!verification_code && !certificate_number) {
        return res.status(400).json({
          success: false,
          message: 'Código de verificação ou número do atestado é obrigatório'
        });
      }

      const whereClause = {};
      if (verification_code) {
        whereClause.verification_code = verification_code;
      }
      if (certificate_number) {
        whereClause.certificate_number = certificate_number;
      }

      const certificate = await MedicalCertificate.findOne({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['name', 'cpf']
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['name', 'specialty', 'crm']
          }
        ]
      });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Atestado médico não encontrado',
          verified: false
        });
      }

      const isValid = certificate.status === 'active' && 
                     (!certificate.end_date || new Date() <= new Date(certificate.end_date));

      res.json({
        success: true,
        verified: isValid,
        data: {
          certificate_number: certificate.certificate_number,
          patient_name: certificate.patient.name,
          doctor_name: certificate.doctor.name,
          doctor_crm: certificate.doctor.crm,
          certificate_type: certificate.certificate_type,
          issued_at: certificate.issued_at,
          start_date: certificate.start_date,
          end_date: certificate.end_date,
          status: certificate.status
        }
      });
    } catch (error) {
      console.error('Erro ao verificar atestado médico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = medicalCertificateController;
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalCertificate = sequelize.define('MedicalCertificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  certificate_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  certificate_type: {
    type: DataTypes.ENUM('trabalho', 'estudos', 'atividade_fisica', 'comparecimento', 'repouso', 'outros'),
    allowNull: false,
    defaultValue: 'trabalho'
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rest_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  restrictions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  },
  verification_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  },
  qr_code: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issued_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelled_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'medical_certificates',
  timestamps: true
});

module.exports = MedicalCertificate;
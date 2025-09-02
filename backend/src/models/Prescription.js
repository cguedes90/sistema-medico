const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  prescription_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  medications: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'dispensed', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: false
  },
  qr_code: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  digital_signature: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verification_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pharmacy_dispensed: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dispensed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'prescriptions',
  hooks: {
    beforeCreate: async (prescription) => {
      // Gerar número da receita
      const count = await Prescription.count();
      prescription.prescription_number = `RX-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
      
      // Gerar código de verificação
      prescription.verification_code = Math.random().toString(36).substring(2, 15).toUpperCase();
      
      // Definir validade (30 dias por padrão)
      if (!prescription.valid_until) {
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);
        prescription.valid_until = validUntil;
      }
    }
  }
});

module.exports = Prescription;
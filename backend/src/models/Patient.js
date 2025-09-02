const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [11, 14]
    }
  },
  rg: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [10, 20]
    }
  },
  emergency_contact: {
    type: DataTypes.JSON,
    allowNull: true
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  blood_type: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  allergies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  medications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  pre_existing_conditions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  family_history: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  insurance_info: {
    type: DataTypes.JSON,
    allowNull: true
  },
  primary_care_physician: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deceased'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  privacy_consent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_consent_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'patients',
  indexes: [
    {
      unique: true,
      fields: ['cpf']
    },
    {
      fields: ['name']
    },
    {
      fields: ['email']
    }
  ]
});

module.exports = Patient;
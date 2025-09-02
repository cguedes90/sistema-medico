const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Note = sequelize.define('Note', {
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
    },
    onDelete: 'CASCADE'
  },
  author_id: {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 10000]
    }
  },
  type: {
    type: DataTypes.ENUM(
      'consultation',
      'examination',
      'prescription',
      'procedure',
      'follow_up',
      'emergency',
      'general',
      'lab_result',
      'imaging',
      'surgery'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed', 'archived'),
    defaultValue: 'active'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  symptoms: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  diagnosis: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  treatment_plan: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  medications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  vital_signs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  ai_insights: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  is_confidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  follow_up_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  follow_up_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  related_notes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'notes',
  indexes: [
    {
      fields: ['patient_id']
    },
    {
      fields: ['author_id']
    },
    {
      fields: ['appointment_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Note;
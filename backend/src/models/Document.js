const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
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
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'exame',
      'receita',
      'laudo',
      'atestado',
      'prontuario',
      'imagem',
      'outro'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  extraction_status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  extracted_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ai_analysis: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  is_sensitive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  retention_period: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Período de retenção em anos'
  },
  access_level: {
    type: DataTypes.ENUM('public', 'private', 'confidential'),
    defaultValue: 'private'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'documents',
  indexes: [
    {
      fields: ['patient_id']
    },
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['category']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['extraction_status']
    }
  ]
});

module.exports = Document;
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TelemedicineSession = sequelize.define('TelemedicineSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'appointments',
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
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  room_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'waiting', 'active', 'completed', 'cancelled', 'no_show'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quality_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  technical_issues: {
    type: DataTypes.JSON,
    allowNull: true
  },
  recording_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  connection_logs: {
    type: DataTypes.JSON,
    allowNull: true
  },
  prescription_issued: {
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
  session_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'telemedicine_sessions',
  hooks: {
    beforeCreate: async (session) => {
      // Gerar session_id único
      session.session_id = `TM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    },
    beforeUpdate: async (session) => {
      // Calcular duração se a sessão foi encerrada
      if (session.ended_at && session.started_at) {
        const duration = Math.floor((new Date(session.ended_at) - new Date(session.started_at)) / (1000 * 60));
        session.duration_minutes = duration;
      }
    }
  }
});

module.exports = TelemedicineSession;
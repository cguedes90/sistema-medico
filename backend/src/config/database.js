const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração para Neon PostgreSQL
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_NtjRzF0Lc1Gu@ep-muddy-cake-achnuvpa-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true
    },
    // Configurações específicas para Neon
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
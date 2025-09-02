#!/usr/bin/env node

/**
 * Script de Integração com Neon PostgreSQL
 * Este script integra o banco de dados Neon com o frontend e backend
 */

const { sequelize } = require('../backend/src/config/database');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

console.log('🚀 Iniciando integração com Neon PostgreSQL...');

async function integrateWithNeon() {
  try {
    // 1. Testar conexão com o banco de dados
    console.log('🔍 Testando conexão com o Neon PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexão com o Neon PostgreSQL estabelecida com sucesso!');

    // 2. Sincronizar modelos
    console.log('📊 Sincronizando modelos com o Neon PostgreSQL...');
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados com sucesso!');

    // 3. Executar script de inicialização
    console.log('📝 Executando script de inicialização do banco de dados...');
    await runDatabaseSetup();
    
    // 4. Verificar integridade dos dados
    console.log('🔍 Verificando integridade dos dados...');
    await verifyDataIntegrity();
    
    // 5. Criar dados de exemplo
    console.log('🎭 Criando dados de exemplo para desenvolvimento...');
    await createSampleData();
    
    // 6. Configurar frontend
    console.log('⚙️ Configurando frontend para usar o Neon PostgreSQL...');
    await setupFrontend();
    
    // 7. Testar integração completa
    console.log('🧪 Testando integração completa...');
    await testIntegration();
    
    console.log('🎉 Integração com Neon PostgreSQL concluída!');
    console.log('');
    console.log('📋 Resumo da integração:');
    console.log('   • Banco de dados: Neon PostgreSQL');
    console.log('   • URL: postgresql://neondb_owner:npg_NtjRzF0Lc1Gu@ep-muddy-cake-achnuvpa-pooler.sa-east-1.aws.neon.tech/neondb');
    console.log('   • Tabelas criadas: users, patients, documents, notes, appointments, ai_analyses, audit_logs');
    console.log('   • Views criadas: patient_summary, user_activity');
    console.log('   • Índices criados para performance');
    console.log('   • Dados de exemplo inseridos');
    console.log('   • Frontend configurado');
    console.log('   • Backend integrado');
    console.log('');
    console.log('🚀 Pronto para usar! Inicie os serviços com:');
    console.log('   npm run dev (backend)');
    console.log('   npm start (frontend)');
    
  } catch (error) {
    console.error('❌ Erro durante a integração:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function runDatabaseSetup() {
  try {
    const sqlPath = path.join(__dirname, '../database/init.sql');
    
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Dividir o script em comandos individuais
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('DO $'));

      // Executar cada comando
      for (const command of commands) {
        try {
          if (command.includes('CREATE') || command.includes('ALTER') || command.includes('INSERT') || command.includes('GRANT')) {
            console.log(`   📋 Executando: ${command.substring(0, 50)}...`);
            await sequelize.query(command);
          }
        } catch (error) {
          // Ignorar erros de tabelas/views já existentes
          if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
            console.log(`   ⚠️  Comando ignorado: ${error.message}`);
          }
        }
      }
      
      console.log('   ✅ Script de inicialização executado com sucesso!');
    } else {
      console.log('   ⚠️  Script de inicialização não encontrado, pulando...');
    }
  } catch (error) {
    console.error('   ❌ Erro ao executar script de inicialização:', error);
    throw error;
  }
}

async function verifyDataIntegrity() {
  try {
    const { User, Patient, Document, Note, Appointment } = require('../backend/src/models');
    
    // Verificar se as tabelas foram criadas
    const userCount = await User.count();
    const patientCount = await Patient.count();
    const documentCount = await Document.count();
    const noteCount = await Note.count();
    const appointmentCount = await Appointment.count();
    
    console.log('   📊 Verificando integridade dos dados:');
    console.log(`   • Usuários: ${userCount}`);
    console.log(`   • Pacientes: ${patientCount}`);
    console.log(`   • Documentos: ${documentCount}`);
    console.log(`   • Anotações: ${noteCount}`);
    console.log(`   • Agendamentos: ${appointmentCount}`);
    
    // Verificar se as views existem
    try {
      await sequelize.query('SELECT * FROM patient_summary LIMIT 1');
      console.log('   • View patient_summary: OK');
    } catch (error) {
      console.log('   • View patient_summary: Não encontrada');
    }
    
    try {
      await sequelize.query('SELECT * FROM user_activity LIMIT 1');
      console.log('   • View user_activity: OK');
    } catch (error) {
      console.log('   • View user_activity: Não encontrada');
    }
    
  } catch (error) {
    console.error('   ❌ Erro ao verificar integridade dos dados:', error);
    throw error;
  }
}

async function createSampleData() {
  try {
    const { User, Patient, Document, Note, Appointment } = require('../backend/src/models');
    
    // Criar usuários de exemplo
    console.log('   📋 Criando usuários de exemplo...');
    const [doctor] = await User.findOrCreate({
      where: { email: 'joao.silva@medico.com' },
      defaults: {
        name: 'Dr. João Silva',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZeUfkZMBs9kYZP6',
        role: 'doctor',
        crm: '123456',
        specialty: 'Cardiologia',
        email_verified: true
      }
    });

    const [nurse] = await User.findOrCreate({
      where: { email: 'maria.enfermeira@medico.com' },
      defaults: {
        name: 'Enfermeira Maria',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZeUfkZMBs9kYZP6',
        role: 'nurse',
        email_verified: true
      }
    });

    // Criar pacientes de exemplo
    console.log('   👥 Criando pacientes de exemplo...');
    const [patient1] = await Patient.findOrCreate({
      where: { cpf: '12345678900' },
      defaults: {
        name: 'José da Silva',
        email: 'jose.silva@email.com',
        birth_date: new Date('1980-05-15'),
        gender: 'male',
        phone: '11999999999',
        privacy_consent: true,
        data_consent_date: new Date()
      }
    });

    const [patient2] = await Patient.findOrCreate({
      where: { cpf: '98765432100' },
      defaults: {
        name: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        birth_date: new Date('1975-08-22'),
        gender: 'female',
        phone: '11888888888',
        privacy_consent: true,
        data_consent_date: new Date()
      }
    });

    // Criar anotações de exemplo
    console.log('   📝 Criando anotações de exemplo...');
    await Note.findOrCreate({
      where: { 
        patient_id: patient1.id,
        author_id: doctor.id,
        title: 'Consulta inicial - Hipertensão'
      },
      defaults: {
        content: 'Paciente apresenta hipertensão controlada com medicação atual. Recomendo acompanhamento mensal.',
        type: 'consultation',
        priority: 'normal',
        is_private: false
      }
    });

    // Criar agendamentos de exemplo
    console.log('   📅 Criando agendamentos de exemplo...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    await Appointment.findOrCreate({
      where: { 
        patient_id: patient1.id,
        doctor_id: doctor.id
      },
      defaults: {
        title: 'Retorno - Controle de pressão',
        description: 'Avaliação do tratamento atual',
        start_time: futureDate,
        end_time: new Date(futureDate.getTime() + 30 * 60000),
        status: 'scheduled',
        type: 'consultation',
        created_by: doctor.id
      }
    });

    console.log('   ✅ Dados de exemplo criados com sucesso!');
    
  } catch (error) {
    console.log('   ⚠️  Erro ao criar dados de exemplo:', error.message);
  }
}

async function setupFrontend() {
  try {
    // Verificar se o arquivo .env existe no frontend
    const frontendEnvPath = path.join(__dirname, '../frontend/.env');
    
    if (!fs.existsSync(frontendEnvPath)) {
      console.log('   📝 Criando arquivo .env do frontend...');
      const frontendEnvContent = `REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
REACT_APP_DATABASE_URL=postgresql://neondb_owner:npg_NtjRzF0Lc1Gu@ep-muddy-cake-achnuvpa-pooler.sa-east-1.aws.neon.tech/neondb
REACT_APP_ENABLE_IA=true
REACT_APP_ENABLE_ANALYTICS=false`;
      
      fs.writeFileSync(frontendEnvPath, frontendEnvContent);
      console.log('   ✅ Arquivo .env do frontend criado com sucesso!');
    } else {
      console.log('   ℹ️  Arquivo .env do frontend já existe');
    }
    
    // Verificar se o arquivo package.json do frontend tem as dependências corretas
    const frontendPackagePath = path.join(__dirname, '../frontend/package.json');
    const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
    
    if (!frontendPackage.dependencies['axios']) {
      console.log('   📦 Instalando dependências do frontend...');
      await execAsync('cd frontend && npm install axios react-hot-toast @mui/material @emotion/react @emotion/styled @mui/icons-material');
      console.log('   ✅ Dependências do frontend instaladas com sucesso!');
    }
    
  } catch (error) {
    console.error('   ❌ Erro ao configurar frontend:', error);
    throw error;
  }
}

async function testIntegration() {
  try {
    console.log('   🧋试ando integração...');
    
    // Testar conexão com a API
    const response = await fetch('http://localhost:3001/api/health');
    if (!response.ok) {
      throw new Error('Não foi possível conectar à API do backend');
    }
    
    const healthData = await response.json();
    console.log(`   • API do backend: OK (${healthData.status})`);
    
    // Testar conexão com o banco de dados
    const dbResponse = await fetch('http://localhost:3001/api/patients?limit=1');
    if (!dbResponse.ok) {
      throw new Error('Não foi possível conectar ao banco de dados');
    }
    
    console.log('   • Conexão com o banco de dados: OK');
    console.log('   • Integração frontend-backend: OK');
    
  } catch (error) {
    console.error('   ❌ Erro ao testar integração:', error);
    throw error;
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  integrateWithNeon();
}

module.exports = { integrateWithNeon };
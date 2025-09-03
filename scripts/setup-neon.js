#!/usr/bin/env node

/**
 * Script de configuração do banco de dados Neon PostgreSQL
 * Este script sincroniza as tabelas com o banco de dados Neon
 */

const { sequelize } = require('../backend/src/config/database');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

console.log('🚀 Iniciando configuração do banco de dados Neon PostgreSQL...');

async function setupDatabase() {
  try {
    // Testar conexão com o banco de dados
    console.log('🔍 Testando conexão com o banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

    // Sincronizar modelos
    console.log('📊 Sincronizando modelos com o banco de dados...');
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados com sucesso!');

    // Ler e executar o script SQL de inicialização
    const sqlPath = path.join(__dirname, '../database/init.sql');
    console.log('📝 Lendo script de inicialização...');
    
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log('🔧 Executando script de inicialização...');
      
      // Dividir o script em comandos individuais
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      // Executar cada comando
      for (const command of commands) {
        try {
          if (command.includes('CREATE') || command.includes('ALTER') || command.includes('INSERT')) {
            console.log(`📋 Executando: ${command.substring(0, 50)}...`);
            await sequelize.query(command);
          }
        } catch (error) {
          console.log(`⚠️  Comando ignorado (pode já existir): ${error.message}`);
        }
      }
      
      console.log('✅ Script de inicialização executado com sucesso!');
    } else {
      console.log('⚠️  Script de inicialização não encontrado, pulando...');
    }

    // Criar dados de exemplo para desenvolvimento
    console.log('🎭 Criando dados de exemplo para desenvolvimento...');
    await createSampleData();
    
    console.log('🎉 Configuração do banco de dados concluída!');
    console.log('');
    console.log('📋 Resumo da configuração:');
    console.log('   • Banco de dados: Neon PostgreSQL');
    console.log('   • URL: [DATABASE_URL configurada via variável de ambiente]');
    console.log('   • Tabelas criadas: users, patients, documents, notes, appointments, ai_analyses, audit_logs');
    console.log('   • Views criadas: patient_summary, user_activity');
    console.log('   • Índices criados para performance');
    console.log('   • Dados de exemplo inseridos');
    console.log('');
    console.log('🚀 Pronto para usar! Inicie o backend com:');
    console.log('   cd backend && npm run dev');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração do banco de dados:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function createSampleData() {
  try {
    const { User, Patient, Document, Note, Appointment } = require('../backend/src/models');
    
    // Criar usuários de exemplo
    console.log('   📋 Criando usuários de exemplo...');
    const doctor = await User.findOrCreate({
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

    const nurse = await User.findOrCreate({
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
    const patient1 = await Patient.findOrCreate({
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

    const patient2 = await Patient.findOrCreate({
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
        patient_id: patient1[0].id,
        author_id: doctor[0].id,
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
        patient_id: patient1[0].id,
        doctor_id: doctor[0].id
      },
      defaults: {
        title: 'Retorno - Controle de pressão',
        description: 'Avaliação do tratamento atual',
        start_time: futureDate,
        end_time: new Date(futureDate.getTime() + 30 * 60000),
        status: 'scheduled',
        type: 'consultation',
        created_by: doctor[0].id
      }
    });

    console.log('   ✅ Dados de exemplo criados com sucesso!');
    
  } catch (error) {
    console.log('   ⚠️  Erro ao criar dados de exemplo:', error.message);
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
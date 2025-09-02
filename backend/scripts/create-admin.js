#!/usr/bin/env node

const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const { logger } = require('../src/utils/logger');

async function createAdmin() {
  try {
    logger.info('Criando usuário administrador...');
    
    // Verificar se já existe um administrador
    const existingAdmin = await User.findOne({ 
      where: { 
        role: 'admin',
        email: 'admin@sistema-medico.com' 
      } 
    });

    // Se passar --force-reset, redefine a senha do admin
    const forceReset = process.argv.includes('--force-reset');
    if (existingAdmin && forceReset) {
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      logger.info('Senha do administrador redefinida para admin123.');
      return;
    }
    if (existingAdmin) {
      logger.info('Usuário administrador já existe.');
      return;
    }
    
    // Criar administrador
    const adminData = {
      name: 'Administrador do Sistema',
      email: 'admin@sistema-medico.com',
      password: 'admin123',
      role: 'admin',
      crm: 'ADMIN001',
      specialty: 'Administração',
      phone: '(11) 99999-8888',
      birth_date: '1980-01-01',
      gender: 'other',
      email_verified: true,
      is_active: true
    };
    
    const admin = await User.create(adminData);
    
    logger.info(`Usuário administrador criado com sucesso!`);
    logger.info(`Email: ${admin.email}`);
    logger.info(`Senha: admin123`);
    logger.info(`Role: ${admin.role}`);
    logger.info(`ID: ${admin.id}`);
    
    // Criar médico de exemplo
    const doctorData = {
      name: 'Dr. João Silva',
      email: 'joao.silva@sistema-medico.com',
      password: 'medico123',
      role: 'doctor',
      crm: 'SP123456',
      specialty: 'Clínica Geral',
      phone: '(11) 99999-7777',
      birth_date: '1975-03-15',
      gender: 'male',
      email_verified: true,
      is_active: true
    };
    
    const doctor = await User.create(doctorData);
    
    logger.info(`Médico de exemplo criado com sucesso!`);
    logger.info(`Email: ${doctor.email}`);
    logger.info(`Senha: medico123`);
    logger.info(`CRM: ${doctor.crm}`);
    logger.info(`Especialidade: ${doctor.specialty}`);
    
    // Criar enfermeiro de exemplo
    const nurseData = {
      name: 'Enfermeira Maria Santos',
      email: 'maria.santos@sistema-medico.com',
      password: 'enfermeiro123',
      role: 'nurse',
      phone: '(11) 99999-6666',
      birth_date: '1985-07-20',
      gender: 'female',
      email_verified: true,
      is_active: true
    };
    
    const nurse = await User.create(nurseData);
    
    logger.info(`Enfermeiro de exemplo criado com sucesso!`);
    logger.info(`Email: ${nurse.email}`);
    logger.info(`Senha: enfermeiro123`);
    
    logger.info('Usuários de exemplo criados com sucesso!');
    logger.info('Você pode usar estas credenciais para fazer login no sistema.');
    
  } catch (error) {
    logger.error('Erro ao criar usuário administrador:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };
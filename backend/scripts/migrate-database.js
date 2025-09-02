#!/usr/bin/env node

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Document = require('../models/Document');
const Note = require('../models/Note');
const { logger } = require('../utils/logger');

async function migrateDatabase() {
  try {
    logger.info('Iniciando migração do banco de dados...');
    
    // Sincronizar todos os modelos
    await sequelize.sync({ force: false });
    logger.info('Banco de dados sincronizado com sucesso.');
    
    // Criar índices adicionais se não existirem
    await createAdditionalIndexes();
    
    // Atualizar dados existentes se necessário
    await updateExistingData();
    
    // Verificar integridade do banco
    await checkDatabaseIntegrity();
    
    logger.info('Migração concluída com sucesso!');
    
  } catch (error) {
    logger.error('Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function createAdditionalIndexes() {
  logger.info('Criando índices adicionais...');
  
  try {
    // Índice para busca de pacientes por nome
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_patients_name ON patients USING gin(to_tsvector('portuguese', name));
    `);
    
    // Índice para busca de documentos por conteúdo
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_content ON documents USING gin(to_tsvector('portuguese', extracted_text));
    `);
    
    // Índice para busca de anotações por conteúdo
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_content ON notes USING gin(to_tsvector('portuguese', content));
    `);
    
    // Índice para data de criação
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
    `);
    
    // Índice para status de extração
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_extraction_status ON documents(extraction_status);
    `);
    
    logger.info('Índices adicionais criados com sucesso.');
    
  } catch (error) {
    logger.error('Erro ao criar índices:', error);
    throw error;
  }
}

async function updateExistingData() {
  logger.info('Atualizando dados existentes...');
  
  try {
    // Atualizar formato de CPF para pacientes existentes
    const patients = await Patient.findAll({
      where: {
        cpf: {
          [sequelize.Op.not]: null,
          [sequelize.Op.notLike]: '%[0-9]%'
        }
      }
    });
    
    for (const patient of patients) {
      const cleanedCPF = patient.cpf.replace(/\D/g, '');
      await patient.update({ cpf: cleanedCPF });
      logger.info(`CPF atualizado para paciente ${patient.name}: ${cleanedCPF}`);
    }
    
    // Atualizar formato de telefone para pacientes existentes
    const patientsWithPhones = await Patient.findAll({
      where: {
        phone: {
          [sequelize.Op.not]: null,
          [sequelize.Op.notLike]: '%[0-9]%'
        }
      }
    });
    
    for (const patient of patientsWithPhones) {
      const cleanedPhone = patient.phone.replace(/\D/g, '');
      await patient.update({ phone: cleanedPhone });
      logger.info(`Telefone atualizado para paciente ${patient.name}: ${cleanedPhone}`);
    }
    
    // Atualizar formato de telefone para usuários existentes
    const usersWithPhones = await User.findAll({
      where: {
        phone: {
          [sequelize.Op.not]: null,
          [sequelize.Op.notLike]: '%[0-9]%'
        }
      }
    });
    
    for (const user of usersWithPhones) {
      const cleanedPhone = user.phone.replace(/\D/g, '');
      await user.update({ phone: cleanedPhone });
      logger.info(`Telefone atualizado para usuário ${user.name}: ${cleanedPhone}`);
    }
    
    logger.info('Dados existentes atualizados com sucesso.');
    
  } catch (error) {
    logger.error('Erro ao atualizar dados existentes:', error);
    throw error;
  }
}

async function checkDatabaseIntegrity() {
  logger.info('Verificando integridade do banco de dados...');
  
  try {
    // Verificar referências quebradas
    const brokenReferences = await sequelize.query(`
      SELECT d.id, d.patient_id, d.title
      FROM documents d
      LEFT JOIN patients p ON d.patient_id = p.id
      WHERE p.id IS NULL;
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (brokenReferences.length > 0) {
      logger.warn(`Encontradas ${brokenReferences.length} referências quebradas em documentos.`);
      for (const doc of brokenReferences) {
        logger.warn(`Documento ID ${doc.id} (${doc.title}) referencia paciente inexistente.`);
      }
    }
    
    // Verificar anotações com referências quebradas
    const brokenNoteReferences = await sequelize.query(`
      SELECT n.id, n.patient_id, n.title
      FROM notes n
      LEFT JOIN patients p ON n.patient_id = p.id
      WHERE p.id IS NULL;
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (brokenNoteReferences.length > 0) {
      logger.warn(`Encontradas ${brokenNoteReferences.length} referências quebradas em anotações.`);
      for (const note of brokenNoteReferences) {
        logger.warn(`Anotação ID ${note.id} (${note.title}) referencia paciente inexistente.`);
      }
    }
    
    // Verificar documentos sem extração de texto
    const documentsWithoutExtraction = await Document.count({
      where: {
        extraction_status: 'pending',
        extracted_text: null
      }
    });
    
    if (documentsWithoutExtraction > 0) {
      logger.info(`${documentsWithoutExtraction} documentos aguardando extração de texto.`);
    }
    
    // Verificar anotações sem tipo
    const notesWithoutType = await Note.count({
      where: {
        note_type: null
      }
    });
    
    if (notesWithoutType > 0) {
      logger.warn(`${notesWithoutType} anotações sem tipo definido.`);
    }
    
    // Verificar pacientes sem consentimento de privacidade
    const patientsWithoutConsent = await Patient.count({
      where: {
        privacy_consent: false
      }
    });
    
    if (patientsWithoutConsent > 0) {
      logger.warn(`${patientsWithoutConsent} pacientes sem consentimento de privacidade.`);
    }
    
    logger.info('Verificação de integridade concluída.');
    
  } catch (error) {
    logger.error('Erro ao verificar integridade do banco de dados:', error);
    throw error;
  }
}

async function rollbackMigration() {
  logger.info('Realizando rollback da migração...');
  
  try {
    // Remover índices adicionais
    await sequelize.query(`
      DROP INDEX IF EXISTS idx_patients_name;
      DROP INDEX IF EXISTS idx_documents_content;
      DROP INDEX IF EXISTS idx_notes_content;
      DROP INDEX IF EXISTS idx_documents_created_at;
      DROP INDEX IF EXISTS idx_documents_extraction_status;
    `);
    
    logger.info('Rollback concluído com sucesso.');
    
  } catch (error) {
    logger.error('Erro durante o rollback:', error);
    throw error;
  }
}

async function backupDatabase() {
  logger.info('Realizando backup do banco de dados...');
  
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const backupDir = path.join(__dirname, '../../database/backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
    
    // Criar backup usando pg_dump
    if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
      const { exec } = require('child_process');
      const command = `pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} > ${backupFile}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Erro ao criar backup: ${stderr}`);
          throw error;
        }
        logger.info(`Backup criado com sucesso: ${backupFile}`);
      });
    } else {
      logger.warn('Variáveis de ambiente do banco não configuradas. Backup não realizado.');
    }
    
  } catch (error) {
    logger.error('Erro ao realizar backup:', error);
    throw error;
  }
}

// Função principal
async function main() {
  const action = process.argv[2] || 'migrate';
  
  switch (action) {
    case 'migrate':
      await migrateDatabase();
      break;
    case 'rollback':
      await rollbackMigration();
      break;
    case 'backup':
      await backupDatabase();
      break;
    case 'check':
      await checkDatabaseIntegrity();
      break;
    default:
      console.log('Uagem: node migrate-database.js [ação]');
      console.log('Ações disponíveis:');
      console.log('  migrate  - Executa migração (padrão)');
      console.log('  rollback - Realiza rollback da migração');
      console.log('  backup   - Cria backup do banco');
      console.log('  check    - Verifica integridade do banco');
      process.exit(1);
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  main().catch(error => {
    logger.error('Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { migrateDatabase, rollbackMigration, backupDatabase, checkDatabaseIntegrity };
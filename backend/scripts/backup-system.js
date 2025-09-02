#!/usr/bin/env node

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Document = require('../models/Document');
const Note = require('../models/Note');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class SystemBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.isRunning = false;
  }

  async initialize() {
    // Criar diretório de backups se não existir
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createFullBackup() {
    if (this.isRunning) {
      logger.warn('Backup já está em execução.');
      return;
    }

    this.isRunning = true;
    logger.info('Iniciando backup completo do sistema...');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `full_backup_${timestamp}`);

      // Criar diretório do backup
      fs.mkdirSync(backupPath, { recursive: true });

      // Executar backups
      const backupPromises = [
        this.backupDatabase(backupPath),
        this.backupFiles(backupPath),
        this.backupConfig(backupPath),
        this.generateBackupReport(backupPath)
      ];

      await Promise.all(backupPromises);

      // Compactar backup
      await this.compressBackup(backupPath);

      // Remover diretório não compactado
      await this.removeDirectory(backupPath);

      logger.info(`Backup completo criado com sucesso: ${backupPath}.tar.gz`);

      // Limpar backups antigos (manter últimos 7)
      await this.cleanOldBackups();

      return `${backupPath}.tar.gz`;

    } catch (error) {
      logger.error('Erro durante backup:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async backupDatabase(backupPath) {
    logger.info('Realizando backup do banco de dados...');

    try {
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'sistema_medico',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || ''
      };

      const backupFile = path.join(backupPath, 'database.sql');
      const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} > ${backupFile}`;

      await execAsync(command);

      // Criar arquivo de metadados do banco
      const dbMetadata = {
        timestamp: new Date().toISOString(),
        database: dbConfig.database,
        host: dbConfig.host,
        port: dbConfig.port,
        size: fs.statSync(backupFile).size
      };

      fs.writeFileSync(
        path.join(backupPath, 'database_metadata.json'),
        JSON.stringify(dbMetadata, null, 2)
      );

      logger.info('Backup do banco de dados concluído.');

    } catch (error) {
      logger.error('Erro ao backup do banco de dados:', error);
      throw error;
    }
  }

  async backupFiles(backupPath) {
    logger.info('Realizando backup de arquivos...');

    try {
      const filesToBackup = [
        path.join(__dirname, '../../uploads'),
        path.join(__dirname, '../../frontend/build'),
        path.join(__dirname, '../../docs')
      ];

      const backupFilesDir = path.join(backupPath, 'files');
      fs.mkdirSync(backupFilesDir, { recursive: true });

      for (const sourceDir of filesToBackup) {
        if (fs.existsSync(sourceDir)) {
          const dirName = path.basename(sourceDir);
          const targetDir = path.join(backupFilesDir, dirName);
          
          await this.copyDirectory(sourceDir, targetDir);
          logger.info(`Diretório ${dirName} copiado com sucesso.`);
        }
      }

      logger.info('Backup de arquivos concluído.');

    } catch (error) {
      logger.error('Erro ao backup de arquivos:', error);
      throw error;
    }
  }

  async backupConfig(backupPath) {
    logger.info('Realizando backup de configurações...');

    try {
      const configFiles = [
        '.env',
        'backend/package.json',
        'frontend/package.json',
        'README.md'
      ];

      const configDir = path.join(backupPath, 'config');
      fs.mkdirSync(configDir, { recursive: true });

      for (const configFile of configFiles) {
        const sourceFile = path.join(__dirname, '../../', configFile);
        if (fs.existsSync(sourceFile)) {
          const targetFile = path.join(configDir, path.basename(configFile));
          fs.copyFileSync(sourceFile, targetFile);
        }
      }

      // Criar arquivo de configuração do backup
      const backupConfig = {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          name: process.env.DB_NAME
        },
        server: {
          port: process.env.PORT || 3001
        },
        aws: {
          region: process.env.AWS_REGION,
          bucket: process.env.AWS_S3_BUCKET
        }
      };

      fs.writeFileSync(
        path.join(configDir, 'backup_config.json'),
        JSON.stringify(backupConfig, null, 2)
      );

      logger.info('Backup de configurações concluído.');

    } catch (error) {
      logger.error('Erro ao backup de configurações:', error);
      throw error;
    }
  }

  async generateBackupReport(backupPath) {
    logger.info('Gerando relatório do backup...');

    try {
      // Obter estatísticas do sistema
      const stats = await this.getSystemStats();

      // Gerar relatório
      const report = {
        backup_info: {
          timestamp: new Date().toISOString(),
          backup_type: 'full',
          backup_path: backupPath,
          version: process.env.npm_package_version || '1.0.0'
        },
        system_stats: stats,
        files: {
          database: {
            size: fs.statSync(path.join(backupPath, 'database.sql')).size,
            tables: await this.getDatabaseTables()
          },
          uploads: await this.getDirectorySize(path.join(backupPath, 'files/uploads')),
          frontend: await this.getDirectorySize(path.join(backupPath, 'files/frontend')),
          docs: await this.getDirectorySize(path.join(backupPath, 'files/docs'))
        },
        verification: {
          checksums: await this.generateChecksums(backupPath),
          integrity: 'pending'
        }
      };

      fs.writeFileSync(
        path.join(backupPath, 'backup_report.json'),
        JSON.stringify(report, null, 2)
      );

      logger.info('Relatório do backup gerado.');

    } catch (error) {
      logger.error('Erro ao gerar relatório do backup:', error);
      throw error;
    }
  }

  async compressBackup(backupPath) {
    logger.info('Compactando backup...');

    try {
      const tarCommand = `tar -czf "${backupPath}.tar.gz" -C "${path.dirname(backupPath)}" "${path.basename(backupPath)}"`;
      await execAsync(tarCommand);

      logger.info('Backup compactado com sucesso.');

    } catch (error) {
      logger.error('Erro ao compactar backup:', error);
      throw error;
    }
  }

  async cleanOldBackups() {
    logger.info('Limpando backups antigos...');

    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('full_backup_') && file.endsWith('.tar.gz'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

      // Remover backups mais antigos que 7
      const backupsToRemove = backupFiles.slice(7);
      for (const backup of backupsToRemove) {
        fs.unlinkSync(backup.path);
        logger.info(`Backup removido: ${backup.name}`);
      }

      logger.info(`Limpeza concluída. ${backupsToRemove.length} backups removidos.`);

    } catch (error) {
      logger.error('Erro ao limpar backups antigos:', error);
    }
  }

  async restoreBackup(backupFile) {
    logger.info(`Iniciando restauração do backup: ${backupFile}`);

    try {
      // Verificar se o arquivo de backup existe
      if (!fs.existsSync(backupFile)) {
        throw new Error(`Arquivo de backup não encontrado: ${backupFile}`);
      }

      // Extrair backup
      const extractPath = path.join(this.backupDir, 'restore');
      fs.mkdirSync(extractPath, { recursive: true });

      const extractCommand = `tar -xzf "${backupFile}" -C "${extractPath}"`;
      await execAsync(extractCommand);

      // Restaurar banco de dados
      await this.restoreDatabase(extractPath);

      // Restaurar arquivos
      await this.restoreFiles(extractPath);

      // Limupar arquivos temporários
      await this.removeDirectory(extractPath);

      logger.info('Restauração concluída com sucesso.');

    } catch (error) {
      logger.error('Erro durante restauração:', error);
      throw error;
    }
  }

  async restoreDatabase(backupPath) {
    logger.info('Restaurando banco de dados...');

    try {
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'sistema_medico',
        username: process.env.DB_USER || 'postgres'
      };

      const backupFile = path.join(backupPath, 'database.sql');
      const command = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} < ${backupFile}`;

      await execAsync(command);

      logger.info('Banco de dados restaurado com sucesso.');

    } catch (error) {
      logger.error('Erro ao restaurar banco de dados:', error);
      throw error;
    }
  }

  async restoreFiles(backupPath) {
    logger.info('Restaurando arquivos...');

    try {
      const filesDir = path.join(backupPath, 'files');

      if (fs.existsSync(filesDir)) {
        // Restaurar arquivos de upload
        const uploadsSource = path.join(filesDir, 'uploads');
        const uploadsTarget = path.join(__dirname, '../../uploads');
        
        if (fs.existsSync(uploadsSource)) {
          await this.copyDirectory(uploadsSource, uploadsTarget);
          logger.info('Arquivos de upload restaurados.');
        }

        // Restaurar build do frontend
        const frontendSource = path.join(filesDir, 'frontend');
        const frontendTarget = path.join(__dirname, '../../frontend/build');
        
        if (fs.existsSync(frontendSource)) {
          await this.copyDirectory(frontendSource, frontendTarget);
          logger.info('Build do frontend restaurado.');
        }

        // Restaurar documentação
        const docsSource = path.join(filesDir, 'docs');
        const docsTarget = path.join(__dirname, '../../docs');
        
        if (fs.existsSync(docsSource)) {
          await this.copyDirectory(docsSource, docsTarget);
          logger.info('Documentação restaurada.');
        }
      }

      logger.info('Arquivos restaurados com sucesso.');

    } catch (error) {
      logger.error('Erro ao restaurar arquivos:', error);
      throw error;
    }
  }

  async getSystemStats() {
    try {
      const [userCount, patientCount, documentCount, noteCount] = await Promise.all([
        User.count(),
        Patient.count(),
        Document.count(),
        Note.count()
      ]);

      return {
        users: userCount,
        patients: patientCount,
        documents: documentCount,
        notes: noteCount,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Erro ao obter estatísticas do sistema:', error);
      return {};
    }
  }

  async getDatabaseTables() {
    try {
      const result = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
      `, { type: sequelize.QueryTypes.SELECT });

      return result.map(row => row.table_name);

    } catch (error) {
      logger.error('Erro ao obter tabelas do banco:', error);
      return [];
    }
  }

  async generateChecksums(backupPath) {
    const checksums = {};

    async function generateChecksum(filePath) {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256');
      const data = fs.readFileSync(filePath);
      hash.update(data);
      return hash.digest('hex');
    }

    async function processDirectory(dirPath) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const relativePath = path.relative(backupPath, filePath);
        
        if (fs.statSync(filePath).isDirectory()) {
          await processDirectory(filePath);
        } else {
          checksums[relativePath] = await generateChecksum(filePath);
        }
      }
    }

    await processDirectory(backupPath);
    return checksums;
  }

  async copyDirectory(src, dest) {
    await fs.promises.mkdir(dest, { recursive: true });
    
    const entries = await fs.promises.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  }

  async removeDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await this.removeDirectory(fullPath);
      } else {
        await fs.promises.unlink(fullPath);
      }
    }
    
    await fs.promises.rmdir(dirPath);
  }

  async getDirectorySize(dirPath) {
    let totalSize = 0;
    
    if (!fs.existsSync(dirPath)) return 0;

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        totalSize += await this.getDirectorySize(fullPath);
      } else {
        const stats = await fs.promises.stat(fullPath);
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }
}

// Instanciar sistema de backup
const backupSystem = new SystemBackup();

// Funções principais
async function createBackup() {
  await backupSystem.initialize();
  return await backupSystem.createFullBackup();
}

async function restoreBackup(backupFile) {
  await backupSystem.initialize();
  return await backupSystem.restoreBackup(backupFile);
}

// Configurar handlers de sinal
process.on('SIGINT', () => {
  logger.info('Recebido sinal SIGINT. Saindo...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Recebido sinal SIGTERM. Saindo...');
  process.exit(0);
});

// Executar se o script for chamado diretamente
if (require.main === module) {
  const action = process.argv[2] || 'backup';
  
  switch (action) {
    case 'backup':
      createBackup()
        .then(backupFile => {
          logger.info(`Backup criado: ${backupFile}`);
          process.exit(0);
        })
        .catch(error => {
          logger.error('Erro ao criar backup:', error);
          process.exit(1);
        });
      break;
      
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        logger.error('Uagem: node backup-system.js restore <arquivo-de-backup>');
        process.exit(1);
      }
      
      restoreBackup(backupFile)
        .then(() => {
          logger.info('Backup restaurado com sucesso!');
          process.exit(0);
        })
        .catch(error => {
          logger.error('Erro ao restaurar backup:', error);
          process.exit(1);
        });
      break;
      
    default:
      logger.log('Uagem: node backup-system.js [ação]');
      logger.log('Ações disponíveis:');
      logger.log('  backup  - Cria um backup completo (padrão)');
      logger.log('  restore <arquivo> - Restaura um backup específico');
      process.exit(1);
  }
}

module.exports = { SystemBackup, createBackup, restoreBackup };
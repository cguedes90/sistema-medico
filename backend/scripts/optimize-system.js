#!/usr/bin/env node

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Document = require('../models/Document');
const Note = require('../models/Note');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class SystemOptimizer {
  constructor() {
    this.optimizationDir = path.join(__dirname, '../optimization');
    this.isRunning = false;
  }

  async initialize() {
    // Criar diretório de otimização se não existir
    if (!fs.existsSync(this.optimizationDir)) {
      fs.mkdirSync(this.optimizationDir, { recursive: true });
    }
  }

  async optimizeDatabase() {
    logger.info('Iniciando otimização do banco de dados...');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const report = {
        timestamp,
        operations: [],
        results: {}
      };

      // 1. Limpar dados temporários
      await this.cleanTemporaryData(report);

      // 2. Otimizar índices
      await this.optimizeIndexes(report);

      // 3. Atualizar estatísticas
      await this.updateStatistics(report);

      // 4. Reorganizar tabelas
      await this.reorganizeTables(report);

      // 5. Limpar logs antigos
      await this.cleanOldLogs(report);

      // 6. Comprimir arquivos grandes
      await this.compressLargeFiles(report);

      // 7. Gerar relatório
      await this.generateOptimizationReport(report);

      logger.info('Otimização do banco de dados concluída.');

      return report;

    } catch (error) {
      logger.error('Erro durante otimização do banco de dados:', error);
      throw error;
    }
  }

  async cleanTemporaryData(report) {
    logger.info('Limpando dados temporários...');

    try {
      // Limpar documentos com extração pendente há mais de 7 dias
      const oldPendingDocs = await Document.destroy({
        where: {
          extraction_status: 'pending',
          created_at: {
            [sequelize.Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      if (oldPendingDocs > 0) {
        report.operations.push({
          type: 'clean_temporary_data',
          description: `Removidos ${oldPendingDocs} documentos com extração pendente antiga`
        });
      }

      // Limpar anotações excluídas há mais de 30 dias
      const oldDeletedNotes = await Note.destroy({
        where: {
          deleted_at: {
            [sequelize.Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      if (oldDeletedNotes > 0) {
        report.operations.push({
          type: 'clean_temporary_data',
          description: `Removidas ${oldDeletedNotes} anotações excluídas antigas`
        });
      }

      // Limpar sessões expiradas
      await sequelize.query(`
        DELETE FROM sessions 
        WHERE expires_at < NOW();
      `, { type: sequelize.QueryTypes.DELETE });

      report.operations.push({
        type: 'clean_temporary_data',
        description: 'Sessões expiradas removidas'
      });

      logger.info('Limpeza de dados temporários concluída.');

    } catch (error) {
      logger.error('Erro ao limpar dados temporários:', error);
      throw error;
    }
  }

  async optimizeIndexes(report) {
    logger.info('Otimizando índices...');

    try {
      // Recriar índices fragmentados
      const indexesToRebuild = [
        'idx_patients_name',
        'idx_documents_content',
        'idx_notes_content',
        'idx_documents_created_at'
      ];

      for (const indexName of indexesToRebuild) {
        try {
          await sequelize.query(`
            REINDEX INDEX ${indexName};
          `, { type: sequelize.QueryTypes.RAW });
          
          report.operations.push({
            type: 'optimize_indexes',
            description: `Índice ${indexName} reconstruído`
          });
        } catch (error) {
          logger.warn(`Não foi possível reconstruir índice ${indexName}: ${error.message}`);
        }
      }

      // Analisar e atualizar estatísticas
      await sequelize.query(`
        ANALYZE;
      `, { type: sequelize.QueryTypes.RAW });

      report.operations.push({
        type: 'optimize_indexes',
        description: 'Estatísticas do banco atualizadas'
      });

      logger.info('Otimização de índices concluída.');

    } catch (error) {
      logger.error('Erro ao otimizar índices:', error);
      throw error;
    }
  }

  async updateStatistics(report) {
    logger.info('Atualizando estatísticas do sistema...');

    try {
      const [userCount, patientCount, documentCount, noteCount] = await Promise.all([
        User.count(),
        Patient.count(),
        Document.count(),
        Note.count()
      ]);

      const stats = {
        users: userCount,
        patients: patientCount,
        documents: documentCount,
        notes: noteCount,
        timestamp: new Date().toISOString()
      };

      // Salvar estatísticas
      const statsFile = path.join(this.optimizationDir, `system_stats_${Date.now()}.json`);
      fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

      report.results.statistics = stats;
      report.operations.push({
        type: 'update_statistics',
        description: 'Estatísticas do sistema atualizadas'
      });

      logger.info('Estatísticas atualizadas com sucesso.');

    } catch (error) {
      logger.error('Erro ao atualizar estatísticas:', error);
      throw error;
    }
  }

  async reorganizeTables(report) {
    logger.info('Reorganizando tabelas...');

    try {
      const tablesToReorganize = [
        'users',
        'patients',
        'documents',
        'notes'
      ];

      for (const tableName of tablesToReorganize) {
        try {
          await sequelize.query(`
            VACUUM (ANALYZE, VERBOSE) ${tableName};
          `, { type: sequelize.QueryTypes.RAW });
          
          report.operations.push({
            type: 'reorganize_tables',
            description: `Tabela ${tableName} reorganizada`
          });
        } catch (error) {
          logger.warn(`Não foi possível reorganizar tabela ${tableName}: ${error.message}`);
        }
      }

      logger.info('Reorganização de tabelas concluída.');

    } catch (error) {
      logger.error('Erro ao reorganizar tabelas:', error);
      throw error;
    }
  }

  async cleanOldLogs(report) {
    logger.info('Limpando logs antigos...');

    try {
      const logDir = path.join(__dirname, '../logs');
      if (fs.existsSync(logDir)) {
        const files = fs.readdirSync(logDir);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        let cleanedFiles = 0;
        
        for (const file of files) {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < thirtyDaysAgo && file.endsWith('.log')) {
            fs.unlinkSync(filePath);
            cleanedFiles++;
          }
        }
        
        if (cleanedFiles > 0) {
          report.operations.push({
            type: 'clean_old_logs',
            description: `${cleanedFiles} arquivos de logs antigos removidos`
          });
        }
      }

      logger.info('Limpeza de logs concluída.');

    } catch (error) {
      logger.error('Erro ao limpar logs antigos:', error);
      throw error;
    }
  }

  async compressLargeFiles(report) {
    logger.info('Comprimindo arquivos grandes...');

    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        const largeFiles = [];
        
        for (const file of files) {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.size > 10 * 1024 * 1024) { // Arquivos maiores que 10MB
            largeFiles.push({
              name: file,
              size: stats.size,
              path: filePath
            });
          }
        }
        
        if (largeFiles.length > 0) {
          report.operations.push({
            type: 'compress_large_files',
            description: `${largeFiles.length} arquivos grandes identificados`
          });
          
          // Aqui você poderia adicionar lógica de compressão real
          logger.info(`Identificados ${largeFiles.length} arquivos grandes para compressão.`);
        }
      }

      logger.info('Análise de arquivos grandes concluída.');

    } catch (error) {
      logger.error('Erro ao analisar arquivos grandes:', error);
      throw error;
    }
  }

  async optimizePerformance() {
    logger.info('Iniciando otimização de performance...');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const report = {
        timestamp,
        operations: [],
        results: {}
      };

      // 1. Otimizar consultas lentas
      await this.optimizeSlowQueries(report);

      // 2. Configurar cache
      await this.configureCache(report);

      // 3. Otimizar memória
      await this.optimizeMemory(report);

      // 4. Configurar conexões
      await this.optimizeConnections(report);

      // 5. Gerar relatório
      await this.generatePerformanceReport(report);

      logger.info('Otimização de performance concluída.');

      return report;

    } catch (error) {
      logger.error('Erro durante otimização de performance:', error);
      throw error;
    }
  }

  async optimizeSlowQueries(report) {
    logger.info('Otimizando consultas lentas...');

    try {
      // Identificar consultas lentas
      const slowQueries = await sequelize.query(`
        SELECT query, mean_time, calls
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 10;
      `, { type: sequelize.QueryTypes.SELECT });

      if (slowQueries.length > 0) {
        report.operations.push({
          type: 'optimize_slow_queries',
          description: `${slowQueries.length} consultas lentas identificadas`
        });
        
        // Gerar plano de execução para as consultas mais lentas
        for (const query of slowQueries.slice(0, 3)) {
          try {
            const explainResult = await sequelize.query(`
              EXPLAIN ANALYZE ${query.query}
            `, { type: sequelize.QueryTypes.SELECT });
            
            report.results[`slow_query_${query.query}`] = explainResult;
          } catch (error) {
            logger.warn(`Não foi possível gerar plano para consulta: ${error.message}`);
          }
        }
      }

      logger.info('Análise de consultas lentas concluída.');

    } catch (error) {
      logger.error('Erro ao otimizar consultas lentas:', error);
      throw error;
    }
  }

  async configureCache(report) {
    logger.info('Configurando cache...');

    try {
      // Verificar e configurar cache de consulta
      await sequelize.query(`
        SET statement_timeout = 30000;
        SET lock_timeout = 30000;
        SET idle_in_transaction_session_timeout = 30000;
        SET client_min_messages = warning;
        SET default_table_access_method = heap;
      `, { type: sequelize.QueryTypes.RAW });

      report.operations.push({
        type: 'configure_cache',
        description: 'Configurações de cache aplicadas'
      });

      logger.info('Cache configurado com sucesso.');

    } catch (error) {
      logger.error('Erro ao configurar cache:', error);
      throw error;
    }
  }

  async optimizeMemory(report) {
    logger.info('Otimizando uso de memória...');

    try {
      const memoryUsage = process.memoryUsage();
      const memoryMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      };

      report.results.memory_usage = memoryMB;

      // Se o uso de memória estiver alto, forçar garbage collection
      if (memoryMB.heapUsed > 400) {
        if (global.gc) {
          global.gc();
          logger.info('Garbage collection forçada.');
        }
      }

      report.operations.push({
        type: 'optimize_memory',
        description: `Uso de memória monitorado: ${memoryMB.heapUsed}MB heap usado`
      });

      logger.info('Otimização de memória concluída.');

    } catch (error) {
      logger.error('Erro ao otimizar memória:', error);
      throw error;
    }
  }

  async optimizeConnections(report) {
    logger.info('Otimizando conexões...');

    try {
      // Verificar status das conexões
      const connectionStats = await sequelize.query(`
        SELECT count(*) as total_connections,
               count(*) FILTER (WHERE state = 'active') as active_connections,
               count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity;
      `, { type: sequelize.QueryTypes.SELECT });

      report.results.connection_stats = connectionStats[0];

      // Fechar conexões idle há mais de 1 hora
      await sequelize.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE state = 'idle'
        AND state_change < NOW() - INTERVAL '1 hour';
      `, { type: sequelize.QueryTypes.RAW });

      report.operations.push({
        type: 'optimize_connections',
        description: 'Conexões idle otimizadas'
      });

      logger.info('Otimização de conexões concluída.');

    } catch (error) {
      logger.error('Erro ao otimizar conexões:', error);
      throw error;
    }
  }

  async generateOptimizationReport(report) {
    logger.info('Gerando relatório de otimização...');

    try {
      const reportFile = path.join(
        this.optimizationDir,
        `optimization_report_${report.timestamp}.json`
      );

      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      // Gerar relatório HTML
      const htmlReport = this.generateHTMLReport(report);
      const htmlFile = path.join(
        this.optimizationDir,
        `optimization_report_${report.timestamp}.html`
      );

      fs.writeFileSync(htmlFile, htmlReport);

      logger.info(`Relatório de otimização gerado: ${reportFile}`);

    } catch (error) {
      logger.error('Erro ao gerar relatório de otimização:', error);
      throw error;
    }
  }

  async generatePerformanceReport(report) {
    logger.info('Gerando relatório de performance...');

    try {
      const reportFile = path.join(
        this.optimizationDir,
        `performance_report_${report.timestamp}.json`
      );

      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      // Gerar relatório HTML
      const htmlReport = this.generateHTMLReport(report);
      const htmlFile = path.join(
        this.optimizationDir,
        `performance_report_${report.timestamp}.html`
      );

      fs.writeFileSync(htmlFile, htmlReport);

      logger.info(`Relatório de performance gerado: ${reportFile}`);

    } catch (error) {
      logger.error('Erro ao gerar relatório de performance:', error);
      throw error;
    }
  }

  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Otimização - Sistema Médico</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .card h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        .card .value {
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
        }
        .operation {
            padding: 10px;
            margin: 5px 0;
            border-radius: 3px;
            border-left: 4px solid #28a745;
            background-color: #d4edda;
        }
        .operation h4 {
            margin: 0 0 5px 0;
            color: #155724;
        }
        .operation p {
            margin: 0;
            color: #155724;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Relatório de Otimização - Sistema Médico</h1>
        <p><strong>Gerado em:</strong> ${new Date(report.timestamp).toLocaleString('pt-BR')}</p>
        
        <div class="summary">
            <div class="card">
                <h3>Operações Realizadas</h3>
                <div class="value">${report.operations.length}</div>
            </div>
            <div class="card">
                <h3>Status</h3>
                <div class="value" style="color: #28a745;">Concluído</div>
            </div>
        </div>
        
        <h2>Operações Realizadas</h2>
        ${report.operations.map(op => `
            <div class="operation">
                <h4>${op.type.replace(/_/g, ' ').toUpperCase()}</h4>
                <p>${op.description}</p>
            </div>
        `).join('')}
        
        ${report.results.statistics ? `
            <h2>Estatísticas do Sistema</h2>
            <div class="summary">
                <div class="card">
                    <h3>Usuários</h3>
                    <div class="value">${report.results.statistics.users}</div>
                </div>
                <div class="card">
                    <h3>Pacientes</h3>
                    <div class="value">${report.results.statistics.patients}</div>
                </div>
                <div class="card">
                    <h3>Documentos</h3>
                    <div class="value">${report.results.statistics.documents}</div>
                </div>
                <div class="card">
                    <h3>Anotações</h3>
                    <div class="value">${report.results.statistics.notes}</div>
                </div>
            </div>
        ` : ''}
        
        <div class="footer">
            <p>Relatório gerado automaticamente pelo Sistema Médico</p>
            <p>© 2024 Sistema Médico. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;
    
    return html;
  }
}

// Instanciar otimizador
const optimizer = new SystemOptimizer();

// Funções principais
async function optimizeDatabase() {
  await optimizer.initialize();
  return await optimizer.optimizeDatabase();
}

async function optimizePerformance() {
  await optimizer.initialize();
  return await optimizer.optimizePerformance();
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
  const action = process.argv[2] || 'database';
  
  switch (action) {
    case 'database':
      optimizeDatabase()
        .then(report => {
          logger.info('Otimização do banco de dados concluída!');
          process.exit(0);
        })
        .catch(error => {
          logger.error('Erro ao otimizar banco de dados:', error);
          process.exit(1);
        });
      break;
      
    case 'performance':
      optimizePerformance()
        .then(report => {
          logger.info('Otimização de performance concluída!');
          process.exit(0);
        })
        .catch(error => {
          logger.error('Erro ao otimizar performance:', error);
          process.exit(1);
        });
      break;
      
    default:
      logger.log('Uagem: node optimize-system.js [ação]');
      logger.log('Ações disponíveis:');
      logger.log('  database   - Otimiza o banco de dados (padrão)');
      logger.log('  performance - Otimiza a performance do sistema');
      process.exit(1);
  }
}

module.exports = { SystemOptimizer, optimizeDatabase, optimizePerformance };
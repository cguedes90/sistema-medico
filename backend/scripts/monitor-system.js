#!/usr/bin/env node

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Document = require('../models/Document');
const Note = require('../models/Note');
const { logger } = require('../utils/logger');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SystemMonitor {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.alerts = [];
    this.metrics = {
      uptime: 0,
      lastCheck: null,
      totalChecks: 0,
      failedChecks: 0
    };
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Monitoramento já está em execução.');
      return;
    }

    logger.info('Iniciando monitoramento do sistema...');
    this.isRunning = true;
    this.metrics.startTime = Date.now();

    // Executar verificação imediata
    await this.performCheck();

    // Configurar intervalo de verificação (a cada 5 minutos)
    this.intervalId = setInterval(async () => {
      await this.performCheck();
    }, 5 * 60 * 1000);

    // Configar verificação de saúde da API (a cada 30 segundos)
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAPIHealth();
    }, 30 * 1000);

    logger.info('Monitoramento iniciado com sucesso.');
  }

  async stop() {
    if (!this.isRunning) {
      logger.warn('Monitoramento não está em execução.');
      return;
    }

    logger.info('Parando monitoramento do sistema...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Gerar relatório final
    await this.generateFinalReport();

    logger.info('Monitoramento parado.');
  }

  async performCheck() {
    try {
      this.metrics.totalChecks++;
      this.metrics.lastCheck = new Date();

      logger.info('Executando verificação do sistema...');

      const checks = {
        database: await this.checkDatabase(),
        api: await this.checkAPI(),
        performance: await this.checkPerformance(),
        security: await this.checkSecurity(),
        storage: await this.checkStorage()
      };

      // Processar resultados
      const hasIssues = Object.values(checks).some(check => !check.healthy);
      
      if (hasIssues) {
        this.metrics.failedChecks++;
        await this.processAlerts(checks);
      }

      // Salvar métricas
      await this.saveMetrics(checks);

      logger.info('Verificação concluída.');

    } catch (error) {
      logger.error('Erro durante verificação do sistema:', error);
      this.metrics.failedChecks++;
    }
  }

  async checkDatabase() {
    try {
      const startTime = Date.now();
      
      // Testar conexão
      await sequelize.authenticate();
      
      // Testar consultas
      const userCount = await User.count();
      const patientCount = await Patient.count();
      const documentCount = await Document.count();
      const noteCount = await Note.count();
      
      const responseTime = Date.now() - startTime;

      const healthy = responseTime < 1000 && userCount >= 0;
      
      return {
        healthy,
        responseTime,
        counts: {
          users: userCount,
          patients: patientCount,
          documents: documentCount,
          notes: noteCount
        },
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Erro ao verificar banco de dados:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async checkAPI() {
    try {
      const startTime = Date.now();
      
      // Verificar health check
      const response = await axios.get('http://localhost:3001/api/health', {
        timeout: 5000
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: response.status === 200,
        responseTime,
        status: response.status,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Erro ao verificar API:', error.message);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async checkPerformance() {
    try {
      const startTime = Date.now();
      
      // Testar consulta complexa
      const patients = await Patient.findAll({
        include: [
          {
            model: Document,
            as: 'documents'
          },
          {
            model: Note,
            as: 'notes'
          }
        ],
        limit: 10
      });
      
      const queryTime = Date.now() - startTime;
      
      // Verificar uso de memória
      const memoryUsage = process.memoryUsage();
      const memoryMB = Math.round(memoryUsage.rss / 1024 / 1024);
      
      return {
        healthy: queryTime < 2000 && memoryMB < 500,
        queryTime,
        memoryUsage: {
          rss: memoryMB,
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        },
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Erro ao verificar performance:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async checkSecurity() {
    try {
      const issues = [];
      
      // Verificar usuários com senhas fracas
      const weakPasswordUsers = await User.findAll({
        where: {
          password: {
            [sequelize.Op.like]: '%123%'
          }
        }
      });
      
      if (weakPasswordUsers.length > 0) {
        issues.push(`Usuários com senhas fracas: ${weakPasswordUsers.length}`);
      }
      
      // Verificar usuários não verificados
      const unverifiedUsers = await User.count({
        where: {
          email_verified: false
        }
      });
      
      if (unverifiedUsers > 0) {
        issues.push(`Usuários não verificados: ${unverifiedUsers}`);
      }
      
      // Verificar pacientes sem consentimento
      const patientsWithoutConsent = await Patient.count({
        where: {
          privacy_consent: false
        }
      });
      
      if (patientsWithoutConsent > 0) {
        issues.push(`Pacientes sem consentimento: ${patientsWithoutConsent}`);
      }
      
      return {
        healthy: issues.length === 0,
        issues,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Erro ao verificar segurança:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async checkStorage() {
    try {
      // Verificar espaço em disco
      const diskUsage = await this.getDiskUsage();
      
      // Verificar tamanho do banco de dados
      const dbSize = await this.getDatabaseSize();
      
      // Verificar tamanho dos arquivos de upload
      const uploadDir = path.join(__dirname, '../../uploads');
      const uploadSize = await this.getDirectorySize(uploadDir);
      
      return {
        healthy: diskUsage.usage < 80 && dbSize < 1024 * 1024 * 1024, // 1GB
        diskUsage,
        dbSize: Math.round(dbSize / 1024 / 1024), // MB
        uploadSize: Math.round(uploadSize / 1024 / 1024), // MB
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Erro ao verificar armazenamento:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async checkAPIHealth() {
    try {
      const response = await axios.get('http://localhost:3001/api/health', {
        timeout: 3000
      });
      
      if (response.status === 200) {
        logger.debug('Health check da API: OK');
      }
      
    } catch (error) {
      logger.warn(`Health check da API falhou: ${error.message}`);
      // Não gerar alerta para health check falho, apenas logar
    }
  }

  async processAlerts(checks) {
    const timestamp = new Date();
    
    // Processar alertas do banco de dados
    if (!checks.database.healthy) {
      this.addAlert({
        type: 'database',
        severity: 'high',
        message: checks.database.error || 'Banco de dados não está saudável',
        timestamp
      });
    }
    
    // Processar alertas da API
    if (!checks.api.healthy) {
      this.addAlert({
        type: 'api',
        severity: 'high',
        message: checks.api.error || 'API não está saudável',
        timestamp
      });
    }
    
    // Processar alertas de performance
    if (!checks.performance.healthy) {
      this.addAlert({
        type: 'performance',
        severity: 'medium',
        message: `Performance abaixo do esperado: ${checks.performance.queryTime}ms`,
        timestamp
      });
    }
    
    // Processar alertas de segurança
    if (!checks.security.healthy) {
      this.addAlert({
        type: 'security',
        severity: 'high',
        message: `Problemas de segurança detectados: ${checks.security.issues.join(', ')}`,
        timestamp
      });
    }
    
    // Processar alertas de armazenamento
    if (!checks.storage.healthy) {
      this.addAlert({
        type: 'storage',
        severity: 'medium',
        message: `Armazenamento abaixo do esperado: ${checks.storage.diskUsage.usage}%`,
        timestamp
      });
    }
    
    // Enviar alertas por email se necessário
    await this.sendAlerts();
  }

  addAlert(alert) {
    this.alerts.push(alert);
    logger.warn(`Alerta adicionado: ${alert.type} - ${alert.message}`);
    
    // Manter apenas os últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  async sendAlerts() {
    // Implementar envio de alertas por email, Slack, etc.
    // Por enquanto, apenas logar os alertas críticos
    const criticalAlerts = this.alerts.filter(alert => alert.severity === 'high');
    
    if (criticalAlerts.length > 0) {
      logger.error('Alertas críticos detectados:');
      criticalAlerts.forEach(alert => {
        logger.error(`- ${alert.type}: ${alert.message}`);
      });
    }
  }

  async saveMetrics(checks) {
    const metricsDir = path.join(__dirname, '../metrics');
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const metricsFile = path.join(metricsDir, `metrics_${timestamp}.json`);
    
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.metrics.startTime,
      checks: this.metrics,
      system: checks
    };
    
    // Salvar métricas diárias
    const dailyMetricsFile = path.join(metricsDir, `daily_metrics_${timestamp}.json`);
    
    try {
      let dailyMetrics = [];
      if (fs.existsSync(dailyMetricsFile)) {
        dailyMetrics = JSON.parse(fs.readFileSync(dailyMetricsFile, 'utf8'));
      }
      
      dailyMetrics.push(metrics);
      
      // Manter apenas as últimas 24 horas de métricas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      dailyMetrics = dailyMetrics.filter(m => new Date(m.timestamp) > oneDayAgo);
      
      fs.writeFileSync(dailyMetricsFile, JSON.stringify(dailyMetrics, null, 2));
      
    } catch (error) {
      logger.error('Erro ao salvar métricas:', error);
    }
  }

  async generateFinalReport() {
    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const reportFile = path.join(reportDir, `monitor_report_${timestamp}.json`);
    
    const report = {
      summary: {
        uptime: this.metrics.uptime,
        totalChecks: this.metrics.totalChecks,
        failedChecks: this.metrics.failedChecks,
        successRate: ((this.metrics.totalChecks - this.metrics.failedChecks) / this.metrics.totalChecks * 100).toFixed(2) + '%',
        totalAlerts: this.alerts.length
      },
      alerts: this.alerts,
      metrics: this.metrics,
      generated_at: new Date().toISOString()
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    logger.info(`Relatório de monitoramento gerado: ${reportFile}`);
  }

  async getDiskUsage() {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      exec('wmic logicaldisk get size,freespace,caption', (error, stdout) => {
        if (error) {
          resolve({ total: 0, free: 0, used: 0, usage: 0 });
          return;
        }
        
        const lines = stdout.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          resolve({ total: 0, free: 0, used: 0, usage: 0 });
          return;
        }
        
        const total = parseInt(lines[1].split(/\s+/)[1]) || 0;
        const free = parseInt(lines[1].split(/\s+/)[2]) || 0;
        const used = total - free;
        const usage = total > 0 ? Math.round((used / total) * 100) : 0;
        
        resolve({ total, free, used, usage });
      });
    });
  }

  async getDatabaseSize() {
    try {
      const result = await sequelize.query(`
        SELECT pg_database_size(current_database()) as size;
      `, { type: sequelize.QueryTypes.SELECT });
      
      return result[0].size || 0;
    } catch (error) {
      return 0;
    }
  }

  async getDirectorySize(dirPath) {
    return new Promise((resolve) => {
      let totalSize = 0;
      
      const { readdir, stat } = require('fs');
      const { join } = require('path');
      
      function calculateSize(currentPath) {
        readdir(currentPath, (err, files) => {
          if (err) return resolve(totalSize);
          
          let pending = files.length;
          
          if (pending === 0) resolve(totalSize);
          
          files.forEach(file => {
            const filePath = join(currentPath, file);
            stat(filePath, (err, stats) => {
              if (err) {
                if (--pending === 0) resolve(totalSize);
                return;
              }
              
              if (stats.isFile()) {
                totalSize += stats.size;
              } else if (stats.isDirectory()) {
                calculateSize(filePath);
              }
              
              if (--pending === 0) resolve(totalSize);
            });
          });
        });
      }
      
      calculateSize(dirPath);
    });
  }
}

// Instanciar monitor
const monitor = new SystemMonitor();

// Configurar handlers de sinal
process.on('SIGINT', async () => {
  logger.info('Recebido sinal SIGINT. Parando monitoramento...');
  await monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Recebido sinal SIGTERM. Parando monitoramento...');
  await monitor.stop();
  process.exit(0);
});

// Iniciar monitoramento se o script for executado diretamente
if (require.main === module) {
  monitor.start().catch(error => {
    logger.error('Erro ao iniciar monitoramento:', error);
    process.exit(1);
  });
}

module.exports = { SystemMonitor };
#!/usr/bin/env node

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Document = require('../models/Document');
const Note = require('../models/Note');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class ReportGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.isRunning = false;
  }

  async initialize() {
    // Criar diretório de relatórios se não existir
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateSystemReport() {
    logger.info('Gerando relatório do sistema...');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const report = {
        timestamp,
        type: 'system',
        title: 'Relatório do Sistema',
        summary: {},
        sections: {},
        generated_by: 'System Report Generator'
      };

      // 1. Gerar resumo do sistema
      await this.generateSystemSummary(report);

      // 2. Gerar seção de usuários
      await this.generateUsersSection(report);

      // 3. Gerar seção de pacientes
      await this.generatePatientsSection(report);

      // 4. Gerar seção de documentos
      await this.generateDocumentsSection(report);

      // 5. Gerar seção de anotações
      await this.generateNotesSection(report);

      // 6. Gerar seção de desempenho
      await this.generatePerformanceSection(report);

      // 7. Gerar seção de segurança
      await this.generateSecuritySection(report);

      // 8. Gerar conclusões
      await this.generateConclusions(report);

      // 9. Salvar relatórios
      await this.saveReports(report);

      logger.info('Relatório do sistema gerado com sucesso.');

      return report;

    } catch (error) {
      logger.error('Erro ao gerar relatório do sistema:', error);
      throw error;
    }
  }

  async generateSystemSummary(report) {
    logger.info('Gerando resumo do sistema...');

    try {
      const [userCount, patientCount, documentCount, noteCount] = await Promise.all([
        User.count(),
        Patient.count(),
        Document.count(),
        Note.count()
      ]);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const recentActivity = {
        patients: await Patient.count({
          where: { created_at: { [sequelize.Op.gte]: thirtyDaysAgo } }
        }),
        documents: await Document.count({
          where: { created_at: { [sequelize.Op.gte]: thirtyDaysAgo } }
        }),
        notes: await Note.count({
          where: { created_at: { [sequelize.Op.gte]: thirtyDaysAgo } }
        })
      };

      report.summary = {
        total_users: userCount,
        total_patients: patientCount,
        total_documents: documentCount,
        total_notes: noteCount,
        recent_activity: recentActivity,
        system_health: 'healthy',
        generated_at: new Date().toISOString()
      };

      logger.info('Resumo do sistema gerado.');

    } catch (error) {
      logger.error('Erro ao gerar resumo do sistema:', error);
      throw error;
    }
  }

  async generateUsersSection(report) {
    logger.info('Gerando seção de usuários...');

    try {
      // Distribuição por função
      const roleDistribution = await User.findAll({
        attributes: [
          'role',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['role'],
        raw: true
      });

      // Usuários ativos vs inativos
      const activeUsers = await User.count({
        where: { is_active: true }
      });

      const inactiveUsers = await User.count({
        where: { is_active: false }
      });

      // Médicos por especialidade
      const doctorsBySpecialty = await User.findAll({
        attributes: [
          'specialty',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { role: 'doctor' },
        group: ['specialty'],
        raw: true
      });

      // Usuários mais ativos
      const activeUsersList = await User.findAll({
        attributes: ['name', 'email', 'last_login'],
        where: { 
          is_active: true,
          last_login: { [sequelize.Op.not]: null }
        },
        order: [['last_login', 'DESC']],
        limit: 10,
        raw: true
      });

      report.sections.users = {
        role_distribution: roleDistribution,
        active_vs_inactive: {
          active: activeUsers,
          inactive: inactiveUsers,
          total: activeUsers + inactiveUsers
        },
        doctors_by_specialty: doctorsBySpecialty,
        most_active_users: activeUsersList
      };

      logger.info('Seção de usuários gerada.');

    } catch (error) {
      logger.error('Erro ao gerar seção de usuários:', error);
      throw error;
    }
  }

  async generatePatientsSection(report) {
    logger.info('Gerando seção de pacientes...');

    try {
      // Distribuição por gênero
      const genderDistribution = await Patient.findAll({
        attributes: [
          'gender',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['gender'],
        raw: true
      });

      // Distribuição etária
      const ageDistribution = await this.getDetailedAgeDistribution();

      // Pacientes com condições médicas
      const patientsWithConditions = await Patient.count({
        where: {
          pre_existing_conditions: {
            [sequelize.Op.not]: null,
            [sequelize.Op.not]: []
          }
        }
      });

      // Pacientes com alergias
      const patientsWithAllergies = await Patient.count({
        where: {
          allergies: {
            [sequelize.Op.not]: null,
            [sequelize.Op.not]: []
          }
        }
      });

      // Pacientes mais recentes
      const recentPatients = await Patient.findAll({
        attributes: ['name', 'email', 'birth_date', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 10,
        raw: true
      });

      report.sections.patients = {
        gender_distribution: genderDistribution,
        age_distribution: ageDistribution,
        medical_conditions: {
          with_conditions: patientsWithConditions,
          with_allergies: patientsWithAllergies,
          total_patients: report.summary.total_patients
        },
        recent_patients: recentPatients
      };

      logger.info('Seção de pacientes gerada.');

    } catch (error) {
      logger.error('Erro ao gerar seção de pacientes:', error);
      throw error;
    }
  }

  async getDetailedAgeDistribution() {
    try {
      const ageGroups = {
        '0-10': 0,
        '11-20': 0,
        '21-30': 0,
        '31-40': 0,
        '41-50': 0,
        '51-60': 0,
        '61-70': 0,
        '71-80': 0,
        '80+': 0
      };

      const patients = await Patient.findAll({
        attributes: ['birth_date'],
        raw: true
      });

      const currentYear = new Date().getFullYear();

      patients.forEach(patient => {
        if (patient.birth_date) {
          const birthYear = new Date(patient.birth_date).getFullYear();
          const age = currentYear - birthYear;

          if (age <= 10) ageGroups['0-10']++;
          else if (age <= 20) ageGroups['11-20']++;
          else if (age <= 30) ageGroups['21-30']++;
          else if (age <= 40) ageGroups['31-40']++;
          else if (age <= 50) ageGroups['41-50']++;
          else if (age <= 60) ageGroups['51-60']++;
          else if (age <= 70) ageGroups['61-70']++;
          else if (age <= 80) ageGroups['71-80']++;
          else ageGroups['80+']++;
        }
      });

      return ageGroups;

    } catch (error) {
      logger.error('Erro ao obter distribuição etária detalhada:', error);
      return {};
    }
  }

  async generateDocumentsSection(report) {
    logger.info('Gerando seção de documentos...');

    try {
      // Distribuição por categoria
      const categoryDistribution = await Document.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category'],
        raw: true
      });

      // Distribuição por tipo de arquivo
      const fileTypeDistribution = await Document.findAll({
        attributes: [
          'mime_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['mime_type'],
        raw: true
      });

      // Estatísticas de tamanho
      const sizeStats = await Document.findAll({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('file_size')), 'avg_size'],
          [sequelize.fn('MAX', sequelize.col('file_size')), 'max_size'],
          [sequelize.fn('MIN', sequelize.col('file_size')), 'min_size'],
          [sequelize.fn('SUM', sequelize.col('file_size')), 'total_size']
        ],
        raw: true
      });

      // Documentos por status de extração
      const extractionStatus = await Document.findAll({
        attributes: [
          'extraction_status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['extraction_status'],
        raw: true
      });

      // Documentos mais recentes
      const recentDocuments = await Document.findAll({
        attributes: [
          'original_name', 'category', 'file_size', 'created_at',
          [sequelize.col('patient->name'), 'patient_name']
        ],
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: []
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10,
        raw: true
      });

      report.sections.documents = {
        category_distribution: categoryDistribution,
        file_type_distribution: fileTypeDistribution,
        size_statistics: sizeStats[0],
        extraction_status: extractionStatus,
        recent_documents: recentDocuments
      };

      logger.info('Seção de documentos gerada.');

    } catch (error) {
      logger.error('Erro ao gerar seção de documentos:', error);
      throw error;
    }
  }

  async generateNotesSection(report) {
    logger.info('Gerando seção de anotações...');

    try {
      // Distribuição por tipo
      const typeDistribution = await Note.findAll({
        attributes: [
          'note_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['note_type'],
        raw: true
      });

      // Anotações por usuário
      const notesByUser = await Note.findAll({
        attributes: [
          [sequelize.col('user->name'), 'user_name'],
          [sequelize.fn('COUNT', sequelize.col('notes.id')), 'count']
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: []
          }
        ],
        group: ['user->name'],
        order: [[sequelize.fn('COUNT', sequelize.col('notes.id')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Anotações mais recentes
      const recentNotes = await Note.findAll({
        attributes: [
          'title', 'note_type', 'created_at',
          [sequelize.col('user->name'), 'user_name'],
          [sequelize.col('patient->name'), 'patient_name']
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: []
          },
          {
            model: Patient,
            as: 'patient',
            attributes: []
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10,
        raw: true
      });

      // Comprimento médio das anotações
      const lengthStats = await Note.findAll({
        attributes: [
          [sequelize.fn('AVG', sequelize.fn('LENGTH', sequelize.col('content'))), 'avg_length'],
          [sequelize.fn('MAX', sequelize.fn('LENGTH', sequelize.col('content'))), 'max_length'],
          [sequelize.fn('MIN', sequelize.fn('LENGTH', sequelize.col('content'))), 'min_length']
        ],
        raw: true
      });

      report.sections.notes = {
        type_distribution: typeDistribution,
        notes_by_user: notesByUser,
        recent_notes: recentNotes,
        length_statistics: lengthStats[0]
      };

      logger.info('Seção de anotações gerada.');

    } catch (error) {
      logger.error('Erro ao gerar seção de anotações:', error);
      throw error;
    }
  }

  async generatePerformanceSection(report) {
    logger.info('Gerando seção de desempenho...');

    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      // Estatísticas de banco de dados
      const dbStats = await sequelize.query(`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as db_size,
          pg_size_pretty(pg_total_relation_size('public.patients')) as patients_size,
          pg_size_pretty(pg_total_relation_size('public.documents')) as documents_size,
          pg_size_pretty(pg_total_relation_size('public.notes')) as notes_size;
      `, { type: sequelize.QueryTypes.SELECT });

      // Estatísticas de índices
      const indexStats = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexrelid)) as index_size
        FROM pg_stat_user_indexes
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 10;
      `, { type: sequelize.QueryTypes.SELECT });

      report.sections.performance = {
        system: {
          uptime: Math.round(uptime),
          memory_usage: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heap_used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heap_total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
          }
        },
        database: dbStats[0],
        indexes: indexStats
      };

      logger.info('Seção de desempenho gerada.');

    } catch (error) {
      logger.error('Erro ao gerar seção de desempenho:', error);
      throw error;
    }
  }

  async generateSecuritySection(report) {
    logger.info('Gerando seção de segurança...');

    try {
      // Usuários não verificados
      const unverifiedUsers = await User.count({
        where: { email_verified: false }
      });

      // Senhas fracas (padrão simples)
      const weakPasswords = await User.count({
        where: {
          password: {
            [sequelize.Op.like]: '%123%'
          }
        }
      });

      // Pacientes sem consentimento
      const patientsWithoutConsent = await Patient.count({
        where: { privacy_consent: false }
      });

      // Documentos sensíveis
      const sensitiveDocuments = await Document.count({
        where: { is_sensitive: true }
      });

      // Acessos recentes
      const recentAccess = await User.findAll({
        attributes: ['name', 'last_login', 'email_verified'],
        where: { 
          last_login: { [sequelize.Op.not]: null },
          last_login: { [sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        order: [['last_login', 'DESC']],
        limit: 10,
        raw: true
      });

      report.sections.security = {
        user_verification: {
          unverified_users: unverifiedUsers,
          weak_passwords: weakPasswords,
          total_users: report.summary.total_users
        },
        patient_privacy: {
          without_consent: patientsWithoutConsent,
          total_patients: report.summary.total_patients
        },
        document_security: {
          sensitive_documents: sensitiveDocuments,
          total_documents: report.summary.total_documents
        },
        recent_access: recentAccess
      };

      logger.info('Seção de segurança gerada.');

    } catch (error) {
      logger.error('Erro ao gerar seção de segurança:', error);
      throw error;
    }
  }

  async generateConclusions(report) {
    logger.info('Gerando conclusões...');

    try {
      const conclusions = [];

      // Conclusões baseadas em dados gerais
      if (report.summary.total_patients > 1000) {
        conclusions.push({
          type: 'growth',
          message: 'O sistema está atendendo a um número significativo de pacientes, indicando adoção bem-sucedida.',
          priority: 'high'
        });
      }

      // Conclusões baseadas em segurança
      if (report.sections.security.user_verification.unverified_users > 0) {
        conclusions.push({
          type: 'security',
          message: `${report.sections.security.user_verification.unverified_users} usuários não verificados. Recomenda-se verificar todos os usuários.`,
          priority: 'high'
        });
      }

      // Conclusões baseadas em documentos
      const extractionRate = report.sections.documents.extraction_status;
      const completedExtraction = extractionStatus.find(s => s.extraction_status === 'completed');
      if (completedExtraction && completedExtraction.count / report.summary.total_documents < 0.8) {
        conclusions.push({
          type: 'efficiency',
          message: 'Taxa de extração de texto abaixo do ideal. Considerar otimizar o processo.',
          priority: 'medium'
        });
      }

      // Conclusões baseadas em atividade recente
      const totalRecentActivity = Object.values(report.summary.recent_activity).reduce((a, b) => a + b, 0);
      if (totalRecentActivity < 10) {
        conclusions.push({
          type: 'activity',
          message: 'Atividade recente baixa. Verificar se o sistema está sendo utilizado normalmente.',
          priority: 'medium'
        });
      }

      report.conclusions = conclusions;

      logger.info('Conclusões geradas.');

    } catch (error) {
      logger.error('Erro ao gerar conclusões:', error);
      throw error;
    }
  }

  async saveReports(report) {
    logger.info('Salvando relatórios...');

    try {
      // Salvar relatório JSON
      const jsonFile = path.join(this.reportsDir, `system_report_${report.timestamp}.json`);
      fs.writeFileSync(jsonFile, JSON.stringify(report, null, 2));

      // Gerar relatório HTML
      const htmlReport = this.generateHTMLReport(report);
      const htmlFile = path.join(this.reportsDir, `system_report_${report.timestamp}.html`);
      fs.writeFileSync(htmlFile, htmlReport);

      // Gerar relatório PDF (simulado)
      const pdfReport = this.generateTextReport(report);
      const pdfFile = path.join(this.reportsDir, `system_report_${report.timestamp}.txt`);
      fs.writeFileSync(pdfFile, pdfReport);

      logger.info(`Relatórios salvos: ${jsonFile}, ${htmlFile}, ${pdfFile}`);

    } catch (error) {
      logger.error('Erro ao salvar relatórios:', error);
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
    <title>${report.title} - Sistema Médico</title>
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
        .section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .section h2 {
            color: #2c3e50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .conclusion {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #3498db;
            background-color: #f8f9fa;
        }
        .conclusion h4 {
            margin: 0 0 5px 0;
            color: #2c3e50;
        }
        .conclusion p {
            margin: 5px 0;
            color: #555;
        }
        .priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }
        .priority.high {
            background-color: #e74c3c;
        }
        .priority.medium {
            background-color: #f39c12;
        }
        .priority.low {
            background-color: #27ae60;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${report.title}</h1>
        <p><strong>Gerado em:</strong> ${new Date(report.timestamp).toLocaleString('pt-BR')}</p>
        <p><strong>Tipo:</strong> ${report.type}</p>
        
        <div class="summary">
            <div class="card">
                <h3>Total de Usuários</h3>
                <div class="value">${report.summary.total_users}</div>
            </div>
            <div class="card">
                <h3>Total de Pacientes</h3>
                <div class="value">${report.summary.total_patients}</div>
            </div>
            <div class="card">
                <h3>Total de Documentos</h3>
                <div class="value">${report.summary.total_documents}</div>
            </div>
            <div class="card">
                <h3>Total de Anotações</h3>
                <div class="value">${report.summary.total_notes}</div>
            </div>
        </div>
        
        ${report.conclusions.length > 0 ? `
        <div class="section">
            <h2>Conclusões</h2>
            ${report.conclusions.map(conclusion => `
                <div class="conclusion">
                    <h4>${conclusion.message}
                        <span class="priority ${conclusion.priority}">${conclusion.priority.toUpperCase()}</span>
                    </h4>
                    <p><strong>Tipo:</strong> ${conclusion.type}</p>
                </div>
            `).join('')}
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

  generateTextReport(report) {
    const lines = [];
    
    lines.push('='.repeat(60));
    lines.push(report.title.toUpperCase());
    lines.push('='.repeat(60));
    lines.push(`Gerado em: ${new Date(report.timestamp).toLocaleString('pt-BR')}`);
    lines.push(`Tipo: ${report.type}`);
    lines.push('');
    
    // Resumo
    lines.push('RESUMO DO SISTEMA');
    lines.push('-'.repeat(30));
    lines.push(`Total de Usuários: ${report.summary.total_users}`);
    lines.push(`Total de Pacientes: ${report.summary.total_patients}`);
    lines.push(`Total de Documentos: ${report.summary.total_documents}`);
    lines.push(`Total de Anotações: ${report.summary.total_notes}`);
    lines.push('');
    
    // Conclusões
    if (report.conclusions.length > 0) {
      lines.push('CONCLUSÕES');
      lines.push('-'.repeat(30));
      report.conclusions.forEach((conclusion, index) => {
        lines.push(`${index + 1}. ${conclusion.message}`);
        lines.push(`   Tipo: ${conclusion.type} | Prioridade: ${conclusion.priority}`);
        lines.push('');
      });
    }
    
    return lines.join('\n');
  }
}

// Instanciar gerador de relatórios
const reportGenerator = new ReportGenerator();

// Funções principais
async function generateSystemReport() {
  await reportGenerator.initialize();
  return await reportGenerator.generateSystemReport();
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
  generateSystemReport()
    .then(report => {
      logger.info('Relatório do sistema gerado com sucesso!');
      logger.info(`Relatórios salvos em: ${reportGenerator.reportsDir}`);
      process.exit(0);
    })
    .catch(error => {
      logger.error('Erro ao gerar relatório do sistema:', error);
      process.exit(1);
    });
}

module.exports = { ReportGenerator, generateSystemReport };
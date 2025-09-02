#!/usr/bin/env node

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Document = require('../models/Document');
const Note = require('../models/Note');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class DataAnalyzer {
  constructor() {
    this.analysisDir = path.join(__dirname, '../analysis');
    this.isRunning = false;
  }

  async initialize() {
    // Criar diretório de análise se não existir
    if (!fs.existsSync(this.analysisDir)) {
      fs.mkdirSync(this.analysisDir, { recursive: true });
    }
  }

  async analyzeSystemData() {
    logger.info('Iniciando análise de dados do sistema...');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const analysis = {
        timestamp,
        summary: {},
        detailed: {},
        trends: {},
        recommendations: []
      };

      // 1. Análise geral do sistema
      await this.analyzeSystemOverview(analysis);

      // 2. Análise de pacientes
      await this.analyzePatients(analysis);

      // 3. Análise de documentos
      await this.analyzeDocuments(analysis);

      // 4. Análise de anotações
      await this.analyzeNotes(analysis);

      // 5. Análise de usuários
      await this.analyzeUsers(analysis);

      // 6. Análise de tendências
      await this.analyzeTrends(analysis);

      // 7. Gerar recomendações
      await this.generateRecommendations(analysis);

      // 8. Gerar relatórios
      await this.generateAnalysisReports(analysis);

      logger.info('Análise de dados concluída.');

      return analysis;

    } catch (error) {
      logger.error('Erro durante análise de dados:', error);
      throw error;
    }
  }

  async analyzeSystemOverview(analysis) {
    logger.info('Analisando visão geral do sistema...');

    try {
      const [userCount, patientCount, documentCount, noteCount] = await Promise.all([
        User.count(),
        Patient.count(),
        Document.count(),
        Note.count()
      ]);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const recentDocuments = await Document.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: thirtyDaysAgo
          }
        }
      });

      const recentNotes = await Note.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: thirtyDaysAgo
          }
        }
      });

      analysis.summary = {
        total_users: userCount,
        total_patients: patientCount,
        total_documents: documentCount,
        total_notes: noteCount,
        recent_documents: recentDocuments,
        recent_notes: recentNotes,
        documents_per_patient: patientCount > 0 ? (documentCount / patientCount).toFixed(2) : 0,
        notes_per_patient: patientCount > 0 ? (noteCount / patientCount).toFixed(2) : 0
      };

      logger.info('Visão geral do sistema analisada.');

    } catch (error) {
      logger.error('Erro ao analisar visão geral do sistema:', error);
      throw error;
    }
  }

  async analyzePatients(analysis) {
    logger.info('Analisando dados de pacientes...');

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

      // Distribuição por faixa etária
      const ageGroups = await this.getAgeDistribution();

      // Distribuição por tipo sanguíneo
      const bloodTypeDistribution = await Patient.findAll({
        attributes: [
          'blood_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          blood_type: {
            [sequelize.Op.not]: null
          }
        },
        group: ['blood_type'],
        raw: true
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

      // Pacientes com condições pré-existentes
      const patientsWithConditions = await Patient.count({
        where: {
          pre_existing_conditions: {
            [sequelize.Op.not]: null,
            [sequelize.Op.not]: []
          }
        }
      });

      analysis.detailed.patients = {
        gender_distribution: genderDistribution,
        age_distribution: ageGroups,
        blood_type_distribution: bloodTypeDistribution,
        patients_with_allergies: patientsWithAllergies,
        patients_with_conditions: patientsWithConditions,
        allergy_rate: patientCount > 0 ? ((patientsWithAllergies / patientCount) * 100).toFixed(2) + '%' : '0%',
        condition_rate: patientCount > 0 ? ((patientsWithConditions / patientCount) * 100).toFixed(2) + '%' : '0%'
      };

      logger.info('Análise de pacientes concluída.');

    } catch (error) {
      logger.error('Erro ao analisar dados de pacientes:', error);
      throw error;
    }
  }

  async getAgeDistribution() {
    try {
      const ageGroups = {
        '0-18': 0,
        '19-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0
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

          if (age <= 18) ageGroups['0-18']++;
          else if (age <= 35) ageGroups['19-35']++;
          else if (age <= 50) ageGroups['36-50']++;
          else if (age <= 65) ageGroups['51-65']++;
          else ageGroups['65+']++;
        }
      });

      return ageGroups;

    } catch (error) {
      logger.error('Erro ao obter distribuição etária:', error);
      return {};
    }
  }

  async analyzeDocuments(analysis) {
    logger.info('Analisando documentos...');

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

      // Tamanho médio dos documentos
      const documentSizes = await Document.findAll({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('file_size')), 'avg_size'],
          [sequelize.fn('MAX', sequelize.col('file_size')), 'max_size'],
          [sequelize.fn('MIN', sequelize.col('file_size')), 'min_size']
        ],
        raw: true
      });

      // Documentos com extração concluída
      const extractedDocuments = await Document.count({
        where: {
          extraction_status: 'completed'
        }
      });

      // Documentos sensíveis
      const sensitiveDocuments = await Document.count({
        where: {
          is_sensitive: true
        }
      });

      analysis.detailed.documents = {
        category_distribution: categoryDistribution,
        file_type_distribution: fileTypeDistribution,
        size_stats: documentSizes[0],
        extracted_documents: extractedDocuments,
        sensitive_documents: sensitiveDocuments,
        extraction_rate: documentCount > 0 ? ((extractedDocuments / documentCount) * 100).toFixed(2) + '%' : '0%',
        sensitivity_rate: documentCount > 0 ? ((sensitiveDocuments / documentCount) * 100).toFixed(2) + '%' : '0%'
      };

      logger.info('Análise de documentos concluída.');

    } catch (error) {
      logger.error('Erro ao analisar documentos:', error);
      throw error;
    }
  }

  async analyzeNotes(analysis) {
    logger.info('Analisando anotações...');

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

      // Comprimento médio das anotações
      const noteLengths = await Note.findAll({
        attributes: [
          [sequelize.fn('AVG', sequelize.fn('LENGTH', sequelize.col('content'))), 'avg_length'],
          [sequelize.fn('MAX', sequelize.fn('LENGTH', sequelize.col('content'))), 'max_length'],
          [sequelize.fn('MIN', sequelize.fn('LENGTH', sequelize.col('content'))), 'min_length']
        ],
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

      analysis.detailed.notes = {
        type_distribution: typeDistribution,
        length_stats: noteLengths[0],
        notes_by_user: notesByUser
      };

      logger.info('Análise de anotações concluída.');

    } catch (error) {
      logger.error('Erro ao analisar anotações:', error);
      throw error;
    }
  }

  async analyzeUsers(analysis) {
    logger.info('Analisando usuários...');

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

      // Usuários verificados
      const verifiedUsers = await User.count({
        where: {
          email_verified: true
        }
      });

      // Usuários ativos
      const activeUsers = await User.count({
        where: {
          is_active: true
        }
      });

      // Médicos por especialidade
      const doctorsBySpecialty = await User.findAll({
        attributes: [
          'specialty',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          role: 'doctor'
        },
        group: ['specialty'],
        raw: true
      });

      analysis.detailed.users = {
        role_distribution: roleDistribution,
        verified_users: verifiedUsers,
        active_users: activeUsers,
        verification_rate: userCount > 0 ? ((verifiedUsers / userCount) * 100).toFixed(2) + '%' : '0%',
        activity_rate: userCount > 0 ? ((activeUsers / userCount) * 100).toFixed(2) + '%' : '0%',
        doctors_by_specialty: doctorsBySpecialty
      };

      logger.info('Análise de usuários concluída.');

    } catch (error) {
      logger.error('Erro ao analisar usuários:', error);
      throw error;
    }
  }

  async analyzeTrends(analysis) {
    logger.info('Analisando tendências...');

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // Tendência de cadastros de pacientes
      const recentPatients = await Patient.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: thirtyDaysAgo
          }
        }
      });

      const olderPatients = await Patient.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: ninetyDaysAgo,
            [sequelize.Op.lt]: thirtyDaysAgo
          }
        }
      });

      // Tendência de documentos
      const recentDocuments = await Document.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: thirtyDaysAgo
          }
        }
      });

      const olderDocuments = await Document.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: ninetyDaysAgo,
            [sequelize.Op.lt]: thirtyDaysAgo
          }
        }
      });

      // Tendência de anotações
      const recentNotes = await Note.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: thirtyDaysAgo
          }
        }
      });

      const olderNotes = await Note.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: ninetyDaysAgo,
            [sequelize.Op.lt]: thirtyDaysAgo
          }
        }
      });

      analysis.trends = {
        patients: {
          recent: recentPatients,
          older: olderPatients,
          trend: this.calculateTrend(recentPatients, olderPatients)
        },
        documents: {
          recent: recentDocuments,
          older: olderDocuments,
          trend: this.calculateTrend(recentDocuments, olderDocuments)
        },
        notes: {
          recent: recentNotes,
          older: olderNotes,
          trend: this.calculateTrend(recentNotes, olderNotes)
        }
      };

      logger.info('Análise de tendências concluída.');

    } catch (error) {
      logger.error('Erro ao analisar tendências:', error);
      throw error;
    }
  }

  calculateTrend(recent, older) {
    if (older === 0) return recent > 0 ? 'increasing' : 'stable';
    
    const percentage = ((recent - older) / older) * 100;
    
    if (percentage > 20) return 'increasing_fast';
    if (percentage > 5) return 'increasing';
    if (percentage < -20) return 'decreasing_fast';
    if (percentage < -5) return 'decreasing';
    return 'stable';
  }

  async generateRecommendations(analysis) {
    logger.info('Gerando recomendações...');

    try {
      const recommendations = [];

      // Recomendações baseadas em dados de pacientes
      if (analysis.summary.patients_with_allergies > 0) {
        recommendations.push({
          type: 'patient_safety',
          priority: 'high',
          title: 'Alergias não documentadas',
          description: `${analysis.summary.patients_with_allergies} pacientes têm alergias registradas. Verificar se todas as alergias estão atualizadas.`,
          action: 'Atualizar informações de alergias de todos os pacientes.'
        });
      }

      // Recomendações baseadas em documentos
      if (analysis.detailed.documents.extraction_rate < 80) {
        recommendations.push({
          type: 'document_processing',
          priority: 'medium',
          title: 'Extração de texto pendente',
          description: `${analysis.detailed.documents.extraction_rate} dos documentos tiveram extração de texto concluída.`,
          action: 'Priorizar a extração de texto para documentos pendentes.'
        });
      }

      // Recomendações baseadas em usuários
      if (analysis.detailed.users.verification_rate < 90) {
        recommendations.push({
          type: 'user_management',
          priority: 'medium',
          title: 'Usuários não verificados',
          description: `${analysis.detailed.users.verification_rate} dos usuários estão verificados.`,
          action: 'Solicitar verificação de email para usuários pendentes.'
        });
      }

      // Recomendações baseadas em tendências
      if (analysis.trends.patients.trend === 'increasing_fast') {
        recommendations.push({
          type: 'system_capacity',
          priority: 'medium',
          title: 'Crescimento rápido de pacientes',
          description: 'O número de pacientes está aumentando rapidamente.',
          action: 'Considerar expandir capacidade do sistema e equipe.'
        });
      }

      analysis.recommendations = recommendations;

      logger.info('Recomendações geradas com sucesso.');

    } catch (error) {
      logger.error('Erro ao gerar recomendações:', error);
      throw error;
    }
  }

  async generateAnalysisReports(analysis) {
    logger.info('Gerando relatórios de análise...');

    try {
      // Salvar relatório JSON
      const jsonFile = path.join(this.analysisDir, `analysis_report_${analysis.timestamp}.json`);
      fs.writeFileSync(jsonFile, JSON.stringify(analysis, null, 2));

      // Gerar relatório HTML
      const htmlReport = this.generateHTMLReport(analysis);
      const htmlFile = path.join(this.analysisDir, `analysis_report_${analysis.timestamp}.html`);
      fs.writeFileSync(htmlFile, htmlReport);

      // Gerar relatório CSV para exportação
      const csvReport = this.generateCSVReport(analysis);
      const csvFile = path.join(this.analysisDir, `analysis_report_${analysis.timestamp}.csv`);
      fs.writeFileSync(csvFile, csvReport);

      logger.info(`Relatórios gerados: ${jsonFile}, ${htmlFile}, ${csvFile}`);

    } catch (error) {
      logger.error('Erro ao gerar relatórios:', error);
      throw error;
    }
  }

  generateHTMLReport(analysis) {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Análise de Dados - Sistema Médico</title>
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
        .recommendation {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #f39c12;
        }
        .recommendation.high {
            border-left-color: #e74c3c;
            background-color: #fdf2f2;
        }
        .recommendation.medium {
            border-left-color: #f39c12;
            background-color: #fef9f3;
        }
        .recommendation.low {
            border-left-color: #27ae60;
            background-color: #f2fdf4;
        }
        .recommendation h4 {
            margin: 0 0 5px 0;
            color: #2c3e50;
        }
        .recommendation p {
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
    </style>
</head>
<body>
    <div class="container">
        <h1>Relatório de Análise de Dados - Sistema Médico</h1>
        <p><strong>Gerado em:</strong> ${new Date(analysis.timestamp).toLocaleString('pt-BR')}</p>
        
        <div class="summary">
            <div class="card">
                <h3>Total de Usuários</h3>
                <div class="value">${analysis.summary.total_users}</div>
            </div>
            <div class="card">
                <h3>Total de Pacientes</h3>
                <div class="value">${analysis.summary.total_patients}</div>
            </div>
            <div class="card">
                <h3>Total de Documentos</h3>
                <div class="value">${analysis.summary.total_documents}</div>
            </div>
            <div class="card">
                <h3>Total de Anotações</h3>
                <div class="value">${analysis.summary.total_notes}</div>
            </div>
            <div class="card">
                <h3>Documentos/Paciente</h3>
                <div class="value">${analysis.summary.documents_per_patient}</div>
            </div>
            <div class="card">
                <h3>Anotações/Paciente</h3>
                <div class="value">${analysis.summary.notes_per_patient}</div>
            </div>
        </div>
        
        ${analysis.recommendations.length > 0 ? `
        <div class="section">
            <h2>Recomendações</h2>
            ${analysis.recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <h4>${rec.title}
                        <span class="priority ${rec.priority}">${rec.priority.toUpperCase()}</span>
                    </h4>
                    <p><strong>Tipo:</strong> ${rec.type}</p>
                    <p><strong>Descrição:</strong> ${rec.description}</p>
                    <p><strong>Ação:</strong> ${rec.action}</p>
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

  generateCSVReport(analysis) {
    const lines = [];
    
    // Cabeçalho
    lines.push('Métrica,Valor');
    
    // Dados gerais
    lines.push(`Total de Usuários,${analysis.summary.total_users}`);
    lines.push(`Total de Pacientes,${analysis.summary.total_patients}`);
    lines.push(`Total de Documentos,${analysis.summary.total_documents}`);
    lines.push(`Total de Anotações,${analysis.summary.total_notes}`);
    lines.push(`Documentos por Paciente,${analysis.summary.documents_per_patient}`);
    lines.push(`Anotações por Paciente,${analysis.summary.notes_per_patient}`);
    
    // Recomendações
    lines.push('');
    lines.push('Recomendações');
    lines.push('Prioridade,Tipo,Título,Descrição,Ação');
    
    analysis.recommendations.forEach(rec => {
      lines.push(`"${rec.priority}","${rec.type}","${rec.title}","${rec.description}","${rec.action}"`);
    });
    
    return lines.join('\n');
  }
}

// Instanciar analisador
const dataAnalyzer = new DataAnalyzer();

// Funções principais
async function analyzeData() {
  await dataAnalyzer.initialize();
  return await dataAnalyzer.analyzeSystemData();
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
  analyzeData()
    .then(analysis => {
      logger.info('Análise de dados concluída!');
      logger.info(`Relatório gerado em: ${dataAnalyzer.analysisDir}`);
      process.exit(0);
    })
    .catch(error => {
      logger.error('Erro ao analisar dados:', error);
      process.exit(1);
    });
}

module.exports = { DataAnalyzer, analyzeData };
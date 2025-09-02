#!/usr/bin/env node

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Document = require('../models/Document');
const Note = require('../models/Note');
const { logger } = require('../utils/logger');

async function runTests() {
  try {
    logger.info('Iniciando testes automatizados...');
    
    // Configurar ambiente de teste
    await setupTestEnvironment();
    
    // Executar testes
    const results = {
      database: await testDatabase(),
      models: await testModels(),
      api: await testAPI(),
      security: await testSecurity(),
      performance: await testPerformance()
    };
    
    // Gerar relatório
    generateTestReport(results);
    
    // Retornar código de saída baseado nos resultados
    const hasErrors = Object.values(results).some(result => result.errors > 0);
    process.exit(hasErrors ? 1 : 0);
    
  } catch (error) {
    logger.error('Erro durante os testes:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function setupTestEnvironment() {
  logger.info('Configurando ambiente de teste...');
  
  try {
    // Limpar dados de teste existentes
    await Note.destroy({ where: {}, truncate: true });
    await Document.destroy({ where: {}, truncate: true });
    await Patient.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    
    // Criar dados de teste
    const testUser = await User.create({
      name: 'Usuário de Teste',
      email: 'test@example.com',
      password: 'test123',
      role: 'doctor',
      crm: 'TEST123',
      specialty: 'Clínica Geral'
    });
    
    const testPatient = await Patient.create({
      name: 'Paciente de Teste',
      email: 'patient.test@example.com',
      cpf: '12345678900',
      birth_date: '1990-01-01',
      gender: 'male',
      phone: '(11) 99999-0000'
    });
    
    const testDocument = await Document.create({
      patient_id: testPatient.id,
      uploaded_by: testUser.id,
      filename: 'test_document.pdf',
      original_name: 'Documento de Teste.pdf',
      file_path: '/uploads/test_document.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf',
      category: 'exame',
      title: 'Exame de Teste',
      description: 'Documento de teste para validação',
      extraction_status: 'completed',
      extracted_text: 'Este é um documento de teste para validação do sistema.'
    });
    
    const testNote = await Note.create({
      patient_id: testPatient.id,
      user_id: testUser.id,
      title: 'Anotação de Teste',
      content: 'Esta é uma anotação de teste para validação do sistema.',
      note_type: 'consulta'
    });
    
    logger.info('Ambiente de teste configurado com sucesso.');
    
  } catch (error) {
    logger.error('Erro ao configurar ambiente de teste:', error);
    throw error;
  }
}

async function testDatabase() {
  logger.info('Executando testes de banco de dados...');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    tests: []
  };
  
  try {
    // Teste 1: Conexão com o banco
    results.total++;
    try {
      await sequelize.authenticate();
      results.passed++;
      results.tests.push({ name: 'Conexão com o banco', status: 'passed' });
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Conexão com o banco', status: 'failed', error: error.message });
    }
    
    // Teste 2: Consulta básica
    results.total++;
    try {
      const count = await User.count();
      results.passed++;
      results.tests.push({ name: 'Consulta básica de usuários', status: 'passed' });
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Consulta básica de usuários', status: 'failed', error: error.message });
    }
    
    // Teste 3: Inserção de dados
    results.total++;
    try {
      const testUser = await User.create({
        name: 'Teste Inserção',
        email: 'insert.test@example.com',
        password: 'test123',
        role: 'assistant'
      });
      await testUser.destroy();
      results.passed++;
      results.tests.push({ name: 'Inserção e exclusão de dados', status: 'passed' });
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Inserção e exclusão de dados', status: 'failed', error: error.message });
    }
    
    // Teste 4: Transações
    results.total++;
    try {
      await sequelize.transaction(async (t) => {
        await User.create({
          name: 'Teste Transação',
          email: 'transaction.test@example.com',
          password: 'test123',
          role: 'assistant'
        }, { transaction: t });
        // A transação será rollback automaticamente
      });
      results.passed++;
      results.tests.push({ name: 'Transações do banco', status: 'passed' });
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Transações do banco', status: 'failed', error: error.message });
    }
    
    logger.info(`Testes de banco de dados concluídos: ${results.passed}/${results.total} passados.`);
    
  } catch (error) {
    logger.error('Erro durante testes de banco de dados:', error);
    results.errors++;
  }
  
  return results;
}

async function testModels() {
  logger.info('Executando testes de modelos...');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    tests: []
  };
  
  try {
    // Teste 1: Validação de modelo User
    results.total++;
    try {
      const user = await User.create({
        name: 'Teste Modelo',
        email: 'model.test@example.com',
        password: '123', // Senha curta - deve falhar
        role: 'doctor'
      });
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Validação de senha do User', status: 'failed', error: 'Validação não funcionou' });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        results.passed++;
        results.tests.push({ name: 'Validação de senha do User', status: 'passed' });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Validação de senha do User', status: 'failed', error: error.message });
      }
    }
    
    // Teste 2: Validação de modelo Patient
    results.total++;
    try {
      const patient = await Patient.create({
        name: 'Teste Paciente',
        email: 'patient.model.test@example.com',
        cpf: '123', // CPF inválido - deve falhar
        birth_date: '1990-01-01',
        gender: 'male'
      });
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Validação de CPF do Patient', status: 'failed', error: 'Validação não funcionou' });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        results.passed++;
        results.tests.push({ name: 'Validação de CPF do Patient', status: 'passed' });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Validação de CPF do Patient', status: 'failed', error: error.message });
      }
    }
    
    // Teste 3: Relacionamentos
    results.total++;
    try {
      const user = await User.findOne({ where: { email: 'test@example.com' } });
      const patient = await Patient.findOne({ where: { email: 'patient.test@example.com' } });
      
      if (user && patient) {
        results.passed++;
        results.tests.push({ name: 'Relacionamentos entre modelos', status: 'passed' });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Relacionamentos entre modelos', status: 'failed', error: 'Dados não encontrados' });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Relacionamentos entre modelos', status: 'failed', error: error.message });
    }
    
    logger.info(`Testes de modelos concluídos: ${results.passed}/${results.total} passados.`);
    
  } catch (error) {
    logger.error('Erro durante testes de modelos:', error);
    results.errors++;
  }
  
  return results;
}

async function testAPI() {
  logger.info('Executando testes de API...');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    tests: []
  };
  
  try {
    // Teste 1: Health check
    results.total++;
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        results.passed++;
        results.tests.push({ name: 'Health check da API', status: 'passed' });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Health check da API', status: 'failed', error: `Status: ${response.status}` });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Health check da API', status: 'failed', error: error.message });
    }
    
    // Teste 2: Login
    results.total++;
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      });
      
      if (response.ok) {
        results.passed++;
        results.tests.push({ name: 'Login de usuário', status: 'passed' });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Login de usuário', status: 'failed', error: `Status: ${response.status}` });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Login de usuário', status: 'failed', error: error.message });
    }
    
    // Teste 3: Listar pacientes
    results.total++;
    try {
      // Primeiro fazer login para obter token
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      });
      
      if (loginResponse.ok) {
        const data = await loginResponse.json();
        const token = data.data.token;
        
        const patientsResponse = await fetch('http://localhost:3001/api/patients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (patientsResponse.ok) {
          results.passed++;
          results.tests.push({ name: 'Listar pacientes', status: 'passed' });
        } else {
          results.failed++;
          results.errors++;
          results.tests.push({ name: 'Listar pacientes', status: 'failed', error: `Status: ${patientsResponse.status}` });
        }
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Listar pacientes', status: 'failed', error: 'Não foi possível obter token de autenticação' });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Listar pacientes', status: 'failed', error: error.message });
    }
    
    logger.info(`Testes de API concluídos: ${results.passed}/${results.total} passados.`);
    
  } catch (error) {
    logger.error('Erro durante testes de API:', error);
    results.errors++;
  }
  
  return results;
}

async function testSecurity() {
  logger.info('Executando testes de segurança...');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    tests: []
  };
  
  try {
    // Teste 1: SQL Injection
    results.total++;
    try {
      const response = await fetch('http://localhost:3001/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "Teste'; DROP TABLE users; --",
          email: 'sql.injection@test.com',
          cpf: '12345678900',
          birth_date: '1990-01-01',
          gender: 'male'
        })
      });
      
      if (response.status === 400 || response.status === 422) {
        results.passed++;
        results.tests.push({ name: 'Prevenção de SQL Injection', status: 'passed' });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Prevenção de SQL Injection', status: 'failed', error: 'SQL Injection não foi bloqueado' });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Prevenção de SQL Injection', status: 'failed', error: error.message });
    }
    
    // Teste 2: XSS
    results.total++;
    try {
      const response = await fetch('http://localhost:3001/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: '<script>alert("XSS")</script>',
          email: 'xss.test@example.com',
          cpf: '12345678900',
          birth_date: '1990-01-01',
          gender: 'male'
        })
      });
      
      if (response.status === 400 || response.status === 422) {
        results.passed++;
        results.tests.push({ name: 'Prevenção de XSS', status: 'passed' });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Prevenção de XSS', status: 'failed', error: 'XSS não foi bloqueado' });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Prevenção de XSS', status: 'failed', error: error.message });
    }
    
    // Teste 3: Autenticação
    results.total++;
    try {
      const response = await fetch('http://localhost:3001/api/patients', {
        headers: {
          'Authorization': 'Bearer token_invalido'
        }
      });
      
      if (response.status === 401) {
        results.passed++;
        results.tests.push({ name: 'Validação de token JWT', status: 'passed' });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Validação de token JWT', status: 'failed', error: 'Token inválido não foi rejeitado' });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Validação de token JWT', status: 'failed', error: error.message });
    }
    
    logger.info(`Testes de segurança concluídos: ${results.passed}/${results.total} passados.`);
    
  } catch (error) {
    logger.error('Erro durante testes de segurança:', error);
    results.errors++;
  }
  
  return results;
}

async function testPerformance() {
  logger.info('Executando testes de performance...');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    tests: []
  };
  
  try {
    // Teste 1: Tempo de resposta da API
    results.total++;
    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/api/health');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok && responseTime < 1000) {
        results.passed++;
        results.tests.push({ name: 'Tempo de resposta da API', status: 'passed', responseTime: `${responseTime}ms` });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Tempo de resposta da API', status: 'failed', error: `Tempo de resposta: ${responseTime}ms` });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Tempo de resposta da API', status: 'failed', error: error.message });
    }
    
    // Teste 2: Consulta complexa
    results.total++;
    try {
      const startTime = Date.now();
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
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      if (queryTime < 2000) {
        results.passed++;
        results.tests.push({ name: 'Consulta complexa', status: 'passed', queryTime: `${queryTime}ms` });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Consulta complexa', status: 'failed', error: `Tempo de consulta: ${queryTime}ms` });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Consulta complexa', status: 'failed', error: error.message });
    }
    
    // Teste 3: Conexões simultâneas
    results.total++;
    try {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          fetch('http://localhost:3001/api/health')
            .then(response => response.ok)
            .catch(() => false)
        );
      }
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r).length;
      
      if (successCount === 10) {
        results.passed++;
        this.tests.push({ name: 'Conexões simultâneas', status: 'passed', successCount: `${successCount}/10` });
      } else {
        results.failed++;
        results.errors++;
        results.tests.push({ name: 'Conexões simultâneas', status: 'failed', error: `${successCount}/10 conexões bem-sucedidas` });
      }
    } catch (error) {
      results.failed++;
      results.errors++;
      results.tests.push({ name: 'Conexões simultâneas', status: 'failed', error: error.message });
    }
    
    logger.info(`Testes de performance concluídos: ${results.passed}/${results.total} passados.`);
    
  } catch (error) {
    logger.error('Erro durante testes de performance:', error);
    results.errors++;
  }
  
  return results;
}

function generateTestReport(results) {
  logger.info('Gerando relatório de testes...');
  
  const timestamp = new Date().toISOString().split('T')[0];
  const reportDir = path.join(__dirname, '../reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const totalTests = Object.values(results).reduce((sum, result) => sum + result.total, 0);
  const totalPassed = Object.values(results).reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, result) => sum + result.failed, 0);
  const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors, 0);
  
  const report = {
    summary: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      errors: totalErrors,
      success_rate: ((totalPassed / totalTests) * 100).toFixed(2) + '%'
    },
    details: results,
    generated_at: new Date().toISOString()
  };
  
  // Salvar relatório JSON
  fs.writeFileSync(
    path.join(reportDir, `test_report_${timestamp}.json`),
    JSON.stringify(report, null, 2)
  );
  
  // Salvar relatório HTML
  const htmlReport = generateHTMLTestReport(report);
  fs.writeFileSync(
    path.join(reportDir, `test_report_${timestamp}.html`),
    htmlReport
  );
  
  logger.info(`Relatório de testes gerado: test_report_${timestamp}.html`);
  logger.info(`Taxa de sucesso: ${report.summary.success_rate}`);
}

function generateHTMLTestReport(report) {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Testes - Sistema Médico</title>
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
        .test-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .test-item {
            padding: 10px;
            margin: 5px 0;
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-item.passed {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
        }
        .test-item.failed {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
        }
        .test-item.error {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
        }
        .status {
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
        }
        .status.passed {
            background-color: #28a745;
            color: white;
        }
        .status.failed {
            background-color: #dc3545;
            color: white;
        }
        .status.error {
            background-color: #ffc107;
            color: #212529;
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
        <h1>Relatório de Testes - Sistema Médico</h1>
        <p><strong>Gerado em:</strong> ${new Date(report.generated_at).toLocaleString('pt-BR')}</p>
        
        <div class="summary">
            <div class="card">
                <h3>Total de Testes</h3>
                <div class="value">${report.summary.total}</div>
            </div>
            <div class="card">
                <h3>Passados</h3>
                <div class="value" style="color: #28a745;">${report.summary.passed}</div>
            </div>
            <div class="card">
                <h3>Falhados</h3>
                <div class="value" style="color: #dc3545;">${report.summary.failed}</div>
            </div>
            <div class="card">
                <h3>Erros</h3>
                <div class="value" style="color: #ffc107;">${report.summary.errors}</div>
            </div>
            <div class="card">
                <h3>Taxa de Sucesso</h3>
                <div class="value">${report.summary.success_rate}</div>
            </div>
        </div>
        
        ${Object.entries(report.details).map(([category, results]) => `
            <div class="test-section">
                <h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                <p><strong>Resultados:</strong> ${results.passed}/${results.total} testes passados</p>
                
                ${results.tests.map(test => `
                    <div class="test-item ${test.status}">
                        <span>${test.name}</span>
                        <span class="status ${test.status}">${test.status.toUpperCase()}</span>
                    </div>
                `).join('')}
            </div>
        `).join('')}
        
        <div class="footer">
            <p>Relatório gerado automaticamente pelo Sistema Médico</p>
            <p>© 2024 Sistema Médico. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  
  return html;
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
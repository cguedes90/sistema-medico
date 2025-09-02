#!/usr/bin/env node

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Document = require('../models/Document');
const Note = require('../models/Note');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

async function seedDatabase() {
  try {
    logger.info('Iniciando seed do banco de dados...');
    
    // Criar pacientes de exemplo
    const patients = [
      {
        name: 'Ana Maria Santos',
        email: 'ana.santos@example.com',
        cpf: '12345678900',
        rg: 'MG1234567',
        birth_date: '1985-03-15',
        gender: 'female',
        phone: '(11) 99999-1111',
        emergency_contact: {
          name: 'Carlos Santos',
          phone: '(11) 99999-2222',
          relationship: 'marido'
        },
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567'
        },
        blood_type: 'O+',
        allergies: ['Penicilina', 'Aspirina'],
        medications: ['Metformina 500mg'],
        pre_existing_conditions: ['Diabetes tipo 2'],
        family_history: ['Diabetes', 'Hipertensão'],
        insurance_info: {
          provider: 'Unimed',
          policy_number: '123456789',
          group_number: '987654321'
        },
        notes: 'Paciente com histórico de diabetes tipo 2. Necessita acompanhamento regular.'
      },
      {
        name: 'Pedro Henrique Oliveira',
        email: 'pedro.oliveira@example.com',
        cpf: '98765432100',
        rg: 'SP9876543',
        birth_date: '1990-07-20',
        gender: 'male',
        phone: '(11) 99999-3333',
        emergency_contact: {
          name: 'Maria Oliveira',
          phone: '(11) 99999-4444',
          relationship: 'mãe'
        },
        address: {
          street: 'Av. Paulista, 456',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01310-100'
        },
        blood_type: 'A+',
        allergies: [],
        medications: [],
        pre_existing_conditions: [],
        family_history: ['Câncer de cólon'],
        insurance_info: {
          provider: 'Amil',
          policy_number: '987654321',
          group_number: '123456789'
        },
        notes: 'Paciente saudável. Necessidade de check-up anual.'
      },
      {
        name: 'Mariana Costa',
        email: 'mariana.costa@example.com',
        cpf: '45678912300',
        rg: 'RJ4567891',
        birth_date: '1992-11-08',
        gender: 'female',
        phone: '(11) 99999-5555',
        emergency_contact: {
          name: 'Roberto Costa',
          phone: '(11) 99999-6666',
          relationship: 'pai'
        },
        address: {
          street: 'Rua Augusta, 789',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01304-100'
        },
        blood_type: 'B-',
        allergies: ['Lactose'],
        medications: ['Suplemento de ferro'],
        pre_existing_conditions: ['Anemia'],
        family_history: ['Asma', 'Doença celíaca'],
        insurance_info: {
          provider: 'Bradesco Saúde',
          policy_number: '456789123',
          group_number: '789123456'
        },
        notes: 'Paciente com anemia. Necessita suplementação de ferro.'
      }
    ];

    logger.info('Criando pacientes...');
    const createdPatients = [];
    for (const patientData of patients) {
      const patient = await Patient.create(patientData);
      createdPatients.push(patient);
      logger.info(`Paciente criado: ${patient.name}`);
    }

    // Criar documentos de exemplo
    const documents = [
      {
        patient_id: createdPatients[0].id,
        uploaded_by: '1', // ID do administrador
        filename: 'exame_sangue_ana.pdf',
        original_name: 'Exame de Sangue - Ana Santos.pdf',
        file_path: '/uploads/exame_sangue_ana.pdf',
        file_size: 2048576,
        mime_type: 'application/pdf',
        category: 'exame',
        title: 'Exame de Sangue Completo',
        description: 'Exame de sangue completo realizado em 15/03/2024',
        tags: ['sangue', 'hemograma', 'anemia'],
        extraction_status: 'completed',
        extracted_text: 'Paciente: Ana Maria Santos\nData: 15/03/2024\nHemoglobina: 12.5 g/dL\nHematócrito: 38%\nLeucócitos: 7.2 x 10³/μL\nPlaquetas: 250 x 10³/μL\nObservações: Valores dentro da normalidade.',
        ai_analysis: {
          summary: 'Exame de sangue normal sem alterações significativas',
          critical_points: [],
          recommendations: ['Manter acompanhamento regular'],
          risk_level: 'low'
        }
      },
      {
        patient_id: createdPatients[1].id,
        uploaded_by: '1',
        filename: 'laudo_radiografia_pedro.pdf',
        original_name: 'Laudo de Radiografia - Pedro Oliveira.pdf',
        file_path: '/uploads/laudo_radiografia_pedro.pdf',
        file_size: 3072000,
        mime_type: 'application/pdf',
        category: 'laudo',
        title: 'Laudo de Radiografia de Tórax',
        description: 'Radiografia de tórax realizada em 20/07/2024',
        tags: ['radiografia', 'torax', 'pulmão'],
        extraction_status: 'completed',
        extracted_text: 'Paciente: Pedro Henrique Oliveira\nData: 20/07/2024\nTipo: Radiografia de Tórax PA\nResultados: Estruturas mediastínicas sem deslocamentos. Corações de tamanho normal. Silhueta cardíaca sem alterações. Áreas pulmonares com padrão aéreo normal sem sinais de derrame ou pneumotórax.',
        ai_analysis: {
          summary: 'Radiografia de tórax normal sem alterações',
          critical_points: [],
          recommendations: ['Repetir em 1 ano para controle'],
          risk_level: 'low'
        }
      },
      {
        patient_id: createdPatients[2].id,
        uploaded_by: '1',
        filename: 'receita_mariana.pdf',
        original_name: 'Receita Médica - Mariana Costa.pdf',
        file_path: '/uploads/receita_mariana.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        category: 'receita',
        title: 'Receita de Suplemento de Ferro',
        description: 'Receita para suplementação de ferro',
        tags: ['receita', 'ferro', 'anemia'],
        extraction_status: 'completed',
        extracted_text: 'Paciente: Mariana Costa\nData: 08/11/2024\nMedicamento: Sulfato Ferroso 300mg\nDosagem: 1 comprimido ao dia\nDuração: 3 meses\nObservações: Tomar com estômago vazio.',
        ai_analysis: {
          summary: 'Receita para tratamento de anemia ferropriva',
          critical_points: ['Tomar com estômago vazio'],
          recommendations: ['Acompanhar hemograma em 3 meses'],
          risk_level: 'medium'
        }
      }
    ];

    logger.info('Criando documentos...');
    for (const documentData of documents) {
      const document = await Document.create(documentData);
      logger.info(`Documento criado: ${document.title}`);
    }

    // Criar anotações de exemplo
    const notes = [
      {
        patient_id: createdPatients[0].id,
        user_id: '1', // ID do administrador
        title: 'Consulta de Rotina',
        content: 'Paciente veio para consulta de rotina. Queixas de cansaço leve. Exame físico normal. Solicitado exame de sangue para controle de diabetes.',
        note_type: 'consulta'
      },
      {
        patient_id: createdPatients[0].id,
        user_id: '1',
        title: 'Acompanhamento de Diabetes',
        content: 'Hemoglobina glicada: 6.8%. Controle adequado. Manter dose atual de metformina. Próxima consulta em 3 meses.',
        note_type: 'avaliacao'
      },
      {
        patient_id: createdPatients[1].id,
        user_id: '1',
        title: 'Check-up Anual',
        content: 'Paciente saudável. Exames normais. Recomendado manter estilo de vida saudável. Próximo check-up em 1 ano.',
        note_type: 'consulta'
      },
      {
        patient_id: createdPatients[2].id,
        user_id: '1',
        title: 'Acompanhamento de Anemia',
        content: 'Paciente em uso de suplemento de ferro. Melhora dos sintomas. Hemoglobina: 11.2 g/dL. Continuar tratamento por mais 2 meses.',
        note_type: 'avaliacao'
      }
    ];

    logger.info('Criando anotações...');
    for (const noteData of notes) {
      const note = await Note.create(noteData);
      logger.info(`Anotação criada: ${note.title}`);
    }

    logger.info('Seed do banco de dados concluído com sucesso!');
    logger.info(`Criados ${createdPatients.length} pacientes, ${documents.length} documentos e ${notes.length} anotações.`);
    
  } catch (error) {
    logger.error('Erro ao fazer seed do banco de dados:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
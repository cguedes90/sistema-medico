const { Document, Note, Patient } = require('../models');
const { logger } = require('../utils/logger');

// Analisar documento médico
const analyzeDocument = async (req, res) => {
  try {
    const { document_id } = req.params;
    const { user_prompt } = req.body;

    const document = await Document.findByPk(document_id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf']
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      });
    }

    // Verificar permissão
    if (document.is_sensitive && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Documento confidencial.'
      });
    }

    const extractedText = document.extracted_text || 'Nenhum texto extraído disponível.';
    
    // Construir prompt para análise
    const defaultPrompt = `
Analise o seguinte relatório médico e forneça insights clínicos importantes:

Paciente: ${document.patient.name}
Documento: ${document.title}
Categoria: ${document.category}
Data: ${new Date(document.created_at).toLocaleDateString()}

Conteúdo do documento:
${extractedText}

Por favor, inclua:
1. Pontos críticos que exigem atenção imediata
2. Recomendações para tratamento
3. Alertas sobre possíveis interações medicamentosas
4. Sugestões para exames complementares
5. Observações sobre padrões ou tendências
6. Qualquer informação incomum ou preocupante

Formatar a resposta em seções claras e objetivas.
`;

    const finalPrompt = user_prompt || defaultPrompt;

    // Aqui você integraria com as APIs de IA reais
    // const gpt4Analysis = await openai.chat.completions.create({
    //   model: "gpt-4.1",
    //   messages: [{ role: "user", content: finalPrompt }],
    //   max_tokens: 2000
    // });
    
    // const claudeAnalysis = await anthropic.messages.create({
    //   model: "claude-sonnet-4",
    //   max_tokens: 2000,
    //   messages: [{ role: "user", content: finalPrompt }]
    // });

    // Simulação de análise de IA
    const mockAnalysis = {
      gpt4_analysis: {
        summary: "Análise do documento realizada com sucesso.",
        critical_points: [
          "Paciente apresenta hipertensão controlada com medicação.",
          "Recomenda-se monitoramento regular da pressão arterial.",
          "Exames de sangue mostram níveis normais de glicose."
        ],
        recommendations: [
          "Manter medicação atual para hipertensão.",
          "Realizar check-up anual completo.",
          "Monitorar sintomas de dor no peito."
        ],
        alerts: [
          "Nenhum alerta crítico identificado.",
          "Recomenda-se atenção a medicamentos novos."
        ],
        follow_up_suggestions: [
          "Consulta de acompanhamento em 3 meses.",
          "Exame de sangue completo em 6 meses."
        ],
        confidence_score: 0.95,
        analysis_date: new Date().toISOString()
      },
      claude_analysis: {
        summary: "Análise complementar do documento.",
        insights: [
          "Padrão histórico de condições crônicas estável.",
          "Adesão ao tratamento parece adequada.",
          "Fatores de risco cardiovascular moderados."
        ],
        personalized_recommendations: [
          "Manutenção do estilo de vida atual.",
          "Considerar programa de exercícios supervisionado.",
          "Acompanhamento nutricional periódico."
        ],
        risk_assessment: {
          cardiovascular_risk: "Moderado",
          diabetes_risk: "Baixo",
          complications_risk: "Baixo"
        },
        analysis_date: new Date().toISOString()
      },
      combined_insights: {
        overall_assessment: "Paciente está em estável com condições controladas.",
        key_findings: [
          "Hipertensão controlada",
          "Níveis de glicose normais",
          "Sem alertas críticos identificados"
        ],
        action_items: [
          "Manter medicação atual",
          "Consulta de acompanhamento em 3 meses",
          "Exame de sangue completo em 6 meses"
        ],
        priority_level: "Normal"
      }
    };

    // Atualizar documento com análise de IA
    await document.update({
      ai_analysis: mockAnalysis,
      extraction_status: 'completed'
    });

    logger.info(`Documento analisado por IA: ${document.title}`);

    res.json({
      success: true,
      message: 'Documento analisado com sucesso',
      data: {
        document_id: document.id,
        analysis: mockAnalysis,
        patient_info: {
          id: document.patient.id,
          name: document.patient.name,
          cpf: document.patient.cpf
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao analisar documento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao analisar documento'
    });
  }
};

// Gerar insights do histórico do paciente
const generatePatientInsights = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { time_range = '12months' } = req.body;

    const patient = await Patient.findByPk(patient_id, {
      include: [
        {
          model: Document,
          as: 'documents',
          where: { deleted_at: null },
          attributes: ['id', 'title', 'category', 'created_at', 'ai_analysis']
        },
        {
          model: Note,
          as: 'notes',
          where: { deleted_at: null },
          attributes: ['id', 'title', 'type', 'priority', 'content', 'created_at']
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    // Filtrar dados por período
    const cutoffDate = new Date();
    switch (time_range) {
      case '1month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case '3months':
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case '12months':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      default:
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    }

    const recentDocuments = patient.documents.filter(doc => 
      new Date(doc.created_at) >= cutoffDate
    );

    const recentNotes = patient.notes.filter(note => 
      new Date(note.created_at) >= cutoffDate
    );

    // Aqui você integraria com as APIs de IA reais
    // const insightsPrompt = `Analise o histórico médico do paciente ${patient.name} e gere insights:`;
    // const gpt4Insights = await openai.chat.completions.create({...});

    // Simulação de insights de IA
    const mockInsights = {
      health_trends: {
        overall_trend: "Estável",
        conditions_status: {
          hypertension: "Controlada",
          diabetes: "Não detectada",
          cardiovascular: "Baixo risco"
        },
        medication_adherence: "Alta",
        appointment_compliance: "Boa"
      },
      risk_factors: {
        current_risks: [
          "Hipertensão leve",
          "Peso acima do ideal"
        ],
        emerging_risks: [
          "Sedentarismo",
          "Estresse"
        ],
        mitigated_risks: [
          "Tabagismo (abandono há 2 anos)"
        ]
      },
      recommendations: {
        immediate_actions: [
          "Manter medicação para hipertensão",
          "Consulta de acompanhamento em 3 meses"
        ],
        preventive_measures: [
          "Programa de exercícios regulares",
          "Acompanhamento nutricional",
          "Redução de sal na dieta"
        ],
        long_term_goals: [
          "Chegar ao peso ideal em 6 meses",
          "Reduzir pressão arterial para valores ideais"
        ]
      },
      monitoring_suggestions: {
        vital_signs: {
          blood_pressure: "Semanal",
          weight: "Mensal",
          blood_glucose: "Trimestral"
        },
        examinations: {
          blood_work: "Anual",
          ecg: "Anual",
          eye_exam: "Anual"
        }
      },
      ai_generated_summary: "O paciente apresenta histórico estável com hipertensão controlada. Recomenda-se manter o tratamento atual e implementar medidas preventivas para melhorar a qualidade de vida e reduzir riscos futuros."
    };

    logger.info(`Insights gerados para paciente: ${patient.name}`);

    res.json({
      success: true,
      message: 'Insights gerados com sucesso',
      data: {
        patient_id: patient.id,
        patient_name: patient.name,
        time_range,
        insights: mockInsights,
        data_summary: {
          documents_count: recentDocuments.length,
          notes_count: recentNotes.length,
          period_start: cutoffDate.toISOString(),
          period_end: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao gerar insights:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar insights'
    });
  }
};

// Gerar recomendações personalizadas
const generateRecommendations = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { context = 'general' } = req.body;

    const patient = await Patient.findByPk(patient_id, {
      include: [
        {
          model: Document,
          as: 'documents',
          where: { deleted_at: null },
          limit: 10,
          order: [['created_at', 'DESC']]
        },
        {
          model: Note,
          as: 'notes',
          where: { deleted_at: null },
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    // Construir prompt baseado no contexto
    let contextPrompt = '';
    switch (context) {
      case 'follow_up':
        contextPrompt = 'Gere recomendações para acompanhamento pós-consulta:';
        break;
      case 'preventive':
        contextPrompt = 'Gere recomendações preventivas baseadas no histórico do paciente:';
        break;
      case 'medication':
        contextPrompt = 'Gere recomendações sobre medicamentos e adesão ao tratamento:';
        break;
      default:
        contextPrompt = 'Gere recomendações gerais de saúde baseadas no histórico do paciente:';
    }

    // Aqui você integraria com as APIs de IA reais
    // const recommendationsPrompt = `${contextPrompt}\n\nDados do paciente: ${JSON.stringify(patientData)}`;
    // const gpt4Recommendations = await openai.chat.completions.create({...});

    // Simulação de recomendações de IA
    const mockRecommendations = {
      personalized_recommendations: [
        {
          category: "medication",
          title: "Controle da Hipertensão",
          description: "Manter medicação atual e monitorar pressão arterial diariamente.",
          priority: "high",
          frequency: "diário",
          duration: "contínuo"
        },
        {
          category: "lifestyle",
          title: "Atividade Física",
          description: "Iniciar programa de exercícios moderados, 30 minutos diários, 5 vezes por semana.",
          priority: "medium",
          frequency: "diário",
          duration: "6 meses"
        },
        {
          category: "nutrition",
          title: "Dieta Equilibrada",
          description: "Reduzir consumo de sal e aumentar ingestão de vegetais e frutas.",
          priority: "medium",
          frequency: "contínuo",
          duration: "contínuo"
        }
      ],
      preventive_measures: [
        {
          type: "vaccination",
          name: "Vacina contra gripe",
          due_date: "Próximo outono",
          importance: "alta"
        },
        {
          type: "screening",
          name: "Exame de colonoscopia",
          due_date: "Em 2 anos",
          importance: "média"
        }
      ],
      lifestyle_changes: [
        {
          area: "physical_activity",
          current_status: "Sedentário",
          target: "Ativo moderado",
          timeline: "3 meses"
        },
        {
          area: "diet",
          current_status: "Rico em sódio",
          target: "Equilibrada",
          timeline: "6 meses"
        }
      ],
      monitoring_plan: {
        vital_signs: {
          blood_pressure: "Diário",
          weight: "Semanal",
          heart_rate: "Diário"
        },
        examinations: {
          blood_work: "Trimestral",
          ecg: "Anual",
          check_up: "Anual"
        }
      },
      emergency_contacts: [
        {
          type: "primary_care",
          contact: "Médico assistente",
          phone: "(XX) XXXX-XXXX"
        },
        {
          type: "emergency",
          contact: "Serviço de emergência",
          phone: "192"
        }
      ]
    };

    logger.info(`Recomendações geradas para paciente: ${patient.name}`);

    res.json({
      success: true,
      message: 'Recomendações geradas com sucesso',
      data: {
        patient_id: patient.id,
        patient_name: patient.name,
        context,
        recommendations: mockRecommendations,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro ao gerar recomendações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar recomendações'
    });
  }
};

// Analisar sintomas
const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, patient_id } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Sintomas são obrigatórios e devem ser um array'
      });
    }

    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    // Aqui você integraria com as APIs de IA reais
    // const symptomsPrompt = `Analise os seguintes sintomas: ${symptoms.join(', ')}`;
    // const gpt4Analysis = await openai.chat.completions.create({...});

    // Simulação de análise de sintomas
    const mockAnalysis = {
      symptom_analysis: {
        severity_assessment: "Moderada",
        urgency_level: "Baixa",
        possible_conditions: [
          "Gripe comum",
          "Infecção respiratória",
          "Estresse"
        ],
        recommended_actions: [
          "Repouso e hidratação",
          "Monitorar temperatura",
          "Consultar médico se piorar"
        ]
      },
      differential_diagnosis: [
        {
          condition: "Gripe",
          probability: 0.6,
          symptoms_match: ["febre", "dor de cabeça", "fadiga"],
          recommendations: "Repouso, medicamentos sintomáticos"
        },
        {
          condition: "COVID-19",
          probability: 0.3,
          symptoms_match: ["febre", "fadiga"],
          recommendations: "Teste rápido, isolamento se positivo"
        },
        {
          condition: "Infecção bacteriana",
          probability: 0.1,
          symptoms_match: [],
          recommendations: "Monitorar, procurar ajuda médica se persistir"
        }
      ],
      red_flags: [],
      next_steps: {
        immediate: "Monitorar sintomas",
        short_term: "Consulta médica se sintomas persistirem por mais de 3 dias",
        long_term: "Avaliação completa se sintomas recorrentes"
      }
    };

    logger.info(`Análise de sintomas realizada para paciente: ${patient.name}`);

    res.json({
      success: true,
      message: 'Análise de sintomas realizada com sucesso',
      data: {
        patient_id: patient.id,
        patient_name: patient.name,
        analysis: mockAnalysis,
        analyzed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro ao analisar sintomas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao analisar sintomas'
    });
  }
};

module.exports = {
  analyzeDocument,
  generatePatientInsights,
  generateRecommendations,
  analyzeSymptoms
};
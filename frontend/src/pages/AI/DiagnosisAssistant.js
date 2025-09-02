/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Psychology as AIIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  LocalHospital as MedicalIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DiagnosisAssistant = () => {
  const navigate = useNavigate();
  
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    weight: '',
    height: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [includeRareDiseases, setIncludeRareDiseases] = useState(false);

  const commonSymptoms = [
    'Febre', 'Dor de cabeça', 'Tosse', 'Falta de ar', 'Dor no peito',
    'Náusea', 'Vômito', 'Diarreia', 'Dor abdominal', 'Fadiga',
    'Tontura', 'Dor nas costas', 'Dor nas articulações', 'Erupção cutânea'
  ];

  const handleAddSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim())) {
      setSymptoms([...symptoms, currentSymptom.trim()]);
      setCurrentSymptom('');
    }
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setSymptoms(symptoms.filter(symptom => symptom !== symptomToRemove));
  };

  const handleQuickAddSymptom = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simular análise da IA (substituir por chamada real à API)
    setTimeout(() => {
      const mockResult = {
        primaryDiagnoses: [
          {
            condition: 'Gripe (Influenza)',
            probability: 85,
            confidence: 'Alta',
            description: 'Infecção viral comum que afeta o sistema respiratório',
            symptoms_match: ['Febre', 'Dor de cabeça', 'Fadiga', 'Tosse'],
            next_steps: [
              'Repouso e hidratação',
              'Antivirais se necessário',
              'Monitorar sintomas'
            ]
          },
          {
            condition: 'Resfriado Comum',
            probability: 72,
            confidence: 'Média',
            description: 'Infecção viral leve das vias respiratórias superiores',
            symptoms_match: ['Tosse', 'Dor de cabeça'],
            next_steps: [
              'Tratamento sintomático',
              'Repouso',
              'Aumentar ingestão de líquidos'
            ]
          }
        ],
        secondaryDiagnoses: [
          {
            condition: 'Pneumonia',
            probability: 35,
            confidence: 'Baixa',
            description: 'Infecção dos pulmões que pode ser grave',
            warning: 'Requer investigação adicional',
            recommended_tests: ['Raio-X do tórax', 'Hemograma completo']
          }
        ],
        recommendations: [
          'Realizar exame físico completo',
          'Considerar testes laboratoriais se sintomas persistirem',
          'Monitorar temperatura corporal',
          'Retornar se sintomas piorarem'
        ],
        urgency_level: 'low',
        confidence_score: 78
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const getUrgencyColor = (level) => {
    const colors = {
      'low': 'success',
      'medium': 'warning',
      'high': 'error'
    };
    return colors[level] || 'info';
  };

  const getUrgencyLabel = (level) => {
    const labels = {
      'low': 'Baixa Urgência',
      'medium': 'Urgência Moderada',
      'high': 'Alta Urgência'
    };
    return labels[level] || 'Não definido';
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
          <AIIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Assistente de Diagnóstico IA
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Análise inteligente de sintomas para auxiliar no diagnóstico médico
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Paciente
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Idade"
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Gênero"
                  value={patientInfo.gender}
                  onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Sintomas
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Adicionar sintoma"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSymptom()}
                placeholder="Digite um sintoma..."
              />
              <Button
                variant="contained"
                onClick={handleAddSymptom}
                disabled={!currentSymptom.trim()}
                startIcon={<AddIcon />}
              >
                Adicionar
              </Button>
            </Box>

            {/* Current Symptoms */}
            {symptoms.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sintomas selecionados:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {symptoms.map((symptom, index) => (
                    <Chip
                      key={index}
                      label={symptom}
                      onDelete={() => handleRemoveSymptom(symptom)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Quick Add Symptoms */}
            <Typography variant="subtitle2" gutterBottom>
              Sintomas comuns:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {commonSymptoms.map((symptom) => (
                <Chip
                  key={symptom}
                  label={symptom}
                  onClick={() => handleQuickAddSymptom(symptom)}
                  variant={symptoms.includes(symptom) ? "filled" : "outlined"}
                  color={symptoms.includes(symptom) ? "primary" : "default"}
                  clickable
                />
              ))}
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={includeRareDiseases}
                  onChange={(e) => setIncludeRareDiseases(e.target.checked)}
                />
              }
              label="Incluir doenças raras na análise"
            />

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleAnalyze}
                disabled={symptoms.length === 0 || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Sintomas'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={6}>
          {isAnalyzing && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography variant="h6">
                  Analisando sintomas...
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                A IA está processando os sintomas informados e comparando com a base de conhecimento médico.
              </Typography>
              <LinearProgress />
            </Paper>
          )}

          {analysisResult && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  Resultados da Análise
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={getUrgencyLabel(analysisResult.urgency_level)}
                    color={getUrgencyColor(analysisResult.urgency_level)}
                  />
                  <Chip
                    label={`${analysisResult.confidence_score}% confiança`}
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Primary Diagnoses */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Diagnósticos Principais
              </Typography>
              {analysisResult.primaryDiagnoses.map((diagnosis, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">
                          {diagnosis.condition}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Probabilidade: {diagnosis.probability}% | Confiança: {diagnosis.confidence}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={diagnosis.probability}
                        sx={{ width: 100, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {diagnosis.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Sintomas correspondentes:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {diagnosis.symptoms_match.map((symptom, idx) => (
                        <Chip key={idx} label={symptom} size="small" color="success" />
                      ))}
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>
                      Próximos passos recomendados:
                    </Typography>
                    <List dense>
                      {diagnosis.next_steps.map((step, idx) => (
                        <ListItem key={idx} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircleIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* Secondary Diagnoses */}
              {analysisResult.secondaryDiagnoses.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Diagnósticos Diferenciais
                  </Typography>
                  {analysisResult.secondaryDiagnoses.map((diagnosis, index) => (
                    <Card key={index} sx={{ mb: 2, border: '1px solid', borderColor: 'warning.main' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <WarningIcon color="warning" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">
                            {diagnosis.condition}
                          </Typography>
                          <Chip
                            label={`${diagnosis.probability}%`}
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {diagnosis.description}
                        </Typography>
                        {diagnosis.warning && (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            {diagnosis.warning}
                          </Alert>
                        )}
                        {diagnosis.recommended_tests && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              Exames recomendados:
                            </Typography>
                            <Typography variant="caption" display="block">
                              {diagnosis.recommended_tests.join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {/* Recommendations */}
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recomendações Gerais
              </Typography>
              <List>
                {analysisResult.recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <InfoIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> Este diagnóstico é gerado por IA e deve ser usado apenas como auxílio. 
                  Sempre realize avaliação clínica completa e use seu julgamento médico profissional.
                </Typography>
              </Alert>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => setAnalysisResult(null)}>
                  Nova Análise
                </Button>
                <Button variant="contained">
                  Salvar Análise
                </Button>
              </Box>
            </Paper>
          )}

          {!analysisResult && !isAnalyzing && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <MedicalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pronto para análise
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adicione os sintomas do paciente e clique em "Analisar Sintomas" para obter 
                sugestões de diagnóstico baseadas em IA.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DiagnosisAssistant;
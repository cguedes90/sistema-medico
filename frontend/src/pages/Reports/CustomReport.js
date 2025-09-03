/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CustomReport = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [reportConfig, setReportConfig] = useState({
    title: '',
    type: '',
    dateRange: {
      start: '',
      end: ''
    },
    filters: {
      patients: [],
      doctors: [],
      departments: [],
      status: []
    },
    fields: [],
    format: 'pdf',
    schedule: {
      enabled: false,
      frequency: 'weekly',
      recipients: []
    }
  });

  const reportTypes = [
    { value: 'patients', label: 'Pacientes', description: 'Dados de pacientes e consultas' },
    { value: 'appointments', label: 'Agendamentos', description: 'Análise de consultas e agendamentos' },
    { value: 'financial', label: 'Financeiro', description: 'Receitas, pagamentos e faturamento' },
    { value: 'clinical', label: 'Clínico', description: 'Diagnósticos, tratamentos e outcomes' },
    { value: 'operational', label: 'Operacional', description: 'Métricas operacionais e eficiência' }
  ];

  const availableFields = {
    patients: [
      { id: 'name', label: 'Nome do Paciente' },
      { id: 'age', label: 'Idade' },
      { id: 'gender', label: 'Gênero' },
      { id: 'phone', label: 'Telefone' },
      { id: 'email', label: 'Email' },
      { id: 'address', label: 'Endereço' },
      { id: 'registration_date', label: 'Data de Cadastro' },
      { id: 'last_visit', label: 'Última Consulta' },
      { id: 'total_visits', label: 'Total de Consultas' }
    ],
    appointments: [
      { id: 'patient_name', label: 'Nome do Paciente' },
      { id: 'doctor_name', label: 'Médico' },
      { id: 'date', label: 'Data' },
      { id: 'time', label: 'Horário' },
      { id: 'status', label: 'Status' },
      { id: 'type', label: 'Tipo de Consulta' },
      { id: 'duration', label: 'Duração' },
      { id: 'notes', label: 'Observações' }
    ],
    financial: [
      { id: 'date', label: 'Data' },
      { id: 'patient_name', label: 'Paciente' },
      { id: 'service', label: 'Serviço' },
      { id: 'amount', label: 'Valor' },
      { id: 'payment_method', label: 'Forma de Pagamento' },
      { id: 'insurance', label: 'Convênio' },
      { id: 'status', label: 'Status do Pagamento' }
    ]
  };

  const steps = [
    'Configuração Básica',
    'Filtros e Critérios',
    'Campos e Layout',
    'Revisão e Geração'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldToggle = (fieldId) => {
    setReportConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(id => id !== fieldId)
        : [...prev.fields, fieldId]
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simular geração de relatório
    setTimeout(() => {
      setIsGenerating(false);
      alert('Relatório personalizado gerado com sucesso!');
      navigate('/reports');
    }, 3000);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título do Relatório"
                value={reportConfig.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="Ex: Relatório Mensal de Pacientes - Janeiro 2024"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Relatório</InputLabel>
                <Select
                  value={reportConfig.type}
                  onChange={(e) => handleConfigChange('type', e.target.value)}
                  label="Tipo de Relatório"
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body1">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data Inicial"
                type="date"
                value={reportConfig.dateRange.start}
                onChange={(e) => handleConfigChange('dateRange', {
                  ...reportConfig.dateRange,
                  start: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data Final"
                type="date"
                value={reportConfig.dateRange.end}
                onChange={(e) => handleConfigChange('dateRange', {
                  ...reportConfig.dateRange,
                  end: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Formato de Saída</InputLabel>
                <Select
                  value={reportConfig.format}
                  onChange={(e) => handleConfigChange('format', e.target.value)}
                  label="Formato de Saída"
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel (XLSX)</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="html">HTML</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Filtros Avançados
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Filtrar por Paciente"
                  placeholder="Digite o nome do paciente..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Filtrar por Médico"
                  placeholder="Digite o nome do médico..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={reportConfig.filters.status}
                    onChange={(e) => handleConfigChange('filters', {
                      ...reportConfig.filters,
                      status: e.target.value
                    })}
                    label="Status"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="inativo">Inativo</MenuItem>
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              Os filtros ajudam a refinar os dados do relatório para mostrar apenas as informações relevantes.
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecionar Campos
            </Typography>
            
            {reportConfig.type && availableFields[reportConfig.type] && (
              <List>
                {availableFields[reportConfig.type].map((field) => (
                  <ListItem key={field.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Checkbox
                        checked={reportConfig.fields.includes(field.id)}
                        onChange={() => handleFieldToggle(field.id)}
                      />
                    </ListItemIcon>
                    <ListItemText primary={field.label} />
                  </ListItem>
                ))}
              </List>
            )}

            {reportConfig.fields.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Campos selecionados:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {reportConfig.fields.map((fieldId) => {
                    const field = availableFields[reportConfig.type]?.find(f => f.id === fieldId);
                    return field ? (
                      <Chip
                        key={fieldId}
                        label={field.label}
                        onDelete={() => handleFieldToggle(fieldId)}
                        color="primary"
                        variant="outlined"
                      />
                    ) : null;
                  })}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Agendamento Automático
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportConfig.schedule.enabled}
                  onChange={(e) => handleConfigChange('schedule', {
                    ...reportConfig.schedule,
                    enabled: e.target.checked
                  })}
                />
              }
              label="Gerar este relatório automaticamente"
            />

            {reportConfig.schedule.enabled && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequência</InputLabel>
                    <Select
                      value={reportConfig.schedule.frequency}
                      onChange={(e) => handleConfigChange('schedule', {
                        ...reportConfig.schedule,
                        frequency: e.target.value
                      })}
                      label="Frequência"
                    >
                      <MenuItem value="daily">Diário</MenuItem>
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="monthly">Mensal</MenuItem>
                      <MenuItem value="quarterly">Trimestral</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Revisar Configurações
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Informações Básicas
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Título" 
                      secondary={reportConfig.title || 'Não definido'}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Tipo" 
                      secondary={reportTypes.find(t => t.value === reportConfig.type)?.label || 'Não selecionado'}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Período" 
                      secondary={`${reportConfig.dateRange.start || 'N/A'} até ${reportConfig.dateRange.end || 'N/A'}`}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Formato" 
                      secondary={reportConfig.format.toUpperCase()}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Campos Selecionados ({reportConfig.fields.length})
                </Typography>
                {reportConfig.fields.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {reportConfig.fields.map((fieldId) => {
                      const field = availableFields[reportConfig.type]?.find(f => f.id === fieldId);
                      return field ? (
                        <Chip key={fieldId} label={field.label} size="small" />
                      ) : null;
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum campo selecionado
                  </Typography>
                )}
              </CardContent>
            </Card>

            {reportConfig.schedule.enabled && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Agendamento Automático
                  </Typography>
                  <Typography variant="body2">
                    Frequência: {reportConfig.schedule.frequency}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Alert severity="info">
              Revise todas as configurações antes de gerar o relatório. 
              Após a geração, você poderá baixar o arquivo no formato selecionado.
            </Alert>
          </Box>
        );

      default:
        return 'Etapa desconhecida';
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return reportConfig.title && reportConfig.type && reportConfig.dateRange.start && reportConfig.dateRange.end;
      case 1:
        return true; // Filtros são opcionais
      case 2:
        return reportConfig.fields.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ mt: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
          <SettingsIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Relatório Personalizado
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Crie relatórios customizados com os dados específicos que você precisa
          </Typography>
        </Box>
      </Box>
  

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                          fontSize: '0.875rem'
                        }}
                      >
                        {completed ? <CheckCircleIcon /> : index + 1}
                      </Avatar>
                    )}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {steps[activeStep]}
            </Typography>
            
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<CancelIcon />}
              >
                Voltar
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={() => navigate('/reports')}
                  variant="outlined"
                >
                  Cancelar
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleGenerateReport}
                    disabled={!isStepValid(activeStep) || isGenerating}
                    startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
                  >
                    {isGenerating ? 'Gerando Relatório...' : 'Gerar Relatório'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!isStepValid(activeStep)}
                  >
                    Próximo
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomReport;
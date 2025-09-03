/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Description as DocumentIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportsDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [previewDialog, setPreviewDialog] = useState({ open: false, report: null });
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'patients_summary',
      title: 'Relatório de Pacientes',
      description: 'Resumo completo dos pacientes atendidos, novos cadastros e dados demográficos',
      icon: <PersonIcon />,
      color: '#2196F3',
      path: '/reports/patients',
      category: 'clinical',
      frequency: 'daily',
      lastGenerated: '2024-01-15 10:30',
      status: 'ready'
    },
    {
      id: 'appointments_analytics',
      title: 'Análise de Agendamentos',
      description: 'Estatísticas de consultas, cancelamentos, no-shows e eficiência da agenda',
      icon: <CalendarIcon />,
      color: '#4CAF50',
      path: '/reports/appointments',
      category: 'operational',
      frequency: 'weekly',
      lastGenerated: '2024-01-14 16:45',
      status: 'ready'
    },
    {
      id: 'financial_report',
      title: 'Relatório Financeiro',
      description: 'Receitas, despesas, faturamento por convênio e análise de rentabilidade',
      icon: <TrendingUpIcon />,
      color: '#FF9800',
      path: '/reports/financial',
      category: 'financial',
      frequency: 'monthly',
      lastGenerated: '2024-01-10 09:15',
      status: 'generating'
    },
    {
      id: 'clinical_indicators',
      title: 'Indicadores Clínicos',
      description: 'Métricas de qualidade assistencial, diagnósticos mais frequentes e outcomes',
      icon: <HospitalIcon />,
      color: '#E91E63',
      path: '/reports/clinical',
      category: 'clinical',
      frequency: 'monthly',
      lastGenerated: '2024-01-12 14:20',
      status: 'ready'
    },
    {
      id: 'usage_statistics',
      title: 'Estatísticas de Uso',
      description: 'Utilização do sistema, funcionalidades mais usadas e performance',
      icon: <BarChartIcon />,
      color: '#9C27B0',
      path: '/reports/usage',
      category: 'technical',
      frequency: 'weekly',
      lastGenerated: '2024-01-13 11:00',
      status: 'ready'
    },
    {
      id: 'compliance_report',
      title: 'Relatório de Conformidade',
      description: 'Aderência a protocolos, LGPD, auditoria e regulamentações médicas',
      icon: <DocumentIcon />,
      color: '#607D8B',
      path: '/reports/compliance',
      category: 'regulatory',
      frequency: 'monthly',
      lastGenerated: '2024-01-08 08:30',
      status: 'outdated'
    }
  ];

  const quickStats = [
    { label: 'Relatórios Gerados (Este Mês)', value: '24', trend: '+15%' },
    { label: 'Relatórios Automáticos', value: '12', trend: '100%' },
    { label: 'Relatórios Personalizados', value: '8', trend: '+25%' },
    { label: 'Exportações PDF', value: '45', trend: '+8%' }
  ];

  const recentReports = [
    {
      id: 1,
      title: 'Relatório Mensal de Pacientes - Dezembro 2023',
      type: 'patients_summary',
      generatedAt: '2024-01-15 10:30',
      size: '2.3 MB',
      downloads: 5
    },
    {
      id: 2,
      title: 'Análise de Agendamentos - Semana 2',
      type: 'appointments_analytics',
      generatedAt: '2024-01-14 16:45',
      size: '1.8 MB',
      downloads: 3
    },
    {
      id: 3,
      title: 'Indicadores Clínicos - Q4 2023',
      type: 'clinical_indicators',
      generatedAt: '2024-01-12 14:20',
      size: '3.1 MB',
      downloads: 8
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'ready': 'success',
      'generating': 'warning',
      'outdated': 'error',
      'scheduled': 'info'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ready': 'Pronto',
      'generating': 'Gerando',
      'outdated': 'Desatualizado',
      'scheduled': 'Agendado'
    };
    return labels[status] || status;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'clinical': '#2196F3',
      'operational': '#4CAF50',
      'financial': '#FF9800',
      'technical': '#9C27B0',
      'regulatory': '#607D8B'
    };
    return colors[category] || '#757575';
  };

  const handleGenerateReport = async (reportType) => {
    setIsGenerating(true);
    
    // Simular geração de relatório
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Relatório ${reportType.title} gerado com sucesso!`);
    }, 3000);
  };

  const handlePreviewReport = (report) => {
    setPreviewDialog({ open: true, report });
  };

  const handleDownloadReport = (reportId) => {
    // Simular download
    console.log(`Downloading report ${reportId}`);
    alert('Download iniciado!');
  };

  return (
    <Box sx={{ mt: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
          <ReportsIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Relatórios
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Geração e análise de relatórios médicos e administrativos
          </Typography>
        </Box>
      </Box>
  

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="caption" color="success.main">
                  {stat.trend}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Report Types */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Tipos de Relatórios
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Período</InputLabel>
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  label="Período"
                >
                  <MenuItem value="last_7_days">Últimos 7 dias</MenuItem>
                  <MenuItem value="last_30_days">Últimos 30 dias</MenuItem>
                  <MenuItem value="last_3_months">Últimos 3 meses</MenuItem>
                  <MenuItem value="last_year">Último ano</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2}>
              {reportTypes.map((report) => (
                <Grid item xs={12} sm={6} key={report.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: report.color, 
                            mr: 2,
                            width: 40, 
                            height: 40 
                          }}
                        >
                          {report.icon}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {report.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={getStatusLabel(report.status)}
                              color={getStatusColor(report.status)}
                              size="small"
                            />
                            <Chip
                              label={report.frequency}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {report.description}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Última geração: {format(new Date(report.lastGenerated), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handlePreviewReport(report)}
                      >
                        Visualizar
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={isGenerating ? <CircularProgress size={16} /> : <DownloadIcon />}
                        onClick={() => handleGenerateReport(report)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? 'Gerando...' : 'Gerar'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Reports Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Relatórios Recentes
            </Typography>
            
            {recentReports.length === 0 ? (
              <Alert severity="info">
                Nenhum relatório gerado recentemente.
              </Alert>
            ) : (
              <List>
                {recentReports.map((report, index) => (
                  <React.Fragment key={report.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <DocumentIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={report.title}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {format(new Date(report.generatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.size} • {report.downloads} downloads
                            </Typography>
                          </Box>
                        }
                      />
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        Download
                      </Button>
                    </ListItem>
                    {index < recentReports.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Ações Rápidas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                fullWidth
              >
                Imprimir Relatório
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                fullWidth
              >
                Enviar por Email
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                fullWidth
              >
                Compartilhar
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, report: null })}
        maxWidth="md"
        fullWidth
      >
        {previewDialog.report && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: previewDialog.report.color }}>
                {previewDialog.report.icon}
              </Avatar>
              {previewDialog.report.title}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {previewDialog.report.description}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Este é um preview do relatório. Para visualizar os dados completos, 
                gere uma nova versão do relatório.
              </Alert>

              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Configurações do relatório:
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Frequência" 
                      secondary={previewDialog.report.frequency}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Categoria" 
                      secondary={previewDialog.report.category}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Última geração" 
                      secondary={format(new Date(previewDialog.report.lastGenerated), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    />
                  </ListItem>
                </List>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewDialog({ open: false, report: null })}>
                Fechar
              </Button>
              <Button 
                variant="contained"
                onClick={() => {
                  handleGenerateReport(previewDialog.report);
                  setPreviewDialog({ open: false, report: null });
                }}
              >
                Gerar Relatório
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ReportsDashboard;
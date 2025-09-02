/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Box,
  Container,
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
  LinearProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Healing as HealingIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Psychology as DiagnosisIcon,
  AutoFixHigh as AnalysisIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AIDashboard = () => {
  const navigate = useNavigate();
  const [infoDialog, setInfoDialog] = useState({ open: false, feature: null });

  const aiFeatures = [
    {
      id: 'diagnosis',
      title: 'Assistente de Diagnóstico',
      description: 'IA avançada para auxiliar no diagnóstico médico baseado em sintomas e exames',
      icon: <DiagnosisIcon />,
      color: '#2196F3',
      path: '/ai/diagnosis',
      status: 'active',
      confidence: 95,
      features: [
        'Análise de sintomas',
        'Correlação com exames',
        'Sugestões de diagnóstico diferencial',
        'Base de conhecimento médico atualizada'
      ]
    },
    {
      id: 'prescription',
      title: 'Prescrição Inteligente',
      description: 'Sistema de IA para auxiliar na prescrição de medicamentos e tratamentos',
      icon: <MedicationIcon />,
      color: '#4CAF50',
      path: '/ai/prescription',
      status: 'active',
      confidence: 92,
      features: [
        'Verificação de interações medicamentosas',
        'Dosagem personalizada',
        'Alergias e contraindicações',
        'Protocolos clínicos'
      ]
    },
    {
      id: 'analysis',
      title: 'Análise de Exames',
      description: 'IA para interpretação e análise de resultados de exames médicos',
      icon: <AnalysisIcon />,
      color: '#FF9800',
      path: '/ai/analysis',
      status: 'beta',
      confidence: 88,
      features: [
        'Interpretação de exames laboratoriais',
        'Análise de imagens médicas',
        'Detecção de padrões anômalos',
        'Relatórios automatizados'
      ]
    },
    {
      id: 'risk',
      title: 'Avaliação de Risco',
      description: 'Predição e avaliação de riscos médicos baseados em dados do paciente',
      icon: <AssessmentIcon />,
      color: '#E91E63',
      path: '/ai/risk-assessment',
      status: 'active',
      confidence: 90,
      features: [
        'Análise de fatores de risco',
        'Predição de complicações',
        'Scores de risco personalizados',
        'Recomendações preventivas'
      ]
    },
    {
      id: 'research',
      title: 'Pesquisa Médica',
      description: 'IA para busca e análise de literatura médica e estudos clínicos',
      icon: <ScienceIcon />,
      color: '#9C27B0',
      path: '/ai/research',
      status: 'coming_soon',
      confidence: 85,
      features: [
        'Busca em bases científicas',
        'Análise de evidências',
        'Resumos automatizados',
        'Atualizações em tempo real'
      ]
    },
    {
      id: 'treatment',
      title: 'Plano de Tratamento',
      description: 'IA para criação de planos de tratamento personalizados',
      icon: <HealingIcon />,
      color: '#607D8B',
      path: '/ai/treatment-plan',
      status: 'development',
      confidence: 82,
      features: [
        'Protocolos personalizados',
        'Acompanhamento de evolução',
        'Ajustes automáticos',
        'Medicina baseada em evidências'
      ]
    }
  ];

  const getStatusInfo = (status) => {
    const statusMap = {
      'active': { label: 'Ativo', color: 'success', icon: <CheckCircleIcon /> },
      'beta': { label: 'Beta', color: 'warning', icon: <SpeedIcon /> },
      'development': { label: 'Em Desenvolvimento', color: 'info', icon: <TrendingUpIcon /> },
      'coming_soon': { label: 'Em Breve', color: 'default', icon: <WarningIcon /> }
    };
    return statusMap[status] || statusMap.active;
  };

  const handleFeatureClick = (feature) => {
    if (feature.status === 'active' || feature.status === 'beta') {
      navigate(feature.path);
    } else {
      setInfoDialog({ open: true, feature });
    }
  };

  const recentActivity = [
    {
      id: 1,
      type: 'diagnosis',
      title: 'Diagnóstico assistido - Paciente João Silva',
      description: 'IA sugeriu investigação para diabetes tipo 2',
      timestamp: '2 horas atrás',
      confidence: 94
    },
    {
      id: 2,
      type: 'prescription',
      title: 'Prescrição revisada - Paciente Maria Santos',
      description: 'Detectada interação medicamentosa potencial',
      timestamp: '4 horas atrás',
      confidence: 96
    },
    {
      id: 3,
      type: 'analysis',
      title: 'Análise de exame - Hemograma completo',
      description: 'Valores alterados identificados automaticamente',
      timestamp: '6 horas atrás',
      confidence: 91
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
          <AIIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            IA Médica
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Inteligência Artificial para assistência médica avançada
          </Typography>
        </Box>
      </Box>

      {/* AI Features Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {aiFeatures.map((feature) => {
          const statusInfo = getStatusInfo(feature.status);
          const isClickable = feature.status === 'active' || feature.status === 'beta';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={feature.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  '&:hover': isClickable ? {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  } : {},
                  opacity: isClickable ? 1 : 0.7
                }}
                onClick={() => handleFeatureClick(feature)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: feature.color, 
                        mr: 2,
                        width: 48, 
                        height: 48 
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Chip
                        {...statusInfo}
                        size="small"
                        icon={statusInfo.icon}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>

                  {isClickable && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Confiança: {feature.confidence}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={feature.confidence}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  <List dense sx={{ mt: 1 }}>
                    {feature.features.slice(0, 2).map((item, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <CheckCircleIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                
                {isClickable && (
                  <CardActions>
                    <Button
                      endIcon={<ArrowForwardIcon />}
                      sx={{ ml: 'auto' }}
                    >
                      Acessar
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Atividade Recente da IA
        </Typography>
        
        {recentActivity.length === 0 ? (
          <Alert severity="info">
            Nenhuma atividade recente da IA encontrada.
          </Alert>
        ) : (
          <List>
            {recentActivity.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <AIIcon fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                          <Typography variant="caption">
                            {activity.timestamp}
                          </Typography>
                          <Chip 
                            label={`${activity.confidence}% confiança`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Info Dialog */}
      <Dialog 
        open={infoDialog.open} 
        onClose={() => setInfoDialog({ open: false, feature: null })}
        maxWidth="sm"
        fullWidth
      >
        {infoDialog.feature && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: infoDialog.feature.color }}>
                {infoDialog.feature.icon}
              </Avatar>
              {infoDialog.feature.title}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {infoDialog.feature.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Funcionalidades planejadas:
              </Typography>
              <List>
                {infoDialog.feature.features.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                Esta funcionalidade está em desenvolvimento e estará disponível em breve.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInfoDialog({ open: false, feature: null })}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AIDashboard;
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Psychology as AIIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  MedicalServices as MedicalIcon,
  Analytics as AnalyticsIcon,
  Cloud as CloudIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MedicalIcon />,
      title: "Gestão Completa de Pacientes",
      description: "Prontuários eletrônicos, histórico médico e acompanhamento completo de cada paciente."
    },
    {
      icon: <AIIcon />,
      title: "Inteligência Artificial Médica",
      description: "Assistente de diagnóstico, análise de exames e sugestões baseadas em IA avançada."
    },
    {
      icon: <SecurityIcon />,
      title: "Segurança e Conformidade",
      description: "Proteção de dados médicos conforme LGPD, criptografia e backup automático."
    },
    {
      icon: <SpeedIcon />,
      title: "Agilidade no Atendimento",
      description: "Agendamentos inteligentes, prescrições digitais e telemedicina integrada."
    },
    {
      icon: <AnalyticsIcon />,
      title: "Relatórios e Analytics",
      description: "Dashboards inteligentes, métricas de desempenho e análise de dados."
    },
    {
      icon: <CloudIcon />,
      title: "Acesso em Qualquer Lugar",
      description: "Sistema em nuvem, acessível de qualquer dispositivo, a qualquer hora."
    }
  ];

  const benefits = [
    "Reduz tempo de consulta em até 40%",
    "Elimina papelada e arquivos físicos",
    "Melhora a precisão dos diagnósticos",
    "Facilita o acompanhamento de pacientes",
    "Integra com laboratórios e farmácias",
    "Gera relatórios automatizados",
    "Suporte técnico 24/7",
    "Backup automático e seguro"
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header/Navbar */}
      <Box sx={{ bgcolor: 'white', boxShadow: 1, position: 'sticky', top: 0, zIndex: 1000 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <HospitalIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                MedSystem Pro
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/sistema')}
              >
                Fazer Login
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/sistema')}
              >
                Acessar Sistema
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ py: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white' }}>
                <Chip
                  label="🚀 Sistema Médico Completo"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2 }}
                />
                <Typography variant="h2" fontWeight="bold" gutterBottom>
                  Revolucione sua
                  <Typography component="span" variant="h2" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                    {' '}Clínica{' '}
                  </Typography>
                  com IA
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                  Sistema completo de gestão médica com Inteligência Artificial, 
                  prontuário eletrônico, telemedicina e muito mais. 
                  Transforme seu atendimento hoje mesmo!
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ bgcolor: 'white', color: 'primary.main', px: 4, py: 1.5 }}
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate('/sistema')}
                  >
                    Começar Gratuitamente
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: 'white', color: 'white', px: 4, py: 1.5 }}
                  >
                    Ver Demonstração
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={24}
                sx={{
                  p: 3,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    📊 Dashboard em Tempo Real
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        2.847
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pacientes Ativos
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        95%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Satisfação
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>🤖 IA Diagnóstica:</strong> 847 análises hoje
                      </Typography>
                      <Box sx={{ bgcolor: 'success.light', height: 8, borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ bgcolor: 'success.main', height: '100%', width: '78%' }} />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Funcionalidades Avançadas
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Tudo que você precisa para modernizar sua prática médica em uma única plataforma
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Por que escolher o MedSystem Pro?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Mais de 500 clínicas já transformaram seus atendimentos
              </Typography>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  🎯 Resultados Comprovados
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="primary.main">
                        40%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Redução no tempo de consulta
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="success.main">
                        95%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Precisão nos diagnósticos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="info.main">
                        60%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aumento na produtividade
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="warning.main">
                        24/7
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Suporte disponível
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Pronto para Revolucionar sua Clínica?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Junte-se a centenas de profissionais que já transformaram seus atendimentos
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main', 
                  px: 6, 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/sistema')}
              >
                Acessar Sistema Agora
              </Button>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
              ✅ Teste grátis por 30 dias • ✅ Sem compromisso • ✅ Suporte incluído
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <HospitalIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  MedSystem Pro
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 400 }}>
                O sistema médico mais completo e inteligente do mercado. 
                Transformando a medicina com tecnologia de ponta e IA avançada.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Sistema
                  </Typography>
                  <Button color="inherit" onClick={() => navigate('/sistema')}>
                    Fazer Login
                  </Button>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Suporte
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    suporte@medsystem.com
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'grey.700' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2024 MedSystem Pro. Todos os direitos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
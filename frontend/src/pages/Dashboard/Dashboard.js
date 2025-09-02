import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  Avatar,
  Divider,
  Container,
} from '@mui/material';
import {
  People as PatientsIcon,
  Folder as DocumentsIcon,
  Note as NotesIcon,
  Event as AppointmentsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, patientsAPI, documentsAPI, notesAPI, appointmentsAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotification } from '../../components/NotificationProvider';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const { showSuccess, showInfo } = useNotification();

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading: isLoadingDashboard, refetch } = useQuery(
    ['dashboard', selectedPeriod],
    () => dashboardAPI.getStatistics({ period: selectedPeriod }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch recent patients
  const { data: recentPatients } = useQuery(
    ['recent-patients'],
    () => patientsAPI.getAll({ limit: 5, sort: 'created_at', order: 'desc' }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch recent documents
  const { data: recentDocuments } = useQuery(
    ['recent-documents'],
    () => documentsAPI.getAll({ limit: 5, sort: 'created_at', order: 'desc' }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch recent notes
  const { data: recentNotes } = useQuery(
    ['recent-notes'],
    () => notesAPI.getAll({ limit: 5, sort: 'created_at', order: 'desc' }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch upcoming appointments
  const { data: upcomingAppointments } = useQuery(
    ['upcoming-appointments'],
    () => appointmentsAPI.getUpcoming({ limit: 5 }),
    {
      keepPreviousData: true,
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };


  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color === 'primary' ? '#e3f2fd' : 
                                                color === 'secondary' ? '#f3e5f5' :
                                                color === 'success' ? '#e8f5e8' : '#fff3e0'} 0%, white 100%)`,
        border: `1px solid ${color === 'primary' ? '#2196f3' : 
                             color === 'secondary' ? '#9c27b0' :
                             color === 'success' ? '#4caf50' : '#ff9800'}20`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {title}
          </Typography>
        }
        avatar={
          <Box
            sx={{
              bgcolor: `${color}.main`,
              color: 'white',
              borderRadius: 2,
              p: 1.5,
              boxShadow: 2,
              background: `linear-gradient(45deg, ${color === 'primary' ? '#1976d2, #42a5f5' : 
                                                   color === 'secondary' ? '#7b1fa2, #ba68c8' :
                                                   color === 'success' ? '#388e3c, #66bb6a' : '#f57c00, #ffb74d'})`,
            }}
          >
            {icon}
          </Box>
        }
        action={
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MoreVertIcon />
          </IconButton>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Typography variant="h3" component="div" gutterBottom fontWeight={700} color="text.primary">
          {value}
        </Typography>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {change > 0 ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : change < 0 ? (
              <TrendingDownIcon color="error" fontSize="small" />
            ) : null}
            <Typography
              variant="body2"
              fontWeight={500}
              color={change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary'}
            >
              {change !== 0 ? `${change > 0 ? '+' : ''}${Math.abs(change)}% vs período anterior` : 'Sem alteração'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`dashboard-tabpanel-${index}`}
        aria-labelledby={`dashboard-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  if (isLoadingDashboard) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f4fd 100%)',
        borderRadius: 3,
        p: 3,
        border: '1px solid #e0e0e0'
      }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700} color="primary.main">
            Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            Bem-vindo ao sistema médico - Visão geral das atividades
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              refetch();
              showSuccess('Dashboard atualizado com sucesso!');
            }}
            disabled={isLoadingDashboard}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.50',
                borderColor: 'primary.dark',
              }
            }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              showInfo('Redirecionando para novo paciente...');
              navigate('/patients/new');
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
              }
            }}
          >
            Novo Paciente
          </Button>
        </Box>
      </Box>

      {/* Period Selector */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ mr: 2, fontWeight: 600, color: 'text.primary' }}>
            📊 Período de análise:
          </Typography>
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'contained' : 'outlined'}
              size="medium"
              onClick={() => handlePeriodChange(period)}
              sx={{
                borderRadius: 20,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                ...(selectedPeriod === period ? {
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  boxShadow: 2,
                } : {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    borderColor: 'primary.dark',
                  }
                })
              }}
            >
              {period === '7d' ? '📅 Últimos 7 dias' : 
               period === '30d' ? '📅 Últimos 30 dias' :
               period === '90d' ? '📅 Últimos 90 dias' : '📅 Último ano'}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Pacientes"
            value={formatNumber(dashboardData?.total_patients || 0)}
            change={dashboardData?.patient_growth || 0}
            icon={<PatientsIcon />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Documentos"
            value={formatNumber(dashboardData?.total_documents || 0)}
            change={dashboardData?.document_growth || 0}
            icon={<DocumentsIcon />}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Anotações"
            value={formatNumber(dashboardData?.total_notes || 0)}
            change={dashboardData?.note_growth || 0}
            icon={<NotesIcon />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Consultas"
            value={formatNumber(dashboardData?.total_appointments || 0)}
            change={dashboardData?.appointment_growth || 0}
            icon={<AppointmentsIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts and Tables */}
      <Paper sx={{ 
        mb: 4, 
        borderRadius: 3, 
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          variant="fullWidth"
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: '2px solid #e0e0e0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 72,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                borderRadius: '8px 8px 0 0',
                margin: '8px 8px 0 8px',
              }
            }
          }}
        >
          <Tab
            icon={<TrendingUpIcon />}
            iconPosition="start"
            label="📈 Visão Geral"
            id="dashboard-tab-0"
            aria-controls="dashboard-tabpanel-0"
          />
          <Tab
            icon={<PatientsIcon />}
            iconPosition="start"
            label="👥 Pacientes"
            id="dashboard-tab-1"
            aria-controls="dashboard-tabpanel-1"
          />
          <Tab
            icon={<DocumentsIcon />}
            iconPosition="start"
            label="📄 Documentos"
            id="dashboard-tab-2"
            aria-controls="dashboard-tabpanel-2"
          />
          <Tab
            icon={<NotesIcon />}
            iconPosition="start"
            label="📝 Anotações"
            id="dashboard-tab-3"
            aria-controls="dashboard-tabpanel-3"
          />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h5" gutterBottom fontWeight={600} color="primary.main">
                🔔 Atividade Recente
              </Typography>
              <List>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PatientsIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        Novo paciente cadastrado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {recentPatients?.[0]?.name || 'Nenhum paciente recente'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <DocumentsIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        Documento adicionado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {recentDocuments?.[0]?.title || 'Nenhum documento recente'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <NotesIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        Anotação criada
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {recentNotes?.[0]?.title || 'Nenhuma anotação recente'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Upcoming Appointments */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom fontWeight={600} color="primary.main">
                  📅 Próximas Consultas
                </Typography>
                <Button size="small" onClick={() => navigate('/appointments')}>
                  Ver todas
                </Button>
              </Box>
              <List>
                {upcomingAppointments?.appointments?.map((appointment) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                        <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                          <CalendarIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1">
                            {appointment.title || 'Consulta'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.patient_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(appointment.appointment_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </Typography>
                        </Box>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pacientes Recentes
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Data de Nascimento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentPatients?.patients?.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {patient.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body1">
                          {patient.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {patient.cpf}
                    </TableCell>
                    <TableCell>
                      {format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={patient.status}
                        color={patient.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/patients/${patient.id}`)}>
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Documentos Recentes
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Documento</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Data de Upload</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentDocuments?.documents?.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <Typography variant="body1">
                        {document.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {document.original_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {document.patient_name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={document.category}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(document.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/documents/${document.id}`)}>
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Anotações Recentes
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Anotação</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentNotes?.notes?.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell>
                      <Typography variant="body1">
                        {note.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {note.content.substring(0, 100)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {note.patient_name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={note.type}
                        color="secondary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {note.author_name}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/notes/${note.id}`)}>
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default Dashboard;
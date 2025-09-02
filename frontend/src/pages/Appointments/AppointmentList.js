import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Fab,
  Avatar,
  TextField,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Today as TodayIcon,
  Phone as PhoneIcon,
  EventNote as NoteIcon,
  LocalHospital as HospitalIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { appointmentsAPI, patientsAPI } from '../../services/api';
import { format, parseISO, addDays, subDays, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotification } from '../../components/NotificationProvider';

const AppointmentList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Estados para agendamento rápido
  const [quickBooking, setQuickBooking] = useState({
    open: false,
    time: null,
    selectedPatient: null,
    appointmentType: 'retorno',
    notes: ''
  });

  // Fetch agendamentos do dia selecionado
  const { data: appointmentsData, isLoading, error } = useQuery(
    ['daily-appointments', selectedDate],
    () => appointmentsAPI.getDaySchedule(format(selectedDate, 'yyyy-MM-dd')),
    {
      keepPreviousData: true
    }
  );

  const appointments = appointmentsData?.data || [];

  // Fetch lista de pacientes para autocomplete
  const { data: patientsData } = useQuery(
    'patients-for-booking',
    () => patientsAPI.getAll({ limit: 100 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );

  const patients = patientsData?.data?.patients || [
    { id: 1, name: 'Maria Silva', phone: '(11) 98765-4321' },
    { id: 2, name: 'João Santos', phone: '(11) 94567-8901' },
    { id: 3, name: 'Ana Costa', phone: '(11) 91234-5678' },
    { id: 4, name: 'Carlos Oliveira', phone: '(11) 99876-5432' },
    { id: 5, name: 'Fernanda Lima', phone: '(11) 95432-1098' },
    { id: 6, name: 'Roberto Silva', phone: '(11) 96789-0123' },
    { id: 7, name: 'Juliana Souza', phone: '(11) 97654-3210' },
    { id: 8, name: 'Pedro Mendes', phone: '(11) 98123-4567' }
  ];

  // Gerar horários da agenda (8h às 18h)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getAppointmentForTime = (time) => {
    return appointments.find(apt => {
      const aptTime = format(parseISO(apt.scheduled_at), 'HH:mm');
      return aptTime === time;
    });
  };

  const getAppointmentTypeInfo = (type) => {
    const types = {
      'primeira_vez': {
        label: 'Primeira Vez',
        color: 'primary',
        icon: <PersonIcon />,
        bgColor: '#e3f2fd'
      },
      'retorno': {
        label: 'Retorno',
        color: 'success',
        icon: <CheckIcon />,
        bgColor: '#e8f5e8'
      },
      'acompanhamento': {
        label: 'Acompanhamento',
        color: 'warning',
        icon: <ScheduleIcon />,
        bgColor: '#fff3e0'
      },
      'urgencia': {
        label: 'Urgência',
        color: 'error',
        icon: <WarningIcon />,
        bgColor: '#ffebee'
      }
    };
    return types[type] || types['retorno'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmado': 'success',
      'agendado': 'primary', 
      'em_andamento': 'warning',
      'concluido': 'info',
      'cancelado': 'error',
      'faltou': 'default'
    };
    return colors[status] || 'default';
  };

  const handlePrevDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Funções para agendamento rápido
  const handleQuickBookingOpen = (time) => {
    setQuickBooking({
      open: true,
      time,
      selectedPatient: null,
      appointmentType: 'retorno',
      notes: ''
    });
  };

  const handleQuickBookingClose = () => {
    setQuickBooking({
      open: false,
      time: null,
      selectedPatient: null,
      appointmentType: 'retorno',
      notes: ''
    });
  };

  const handleQuickBookingSubmit = async () => {
    if (!quickBooking.selectedPatient) {
      showError('Por favor, selecione um paciente');
      return;
    }

    try {
      // Simular criação do agendamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showSuccess(`Agendamento criado para ${quickBooking.selectedPatient.name} às ${quickBooking.time}`);
      handleQuickBookingClose();
      
      // Aqui você faria a chamada real para a API:
      // await appointmentsAPI.create({
      //   patient_id: quickBooking.selectedPatient.id,
      //   scheduled_at: `${format(selectedDate, 'yyyy-MM-dd')}T${quickBooking.time}:00Z`,
      //   appointment_type: quickBooking.appointmentType,
      //   notes: quickBooking.notes
      // });
      
    } catch (error) {
      showError('Erro ao criar agendamento');
    }
  };

  const formatPatientLastVisit = (lastVisit) => {
    if (!lastVisit) return 'Primeira consulta';
    try {
      return `Última consulta: ${format(parseISO(lastVisit), 'dd/MM/yyyy', { locale: ptBR })}`;
    } catch {
      return 'Primeira consulta';
    }
  };

  const AppointmentCard = ({ appointment, time }) => {
    if (!appointment) {
      return (
        <Card 
          onClick={() => handleQuickBookingOpen(time)}
          sx={{ 
            minHeight: 120, 
            backgroundColor: '#f9f9f9',
            border: '2px dashed #ddd',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#e3f2fd',
              borderColor: '#2196f3',
              borderStyle: 'solid',
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
              '& .add-icon': {
                transform: 'scale(1.2) rotate(90deg)',
                color: '#1976d2'
              },
              '& .hover-text': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <AddIcon 
            className="add-icon"
            sx={{ 
              fontSize: 32, 
              color: '#bbb',
              transition: 'all 0.3s ease',
              mb: 1
            }} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Horário livre
          </Typography>
          <Typography 
            variant="caption" 
            color="primary"
            className="hover-text"
            sx={{ 
              opacity: 0,
              transform: 'translateY(10px)',
              transition: 'all 0.3s ease',
              fontWeight: 600
            }}
          >
            Clique para agendar
          </Typography>
        </Card>
      );
    }

    const typeInfo = getAppointmentTypeInfo(appointment.appointment_type);
    
    return (
      <Card 
        sx={{ 
          minHeight: 120,
          background: `linear-gradient(135deg, ${typeInfo.bgColor} 0%, white 100%)`,
          border: `2px solid ${typeInfo.color === 'primary' ? '#2196f3' : 
                               typeInfo.color === 'success' ? '#4caf50' :
                               typeInfo.color === 'warning' ? '#ff9800' : '#f44336'}20`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: `${typeInfo.color}.main`, width: 32, height: 32 }}>
                {typeInfo.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {appointment.patient?.name || 'Paciente não informado'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {appointment.patient?.age ? `${appointment.patient.age} anos` : ''}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={typeInfo.label}
              color={typeInfo.color}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Informações rápidas */}
          <Stack spacing={1} sx={{ mb: 2 }}>
            {appointment.patient?.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">{appointment.patient.phone}</Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatPatientLastVisit(appointment.patient?.last_visit)}
              </Typography>
            </Box>

            {appointment.patient?.conditions && appointment.patient.conditions.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HospitalIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {appointment.patient.conditions.slice(0, 2).join(', ')}
                  {appointment.patient.conditions.length > 2 && '...'}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Observações expandíveis */}
          {appointment.observations && (
            <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, minHeight: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NoteIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={500} color="primary">
                    Ver observações da última consulta
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {appointment.observations}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Chip
              label={appointment.status === 'confirmado' ? 'Confirmado' : 
                    appointment.status === 'agendado' ? 'Agendado' :
                    appointment.status === 'em_andamento' ? 'Em Andamento' :
                    appointment.status === 'concluido' ? 'Concluído' :
                    appointment.status === 'cancelado' ? 'Cancelado' : 'Faltou'}
              color={getStatusColor(appointment.status)}
              size="small"
            />
            <IconButton 
              size="small" 
              onClick={() => navigate(`/patients/${appointment.patient?.id}`)}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <Box sx={{ mt: 8 }}>
        <Alert severity="error">
          Erro ao carregar agenda: {error.response?.data?.message || error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header com navegação de data */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={700} color="primary.main">
            📅 Agenda Médica
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/new')}
            sx={{
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
              }
            }}
          >
            Novo Agendamento
          </Button>
        </Box>

        {/* Navegação de data */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Dia anterior">
            <IconButton onClick={handlePrevDay} size="large">
              <PrevIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<TodayIcon />}
            onClick={handleToday}
            disabled={isToday(selectedDate)}
            sx={{ mx: 2 }}
          >
            Hoje
          </Button>

          <Paper sx={{ p: 2, flex: 1, textAlign: 'center', backgroundColor: 'primary.50' }}>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {appointments.length} agendamento(s) para este dia
            </Typography>
          </Paper>

          <Tooltip title="Próximo dia">
            <IconButton onClick={handleNextDay} size="large">
              <NextIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Grade de horários */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {timeSlots.map((time) => {
            const appointment = getAppointmentForTime(time);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={time}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 1,
                    p: 1,
                    backgroundColor: 'primary.50',
                    borderRadius: 1
                  }}>
                    <TimeIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {time}
                    </Typography>
                  </Box>
              
                  <AppointmentCard appointment={appointment} time={time} />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Seletor de data manual */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">🗓️ Ir para data específica:</Typography>
          <TextField
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            size="small"
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Paper>

      {/* Modal de agendamento rápido */}
      <Dialog
        open={quickBooking.open}
        onClose={handleQuickBookingClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AddIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Agendamento Rápido</Typography>
              <Typography variant="body2" color="text.secondary">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {quickBooking.time}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {/* Seleção de paciente */}
            <Autocomplete
              options={patients}
              getOptionLabel={(option) => `${option.name} - ${option.phone || ''}`}
              value={quickBooking.selectedPatient}
              onChange={(event, newValue) => {
                setQuickBooking(prev => ({ ...prev, selectedPatient: newValue }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Selecionar Paciente"
                  placeholder="Digite o nome do paciente..."
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.phone}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {/* Tipo de consulta */}
            <FormControl fullWidth>
              <InputLabel>Tipo de Consulta</InputLabel>
              <Select
                value={quickBooking.appointmentType}
                onChange={(e) => setQuickBooking(prev => ({ ...prev, appointmentType: e.target.value }))}
                label="Tipo de Consulta"
              >
                <MenuItem value="primeira_vez">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Primeira Vez
                  </Box>
                </MenuItem>
                <MenuItem value="retorno">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    Retorno
                  </Box>
                </MenuItem>
                <MenuItem value="acompanhamento">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="warning" />
                    Acompanhamento
                  </Box>
                </MenuItem>
                <MenuItem value="urgencia">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    Urgência
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Observações */}
            <TextField
              label="Observações (opcional)"
              multiline
              rows={3}
              value={quickBooking.notes}
              onChange={(e) => setQuickBooking(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Adicione observações sobre a consulta..."
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleQuickBookingClose}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleQuickBookingSubmit}
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!quickBooking.selectedPatient}
            sx={{
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
              }
            }}
          >
            Agendar Consulta
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB para adicionar */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate('/appointments/new')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default AppointmentList;
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  FormControlLabel,
  Switch,
  Divider,
  Container
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { appointmentsAPI, patientsAPI, doctorsAPI } from '../../services/api';
import { format, addMinutes, setHours, setMinutes } from 'date-fns';
import toast from 'react-hot-toast';

const AppointmentCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    scheduled_at: '',
    type: 'consultation',
    duration: 30,
    notes: '',
    is_emergency: false,
    reminder_enabled: true,
    reminder_time: 60, // minutos antes
    status: 'scheduled'
  });

  const [errors, setErrors] = useState({});

  const appointmentTypes = [
    { value: 'consultation', label: 'Consulta' },
    { value: 'followup', label: 'Retorno' },
    { value: 'exam', label: 'Exame' },
    { value: 'procedure', label: 'Procedimento' },
    { value: 'emergency', label: 'Emergência' },
    { value: 'telemedicine', label: 'Telemedicina' }
  ];

  const durations = [15, 30, 45, 60, 90, 120];

  // Buscar pacientes
  const { data: patientsData } = useQuery(
    'patients',
    () => patientsAPI.getAll({ limit: 100 }),
    {
      select: (response) => response.data.patients || []
    }
  );

  // Buscar médicos (simulado - pode precisar criar essa API)
  const [doctors] = useState([
    { id: 1, name: 'Dr. João Silva', specialty: 'Cardiologia' },
    { id: 2, name: 'Dra. Maria Santos', specialty: 'Dermatologia' },
    { id: 3, name: 'Dr. Pedro Costa', specialty: 'Ortopedia' },
    { id: 4, name: 'Dra. Ana Lima', specialty: 'Pediatria' },
    { id: 5, name: 'Dr. Carlos Mendes', specialty: 'Neurologia' }
  ]);

  const createAppointmentMutation = useMutation(
    (appointmentData) => appointmentsAPI.create(appointmentData),
    {
      onSuccess: () => {
        toast.success('Agendamento criado com sucesso!');
        queryClient.invalidateQueries('appointments');
        navigate('/appointments');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao criar agendamento');
        setErrors(error.response?.data?.errors || {});
      }
    }
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patient_id) {
      newErrors.patient_id = 'Paciente é obrigatório';
    }
    
    if (!formData.doctor_id) {
      newErrors.doctor_id = 'Médico é obrigatório';
    }
    
    if (!formData.scheduled_at) {
      newErrors.scheduled_at = 'Data e hora são obrigatórias';
    } else {
      const scheduledDate = new Date(formData.scheduled_at);
      const now = new Date();
      if (scheduledDate < now) {
        newErrors.scheduled_at = 'Data e hora devem ser futuras';
      }
    }
    
    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duração mínima é 15 minutos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = {
      ...formData,
      // Converter para formato ISO se necessário
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      reminder_time: formData.reminder_enabled ? formData.reminder_time : null
    };
    
    createAppointmentMutation.mutate(submitData);
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  // Gerar sugestões de horário
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8:00
    const endHour = 18; // 18:00
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = setMinutes(setHours(new Date(), hour), minute);
        slots.push({
          value: format(time, 'HH:mm'),
          label: format(time, 'HH:mm')
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Novo Agendamento
        </Typography>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={handleCancel}
        >
          Cancelar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.patient_id} required>
                <InputLabel>Paciente</InputLabel>
                <Select
                  value={formData.patient_id}
                  onChange={(e) => handleInputChange('patient_id', e.target.value)}
                  label="Paciente"
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Selecione um paciente</MenuItem>
                  {patientsData?.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.patient_id && (
                  <Typography variant="caption" color="error">
                    {errors.patient_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.doctor_id} required>
                <InputLabel>Médico</InputLabel>
                <Select
                  value={formData.doctor_id}
                  onChange={(e) => handleInputChange('doctor_id', e.target.value)}
                  label="Médico"
                  startAdornment={
                    <InputAdornment position="start">
                      <DoctorIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Selecione um médico</MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </MenuItem>
                  ))}
                </Select>
                {errors.doctor_id && (
                  <Typography variant="caption" color="error">
                    {errors.doctor_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Consulta</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="Tipo de Consulta"
                >
                  {appointmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.duration}>
                <InputLabel>Duração (minutos)</InputLabel>
                <Select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  label="Duração (minutos)"
                  startAdornment={
                    <InputAdornment position="start">
                      <TimeIcon />
                    </InputAdornment>
                  }
                >
                  {durations.map((duration) => (
                    <MenuItem key={duration} value={duration}>
                      {duration} minutos
                    </MenuItem>
                  ))}
                </Select>
                {errors.duration && (
                  <Typography variant="caption" color="error">
                    {errors.duration}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Data e Hora */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Data e Hora
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data e Hora"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                error={!!errors.scheduled_at}
                helperText={errors.scheduled_at}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Configurações */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Configurações
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_emergency}
                    onChange={(e) => handleInputChange('is_emergency', e.target.checked)}
                  />
                }
                label="Marcação de Emergência"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.reminder_enabled}
                    onChange={(e) => handleInputChange('reminder_enabled', e.target.checked)}
                  />
                }
                label="Habilitar Lembrete"
              />
            </Grid>

            {formData.reminder_enabled && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Lembrete (minutos antes)</InputLabel>
                  <Select
                    value={formData.reminder_time}
                    onChange={(e) => handleInputChange('reminder_time', e.target.value)}
                    label="Lembrete (minutos antes)"
                  >
                    <MenuItem value={15}>15 minutos</MenuItem>
                    <MenuItem value={30}>30 minutos</MenuItem>
                    <MenuItem value={60}>1 hora</MenuItem>
                    <MenuItem value={120}>2 horas</MenuItem>
                    <MenuItem value={1440}>1 dia</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações adicionais sobre o agendamento..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NoteIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Botões de ação */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={createAppointmentMutation.isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={createAppointmentMutation.isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={createAppointmentMutation.isLoading}
                >
                  {createAppointmentMutation.isLoading ? 'Salvando...' : 'Salvar Agendamento'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AppointmentCreate;
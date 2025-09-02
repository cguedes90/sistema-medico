import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  MenuItem,
  IconButton,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { api } from '../../services/api';

const MedicalCertificateCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    certificate_type: 'trabalho',
    diagnosis: '',
    rest_days: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    observations: '',
    restrictions: '',
    auto_calculate_end_date: true
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (formData.patient_id) {
      fetchAppointments(formData.patient_id);
    }
  }, [formData.patient_id]);

  useEffect(() => {
    if (formData.auto_calculate_end_date && formData.rest_days > 0) {
      const endDate = addDays(new Date(formData.start_date), formData.rest_days);
      setFormData(prev => ({
        ...prev,
        end_date: format(endDate, 'yyyy-MM-dd')
      }));
    }
  }, [formData.rest_days, formData.start_date, formData.auto_calculate_end_date]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      setPatients(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const fetchAppointments = async (patientId) => {
    try {
      const response = await api.get(`/api/appointments?patient_id=${patientId}`);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/medical-certificates', {
        ...formData,
        rest_days: parseInt(formData.rest_days) || 0
      });
      navigate('/medical-certificates');
    } catch (error) {
      console.error('Erro ao criar atestado:', error);
      alert('Erro ao criar atestado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/medical-certificates')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Novo Atestado Médico
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informações do Atestado
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={patients}
                getOptionLabel={(patient) => `${patient.name} - ${patient.cpf}`}
                value={patients.find(p => p.id === formData.patient_id) || null}
                onChange={(_, value) => handleInputChange('patient_id', value?.id || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Paciente *"
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={appointments}
                getOptionLabel={(appointment) => 
                  `${format(new Date(appointment.scheduled_date), 'dd/MM/yyyy HH:mm')} - ${appointment.type}`
                }
                value={appointments.find(a => a.id === formData.appointment_id) || null}
                onChange={(_, value) => handleInputChange('appointment_id', value?.id || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Consulta (opcional)"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Atestado *"
                value={formData.certificate_type}
                onChange={(e) => handleInputChange('certificate_type', e.target.value)}
                required
              >
                <MenuItem value="trabalho">Trabalho</MenuItem>
                <MenuItem value="estudos">Estudos</MenuItem>
                <MenuItem value="atividade_fisica">Atividade Física</MenuItem>
                <MenuItem value="comparecimento">Comparecimento</MenuItem>
                <MenuItem value="repouso">Repouso</MenuItem>
                <MenuItem value="outros">Outros</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dias de Afastamento"
                type="number"
                value={formData.rest_days}
                onChange={(e) => handleInputChange('rest_days', e.target.value)}
                inputProps={{ min: 0, max: 365 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnóstico *"
                multiline
                rows={3}
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                required
                placeholder="Descrição do diagnóstico ou motivo do atestado"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Período de Validade
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Início *"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Fim"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={formData.auto_calculate_end_date && formData.rest_days > 0}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.auto_calculate_end_date}
                    onChange={(e) => handleInputChange('auto_calculate_end_date', e.target.checked)}
                  />
                }
                label="Calcular data de fim automaticamente com base nos dias de afastamento"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Observações e Restrições
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={4}
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                placeholder="Observações gerais sobre o atestado, instruções especiais, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Restrições Médicas"
                multiline
                rows={3}
                value={formData.restrictions}
                onChange={(e) => handleInputChange('restrictions', e.target.value)}
                placeholder="Restrições específicas de atividades, cuidados necessários, etc."
              />
            </Grid>
          </Grid>
        </Paper>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/medical-certificates')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Emitir Atestado'}
          </Button>
        </Box>
      </form>
    </Container>

  );
};

export default MedicalCertificateCreate;
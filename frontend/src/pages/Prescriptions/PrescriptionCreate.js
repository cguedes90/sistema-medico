import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Autocomplete,
  Card,
  CardContent,
  IconButton,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { api } from '../../services/api';

const PrescriptionCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    diagnosis: '',
    instructions: '',
    notes: '',
    valid_until: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ]
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (formData.patient_id) {
      fetchAppointments(formData.patient_id);
    }
  }, [formData.patient_id]);

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

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ]
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medications: updatedMedications
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/prescriptions', formData);
      navigate('/prescriptions');
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      alert('Erro ao criar receita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/prescriptions')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Nova Receita Digital
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informações da Receita
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnóstico"
                multiline
                rows={3}
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Validade"
                type="date"
                value={formData.valid_until}
                onChange={(e) => handleInputChange('valid_until', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Medicamentos
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addMedication}
              variant="outlined"
            >
              Adicionar Medicamento
            </Button>
          </Box>

          {formData.medications.map((medication, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">
                    Medicamento {index + 1}
                  </Typography>
                  {formData.medications.length > 1 && (
                    <IconButton
                      onClick={() => removeMedication(index)}
                      color="error"
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome do Medicamento *"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Dosagem *"
                      placeholder="Ex: 500mg"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      label="Frequência *"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      required
                    >
                      <MenuItem value="1x ao dia">1x ao dia</MenuItem>
                      <MenuItem value="2x ao dia">2x ao dia</MenuItem>
                      <MenuItem value="3x ao dia">3x ao dia</MenuItem>
                      <MenuItem value="4x ao dia">4x ao dia</MenuItem>
                      <MenuItem value="De 8 em 8 horas">De 8 em 8 horas</MenuItem>
                      <MenuItem value="De 12 em 12 horas">De 12 em 12 horas</MenuItem>
                      <MenuItem value="SOS">SOS (se necessário)</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Duração *"
                      placeholder="Ex: 7 dias"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Instruções Específicas"
                      placeholder="Ex: Tomar após as refeições"
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Instruções Gerais
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instruções para o Paciente"
                multiline
                rows={4}
                placeholder="Instruções gerais sobre o tratamento, cuidados especiais, etc."
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações Internas"
                multiline
                rows={3}
                placeholder="Anotações para uso interno..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/prescriptions')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Receita'}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default PrescriptionCreate;
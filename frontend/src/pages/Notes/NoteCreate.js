/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Note as NoteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MedicalInformation as MedicalInfoIcon,
  LocalHospital as EmergencyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { notesAPI, patientsAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NoteCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    patient_id: '',
    title: '',
    content: '',
    type: 'general',
    priority: 'normal',
    is_private: true,
    tags: [],
    newTag: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [patients, setPatients] = useState([]);

  // Fetch patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await patientsAPI.getAll({ limit: 100 });
        setPatients(response.data.patients || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  // Create note mutation
  const createNoteMutation = useMutation(
    (noteData) => notesAPI.create(noteData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        setSuccess(true);
        setTimeout(() => {
          navigate('/notes');
        }, 2000);
      },
      onError: (error) => {
        console.error('Error creating note:', error);
        setErrors(error.response?.data?.errors || {});
        setLoading(false);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: '',
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patient_id) {
      newErrors.patient_id = 'Selecione um paciente';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await createNoteMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleCancel = () => {
    navigate('/notes');
  };

  if (success) {
    return (
      <Container maxWidth="lg">
        <Alert severity="success" sx={{ mb: 2 }}>
          Anotação criada com sucesso! Redirecionando...
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nova Anotação Médica
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
            {/* Patient Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações do Paciente
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.patient_id}>
                <InputLabel>Paciente</InputLabel>
                <Select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  label="Paciente"
                >
                  <MenuItem value="">Selecione um paciente</MenuItem>
                  {patients.map(patient => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.patient_id && <Typography variant="caption" color="error">{errors.patient_id}</Typography>}
              </FormControl>
            </Grid>

            {/* Note Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações da Anotação
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.title}>
                <TextField
                  fullWidth
                  label="Título"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NoteIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Tipo"
                >
                  <MenuItem value="general">Geral</MenuItem>
                  <MenuItem value="clinical">Clínica</MenuItem>
                  <MenuItem value="prescription">Receita</MenuItem>
                  <MenuItem value="emergency">Emergência</MenuItem>
                  <MenuItem value="follow_up">Acompanhamento</MenuItem>
                </Select>
                {errors.type && <Typography variant="caption" color="error">{errors.type}</Typography>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridade</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Prioridade"
                >
                  <MenuItem value="low">Baixa</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.content}>
                <TextField
                  fullWidth
                  label="Conteúdo"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  multiline
                  rows={8}
                  error={!!errors.content}
                  helperText={errors.content}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MedicalInfoIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>

            {/* Privacy Settings */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_private}
                    onChange={handleChange}
                    name="is_private"
                  />
                }
                label="Marcar como anotação privada (visível apenas para médicos autorizados)"
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Adicionar tag"
                  name="newTag"
                  value={formData.newTag}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!formData.newTag.trim()}
                >
                  Adicionar
                </Button>
              </Box>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Anotação'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NoteCreate;
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  MedicalInformation as MedicalInfoIcon,
  LocalHospital as EmergencyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { patientsAPI } from '../../services/api';
import ImageUpload from '../../components/Upload/ImageUpload';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PatientCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    rg: '',
    birth_date: '',
    gender: '',
    phone: '',
    emergency_contact: {
      name: '',
      phone: '',
      relationship: '',
    },
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
    },
    blood_type: '',
    allergies: [],
    medications: [],
    pre_existing_conditions: [],
    family_history: [],
    insurance_info: {
      provider: '',
      policy_number: '',
      group_number: '',
    },
    primary_care_physician: '',
    notes: '',
    privacy_consent: false,
    profile_image: null,
    profile_image_preview: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Create patient mutation
  const createPatientMutation = useMutation(
    (patientData) => patientsAPI.create(patientData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patients');
        setSuccess(true);
        setTimeout(() => {
          navigate('/patients');
        }, 2000);
      },
      onError: (error) => {
        console.error('Error creating patient:', error);
        setErrors(error.response?.data?.errors || {});
        setLoading(false);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleAddArrayItem = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (file, preview) => {
    setFormData(prev => ({
      ...prev,
      profile_image: file,
      profile_image_preview: preview,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.birth_date) {
      newErrors.birth_date = 'Data de nascimento é obrigatória';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gênero é obrigatório';
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
      // Preparar dados para envio
      const submitData = { ...formData };
      
      // Se há imagem, criar FormData para envio multipart
      if (formData.profile_image) {
        const formDataToSend = new FormData();
        
        // Adicionar todos os campos do formulário
        Object.keys(submitData).forEach(key => {
          if (key === 'profile_image') {
            formDataToSend.append('profile_image', submitData[key]);
          } else if (key === 'profile_image_preview') {
            // Não enviar o preview
            return;
          } else if (typeof submitData[key] === 'object' && submitData[key] !== null) {
            formDataToSend.append(key, JSON.stringify(submitData[key]));
          } else {
            formDataToSend.append(key, submitData[key] || '');
          }
        });
        
        await createPatientMutation.mutateAsync(formDataToSend);
      } else {
        // Remover campos de imagem se não há imagem
        delete submitData.profile_image;
        delete submitData.profile_image_preview;
        await createPatientMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  const formatCPF = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  if (success) {
    return (
      <Container maxWidth="lg">
        <Alert severity="success" sx={{ mb: 2 }}>
          Paciente criado com sucesso! Redirecionando...
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Novo Paciente
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
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
            </Grid>

            {/* Profile Image */}
            <Grid item xs={12} md={4}>
              <ImageUpload
                value={formData.profile_image_preview}
                onChange={handleImageUpload}
                label="Foto do Paciente"
                size={150}
                error={errors.profile_image}
                helperText="Formatos aceitos: JPEG, PNG, WebP, GIF (máx. 5MB)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cpf: formatCPF(e.target.value)
                }))}
                error={!!errors.cpf}
                helperText={errors.cpf}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RG"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Gênero</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gênero"
                >
                  <MenuItem value="male">Masculino</MenuItem>
                  <MenuItem value="female">Feminino</MenuItem>
                  <MenuItem value="other">Outro</MenuItem>
                  <MenuItem value="prefer_not_to_say">Prefiro não informar</MenuItem>
                </Select>
                {errors.gender && <Typography variant="caption" color="error">{errors.gender}</Typography>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de Nascimento"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                error={!!errors.birth_date}
                helperText={errors.birth_date}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: formatPhone(e.target.value)
                }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Endereço
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Logradouro"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número"
                name="address.number"
                value={formData.address.number}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bairro"
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cidade"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Estado"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                inputProps={{ maxLength: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="CEP"
                name="address.zip_code"
                value={formData.address.zip_code}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    zip_code: formatCEP(e.target.value)
                  }
                }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Complemento"
                name="address.complement"
                value={formData.address.complement}
                onChange={handleChange}
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contato de Emergência
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                name="emergency_contact.name"
                value={formData.emergency_contact.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmergencyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="emergency_contact.phone"
                value={formData.emergency_contact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergency_contact: {
                    ...prev.emergency_contact,
                    phone: formatPhone(e.target.value)
                  }
                }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Parentesco"
                name="emergency_contact.relationship"
                value={formData.emergency_contact.relationship}
                onChange={handleChange}
              />
            </Grid>

            {/* Medical Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Médicas
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo Sanguíneo</InputLabel>
                <Select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  label="Tipo Sanguíneo"
                >
                  <MenuItem value="">Selecione</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alergias"
                name="allergies"
                value={formData.allergies.join(', ')}
                onChange={(e) => {
                  const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                  setFormData(prev => ({
                    ...prev,
                    allergies: values
                  }));
                }}
                helperText="Separe por vírgula"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalInfoIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medicamentos em Uso"
                name="medications"
                value={formData.medications.join(', ')}
                onChange={(e) => {
                  const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                  setFormData(prev => ({
                    ...prev,
                    medications: values
                  }));
                }}
                helperText="Separe por vírgula"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalInfoIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Condições Pré-existentes"
                name="pre_existing_conditions"
                value={formData.pre_existing_conditions.join(', ')}
                onChange={(e) => {
                  const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                  setFormData(prev => ({
                    ...prev,
                    pre_existing_conditions: values
                  }));
                }}
                helperText="Separe por vírgula"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalInfoIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Privacy Consent */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.privacy_consent}
                    onChange={handleChange}
                    name="privacy_consent"
                  />
                }
                label="Declaro que li e concordo com os termos de privacidade e tratamento de dados pessoais"
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalInfoIcon />
                    </InputAdornment>
                  ),
                }}
              />
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
                  {loading ? 'Salvando...' : 'Salvar Paciente'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PatientCreate;
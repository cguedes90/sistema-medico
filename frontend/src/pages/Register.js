import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper,
  FormControlLabel,
  Checkbox,
  Divider,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';

const RegisterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
}));

const LoginLink = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
    crm: '',
    specialty: '',
    phone: '',
    birth_date: '',
    gender: 'prefer_not_to_say',
    acceptTerms: false,
    privacyConsent: false
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'acceptTerms' || name === 'privacyConsent' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    
    if (!formData.acceptTerms || !formData.privacyConsent) {
      alert('Você precisa aceitar os termos e políticas de privacidade');
      return;
    }
    
    const { confirmPassword, acceptTerms, privacyConsent, ...registerData } = formData;
    
    const result = await register(registerData);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <RegisterContainer>
      <Typography variant="h5" gutterBottom>
        Crie sua conta
      </Typography>
      
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Cadastre-se para começar a usar o Sistema Médico IA
      </Typography>

      {error && (
        <Alert severity="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome Completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="name"
              autoFocus
              disabled={loading}
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
              required
              margin="normal"
              autoComplete="email"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Função</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Função"
                disabled={loading}
              >
                <MenuItem value="doctor">Médico</MenuItem>
                <MenuItem value="nurse">Enfermeiro</MenuItem>
                <MenuItem value="assistant">Assistente</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.role === 'doctor' && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CRM"
                  name="crm"
                  value={formData.crm}
                  onChange={handleChange}
                  margin="normal"
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Especialidade"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  margin="normal"
                  disabled={loading}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Data de Nascimento"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="gender-label">Gênero</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gênero"
                disabled={loading}
              >
                <MenuItem value="male">Masculino</MenuItem>
                <MenuItem value="female">Feminino</MenuItem>
                <MenuItem value="other">Outro</MenuItem>
                <MenuItem value="prefer_not_to_say">Prefiro não dizer</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="new-password"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="new-password"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  color="primary"
                  disabled={loading}
                />
              }
              label="Aceito os Termos de Serviço"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="privacyConsent"
                  checked={formData.privacyConsent}
                  onChange={handleChange}
                  color="primary"
                  disabled={loading}
                />
              }
              label="Concordo com a Política de Privacidade (LGPD)"
            />
          </Grid>
        </Grid>

        <RegisterButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading || !formData.name || !formData.email || !formData.password || !formData.acceptTerms || !formData.privacyConsent}
          sx={{ mt: 2, mb: 1 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Criar Conta'
          )}
        </RegisterButton>
      </Paper>

      <Box textAlign="center" sx={{ mt: 2 }}>
        <LoginLink 
          variant="body2" 
          color="primary"
          onClick={() => navigate('/login')}
        >
          Já tem uma conta? Faça login
        </LoginLink>
  

      <Divider sx={{ my: 2 }} />

      <Box textAlign="center">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Ao criar uma conta, você concorda com nossos
        </Typography>
        <Typography variant="body2" color="primary">
          Termos de Serviço e Política de Privacidade
        </Typography>
  

      <Box textAlign="center" sx={{ mt: 3 }}>
        <Typography variant="caption" color="textSecondary">
          © 2025 Sistema Médico IA. Todos os direitos reservados.
        </Typography>
  
    </RegisterContainer>
  );
};

export default Register;
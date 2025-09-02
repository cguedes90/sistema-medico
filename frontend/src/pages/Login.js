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
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const LoginButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ForgotPasswordLink = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <LoginContainer>
      <Typography variant="h5" gutterBottom>
        Bem-vindo de volta
      </Typography>
      
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Faça login para acessar sua conta
      </Typography>

      {error && (
        <Alert severity="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
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
          autoFocus
          disabled={loading}
        />
        
        <TextField
          fullWidth
          label="Senha"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          margin="normal"
          autoComplete="current-password"
          disabled={loading}
        />

        <FormControlLabel
          control={
            <Checkbox
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              color="primary"
              disabled={loading}
            />
          }
          label="Lembrar de mim"
        />

        <LoginButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading || !formData.email || !formData.password}
          sx={{ mt: 2, mb: 1 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Entrar'
          )}
        </LoginButton>
      </Paper>

      <Box textAlign="center" sx={{ mt: 2 }}>
        <ForgotPasswordLink 
          variant="body2" 
          color="primary"
          onClick={() => navigate('/forgot-password')}
        >
          Esqueceu sua senha?
        </ForgotPasswordLink>
  

      <Divider sx={{ my: 2 }} />

      <Box textAlign="center">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Não tem uma conta?
        </Typography>
        <Button
          component={Link}
          to="/register"
          variant="outlined"
          color="primary"
          disabled={loading}
        >
          Cadastre-se
        </Button>
  

      <Box textAlign="center" sx={{ mt: 3 }}>
        <Typography variant="caption" color="textSecondary">
          © 2025 Sistema Médico IA. Todos os direitos reservados.
        </Typography>
  
    </LoginContainer>
  );
};

export default Login;
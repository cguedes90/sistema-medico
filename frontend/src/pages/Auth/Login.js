import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Link,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  LocalHospital as HospitalIcon,
  Security as SecurityIcon,
  HealthAndSafety as HealthIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading: reduxLoading, error: reduxError } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Sempre limpar token antigo ao abrir tela de login
    localStorage.removeItem('token');
  }, []);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Dispatch the login action to Redux
      await dispatch(login(formData)).unwrap();
      setSuccess(true);
      setErrors({});
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1200);
    } catch (error) {
      setSuccess(false);
      setErrors({
        general: typeof error === 'string' ? error : 'Email ou senha incorretos. Tente novamente.'
      });
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #2196f3 100%)',
      }}
    >
      {/* Left Side - Medical Theme */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          color: 'white',
          p: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `
              radial-gradient(circle at 20% 50%, white 2px, transparent 2px),
              radial-gradient(circle at 80% 20%, white 2px, transparent 2px),
              radial-gradient(circle at 40% 80%, white 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 150px 150px, 80px 80px',
          }}
        />
        
        <HospitalIcon sx={{ fontSize: 120, mb: 3, opacity: 0.9 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Sistema Médico
        </Typography>
        <Typography variant="h6" textAlign="center" sx={{ mb: 4, opacity: 0.9 }}>
          Plataforma integrada para gestão médica
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">Seguro</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <HealthIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">Confiável</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <HospitalIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">Profissional</Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          background: 'white',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 5,
            maxWidth: 450,
            width: '100%',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                mx: 'auto',
                bgcolor: 'primary.main',
                width: 80,
                height: 80,
                mb: 3,
                boxShadow: 3,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              }}
            >
              <HospitalIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="600" color="primary.main">
              Bem-vindo
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Faça login para acessar o sistema médico
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie pacientes, documentos e muito mais
            </Typography>
          </Box>

        {reduxError && !success && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {reduxError}
          </Alert>
        )}
        {errors.general && !success && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Login realizado com sucesso! Redirecionando...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
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
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            disabled={reduxLoading}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Senha"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            disabled={reduxLoading}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rememberMe}
                onChange={handleChange}
                name="rememberMe"
                color="primary"
              />
            }
            label="Lembrar de mim"
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={reduxLoading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {reduxLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Entrar'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                navigate('/auth/forgot-password');
              }}
              sx={{ color: 'text.secondary', mr: 2 }}
            >
              Esqueceu a senha?
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                navigate('/auth/register');
              }}
              sx={{ color: 'primary.main' }}
            >
              Criar conta
            </Link>
          </Box>
        </form>

          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © 2025 Sistema Médico. Todos os direitos reservados.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
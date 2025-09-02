import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(2),
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[8],
  maxWidth: '400px',
  width: '100%',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const AuthLayout = ({ children }) => {
  return (
    <AuthContainer>
      <Container maxWidth="xs">
        <AuthPaper>
          <Box textAlign="center" mb={3}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                color: 'primary.main',
                fontWeight: 700,
                mb: 2
              }}
            >
              Sistema Médico IA
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{ mb: 3 }}
            >
              Plataforma médica com suporte de inteligência artificial
            </Typography>
          </Box>
          {children}
        </AuthPaper>
      </Container>
    </AuthContainer>
  );
};

export default AuthLayout;
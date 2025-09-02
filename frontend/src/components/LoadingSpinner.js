import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Carregando...' }) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="200px"
      gap={2}
    >
      <CircularProgress 
        size={40} 
        thickness={4}
        color="primary"
      />
      <Typography 
        variant="body2" 
        color="textSecondary"
        sx={{ mt: 1 }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
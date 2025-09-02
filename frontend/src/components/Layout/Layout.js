import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '88px', // Altura do Topbar + margem extra
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          pb: 4,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginLeft: { md: sidebarOpen ? '280px' : 0 },
          width: { md: `calc(100% - ${sidebarOpen ? 280 : 0}px)` },
          minHeight: 'calc(100vh - 88px)',
          bgcolor: '#fafafa',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            maxWidth: '1400px',
            mx: 'auto',
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  Folder as DocumentsIcon,
  NoteAlt as NotesIcon,
  Event as AppointmentsIcon,
  SmartToy as AIIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  BarChart as ChartIcon,
  MedicalInformation as MedicalInfoIcon,
  Receipt as PrescriptionIcon,
  VideoCall as TelemedicineIcon,
  Assignment as CertificateIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    title: 'Pacientes',
    icon: <PatientsIcon />,
    path: '/patients',
    children: [
      { title: 'Lista de Pacientes', path: '/patients' },
      { title: 'Novo Paciente', path: '/patients/new' },
    ],
  },
  {
    title: 'Documentos',
    icon: <DocumentsIcon />,
    path: '/documents',
    children: [
      { title: 'Todos os Documentos', path: '/documents' },
      { title: 'Upload de Documento', path: '/documents/upload' },
    ],
  },
  {
    title: 'Anotações',
    icon: <NotesIcon />,
    path: '/notes',
    children: [
      { title: 'Minhas Anotações', path: '/notes' },
      { title: 'Nova Anotação', path: '/notes/new' },
    ],
  },
  {
    title: 'Agendamentos',
    icon: <AppointmentsIcon />,
    path: '/appointments',
    children: [
      { title: 'Agendamentos', path: '/appointments' },
      { title: 'Novo Agendamento', path: '/appointments/new' },
    ],
  },
  {
    title: 'IA Médica',
    icon: <AIIcon />,
    path: '/ai',
    children: [
      { title: 'Dashboard IA', path: '/ai' },
      { title: 'Assistente de Diagnóstico', path: '/ai/diagnosis' },
    ],
  },
  {
    title: 'Receitas Digitais',
    icon: <PrescriptionIcon />,
    path: '/prescriptions',
    children: [
      { title: 'Lista de Receitas', path: '/prescriptions' },
      { title: 'Nova Receita', path: '/prescriptions/create' },
    ],
  },
  {
    title: 'Telemedicina',
    icon: <TelemedicineIcon />,
    path: '/telemedicine',
    children: [
      { title: 'Sessões', path: '/telemedicine' },
      { title: 'Agendar Sessão', path: '/telemedicine/schedule' },
    ],
  },
  {
    title: 'Atestados Médicos',
    icon: <CertificateIcon />,
    path: '/medical-certificates',
    children: [
      { title: 'Lista de Atestados', path: '/medical-certificates' },
      { title: 'Novo Atestado', path: '/medical-certificates/create' },
    ],
  },
  {
    title: 'Relatórios',
    icon: <ChartIcon />,
    path: '/reports',
    children: [
      { title: 'Dashboard de Relatórios', path: '/reports' },
      { title: 'Relatório Personalizado', path: '/reports/custom' },
    ],
  },
  {
    title: 'Configurações',
    icon: <SettingsIcon />,
    path: '/settings',
    children: [
      { title: 'Perfil', path: '/profile' },
      { title: 'Sistema', path: '/settings' },
    ],
  },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const renderMenuItems = (items, level = 0) => {
    return items.map((item) => {
      const isActive = location.pathname === item.path || 
                      location.pathname.startsWith(item.path + '/');
      
      if (item.children) {
        return (
          <React.Fragment key={item.title}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                sx={{
                  pl: level * 2 + 2,
                  pr: 2,
                  py: 1.5,
                  mx: 1,
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => handleItemClick(item.path)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 44,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.2s ease-in-out',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive ? 'primary.main' : 'text.primary',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
            {renderMenuItems(item.children, level + 1)}
          </React.Fragment>
        );
      }

      return (
        <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            sx={{
              pl: level * 2 + 2,
              pr: 2,
              py: 1.5,
              mx: 1,
              borderRadius: 2,
              bgcolor: isActive ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid transparent',
              '&:hover': {
                bgcolor: isActive ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)',
                transform: 'translateX(4px)',
                transition: 'all 0.2s ease-in-out',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            onClick={() => handleItemClick(item.path)}
          >
            <ListItemIcon
              sx={{
                minWidth: 44,
                color: isActive ? 'primary.main' : 'text.secondary',
                transition: 'color 0.2s ease-in-out',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              sx={{
                '& .MuiListItemText-primary': {
                  color: isActive ? 'primary.main' : 'text.primary',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          background: 'white',
          height: '100vh',
          overflow: 'auto',
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
          <MedicalInfoIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Sistema Médico
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4, 
          p: 2.5, 
          bgcolor: 'rgba(25, 118, 210, 0.08)',
          borderRadius: 2,
          border: '1px solid rgba(25, 118, 210, 0.1)',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
        }}>
          <Avatar
            src={user?.profile_image}
            alt={user?.name}
            sx={{ 
              mr: 2.5, 
              width: 48, 
              height: 48,
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                lineHeight: 1.2,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem'
              }}
            >
              {user?.role === 'admin' ? 'Administrador' :
               user?.role === 'doctor' ? 'Médico' :
               user?.role === 'nurse' ? 'Enfermeiro' :
               user?.role === 'receptionist' ? 'Recepcionista' :
               'Usuário'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 1 }}>
        {renderMenuItems(menuItems)}
      </List>

      <Box sx={{ mt: 'auto', p: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ px: 0 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              sx={{
                pl: 2,
                pr: 2,
                py: 1.5,
                mx: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateX(4px)',
                  transition: 'all 0.2s ease-in-out',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={() => handleItemClick('/profile')}
            >
              <ListItemIcon sx={{ minWidth: 44, color: 'text.secondary' }}>
                <ProfileIcon />
              </ListItemIcon>
              <ListItemText
                primary="Meu Perfil"
                sx={{ 
                  '& .MuiListItemText-primary': {
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                pl: 2,
                pr: 2,
                py: 1.5,
                mx: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.08)',
                  transform: 'translateX(4px)',
                  transition: 'all 0.2s ease-in-out',
                  '& .MuiListItemIcon-root': {
                    color: 'error.main',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'error.main',
                  }
                },
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={handleLogout}
            >
              <ListItemIcon sx={{ minWidth: 44, color: 'text.secondary' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Sair"
                sx={{ 
                  '& .MuiListItemText-primary': {
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
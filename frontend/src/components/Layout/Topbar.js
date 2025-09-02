import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  TextField,
  InputAdornment,
  Autocomplete,
  Chip,
  Paper,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Folder as FolderIcon,
  Note as NoteIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  // Mock data para busca global
  const mockSearchData = [
    { id: 1, type: 'patient', title: 'João Silva', subtitle: 'Paciente - CPF: 123.456.789-00', path: '/patients/1' },
    { id: 2, type: 'patient', title: 'Maria Santos', subtitle: 'Paciente - CPF: 987.654.321-00', path: '/patients/2' },
    { id: 3, type: 'document', title: 'Exame de Sangue - João', subtitle: 'Documento - Uploaded hoje', path: '/documents/1' },
    { id: 4, type: 'document', title: 'Raio-X Tórax - Maria', subtitle: 'Documento - Uploaded ontem', path: '/documents/2' },
    { id: 5, type: 'note', title: 'Consulta de rotina', subtitle: 'Anotação - João Silva', path: '/notes/1' },
    { id: 6, type: 'note', title: 'Prescrição medicamentos', subtitle: 'Anotação - Maria Santos', path: '/notes/2' },
    { id: 7, type: 'appointment', title: 'Consulta - João Silva', subtitle: 'Agendamento - Amanhã 14:00', path: '/appointments/1' },
    { id: 8, type: 'appointment', title: 'Retorno - Maria Santos', subtitle: 'Agendamento - Próxima semana', path: '/appointments/2' },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'patient': return <PersonIcon />;
      case 'document': return <FolderIcon />;
      case 'note': return <NoteIcon />;
      case 'appointment': return <EventIcon />;
      default: return <SearchIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'patient': return 'primary';
      case 'document': return 'secondary';
      case 'note': return 'warning';
      case 'appointment': return 'success';
      default: return 'default';
    }
  };

  const handleSearchChange = (event, value) => {
    setSearchQuery(value);
    
    if (value.length > 1) {
      const filtered = mockSearchData.filter(item =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      setSearchOpen(true);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  const handleSearchSelect = (event, value) => {
    if (value && value.path) {
      navigate(value.path);
      setSearchQuery('');
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  const menuId = 'primary-search-account-menu';
  const notificationId = 'primary-search-notification-menu';

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        background: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        color: '#333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, color: '#666' }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', sm: 'block' },
            color: '#1976d2',
            fontWeight: 'bold'
          }}
        >
          Sistema Médico
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Global Search */}
          <Box sx={{ mr: 2, width: { xs: 200, md: 300 } }}>
            <Autocomplete
              freeSolo
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
              options={searchResults}
              value={searchQuery}
              onInputChange={handleSearchChange}
              onChange={handleSearchSelect}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar pacientes, documentos..."
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      },
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#666' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <ListItemIcon sx={{ minWidth: 40, color: getTypeColor(option.type) }}>
                    {getTypeIcon(option.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={option.title}
                    secondary={option.subtitle}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={option.type}
                    size="small"
                    color={getTypeColor(option.type)}
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              )}
              PaperComponent={(props) => (
                <Paper {...props} sx={{ mt: 1, boxShadow: 3 }} />
              )}
            />
          </Box>

          {/* Notifications */}
          <IconButton
            size="large"
            aria-label="show notifications"
            sx={{ mr: 1, color: '#666' }}
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notificationAnchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            id={notificationId}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(notificationAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Box sx={{ mr: 2 }}>
                <NotificationsIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="subtitle2">Novo Paciente</Typography>
                <Typography variant="caption" color="text.secondary">
                  João Silva foi adicionado hoje
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Box sx={{ mr: 2 }}>
                <NotificationsIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="subtitle2">Lembrete de Consulta</Typography>
                <Typography variant="caption" color="text.secondary">
                  Maria Santos amanhã às 14:00
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Box sx={{ mr: 2 }}>
                <NotificationsIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="subtitle2">Análise de IA</Typography>
                <Typography variant="caption" color="text.secondary">
                  Resultado disponível para exame de sangue
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <Typography variant="body2" color="primary">
                Ver todas as notificações
              </Typography>
            </MenuItem>
          </Menu>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar
              src={user?.profile_image}
              alt={user?.name}
              sx={{ width: 32, height: 32 }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfileClick}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              Meu Perfil
            </MenuItem>
            <MenuItem onClick={handleSettingsClick}>
              <SettingsIcon sx={{ mr: 1 }} />
              Configurações
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <HelpIcon sx={{ mr: 1 }} />
              Ajuda
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authAPI, uploadAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Profile = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading, error } = useQuery(
    'profile',
    authAPI.getProfile,
    {
      onSuccess: (data) => {
        setProfileData(data.data);
      },
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => authAPI.updateProfile(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        setEditMode(false);
      },
      onError: (error) => {
        console.error('Error updating profile:', error);
      },
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (data) => authAPI.changePassword(data.currentPassword, data.newPassword),
    {
      onSuccess: () => {
        setOpenPasswordDialog(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      },
      onError: (error) => {
        console.error('Error changing password:', error);
      },
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancelEdit = () => {
    setProfileData(profile?.data || {});
    setEditMode(false);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Nova senha e confirmação não coincidem');
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'profiles');
      
      const response = await uploadAPI.uploadFile(file, 'profiles');
      
      handleInputChange('profile_image', response.data.url);
      updateProfileMutation.mutate({
        ...profileData,
        profile_image: response.data.url
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Erro ao carregar perfil. Tente novamente.
      </Alert>
    );
  }

  const user = profile?.data || {};

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`profile-tabpanel-${index}`}
        aria-labelledby={`profile-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meu Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie suas informações pessoais e configurações da conta
        </Typography>
      </Box>

      {/* Profile Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user.profile_image}
                alt={user.name}
                sx={{ width: 120, height: 120 }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
                component="label"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <PhotoCameraIcon />
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </IconButton>
            </Box>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                {user.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-start', alignItems: 'center' }}>
                <Chip 
                  label={
                    user.role === 'admin' ? 'Administrador' :
                    user.role === 'doctor' ? 'Médico' :
                    user.role === 'nurse' ? 'Enfermeiro' :
                    user.role === 'receptionist' ? 'Recepcionista' :
                    'Usuário'
                  } 
                  color="primary" 
                />
                {user.specialty && (
                  <Chip label={user.specialty} variant="outlined" />
                )}
                {user.crm && (
                  <Chip label={`CRM: ${user.crm}`} variant="outlined" />
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Editar Perfil
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isLoading}
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Informações Pessoais"
            id="profile-tab-0"
            aria-controls="profile-tabpanel-0"
          />
          <Tab
            icon={<SecurityIcon />}
            iconPosition="start"
            label="Segurança"
            id="profile-tab-1"
            aria-controls="profile-tabpanel-1"
          />
          <Tab
            icon={<NotificationsIcon />}
            iconPosition="start"
            label="Notificações"
            id="profile-tab-2"
            aria-controls="profile-tabpanel-2"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Básicas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Nome Completo"
                    value={profileData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Telefone"
                    value={profileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Data de Nascimento"
                    type="date"
                    value={profileData.birth_date || ''}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Profissionais
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Função</InputLabel>
                    <Select
                      value={profileData.role || ''}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      label="Função"
                    >
                      <MenuItem value="admin">Administrador</MenuItem>
                      <MenuItem value="doctor">Médico</MenuItem>
                      <MenuItem value="nurse">Enfermeiro</MenuItem>
                      <MenuItem value="receptionist">Recepcionista</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="CRM"
                    value={profileData.crm || ''}
                    onChange={(e) => handleInputChange('crm', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Especialidade"
                    value={profileData.specialty || ''}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Departamento"
                    value={profileData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumo de Atividade
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Membro desde"
                      secondary={user.created_at ? format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não informado'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BadgeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Último acesso"
                      secondary={user.last_login ? format(new Date(user.last_login), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Nunca'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Pacientes atendidos"
                      secondary={user.patients_count || 0}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alteração de Senha
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Mantenha sua conta segura com uma senha forte
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<LockIcon />}
                  onClick={() => setOpenPasswordDialog(true)}
                >
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações de Segurança
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Última alteração de senha"
                      secondary={user.password_changed_at ? format(new Date(user.password_changed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Nunca alterada'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Autenticação de dois fatores"
                      secondary="Desabilitada"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Sessões ativas"
                      secondary="1 sessão ativa"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Preferências de Notificação
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure como você deseja receber notificações do sistema
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2">
                Em breve - Sistema de notificações em desenvolvimento
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Senha Atual"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            <TextField
              label="Nova Senha"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            <TextField
              label="Confirmar Nova Senha"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)} disabled={changePasswordMutation.isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={
              changePasswordMutation.isLoading ||
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword ||
              passwordData.newPassword !== passwordData.confirmPassword
            }
          >
            {changePasswordMutation.isLoading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
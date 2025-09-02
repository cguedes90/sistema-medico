/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Container
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Note as NoteIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { appointmentsAPI } from '../../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const AppointmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [statusDialog, setStatusDialog] = useState({ open: false, newStatus: '' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const { data: appointment, isLoading, error } = useQuery(
    ['appointment', id],
    () => appointmentsAPI.getById(id),
    {
      select: (response) => response.data
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status, notes }) => appointmentsAPI.updateStatus(id, { status, notes }),
    {
      onSuccess: () => {
        toast.success('Status atualizado com sucesso!');
        queryClient.invalidateQueries(['appointment', id]);
        queryClient.invalidateQueries('appointments');
        setStatusDialog({ open: false, newStatus: '' });
        setNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar status');
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => appointmentsAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Agendamento excluído com sucesso!');
        navigate('/appointments');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao excluir agendamento');
      }
    }
  );

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'primary',
      'confirmed': 'success',
      'in_progress': 'warning',
      'completed': 'info',
      'cancelled': 'error',
      'no_show': 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'scheduled': 'Agendado',
      'confirmed': 'Confirmado',
      'in_progress': 'Em Andamento',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
      'no_show': 'Faltou'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'consultation': 'Consulta',
      'followup': 'Retorno',
      'exam': 'Exame',
      'procedure': 'Procedimento',
      'emergency': 'Emergência',
      'telemedicine': 'Telemedicina'
    };
    return labels[type] || type;
  };

  const formatDateTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatusDialog({ open: true, newStatus });
  };

  const handleStatusConfirm = () => {
    updateStatusMutation.mutate({
      id,
      status: statusDialog.newStatus,
      notes: notes.trim() || undefined
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Erro ao carregar agendamento: {error.response?.data?.message || error.message}
        </Alert>
      </Box>
    );
  }

  if (!appointment) {
    return (
      <Box>
        <Alert severity="warning">
          Agendamento não encontrado.
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/appointments')}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            Detalhes do Agendamento
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/appointments/${id}/edit`)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informações Principais */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informações do Agendamento
              </Typography>
              <Chip
                label={getStatusLabel(appointment.status)}
                color={getStatusColor(appointment.status)}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Data e Hora
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(appointment.scheduled_at)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Duração
                    </Typography>
                    <Typography variant="body1">
                      {appointment.duration} minutos
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tipo
                    </Typography>
                    <Typography variant="body1">
                      {getTypeLabel(appointment.type)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {appointment.is_emergency && (
                <Grid item xs={12} sm={6}>
                  <Chip label="EMERGÊNCIA" color="error" variant="outlined" />
                </Grid>
              )}
            </Grid>

            {appointment.notes && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Observações
                </Typography>
                <Typography variant="body1">
                  {appointment.notes}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Ações de Status */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ações
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {appointment.status === 'scheduled' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleStatusChange('confirmed')}
                >
                  Confirmar
                </Button>
              )}
              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => handleStatusChange('in_progress')}
                >
                  Iniciar Consulta
                </Button>
              )}
              {appointment.status === 'in_progress' && (
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => handleStatusChange('completed')}
                >
                  Finalizar
                </Button>
              )}
              {['scheduled', 'confirmed'].includes(appointment.status) && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleStatusChange('no_show')}
                  >
                    Marcar Falta
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar com informações do paciente e médico */}
        <Grid item xs={12} md={4}>
          {/* Informações do Paciente */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Paciente
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {appointment.patient?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {appointment.patient?.id}
                  </Typography>
                </Box>
              </Box>
              {appointment.patient && (
                <List dense>
                  {appointment.patient.phone && (
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <PhoneIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={appointment.patient.phone} />
                    </ListItem>
                  )}
                  {appointment.patient.email && (
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <EmailIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={appointment.patient.email} />
                    </ListItem>
                  )}
                </List>
              )}
              
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => navigate(`/patients/${appointment.patient?.id}`)}
                sx={{ mt: 2 }}
              >
                Ver Perfil Completo
              </Button>
            </CardContent>
          </Card>

          {/* Informações do Médico */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Médico
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                  <DoctorIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {appointment.doctor?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.doctor?.specialty || 'Especialidade não informada'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para mudança de status */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, newStatus: '' })}>
        <DialogTitle>
          Alterar Status para: {getStatusLabel(statusDialog.newStatus)}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Observações (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações sobre esta mudança de status..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, newStatus: '' })}>
            Cancelar
          </Button>
          <Button
            onClick={handleStatusConfirm}
            variant="contained"
            disabled={updateStatusMutation.isLoading}
          >
            {updateStatusMutation.isLoading ? 'Atualizando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este agendamento?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentDetail;
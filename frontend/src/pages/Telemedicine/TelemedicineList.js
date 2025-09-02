import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Box,
  TextField,
  Grid,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Visibility as ViewIcon,
  PlayArrow as StartIcon,
  Stop as EndIcon,
  Chat as ChatIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';

const TelemedicineList = () => {
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    fetchSessions();
  }, [filters]);

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/api/telemedicine/sessions?${params.toString()}`);
      setSessions(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'info',
      waiting: 'warning',
      active: 'success',
      completed: 'default',
      cancelled: 'error',
      no_show: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Agendada',
      waiting: 'Aguardando',
      active: 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      no_show: 'Faltou'
    };
    return labels[status] || status;
  };

  const handleStartSession = async (session) => {
    try {
      await api.put(`/api/telemedicine/sessions/${session.id}/start`, {
        room_url: `https://meet.jit.si/${session.session_id}`
      });
      fetchSessions();
      // Abrir sala de vídeo
      window.open(`https://meet.jit.si/${session.session_id}`, '_blank');
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
    }
  };

  const handleEndSession = async (session) => {
    const notes = prompt('Observações da consulta (opcional):');
    try {
      await api.put(`/api/telemedicine/sessions/${session.id}/end`, {
        session_notes: notes,
        quality_rating: 5
      });
      fetchSessions();
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  };

  const handleJoinSession = (session) => {
    if (session.room_url) {
      window.open(session.room_url, '_blank');
    } else {
      window.open(`https://meet.jit.si/${session.session_id}`, '_blank');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Telemedicina
        </Typography>
        <Button
          variant="contained"
          startIcon={<ScheduleIcon />}
          href="/telemedicine/schedule"
        >
          Agendar Sessão
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="scheduled">Agendada</MenuItem>
              <MenuItem value="waiting">Aguardando</MenuItem>
              <MenuItem value="active">Em Andamento</MenuItem>
              <MenuItem value="completed">Concluída</MenuItem>
              <MenuItem value="cancelled">Cancelada</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Data Fim"
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sessão ID</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Médico</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Duração</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{session.session_id}</TableCell>
                <TableCell>{session.patient?.name}</TableCell>
                <TableCell>{session.doctor?.name}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(session.status)}
                    color={getStatusColor(session.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {session.appointment ? 
                    format(new Date(session.appointment.scheduled_date), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR
                    }) : 
                    format(new Date(session.createdAt), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR
                    })
                  }
                </TableCell>
                <TableCell>
                  {session.duration_minutes ? `${session.duration_minutes} min` : '-'}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalhes">
                    <IconButton href={`/telemedicine/sessions/${session.id}`}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>

                  {session.status === 'scheduled' && (
                    <Tooltip title="Iniciar Sessão">
                      <IconButton
                        onClick={() => handleStartSession(session)}
                        color="success"
                      >
                        <StartIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {session.status === 'active' && (
                    <>
                      <Tooltip title="Entrar na Sala">
                        <IconButton
                          onClick={() => handleJoinSession(session)}
                          color="primary"
                        >
                          <VideoCallIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Finalizar Sessão">
                        <IconButton
                          onClick={() => handleEndSession(session)}
                          color="error"
                        >
                          <EndIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {(session.status === 'active' || session.status === 'completed') && (
                    <Tooltip title="Chat">
                      <IconButton href={`/telemedicine/sessions/${session.id}/chat`}>
                        <ChatIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TelemedicineList;
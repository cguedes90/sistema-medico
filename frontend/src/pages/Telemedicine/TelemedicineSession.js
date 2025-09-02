import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  TextField,
  IconButton
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Send as SendIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';

const TelemedicineSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchSession();
    fetchMessages();
  }, [id]);

  const fetchSession = async () => {
    try {
      const response = await api.get(`/api/telemedicine/sessions/${id}`);
      setSession(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/telemedicine/sessions/${id}/messages`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setChatLoading(true);
    try {
      await api.post(`/api/telemedicine/sessions/${id}/messages`, {
        message: newMessage,
        message_type: 'text'
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleJoinSession = () => {
    if (session?.room_url) {
      window.open(session.room_url, '_blank');
    } else {
      window.open(`https://meet.jit.si/${session?.session_id}`, '_blank');
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

  if (loading) return <div>Carregando...</div>;
  if (!session) return <div>Sessão não encontrada</div>;

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/telemedicine')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Sessão de Telemedicina
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informações da Sessão */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {session.session_id}
                </Typography>
                <Chip
                  label={getStatusLabel(session.status)}
                  color={getStatusColor(session.status)}
                />
              </Box>

              {(session.status === 'active' || session.status === 'waiting') && (
                <Button
                  variant="contained"
                  startIcon={<VideoCallIcon />}
                  onClick={handleJoinSession}
                >
                  Entrar na Sala
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Paciente
                    </Typography>
                    <Typography variant="h6">
                      {session.patient?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {session.patient?.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Médico
                    </Typography>
                    <Typography variant="h6">
                      {session.doctor?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {session.doctor?.specialty}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {session.appointment && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">
                        Consulta Agendada
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(session.appointment.scheduled_date), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR
                        })}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {session.appointment.type}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {session.started_at && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Iniciada em
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(session.started_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR
                    })}
                  </Typography>
                </Grid>
              )}

              {session.ended_at && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Finalizada em
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(session.ended_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR
                    })}
                  </Typography>
                </Grid>
              )}

              {session.duration_minutes && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Duração
                  </Typography>
                  <Typography variant="body1">
                    {session.duration_minutes} minutos
                  </Typography>
                </Grid>
              )}

              {session.session_notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Observações da Sessão
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {session.session_notes}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Chat */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Chat da Sessão
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Mensagens */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              <List dense>
                {messages.map((message) => (
                  <ListItem
                    key={message.id}
                    alignItems="flex-start"
                    sx={{
                      justifyContent: message.sender_type === 'doctor' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '80%',
                        bgcolor: message.sender_type === 'doctor' ? 'primary.main' : 'grey.200',
                        color: message.sender_type === 'doctor' ? 'white' : 'black',
                        borderRadius: 2,
                        p: 1
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {message.sender?.name}
                      </Typography>
                      <Typography variant="body1">
                        {message.message}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Input de nova mensagem */}
            {(session.status === 'active' || session.status === 'waiting') && (
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  disabled={chatLoading}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={chatLoading || !newMessage.trim()}
                  color="primary"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TelemedicineSession;
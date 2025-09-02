import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Stack,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
// Criando nossa própria timeline sem @mui/lab para evitar conflitos
import {
  Description,
  Assignment,
  Event,
  LocalHospital,
  Medication,
  Add,
  MoreVert,
  Search,
  CalendarToday,
  Person
} from '@mui/icons-material';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PatientTimeline = ({ events = [], patient = null, onAddEvent, onEditEvent, onDeleteEvent }) => {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Tipos de eventos com ícones e cores
  const eventTypes = {
    consultation: {
      label: 'Consulta',
      icon: <Person />,
      color: 'primary',
      bgColor: '#e3f2fd'
    },
    exam: {
      label: 'Exame',
      icon: <Assignment />,
      color: 'secondary',
      bgColor: '#f3e5f5'
    },
    document: {
      label: 'Documento',
      icon: <Description />,
      color: 'info',
      bgColor: '#e8f5e8'
    },
    appointment: {
      label: 'Agendamento',
      icon: <Event />,
      color: 'warning',
      bgColor: '#fff3e0'
    },
    treatment: {
      label: 'Tratamento',
      icon: <LocalHospital />,
      color: 'error',
      bgColor: '#ffebee'
    },
    medication: {
      label: 'Medicamento',
      icon: <Medication />,
      color: 'success',
      bgColor: '#e8f5e8'
    }
  };

  // Filtrar eventos baseado nos critérios
  useEffect(() => {
    let filtered = events;

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Filtro por data
    if (filterDate) {
      const targetDate = parseISO(filterDate);
      filtered = filtered.filter(event => {
        const eventDate = parseISO(event.date);
        return isWithinInterval(eventDate, {
          start: startOfDay(targetDate),
          end: endOfDay(targetDate)
        });
      });
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredEvents(filtered);
  }, [events, filterType, filterDate, searchTerm]);

  const handleMenuOpen = (event, timelineEvent) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(timelineEvent);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleEventDetails = () => {
    setDialogOpen(true);
    handleMenuClose();
  };

  const formatEventDate = (dateString) => {
    return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR
    });
  };

  const formatEventDateShort = (dateString) => {
    return format(parseISO(dateString), "dd/MM/yyyy", {
      locale: ptBR
    });
  };

  const getEventTypeInfo = (type) => {
    return eventTypes[type] || eventTypes.consultation;
  };

  const renderEventCard = (event) => {
    const typeInfo = getEventTypeInfo(event.type);
    
    return (
      <Card 
        sx={{ 
          mb: 2,
          backgroundColor: typeInfo.bgColor,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" alignItems="center" gap={2} flex={1}>
              <Avatar sx={{ bgcolor: `${typeInfo.color}.main` }}>
                {typeInfo.icon}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.description}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="caption">
                    {formatEventDate(event.date)}
                  </Typography>
                </Box>
                {event.doctor && (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="caption">
                      {event.doctor}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
              <Chip 
                label={typeInfo.label}
                color={typeInfo.color}
                size="small"
              />
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, event)}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Cabeçalho com filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {patient && (
            <Avatar
              src={patient.profile_image}
              alt={patient.name}
              sx={{ width: 56, height: 56 }}
            >
              {patient.name?.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box>
            <Typography variant="h5" gutterBottom>
              Timeline do Paciente
            </Typography>
            {patient && (
              <Typography variant="body2" color="text.secondary">
                {patient.name} - {patient.cpf}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mt={2}>
          {/* Busca */}
          <TextField
            placeholder="Buscar eventos..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />
            }}
            sx={{ flex: 1 }}
          />

          {/* Filtro por tipo */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Tipo de Evento</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Tipo de Evento"
            >
              <MenuItem value="all">Todos os tipos</MenuItem>
              {Object.entries(eventTypes).map(([key, type]) => (
                <MenuItem key={key} value={key}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {type.icon}
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro por data */}
          <TextField
            type="date"
            label="Filtrar por data"
            variant="outlined"
            size="small"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
      </Card>

      {/* Timeline */}
      <Box position="relative">
        {filteredEvents.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum evento encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {events.length === 0 
                ? 'Adicione o primeiro evento para este paciente'
                : 'Tente ajustar os filtros para ver mais eventos'
              }
            </Typography>
          </Card>
        ) : (
          <Box>
            {filteredEvents.map((event, index) => (
              <Box key={event.id || index} sx={{ display: 'flex', mb: 3 }}>
                {/* Timeline dot and line */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${getEventTypeInfo(event.type).color}.main`,
                      width: 48,
                      height: 48,
                      boxShadow: 2,
                      border: 3,
                      borderColor: 'background.paper'
                    }}
                  >
                    {getEventTypeInfo(event.type).icon}
                  </Avatar>
                  {index < filteredEvents.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        height: 40,
                        bgcolor: 'divider',
                        mt: 1
                      }}
                    />
                  )}
                </Box>
                
                {/* Event content */}
                <Box sx={{ flex: 1 }}>
                  {renderEventCard(event)}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Botão para adicionar evento */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => onAddEvent && onAddEvent()}
      >
        <Add />
      </Fab>

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEventDetails}>
          Ver detalhes
        </MenuItem>
        <MenuItem onClick={() => {
          onEditEvent && onEditEvent(selectedEvent);
          handleMenuClose();
        }}>
          Editar
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            onDeleteEvent && onDeleteEvent(selectedEvent);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog de detalhes */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes do Evento
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>
              <Box display="flex" gap={2} mt={2}>
                <Chip 
                  label={getEventTypeInfo(selectedEvent.type).label}
                  color={getEventTypeInfo(selectedEvent.type).color}
                />
                <Chip 
                  label={formatEventDateShort(selectedEvent.date)}
                  variant="outlined"
                />
              </Box>
              {selectedEvent.doctor && (
                <Typography variant="body2" mt={2}>
                  <strong>Médico:</strong> {selectedEvent.doctor}
                </Typography>
              )}
              {selectedEvent.notes && (
                <Typography variant="body2" mt={1}>
                  <strong>Observações:</strong> {selectedEvent.notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientTimeline;
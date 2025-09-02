import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Upload as UploadIcon,
  NoteAdd as NoteAddIcon,
  Event as EventIcon,
  Folder as FolderIcon,
  MedicalInformation as MedicalInfoIcon,
  Timeline as TimelineIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { patientsAPI, documentsAPI, notesAPI, appointmentsAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PatientTimeline from '../../components/Timeline/PatientTimeline';
import usePatientTimeline from '../../hooks/usePatientTimeline';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Hook para timeline interativa
  const {
    timelineEvents,
    loading: timelineLoading,
    error: timelineError,
    deleteTimelineEvent
  } = usePatientTimeline(id);

  // Fetch patient details
  const { data: patient, isLoading: isLoadingPatient } = useQuery(
    ['patient', id],
    () => patientsAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  // Fetch patient documents
  const { data: documents, isLoading: isLoadingDocuments } = useQuery(
    ['patient-documents', id],
    () => documentsAPI.getByPatient(id),
    {
      enabled: !!id,
    }
  );

  // Fetch patient notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery(
    ['patient-notes', id],
    () => notesAPI.getByPatient(id),
    {
      enabled: !!id,
    }
  );

  // Fetch patient appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery(
    ['patient-appointments', id],
    () => appointmentsAPI.getByPatient(id),
    {
      enabled: !!id,
    }
  );

  // Create note mutation
  const createNoteMutation = useMutation(
    (noteData) => notesAPI.create(noteData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['patient-notes', id]);
        setOpenNoteDialog(false);
        setNewNote('');
      },
      onError: (error) => {
        console.error('Error creating note:', error);
      },
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      createNoteMutation.mutate({
        patient_id: id,
        content: newNote,
        type: 'general',
      });
    }
  };

  const handleDeletePatient = () => {
    // Implement delete patient logic
    setOpenDeleteDialog(false);
    navigate('/patients');
  };


  if (isLoadingPatient) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Paciente não encontrado.
        </Alert>
      </Container>
    );
  }

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={patient.profile_image}
            alt={patient.name}
            sx={{ width: 64, height: 64 }}
          >
            {patient.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {patient.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={patient.status}
                color={patient.status === 'active' ? 'success' : 'default'}
                size="small"
              />
              {patient.blood_type && (
                <Chip
                  label={`Sangue: ${patient.blood_type}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/patients/${id}/edit`)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => navigate(`/documents/upload?patient=${id}`)}
          >
            Upload
          </Button>
          <Button
            variant="outlined"
            startIcon={<NoteAddIcon />}
            onClick={() => setOpenNoteDialog(true)}
          >
            Anotação
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
          >
            Imprimir
          </Button>
        </Box>
      </Box>

      {/* Patient Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="CPF"
                    secondary={patient.cpf}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Data de Nascimento"
                    secondary={format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Gênero"
                    secondary={patient.gender}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contato
              </Typography>
              <List>
                <ListItem>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Telefone"
                    secondary={patient.phone || 'Não informado'}
                  />
                </ListItem>
                <ListItem>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Email"
                    secondary={patient.email || 'Não informado'}
                  />
                </ListItem>
                <ListItem>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Endereço"
                    secondary={
                      patient.address
                        ? `${patient.address.street}, ${patient.address.number} - ${patient.address.city}/${patient.address.state}`
                        : 'Não informado'
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contato de Emergência
              </Typography>
              <List>
                <ListItem>
                  <WarningIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary={patient.emergency_contact?.name || 'Não informado'}
                    secondary={
                      patient.emergency_contact?.phone
                        ? `${patient.emergency_contact.phone} (${patient.emergency_contact.relationship})`
                        : 'Não informado'
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações Médicas
              </Typography>
              <List>
                <ListItem>
                  <MedicalInfoIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Alergias"
                    secondary={patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'Nenhuma'}
                  />
                </ListItem>
                <ListItem>
                  <MedicalInfoIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Medicamentos"
                    secondary={patient.medications?.length > 0 ? patient.medications.join(', ') : 'Nenhum'}
                  />
                </ListItem>
                <ListItem>
                  <MedicalInfoIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Condições Pré-existentes"
                    secondary={patient.pre_existing_conditions?.length > 0 ? patient.pre_existing_conditions.join(', ') : 'Nenhuma'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="patient tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<TimelineIcon />}
            iconPosition="start"
            label="Linha do Tempo"
            id="simple-tab-0"
            aria-controls="simple-tabpanel-0"
          />
          <Tab
            icon={<FolderIcon />}
            iconPosition="start"
            label="Documentos"
            id="simple-tab-1"
            aria-controls="simple-tabpanel-1"
          />
          <Tab
            icon={<NoteAddIcon />}
            iconPosition="start"
            label="Anotações"
            id="simple-tab-2"
            aria-controls="simple-tabpanel-2"
          />
          <Tab
            icon={<EventIcon />}
            iconPosition="start"
            label="Agendamentos"
            id="simple-tab-3"
            aria-controls="simple-tabpanel-3"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {timelineLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : timelineError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {timelineError}
          </Alert>
        ) : (
          <PatientTimeline
            patientId={id}
            patient={patient}
            events={timelineEvents}
            onAddEvent={() => setOpenNoteDialog(true)}
            onEditEvent={(event) => {
              // Implementar edição de evento
              console.log('Editar evento:', event);
            }}
            onDeleteEvent={async (event) => {
              try {
                await deleteTimelineEvent(event.id);
              } catch (error) {
                console.error('Erro ao deletar evento:', error);
              }
            }}
          />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Documentos do Paciente
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => navigate(`/documents/upload?patient=${id}`)}
          >
            Upload de Documento
          </Button>
        </Box>
        {isLoadingDocuments ? (
          <CircularProgress />
        ) : (
          <List>
            {documents?.map((doc) => (
              <React.Fragment key={doc.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <FolderIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {doc.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doc.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={doc.category}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={doc.mime_type}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Anotações Médicas
          </Typography>
          <Button
            variant="contained"
            startIcon={<NoteAddIcon />}
            onClick={() => setOpenNoteDialog(true)}
          >
            Nova Anotação
          </Button>
        </Box>
        {isLoadingNotes ? (
          <CircularProgress />
        ) : (
          <List>
            {notes?.map((note) => (
              <React.Fragment key={note.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <NoteAddIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {note.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {note.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - 
                        por {note.author_name}
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Agendamentos do Paciente
        </Typography>
        
        {isLoadingAppointments ? (
          <CircularProgress />
        ) : (
          <List>
            {appointments?.map((appointment) => (
              <React.Fragment key={appointment.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <EventIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {appointment.title || 'Consulta Médica'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(appointment.appointment_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                      {appointment.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {appointment.notes}
                        </Typography>
                      )}
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Add Note Dialog */}
      <Dialog
        open={openNoteDialog}
        onClose={() => setOpenNoteDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Adicionar Anotação</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Anotação"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Digite sua anotação médica aqui..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)} disabled={createNoteMutation.isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddNote}
            variant="contained"
            disabled={createNoteMutation.isLoading || !newNote.trim()}
          >
            {createNoteMutation.isLoading ? 'Salvando...' : 'Salvar Anotação'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Patient Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o paciente "{patient.name}"? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeletePatient}
            color="error"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientDetail;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Note as NoteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notesAPI, patientsAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NoteList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [patients, setPatients] = useState([]);

  // Fetch patients for filter
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await patientsAPI.getAll({ limit: 100 });
        setPatients(response.data.patients || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  // Fetch notes
  const { data, isLoading, error } = useQuery(
    ['notes', page, rowsPerPage, searchTerm, selectedPatient, selectedType],
    async () => {
      const params = {
        page,
        limit: rowsPerPage,
        search: searchTerm,
        patient_id: selectedPatient,
        type: selectedType,
      };
      
      const response = await notesAPI.getAll(params);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  // Delete note mutation
  const deleteNoteMutation = useMutation(
    (id) => notesAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        setOpenDeleteDialog(false);
        setNoteToDelete(null);
      },
      onError: (error) => {
        console.error('Error deleting note:', error);
      },
    }
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(1);
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (noteToDelete) {
      deleteNoteMutation.mutate(noteToDelete.id);
    }
  };

  const handleMenuClick = (event, note) => {
    setAnchorEl(event.currentTarget);
    setSelectedNote(note);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNote(null);
  };

  const handleView = (note) => {
    navigate(`/notes/${note.id}`);
  };

  const handleEdit = (note) => {
    navigate(`/notes/${note.id}/edit`);
  };

  const getNoteTypeColor = (type) => {
    switch (type) {
      case 'general':
        return 'primary';
      case 'clinical':
        return 'success';
      case 'prescription':
        return 'warning';
      case 'emergency':
        return 'error';
      case 'follow_up':
        return 'info';
      default:
        return 'default';
    }
  };

  const getNoteTypeLabel = (type) => {
    switch (type) {
      case 'general':
        return 'Geral';
      case 'clinical':
        return 'Clínica';
      case 'prescription':
        return 'Receita';
      case 'emergency':
        return 'Emergência';
      case 'follow_up':
        return 'Acompanhamento';
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Erro ao carregar anotações. Tente novamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Anotações Médicas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/notes/create')}
        >
          Nova Anotação
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            placeholder="Buscar anotações..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <TextField
            select
            label="Paciente"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            sx={{ minWidth: 200 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Todos os pacientes</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </TextField>
          
          <TextField
            select
            label="Tipo"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            sx={{ minWidth: 150 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Todos os tipos</option>
            <option value="general">Geral</option>
            <option value="clinical">Clínica</option>
            <option value="prescription">Receita</option>
            <option value="emergency">Emergência</option>
            <option value="follow_up">Acompanhamento</option>
          </TextField>
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => navigate('/notes/filters')}
          >
            Mais Filtros
          </Button>
        </Box>
      </Paper>

      {/* Notes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Anotação</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.notes?.map((note) => (
              <TableRow key={note.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <NoteIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {note.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {truncateText(note.content)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {note.patient_name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getNoteTypeLabel(note.type)}
                    color={getNoteTypeColor(note.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {note.author_name}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {formatDate(note.created_at)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={() => handleView(note)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(note)}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mais opções">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, note)}
                        color="default"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {data?.notes?.length || 0} de {data?.total || 0} anotações
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            select
            label="Linhas por página"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            SelectProps={{
              native: true,
            }}
            size="small"
            sx={{ width: 100 }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </TextField>
          <Pagination
            count={Math.ceil((data?.total || 0) / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a anotação "{noteToDelete?.title}"? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={deleteNoteMutation.isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteNoteMutation.isLoading}
          >
            {deleteNoteMutation.isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleView(selectedNote); handleMenuClose(); }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Visualizar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleEdit(selectedNote); handleMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleDeleteClick(selectedNote); handleMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NoteList;
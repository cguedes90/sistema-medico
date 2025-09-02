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
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  OpenInNew as OpenIcon,
  MoreVert as MoreVertIcon,
  Folder as FolderIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { documentsAPI, patientsAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DocumentList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
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

  // Fetch documents
  const { data, isLoading, error } = useQuery(
    ['documents', page, rowsPerPage, searchTerm, selectedPatient, selectedCategory],
    async () => {
      const params = {
        page,
        limit: rowsPerPage,
        search: searchTerm,
        patient_id: selectedPatient,
        category: selectedCategory,
      };
      
      const response = await documentsAPI.getAll(params);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  // Delete document mutation
  const deleteDocumentMutation = useMutation(
    (id) => documentsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setOpenDeleteDialog(false);
        setDocumentToDelete(null);
      },
      onError: (error) => {
        console.error('Error deleting document:', error);
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

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id);
    }
  };

  const handleMenuClick = (event, document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleDownload = async (document) => {
    try {
      const response = await documentsAPI.download(document.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleView = (document) => {
    // Implement document viewing logic
    window.open(document.file_url, '_blank');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'exame':
        return <DescriptionIcon />;
      case 'receita':
        return <DescriptionIcon />;
      case 'laudo':
        return <DescriptionIcon />;
      case 'atestado':
        return <DescriptionIcon />;
      case 'prontuario':
        return <FolderIcon />;
      case 'imagem':
        return <ImageIcon />;
      default:
        return <FileIcon />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'exame':
        return 'primary';
      case 'receita':
        return 'success';
      case 'laudo':
        return 'error';
      case 'atestado':
        return 'warning';
      case 'prontuario':
        return 'info';
      case 'imagem':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getDocumentIcon = (filename) => {
    if (filename.toLowerCase().endsWith('.pdf')) {
      return <PdfIcon color="error" />;
    } else if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      return <ImageIcon color="primary" />;
    } else {
      return <FileIcon color="action" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
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
          Erro ao carregar documentos. Tente novamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Documentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/documents/upload')}
        >
          Upload de Documento
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            placeholder="Buscar documentos..."
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
            label="Categoria"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{ minWidth: 150 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Todas as categorias</option>
            <option value="exame">Exame</option>
            <option value="receita">Receita</option>
            <option value="laudo">Laudo</option>
            <option value="atestado">Atestado</option>
            <option value="prontuario">Prontuário</option>
            <option value="imagem">Imagem</option>
            <option value="outro">Outro</option>
          </TextField>
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => navigate('/documents/filters')}
          >
            Mais Filtros
          </Button>
        </Box>
      </Paper>

      {/* Documents Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Documento</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Tamanho</TableCell>
              <TableCell>Data de Upload</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.documents?.map((document) => (
              <TableRow key={document.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getDocumentIcon(document.original_name)}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {document.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {document.original_name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {document.patient_name}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getCategoryIcon(document.category)}
                    label={document.category}
                    color={getCategoryColor(document.category)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {document.file_size ? `${document.file_size} bytes` : 'N/A'}
                </TableCell>
                <TableCell>
                  {formatDate(document.created_at)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={document.extraction_status}
                    color={
                      document.extraction_status === 'completed' ? 'success' :
                      document.extraction_status === 'processing' ? 'warning' :
                      document.extraction_status === 'failed' ? 'error' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={() => handleView(document)}
                        color="primary"
                      >
                        <OpenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(document)}
                        color="secondary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mais opções">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, document)}
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
          Mostrando {data?.documents?.length || 0} de {data?.total || 0} documentos
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
            Tem certeza que deseja excluir o documento "{documentToDelete?.title}"? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={deleteDocumentMutation.isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteDocumentMutation.isLoading}
          >
            {deleteDocumentMutation.isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleView(selectedDocument); handleMenuClose(); }}>
          <ListItemIcon>
            <OpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Visualizar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleDownload(selectedDocument); handleMenuClose(); }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Baixar</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { navigate(`/documents/${selectedDocument.id}/edit`); handleMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteClick(selectedDocument); handleMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default DocumentList;
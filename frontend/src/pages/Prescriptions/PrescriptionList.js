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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  LocalPharmacy as PharmacyIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    patient_id: ''
  });
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [filters]);

  const fetchPrescriptions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.patient_id) params.append('patient_id', filters.patient_id);

      const response = await api.get(`/api/prescriptions?${params.toString()}`);
      setPrescriptions(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      dispensed: 'info',
      cancelled: 'error',
      expired: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Ativa',
      dispensed: 'Dispensada',
      cancelled: 'Cancelada',
      expired: 'Expirada'
    };
    return labels[status] || status;
  };

  const handleViewQRCode = (prescription) => {
    setSelectedPrescription(prescription);
    setQrDialogOpen(true);
  };

  const handleCancelPrescription = async (prescription) => {
    if (window.confirm('Tem certeza que deseja cancelar esta receita?')) {
      try {
        await api.put(`/api/prescriptions/${prescription.id}/cancel`, {
          reason: 'Cancelada pelo médico'
        });
        fetchPrescriptions();
      } catch (error) {
        console.error('Erro ao cancelar receita:', error);
      }
    }
  };

  const handleDispensePrescription = async (prescription) => {
    const pharmacy = prompt('Informe o nome da farmácia:');
    if (pharmacy) {
      try {
        await api.put(`/api/prescriptions/${prescription.id}/dispense`, {
          pharmacy_dispensed: pharmacy
        });
        fetchPrescriptions();
      } catch (error) {
        console.error('Erro ao dispensar receita:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Receitas Digitais
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          href="/prescriptions/create"
        >
          Nova Receita
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Ativa</MenuItem>
              <MenuItem value="dispensed">Dispensada</MenuItem>
              <MenuItem value="cancelled">Cancelada</MenuItem>
              <MenuItem value="expired">Expirada</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Médico</TableCell>
              <TableCell>Medicamentos</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Validade</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>{prescription.prescription_number}</TableCell>
                <TableCell>{prescription.patient?.name}</TableCell>
                <TableCell>{prescription.doctor?.name}</TableCell>
                <TableCell>
                  {prescription.medications?.length} medicamento(s)
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(prescription.status)}
                    color={getStatusColor(prescription.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(prescription.valid_until), 'dd/MM/yyyy', {
                    locale: ptBR
                  })}
                </TableCell>
                <TableCell>
                  {format(new Date(prescription.createdAt), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR
                  })}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalhes">
                    <IconButton href={`/prescriptions/${prescription.id}`}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="QR Code">
                    <IconButton onClick={() => handleViewQRCode(prescription)}>
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>

                  {prescription.status === 'active' && (
                    <>
                      <Tooltip title="Dispensar">
                        <IconButton
                          onClick={() => handleDispensePrescription(prescription)}
                          color="primary"
                        >
                          <PharmacyIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Cancelar">
                        <IconButton
                          onClick={() => handleCancelPrescription(prescription)}
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code da Receita</DialogTitle>
        <DialogContent>
          {selectedPrescription?.qr_code && (
            <Box textAlign="center" p={2}>
              <img
                src={selectedPrescription.qr_code}
                alt="QR Code"
                style={{ maxWidth: '300px', width: '100%' }}
              />
              <Typography variant="body2" color="textSecondary" mt={2}>
                Código de verificação: {selectedPrescription.verification_code}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>

  );
};

export default PrescriptionList;
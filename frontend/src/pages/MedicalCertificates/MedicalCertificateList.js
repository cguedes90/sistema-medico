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
  Chip,
  IconButton,
  Button,
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
  Verified as VerifiedIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';

const MedicalCertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    certificate_type: '',
    date_from: '',
    date_to: ''
  });
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [filters]);

  const fetchCertificates = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.certificate_type) params.append('certificate_type', filters.certificate_type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/api/medical-certificates?${params.toString()}`);
      setCertificates(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar atestados:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      cancelled: 'error',
      expired: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Ativo',
      cancelled: 'Cancelado',
      expired: 'Expirado'
    };
    return labels[status] || status;
  };

  const getCertificateTypeLabel = (type) => {
    const labels = {
      trabalho: 'Trabalho',
      estudos: 'Estudos',
      atividade_fisica: 'Atividade Física',
      comparecimento: 'Comparecimento',
      repouso: 'Repouso',
      outros: 'Outros'
    };
    return labels[type] || type;
  };

  const handleViewQRCode = (certificate) => {
    setSelectedCertificate(certificate);
    setQrDialogOpen(true);
  };

  const handleCancelCertificate = async (certificate) => {
    if (window.confirm('Tem certeza que deseja cancelar este atestado?')) {
      try {
        await api.put(`/api/medical-certificates/${certificate.id}/cancel`, {
          reason: 'Cancelado pelo médico'
        });
        fetchCertificates();
      } catch (error) {
        console.error('Erro ao cancelar atestado:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Atestados Médicos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          href="/medical-certificates/create"
        >
          Novo Atestado
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
              <MenuItem value="expired">Expirado</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Tipo"
              value={filters.certificate_type}
              onChange={(e) => setFilters({ ...filters, certificate_type: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="trabalho">Trabalho</MenuItem>
              <MenuItem value="estudos">Estudos</MenuItem>
              <MenuItem value="atividade_fisica">Atividade Física</MenuItem>
              <MenuItem value="comparecimento">Comparecimento</MenuItem>
              <MenuItem value="repouso">Repouso</MenuItem>
              <MenuItem value="outros">Outros</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
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
              <TableCell>Número</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Médico</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Data Emissão</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell>{certificate.certificate_number}</TableCell>
                <TableCell>{certificate.patient?.name}</TableCell>
                <TableCell>{certificate.doctor?.name}</TableCell>
                <TableCell>
                  {getCertificateTypeLabel(certificate.certificate_type)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(certificate.status)}
                    color={getStatusColor(certificate.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(certificate.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                  {certificate.end_date && (
                    <> até {format(new Date(certificate.end_date), 'dd/MM/yyyy', { locale: ptBR })}</>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(certificate.issued_at), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR
                  })}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalhes">
                    <IconButton href={`/medical-certificates/${certificate.id}`}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="QR Code">
                    <IconButton onClick={() => handleViewQRCode(certificate)}>
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Verificar">
                    <IconButton href={`/medical-certificates/verify`} color="primary">
                      <VerifiedIcon />
                    </IconButton>
                  </Tooltip>

                  {certificate.status === 'active' && (
                    <Tooltip title="Cancelar">
                      <IconButton
                        onClick={() => handleCancelCertificate(certificate)}
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
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
        <DialogTitle>QR Code do Atestado</DialogTitle>
        <DialogContent>
          {selectedCertificate?.qr_code && (
            <Box textAlign="center" p={2}>
              <img
                src={selectedCertificate.qr_code}
                alt="QR Code"
                style={{ maxWidth: '300px', width: '100%' }}
              />
              <Typography variant="body2" color="textSecondary" mt={2}>
                Código de verificação: {selectedCertificate.verification_code}
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

export default MedicalCertificateList;
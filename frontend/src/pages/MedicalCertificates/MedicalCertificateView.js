import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';

const MedicalCertificateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    try {
      const response = await api.get(`/api/medical-certificates/${id}`);
      setCertificate(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar atestado:', error);
    } finally {
      setLoading(false);
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
      trabalho: 'Atestado de Trabalho',
      estudos: 'Atestado de Estudos',
      atividade_fisica: 'Atestado de Atividade Física',
      comparecimento: 'Atestado de Comparecimento',
      repouso: 'Atestado de Repouso',
      outros: 'Outros'
    };
    return labels[type] || type;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div>Carregando...</div>;
  if (!certificate) return <div>Atestado não encontrado</div>;

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/medical-certificates')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Atestado Médico
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={() => setQrDialogOpen(true)}
          >
            QR Code
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Baixar PDF
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h5" gutterBottom>
            {getCertificateTypeLabel(certificate.certificate_type)}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Número: {certificate.certificate_number}
          </Typography>
          <Chip
            label={getStatusLabel(certificate.status)}
            color={getStatusColor(certificate.status)}
            sx={{ mt: 1 }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Paciente
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {certificate.patient?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  CPF: {certificate.patient?.cpf}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Email: {certificate.patient?.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Médico Responsável
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {certificate.doctor?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  CRM: {certificate.doctor?.crm}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Especialidade: {certificate.doctor?.specialty}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Diagnóstico
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="body1">
                {certificate.diagnosis}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Data de Início
            </Typography>
            <Typography variant="body1">
              {format(new Date(certificate.start_date), 'dd/MM/yyyy', { locale: ptBR })}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Data de Fim
            </Typography>
            <Typography variant="body1">
              {certificate.end_date ? 
                format(new Date(certificate.end_date), 'dd/MM/yyyy', { locale: ptBR }) : 
                'Não especificado'
              }
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Dias de Afastamento
            </Typography>
            <Typography variant="body1">
              {certificate.rest_days} dias
            </Typography>
          </Grid>

          {certificate.observations && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Observações
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body1">
                  {certificate.observations}
                </Typography>
              </Paper>
            </Grid>
          )}

          {certificate.restrictions && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Restrições Médicas
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body1">
                  {certificate.restrictions}
                </Typography>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Data de Emissão
                </Typography>
                <Typography variant="body1">
                  {format(new Date(certificate.issued_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Código de Verificação
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1em' }}>
                  {certificate.verification_code}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {certificate.status === 'cancelled' && (
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Atestado Cancelado
                  </Typography>
                  <Typography variant="body2">
                    Cancelado em: {format(new Date(certificate.cancelled_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </Typography>
                  {certificate.cancelled_reason && (
                    <Typography variant="body2">
                      Motivo: {certificate.cancelled_reason}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code do Atestado</DialogTitle>
        <DialogContent>
          {certificate.qr_code && (
            <Box textAlign="center" p={2}>
              <img
                src={certificate.qr_code}
                alt="QR Code"
                style={{ maxWidth: '300px', width: '100%' }}
              />
              <Typography variant="body2" color="textSecondary" mt={2}>
                Código de verificação: {certificate.verification_code}
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

export default MedicalCertificateView;
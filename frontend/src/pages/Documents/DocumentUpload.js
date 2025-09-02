/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { documentsAPI, patientsAPI } from '../../services/api';
import AdvancedUpload from '../../components/Upload/AdvancedUpload';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(''); // '', 'success', 'error'
  const [message, setMessage] = useState('');

  // Fetch patients for dropdown
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

  // Get patient ID from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientIdParam = params.get('patient');
    if (patientIdParam) {
      setPatientId(patientIdParam);
    }
  }, [location.search]);

  // Função para fazer upload via API
  const handleUpload = async (uploadData) => {
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('patient_id', uploadData.patientId);
      formData.append('category', uploadData.category);
      formData.append('description', uploadData.description || '');
      
      const response = await documentsAPI.upload(formData);
      
      // Atualizar cache de documentos
      queryClient.invalidateQueries(['patient-documents', uploadData.patientId]);
      
      setUploadStatus('success');
      setMessage('Documento enviado com sucesso!');
      
      return response;
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadStatus('error');
      setMessage(error.response?.data?.error || 'Erro ao fazer upload do documento');
      throw error;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Upload de Documentos
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/documents')}
        >
          Voltar
        </Button>
      </Box>

      {/* Seleção de Paciente */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Selecionar Paciente
        </Typography>
        
        <FormControl fullWidth>
          <InputLabel>Paciente</InputLabel>
          <Select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            label="Paciente"
          >
            <MenuItem value="">Selecione um paciente</MenuItem>
            {patients.map(patient => (
              <MenuItem key={patient.id} value={patient.id}>
                {patient.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Alertas de Status */}
      {uploadStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setUploadStatus('')}>
          {message}
        </Alert>
      )}
      
      {uploadStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUploadStatus('')}>
          {message}
        </Alert>
      )}

      {/* Aviso se nenhum paciente selecionado */}
      {!patientId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Selecione um paciente antes de fazer upload dos documentos.
        </Alert>
      )}

      {/* Componente de Upload Avançado */}
      {patientId && (
        <AdvancedUpload
          onUpload={handleUpload}
          patientId={patientId}
          maxFileSize={10485760} // 10MB
          allowedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.txt']}
          autoCompress={true}
        />
      )}
    </Container>
  );
};

export default DocumentUpload;
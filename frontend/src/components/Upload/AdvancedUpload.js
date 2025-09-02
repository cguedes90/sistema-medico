/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Fab,
  Zoom
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Preview,
  Description,
  Image,
  PictureAsPdf,
  VideoFile,
  AudioFile,
  InsertDriveFile,
  Add,
  CheckCircle,
  Error as ErrorIcon,
  Compress,
  Category
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNotification } from '../NotificationProvider';

const AdvancedUpload = ({ 
  onUpload, 
  maxFileSize = 10485760, // 10MB
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  patientId,
  autoCompress = true 
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Categorias de documentos
  const categories = [
    { value: 'exame', label: 'Exame', color: 'primary' },
    { value: 'receita', label: 'Receita', color: 'secondary' },
    { value: 'laudo', label: 'Laudo', color: 'info' },
    { value: 'consulta', label: 'Consulta', color: 'success' },
    { value: 'outros', label: 'Outros', color: 'default' }
  ];

  // Função para comprimir imagem
  const compressImage = (file, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nova dimensão mantendo aspect ratio
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Função para obter ícone baseado no tipo de arquivo
  const getFileIcon = (file) => {
    const type = file.type.toLowerCase();
    
    if (type.includes('image')) return <Image color="primary" />;
    if (type.includes('pdf')) return <PictureAsPdf color="error" />;
    if (type.includes('video')) return <VideoFile color="secondary" />;
    if (type.includes('audio')) return <AudioFile color="info" />;
    if (type.includes('document') || type.includes('word')) return <Description color="success" />;
    
    return <InsertDriveFile />;
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Callback do dropzone
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Mostrar erros para arquivos rejeitados
    rejectedFiles.forEach(({ file, errors }) => {
      console.error(`Arquivo ${file.name} rejeitado:`, errors);
      const errorMessage = errors.map(e => e.message).join(', ');
      showError(`Arquivo "${file.name}" rejeitado: ${errorMessage}`);
    });

    if (acceptedFiles.length > 0) {
      showInfo(`${acceptedFiles.length} arquivo(s) adicionado(s) para upload`);
    }

    // Processar arquivos aceitos
    const processedFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        let processedFile = file;
        
        // Comprimir imagens se autoCompress estiver ativado
        if (autoCompress && file.type.startsWith('image/')) {
          try {
            const compressedBlob = await compressImage(file);
            processedFile = new File([compressedBlob], file.name, {
              type: file.type,
              lastModified: file.lastModified
            });
          } catch (error) {
            console.error('Erro ao comprimir imagem:', error);
          }
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          file: processedFile,
          originalFile: file,
          name: file.name,
          size: processedFile.size,
          type: file.type,
          progress: 0,
          status: 'pending', // pending, uploading, completed, error
          category: '',
          description: '',
          preview: file.type.startsWith('image/') ? URL.createObjectURL(processedFile) : null,
          compressed: autoCompress && file.type.startsWith('image/') && processedFile.size < file.size
        };
      })
    );

    setFiles(prev => [...prev, ...processedFiles]);
  }, [autoCompress, showError, showInfo]);

  // Configuração do dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    maxSize: maxFileSize,
    multiple: true
  });

  // Função para remover arquivo
  const removeFile = (fileId) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      const fileToRemove = prev.find(f => f.id === fileId);
      
      if (fileToRemove) {
        showInfo(`Arquivo "${fileToRemove.name}" removido da lista`);
      }
      
      // Limpar URL do preview
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      return updatedFiles;
    });
  };

  // Função para abrir dialog de categorização
  const handleOpenCategoryDialog = (file) => {
    setSelectedFile(file);
    setCategory(file.category || '');
    setDescription(file.description || '');
    setOpenCategoryDialog(true);
  };

  // Função para salvar categoria
  const saveCategory = () => {
    if (selectedFile) {
      setFiles(prev => prev.map(file => 
        file.id === selectedFile.id 
          ? { ...file, category, description }
          : file
      ));
    }
    setOpenCategoryDialog(false);
    setSelectedFile(null);
    setCategory('');
    setDescription('');
  };

  // Função para fazer upload dos arquivos
  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        if (file.status === 'completed') continue;

        // Atualizar status para uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        try {
          // Simular progresso de upload
          for (let progress = 0; progress <= 100; progress += 10) {
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress } : f
            ));
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Chamar função de upload
          await onUpload({
            file: file.file,
            category: file.category || 'outros',
            description: file.description,
            patientId
          });

          // Atualizar status para completed
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
          ));

          showSuccess(`Arquivo "${file.name}" enviado com sucesso!`);

        } catch (error) {
          console.error('Erro no upload:', error);
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' } : f
          ));
          
          showError(`Erro ao enviar "${file.name}": ${error.message || 'Erro desconhecido'}`);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  // Função para preview de arquivo
  const previewFileHandler = (file) => {
    setPreviewFile(file);
  };

  const getDropzoneStyle = () => {
    const baseStyle = {
      border: '2px dashed #cccccc',
      borderRadius: '8px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#fafafa'
    };

    if (isDragAccept) {
      return { ...baseStyle, borderColor: '#00e676', backgroundColor: '#e8f5e8' };
    }
    
    if (isDragReject) {
      return { ...baseStyle, borderColor: '#ff1744', backgroundColor: '#ffebee' };
    }
    
    if (isDragActive) {
      return { ...baseStyle, borderColor: '#2196f3', backgroundColor: '#e3f2fd' };
    }
    
    return baseStyle;
  };

  return (
    <Box>
      {/* Área de Drop */}
      <Paper
        {...getRootProps()}
        sx={getDropzoneStyle()}
        elevation={isDragActive ? 4 : 1}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        {isDragActive ? (
          <Typography variant="h6" color="primary">
            Solte os arquivos aqui...
          </Typography>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Arraste arquivos aqui ou clique para selecionar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tipos aceitos: {allowedTypes.join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tamanho máximo: {formatFileSize(maxFileSize)}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <Paper sx={{ mt: 3 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              Arquivos Selecionados ({files.length})
            </Typography>
          </Box>
          
          <List>
            {files.map((file, index) => (
              <React.Fragment key={file.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getFileIcon(file)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {file.name}
                        </Typography>
                        {file.compressed && (
                          <Chip 
                            icon={<Compress />} 
                            label="Comprimido" 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                        )}
                        {file.category && (
                          <Chip 
                            label={categories.find(c => c.value === file.category)?.label || file.category}
                            size="small"
                            color={categories.find(c => c.value === file.category)?.color || 'default'}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                          {file.compressed && file.originalFile && (
                            <span> (reduzido de {formatFileSize(file.originalFile.size)})</span>
                          )}
                        </Typography>
                        {file.description && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {file.description}
                          </Typography>
                        )}
                        {file.status === 'uploading' && (
                          <LinearProgress 
                            variant="determinate" 
                            value={file.progress} 
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      {file.status === 'completed' && (
                        <IconButton color="success" disabled>
                          <CheckCircle />
                        </IconButton>
                      )}
                      {file.status === 'error' && (
                        <IconButton color="error" disabled>
                          <ErrorIcon />
                        </IconButton>
                      )}
                      {file.preview && (
                        <IconButton 
                          onClick={() => previewFileHandler(file)}
                          size="small"
                        >
                          <Preview />
                        </IconButton>
                      )}
                      <IconButton 
                        onClick={() => handleOpenCategoryDialog(file)}
                        size="small"
                        color="primary"
                      >
                        <Category />
                      </IconButton>
                      <IconButton 
                        onClick={() => removeFile(file.id)}
                        size="small"
                        color="error"
                        disabled={file.status === 'uploading'}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < files.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              onClick={uploadFiles}
              disabled={uploading || files.length === 0 || files.every(f => f.status === 'completed')}
              startIcon={<CloudUpload />}
              fullWidth
            >
              {uploading ? 'Enviando...' : 'Enviar Arquivos'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* FAB para adicionar mais arquivos */}
      {files.length > 0 && (
        <Zoom in={!uploading}>
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Add />
          </Fab>
        </Zoom>
      )}

      {/* Dialog de Categorização */}
      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Categorizar Documento</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Arquivo: {selectedFile.name}
              </Typography>
            </Box>
          )}
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Categoria"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Descrição (opcional)"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione uma descrição para este documento..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={saveCategory} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Preview: {previewFile?.name}</DialogTitle>
        <DialogContent>
          {previewFile?.preview && (
            <Box textAlign="center">
              <img
                src={previewFile.preview}
                alt={previewFile.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedUpload;
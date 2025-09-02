import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

const ImageUpload = ({ 
  value, 
  onChange, 
  label = "Foto do Paciente",
  size = 120,
  disabled = false,
  error = null,
  helperText = null
}) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.');
      return;
    }

    // Validar tamanho (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    setLoading(true);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setPreview(imageUrl);
      
      // Simular compressão/redimensionamento se necessário
      compressImage(file, imageUrl).then((compressedFile) => {
        onChange(compressedFile, imageUrl);
        setLoading(false);
      });
    };
    
    reader.readAsDataURL(file);
  };

  const compressImage = (file, imageUrl) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo proporção
        const maxWidth = 400;
        const maxHeight = 400;
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
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob
        canvas.toBlob((blob) => {
          // Criar novo arquivo com o blob comprimido
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = imageUrl;
    });
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={preview}
          sx={{
            width: size,
            height: size,
            cursor: disabled ? 'default' : 'pointer',
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'primary.main',
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: disabled ? 'background.paper' : 'action.hover',
            }
          }}
          onClick={handleClick}
        >
          {loading ? (
            <CircularProgress size={40} />
          ) : !preview ? (
            <CameraIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          ) : null}
        </Avatar>
        
        {preview && !loading && !disabled && (
          <IconButton
            onClick={handleRemoveImage}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'error.main',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'error.dark',
              }
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {!preview && !loading && (
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={handleClick}
          disabled={disabled}
          size="small"
        >
          Selecionar Foto
        </Button>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
          {error}
        </Alert>
      )}

      {helperText && !error && (
        <Typography variant="caption" color="text.secondary" textAlign="center">
          {helperText}
        </Typography>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </Box>
  );
};

export default ImageUpload;
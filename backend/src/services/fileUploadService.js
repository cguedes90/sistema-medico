const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');

// Configuração do AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configuração do armazenamento local (para desenvolvimento)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',') 
    : ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${fileExtension}`), false);
  }
};

// Configuração do Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  }
});

// Função para fazer upload para S3
const uploadToS3 = async (file, folder = 'documents') => {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };

    const result = await s3.upload(params).promise();
    
    logger.info(`Arquivo enviado para S3: ${result.Location}`);
    
    return {
      key: result.Key,
      location: result.Location,
      bucket: result.Bucket
    };
  } catch (error) {
    logger.error('Erro ao fazer upload para S3:', error);
    throw new Error('Erro ao fazer upload do arquivo para S3');
  }
};

// Função para fazer download do S3
const downloadFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    const result = await s3.getObject(params).promise();
    
    return {
      buffer: result.Body,
      contentType: result.ContentType,
      contentLength: result.ContentLength
    };
  } catch (error) {
    logger.error('Erro ao fazer download do S3:', error);
    throw new Error('Erro ao fazer download do arquivo do S3');
  }
};

// Função para deletar arquivo do S3
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    
    logger.info(`Arquivo deletado do S3: ${key}`);
  } catch (error) {
    logger.error('Erro ao deletar arquivo do S3:', error);
    throw new Error('Erro ao deletar arquivo do S3');
  }
};

// Função para gerar URL de acesso temporário
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    
    return url;
  } catch (error) {
    logger.error('Erro ao gerar URL assinada:', error);
    throw new Error('Erro ao gerar URL de acesso');
  }
};

// Função para extrair texto de documentos (simulação)
const extractTextFromDocument = async (file) => {
  try {
    // Em uma implementação real, você usaria serviços como:
    // - AWS Textract
    // - Google Cloud Vision
    // - Azure Cognitive Services
    // - ou bibliotecas como pdf-parse, tesseract.js
    
    // Simulação de extração de texto
    const mockExtractedText = `Documento médico extraído:
    
Paciente: [Nome do paciente]
Data: ${new Date().toLocaleDateString()}
Tipo: ${file.originalname}
Categoria: [A ser determinado pelo sistema]

Este é um texto de exemplo extraído do documento. 
Em uma implementação real, o texto real seria extraído aqui usando OCR ou outros métodos de processamento de documentos.
`;

    return mockExtractedText;
  } catch (error) {
    logger.error('Erro ao extrair texto do documento:', error);
    throw new Error('Erro ao extrair texto do documento');
  }
};

// Função para validar arquivo
const validateFile = (file) => {
  const errors = [];
  
  // Validar tamanho
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
  }
  
  // Validar tipo
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',') 
    : ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`Tipo de arquivo não permitido: ${fileExtension}`);
  }
  
  return errors;
};

// Middleware de upload de arquivo único
const uploadSingle = upload.single('file');

// Middleware de upload de múltiplos arquivos
const uploadMultiple = upload.array('files', 10);

// Wrapper para middleware assíncrono
const asyncUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo permitido: 10MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Erro no upload do arquivo: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    next();
  });
};

module.exports = {
  uploadToS3,
  downloadFromS3,
  deleteFromS3,
  getSignedUrl,
  extractTextFromDocument,
  validateFile,
  uploadSingle,
  uploadMultiple,
  asyncUpload
};
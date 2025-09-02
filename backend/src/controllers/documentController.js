const { Document, Patient, User } = require('../models');
const { validationResult } = require('express-validator');
const { 
  uploadToS3, 
  downloadFromS3, 
  deleteFromS3, 
  getSignedUrl, 
  extractTextFromDocument,
  validateFile,
  asyncUpload 
} = require('../services/fileUploadService');
const { logger } = require('../utils/logger');

// Obter todos os documentos
const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, patient_id, category, search, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { deleted_at: null };
    
    if (patient_id) {
      whereClause.patient_id = patient_id;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (search) {
      whereClause.$or = [
        { title: { $ilike: `%${search}%` } },
        { description: { $ilike: `%${search}%` } },
        { original_name: { $ilike: `%${search}%` } }
      ];
    }

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ],
      attributes: { exclude: ['deleted_at'] },
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao obter documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter documentos'
    });
  }
};

// Obter documento por ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ],
      attributes: { exclude: ['deleted_at'] }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      });
    }

    // Gerar URL de acesso temporário
    const signedUrl = await getSignedUrl(document.file_path, 3600); // 1 hora

    res.json({
      success: true,
      data: { 
        document,
        signed_url: signedUrl
      }
    });

  } catch (error) {
    logger.error('Erro ao obter documento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter documento'
    });
  }
};

// Upload de documento
const uploadDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    const { patient_id, category, title, description, tags, is_sensitive } = req.body;

    // Validar paciente
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }

    // Validar arquivo
    const fileErrors = validateFile(req.file);
    if (fileErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo inválido',
        details: fileErrors
      });
    }

    try {
      // Fazer upload para S3
      const s3Result = await uploadToS3(req.file, 'documents');

      // Extrair texto do documento
      const extractedText = await extractTextFromDocument(req.file);

      // Criar registro no banco de dados
      const document = await Document.create({
        patient_id,
        uploaded_by: req.user.id,
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: s3Result.key,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        category,
        title,
        description,
        tags: tags ? JSON.parse(tags) : [],
        extracted_text: extractedText,
        extraction_status: 'completed',
        is_sensitive: is_sensitive === 'true'
      });

      logger.info(`Documento enviado: ${document.title} para paciente ${patient.name}`);

      res.status(201).json({
        success: true,
        message: 'Documento enviado com sucesso',
        data: { document }
      });

    } catch (uploadError) {
      logger.error('Erro no upload do documento:', uploadError);
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar documento'
      });
    }

  } catch (error) {
    logger.error('Erro no upload de documento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar documento'
    });
  }
};

// Download de documento
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      attributes: ['file_path', 'original_name', 'mime_type']
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      });
    }

    try {
      // Fazer download do S3
      const fileData = await downloadFromS3(document.file_path);

      // Definir headers de resposta
      res.setHeader('Content-Type', document.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${document.original_name}"`);
      res.setHeader('Content-Length', fileData.contentLength);

      // Enviar arquivo
      res.send(fileData.buffer);

    } catch (downloadError) {
      logger.error('Erro no download do documento:', downloadError);
      res.status(500).json({
        success: false,
        error: 'Erro ao baixar documento'
      });
    }

  } catch (error) {
    logger.error('Erro no download de documento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao baixar documento'
    });
  }
};

// Excluir documento
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      });
    }

    // Verificar permissão
    if (document.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Você não tem permissão para excluir este documento.'
      });
    }

    try {
      // Deletar do S3
      await deleteFromS3(document.file_path);

      // Deletar do banco de dados (soft delete)
      await document.update({ deleted_at: new Date() });

      logger.info(`Documento excluído: ${document.title}`);

      res.json({
        success: true,
        message: 'Documento excluído com sucesso'
      });

    } catch (deleteError) {
      logger.error('Erro ao deletar documento do S3:', deleteError);
      // Mesmo se falhar no S3, remove do banco
      await document.update({ deleted_at: new Date() });
      
      res.json({
        success: true,
        message: 'Documento excluído do banco de dados. Erro ao deletar do armazenamento.'
      });
    }

  } catch (error) {
    logger.error('Erro ao excluir documento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir documento'
    });
  }
};

// Atualizar metadados do documento
const updateDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      });
    }

    // Verificar permissão
    if (document.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Você não tem permissão para atualizar este documento.'
      });
    }

    await document.update(updateData);

    logger.info(`Documento atualizado: ${document.title}`);

    res.json({
      success: true,
      message: 'Documento atualizado com sucesso',
      data: { document }
    });

  } catch (error) {
    logger.error('Erro ao atualizar documento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar documento'
    });
  }
};

// Obter documentos do paciente
const getPatientDocuments = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { category, sort = 'created_at', order = 'DESC' } = req.query;

    const whereClause = { 
      patient_id,
      deleted_at: null 
    };

    if (category) {
      whereClause.category = category;
    }

    const documents = await Document.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ],
      attributes: { exclude: ['deleted_at'] },
      order: [[sort, order]]
    });

    res.json({
      success: true,
      data: { documents }
    });

  } catch (error) {
    logger.error('Erro ao obter documentos do paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter documentos do paciente'
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  updateDocument,
  getPatientDocuments
};
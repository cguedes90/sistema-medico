const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  logger.error(err);

  // Erro de chave estrangeira (Sequelize)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referência inválida. O recurso relacionado não existe.';
    error = { message, statusCode: 400 };
  }

  // Erro de validação (Sequelize)
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Erro de unicidade (Sequelize)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Registro já existe com este valor.';
    error = { message, statusCode: 409 };
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido.';
    error = { message, statusCode: 401 };
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado.';
    error = { message, statusCode: 401 };
  }

  // Erro de upload de arquivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Arquivo muito grande. Tamanho máximo permitido: 10MB.';
    error = { message, statusCode: 413 };
  }

  // Erro de tipo de arquivo
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Tipo de arquivo não permitido.';
    error = { message, statusCode: 415 };
  }

  // Erro de validação personalizado
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Erro de autorização
  if (err.name === 'UnauthorizedError') {
    const message = 'Acesso não autorizado.';
    error = { message, statusCode: 401 };
  }

  // Erro de permissão
  if (err.name === 'ForbiddenError') {
    const message = 'Acesso negado. Permissão insuficiente.';
    error = { message, statusCode: 403 };
  }

  // Erro de não encontrado
  if (err.name === 'NotFoundError') {
    const message = 'Recurso não encontrado.';
    error = { message, statusCode: 404 };
  }

  // Resposta de erro
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro do servidor interno',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Não encontrado - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
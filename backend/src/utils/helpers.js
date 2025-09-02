const crypto = require('crypto');

/**
 * Gera um código único alfanumérico
 * @param {number} length - Comprimento do código
 * @returns {string} - Código único gerado
 */
const generateUniqueCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Gera um hash seguro para senhas
 * @param {string} password - Senha a ser hasheada
 * @returns {string} - Hash da senha
 */
const generatePasswordHash = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Gera um token aleatório
 * @param {number} bytes - Número de bytes para o token
 * @returns {string} - Token hexadecimal
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Formata CPF
 * @param {string} cpf - CPF não formatado
 * @returns {string} - CPF formatado
 */
const formatCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Remove formatação do CPF
 * @param {string} cpf - CPF formatado
 * @returns {string} - CPF apenas com números
 */
const cleanCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.replace(/[^\d]/g, '');
};

/**
 * Valida formato de email
 * @param {string} email - Email para validar
 * @returns {boolean} - True se válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calcula idade a partir da data de nascimento
 * @param {Date|string} birthDate - Data de nascimento
 * @returns {number} - Idade em anos
 */
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Sanitiza string para uso em URLs
 * @param {string} str - String para sanitizar
 * @returns {string} - String sanitizada
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .trim('-');
};

module.exports = {
  generateUniqueCode,
  generatePasswordHash,
  generateRandomToken,
  formatCPF,
  cleanCPF,
  isValidEmail,
  calculateAge,
  slugify
};
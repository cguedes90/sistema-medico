const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validações
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter letras maiúsculas, minúsculas e números'),
  
  body('role')
    .isIn(['admin', 'doctor', 'nurse', 'assistant'])
    .withMessage('Função inválida'),
  
  body('crm')
    .optional()
    .isLength({ min: 6, max: 20 })
    .withMessage('CRM deve ter entre 6 e 20 caracteres'),
  
  body('specialty')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Especialidade deve ter entre 2 e 100 caracteres'),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  
  body('birth_date')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento inválida'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gênero inválido'),
  
  body('specialty')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Especialidade deve ter entre 2 e 100 caracteres')
];

const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter letras maiúsculas, minúsculas e números')
];

// Rotas públicas
router.post('/register', registerValidation, asyncHandler(authController.register));
router.post('/login', loginValidation, asyncHandler(authController.login));

// Rotas privadas
router.get('/profile', auth, asyncHandler(authController.getProfile));
router.put('/profile', auth, updateProfileValidation, asyncHandler(authController.updateProfile));
router.put('/change-password', auth, changePasswordValidation, asyncHandler(authController.changePassword));
router.post('/logout', auth, asyncHandler(authController.logout));

// Rota de refresh token (opcional)
router.post('/refresh', auth, asyncHandler(async (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    success: true,
    message: 'Token atualizado com sucesso',
    data: {
      token
    }
  });
}));

module.exports = router;
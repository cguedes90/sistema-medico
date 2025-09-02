const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

// Registrar novo usuário
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { name, email, password, role, crm, specialty, phone } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ 
      where: { 
        email,
        deleted_at: null 
      } 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Usuário já existe com este e-mail'
      });
    }

    // Verificar se CRM já existe (para médicos)
    if (role === 'doctor' && crm) {
      const existingCrm = await User.findOne({ 
        where: { 
          crm,
          deleted_at: null 
        } 
      });
      
      if (existingCrm) {
        return res.status(409).json({
          success: false,
          error: 'CRM já cadastrado'
        });
      }
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      role,
      crm,
      specialty,
      phone
    });

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Atualizar último login
    await user.update({ last_login: new Date() });

    logger.info(`Novo usuário registrado: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          crm: user.crm,
          specialty: user.specialty,
          phone: user.phone,
          profile_image: user.profile_image
        },
        token
      }
    });

  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar usuário'
    });
  }
};

// Login de usuário
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ 
      where: { 
        email,
        deleted_at: null 
      } 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Atualizar último login
    await user.update({ last_login: new Date() });

    logger.info(`Usuário logado: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          crm: user.crm,
          specialty: user.specialty,
          phone: user.phone,
          profile_image: user.profile_image
        },
        token
      }
    });

  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao realizar login'
    });
  }
};

// Obter perfil do usuário
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    logger.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter perfil'
    });
  }
};

// Atualizar perfil do usuário
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { name, phone, birth_date, gender, address, specialty } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Atualizar dados
    await user.update({
      name,
      phone,
      birth_date,
      gender,
      address,
      specialty
    });

    logger.info(`Perfil atualizado: ${user.email}`);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          crm: user.crm,
          specialty: user.specialty,
          phone: user.phone,
          profile_image: user.profile_image
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar perfil'
    });
  }
};

// Alterar senha
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await user.comparePassword(current_password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Senha atual inválida'
      });
    }

    // Atualizar senha
    await user.update({ password: new_password });

    logger.info(`Senha alterada: ${user.email}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao alterar senha'
    });
  }
};

// Logout (invalidar token)
const logout = async (req, res) => {
  try {
    // Em uma implementação real, você poderia armazenar tokens inválidos
    // em um cache ou banco de dados para invalidá-los
    
    logger.info(`Usuário deslogado: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao realizar logout'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
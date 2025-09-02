const { sequelize, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    console.log('Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão bem sucedida!');
    
    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({
      where: {
        email: 'admin@sistema-medico.com',
        deleted_at: null
      }
    });
    
    if (existingAdmin) {
      console.log('❌ Usuário admin@sistema-medico.com já existe!');
      console.log('Você pode usar as seguintes credenciais:');
      console.log('Email: admin@sistema-medico.com');
      console.log('Senha: admin123');
      await sequelize.close();
      return;
    }
    
    console.log('Criando usuário administrador...');
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Criar usuário admin
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@sistema-medico.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      crm: null,
      specialty: null,
      phone: null,
      profile_image: null
    });
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('Credenciais de acesso:');
    console.log('Email: admin@sistema-medico.com');
    console.log('Senha: admin123');
    console.log('Função: admin');
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error.message);
    if (error.original) {
      console.error('Erro original:', error.original.message);
    }
    process.exit(1);
  }
}

createAdmin();
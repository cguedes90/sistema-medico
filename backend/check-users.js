const { sequelize, User } = require('./src/models');

async function checkUsers() {
  try {
    console.log('Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão bem sucedida!');
    
    console.log('\nVerificando usuários...');
    const count = await User.count();
    console.log(`Total de usuários: ${count}`);
    
    if (count > 0) {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at']
      });
      
      console.log('\nUsuários encontrados:');
      users.forEach(user => {
        console.log(`- ID: ${user.id}`);
        console.log(`  Nome: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Função: ${user.role}`);
        console.log(`  Ativo: ${user.is_active ? 'Sim' : 'Não'}`);
        console.log(`  Criado em: ${user.created_at}`);
        console.log('---');
      });
    } else {
      console.log('❌ Nenhum usuário encontrado no banco de dados!');
      console.log('Você precisa criar um usuário primeiro.');
    }
    
    await sequelize.close();
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error.message);
    if (error.original) {
      console.error('Erro original:', error.original.message);
    }
    process.exit(1);
  }
}

checkUsers();
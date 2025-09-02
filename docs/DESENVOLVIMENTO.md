# Guia de Desenvolvimento - Sistema Médico com IA

## Visão Geral

Este guia descreve como configurar, desenvolver e manter o Sistema Médico com IA. O projeto é composto por um backend Node.js/Express e um frontend React.js.

## Estrutura do Projeto

```
sistema-medico/
├── backend/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── config/         # Configurações do banco e JWT
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares de autenticação
│   │   ├── services/       # Serviços (IA, upload, etc.)
│   │   └── utils/          # Funções utilitárias
│   ├── uploads/            # Arquivos temporários
│   └── package.json
├── frontend/               # Frontend React.js
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Contexto global
│   │   └── utils/          # Funções utilitárias
│   ├── public/
│   └── package.json
├── database/               # Scripts de banco de dados
├── docs/                   # Documentação
├── scripts/                # Scripts de automação
├── nginx/                  # Configuração do Nginx
└── docker-compose.yml      # Orquestração Docker
```

## Pré-requisitos

- Node.js 16+
- npm 8+
- PostgreSQL 12+
- Docker (opcional, para desenvolvimento com containers)
- Docker Compose (opcional)

## Configuração do Ambiente

### 1. Clone o Repositório

```bash
git clone <repositorio>
cd sistema-medico
```

### 2. Instale as Dependências

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 3. Configure Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Configuração do Servidor
PORT=3001
NODE_ENV=development

# Configuração do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_medico
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT Secret
JWT_SECRET=sua_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket-medico

# OpenAI Configuration (GPT-4.1)
OPENAI_API_KEY=sua_openai_api_key_aqui
OPENAI_MODEL=gpt-4.1

# Anthropic Configuration (Claude Sonnet 4)
ANTHROPIC_API_KEY=sua_anthropic_api_key_aqui
ANTHROPIC_MODEL=claude-sonnet-4

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_email_aqui

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Inicie os Serviços

#### Opção 1: Script de Configuração Automática

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### Opção 2: Manual

```bash
# Iniciar banco de dados (PostgreSQL)
docker-compose up -d postgres

# Rodar migrações do banco de dados
cd backend
npm run migrate

# Iniciar backend
npm run dev

# Iniciar frontend (em outra janela de terminal)
cd frontend
npm start
```

## Desenvolvimento

### Backend

#### Estrutura de Pastas

```
backend/src/
├── config/         # Configurações do banco, JWT, etc.
├── controllers/    # Controladores da API
├── models/         # Modelos de dados Sequelize
├── routes/         # Rotas da API
├── middleware/     # Middlewares (autenticação, validação, etc.)
├── services/       # Serviços (upload, IA, email, etc.)
└── utils/          # Funções utilitárias
```

#### Comandos Úteis

```bash
# Iniciar servidor em modo desenvolvimento
npm run dev

# Iniciar servidor em modo produção
npm start

# Rodar testes
npm test

# Rodar testes em modo watch
npm run test:watch

# Rodar linter
npm run lint

# Corrigir problemas de lint
npm run lint:fix

# Rodar migrações do banco de dados
npm run migrate

# Popular banco de dados com dados de teste
npm run seed
```

#### Adicionando Novas Funcionalidades

1. **Modelo de Dados**: Adicione modelos em `backend/src/models/`
2. **Controlador**: Crie um controlador em `backend/src/controllers/`
3. **Rotas**: Adicione rotas em `backend/src/routes/`
4. **Middleware**: Adicione middlewares em `backend/src/middleware/`
5. **Serviço**: Crie serviços em `backend/src/services/`

### Frontend

#### Estrutura de Pastas

```
frontend/src/
├── components/     # Componentes React reutilizáveis
├── pages/          # Páginas da aplicação
├── services/       # Serviços de API
├── hooks/          # Custom hooks
├── context/        # Contexto global (Redux, Auth)
├── utils/          # Funções utilitárias
└── store/          # Configuração do Redux
```

#### Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm start

# Construir para produção
npm run build

# Rodar testes
npm test

# Rodar testes em modo watch
npm run test:watch

# Rodar linter
npm run lint

# Corrigir problemas de lint
npm run lint:fix

# Formatar código
npm run format

# Verificar tipos
npm run type-check
```

#### Adicionando Novas Páginas

1. **Componente**: Crie um componente em `frontend/src/components/`
2. **Página**: Adicione uma página em `frontend/src/pages/`
3. **Rota**: Adicione a rota em `frontend/src/App.js`
4. **Service**: Adicione um serviço em `frontend/src/services/`
5. **Redux**: Atualize o store se necessário

## Banco de Dados

### Estrutura

O banco de dados PostgreSQL é gerenciado pelo Sequelize ORM. As tabelas principais são:

- `users`: Usuários do sistema
- `patients`: Pacientes
- `documents`: Documentos médicos
- `notes`: Anotações médicas
- `appointments`: Agendamentos
- `ai_analyses`: Análises de IA
- `audit_logs`: Logs de auditoria

### Migrações

```bash
# Criar nova migração
npx sequelize-cli migration:generate --name nome_da_migracao

# Rodar migrações
npx sequelize-cli db:migrate

# Reverter migração
npx sequelize-cli db:migrate:undo
```

### Seeds (Dados de Teste)

```bash
# Criar novo seed
npx sequelize-cli seed:generate --name nome_do_seed

# Rodar seeds
npx sequelize-cli db:seed:all

# Reverter seeds
npx sequelize-cli db:seed:undo
```

## Docker

### Desenvolvimento com Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status dos serviços
docker-compose ps

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild containers
docker-compose build --no-cache
```

### Serviços Disponíveis

- `postgres`: Banco de dados PostgreSQL
- `redis`: Cache e sessões
- `backend`: API Node.js
- `frontend`: Aplicação React
- `nginx`: Proxy reverso
- `minio`: Armazenamento S3
- `mailhog`: Teste de emails

## Integração com IA

### Configuração das APIs

1. **OpenAI GPT-4.1**:
   - Crie uma conta em [OpenAI](https://platform.openai.com/)
   - Gere uma API key
   - Adicione ao arquivo `.env`

2. **Anthropic Claude Sonnet 4**:
   - Crie uma conta em [Anthropic](https://console.anthropic.com/)
   - Gere uma API key
   - Adicione ao arquivo `.env`

### Exemplos de Uso

```javascript
// Análise de documento médico
const analysisPrompt = `
Analise o seguinte relatório médico e destaque pontos críticos e recomendações:

[Documento médico aqui]

Por favor, inclua:
- Pontos críticos que exigem atenção imediata
- Recomendações para tratamento
- Alertas sobre possíveis interações medicamentosas
- Sugestões para exames complementares
`;

// Integração com GPT-4.1
const gptResponse = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages: [
    {
      role: "system",
      content: "Você é um assistente médico especialista em análise de documentos."
    },
    {
      role: "user",
      content: analysisPrompt
    }
  ],
  max_tokens: 2000,
  temperature: 0.3
});

// Integração com Claude
const claudeResponse = await anthropic.messages.create({
  model: "claude-sonnet-4",
  max_tokens: 2000,
  messages: [
    {
      role: "user",
      content: analysisPrompt
    }
  ]
});
```

## Testes

### Backend

```bash
# Rodar todos os testes
npm test

# Rodar testes específicos
npm test -- --testNamePattern="test específico"

# Rodar testes com coverage
npm run test:coverage

# Rodar testes em modo watch
npm run test:watch
```

### Frontend

```bash
# Rodar testes
npm test

# Rodar testes em modo watch
npm run test:watch

# Rodar testes com coverage
npm run test:coverage
```

## Deploy

### Preparação

```bash
# Construir frontend
cd frontend
npm run build
cd ..

# Construir backend
cd backend
npm run build
cd ..
```

### Docker

```bash
# Construir imagem
docker build -t sistema-medico-backend ./backend

# Push para registry
docker push sistema-medico-backend

# Deploy em produção
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Produção

```env
NODE_ENV=production
PORT=3001
DB_HOST=seu-db-host
DB_PORT=5432
DB_NAME=sistema_medico_prod
DB_USER=seu-db-user
DB_PASSWORD=sua-db-senha
JWT_SECRET=sua-senha-jwt-secreta
FRONTEND_URL=https://seu-dominio.com
```

## Melhores Práticas

### Backend

1. **Segurança**:
   - Use JWT para autenticação
   - Valide todas as entradas
   - Use HTTPS em produção
   - Implemente rate limiting

2. **Performance**:
   - Use cache (Redis)
   - Otimize consultas ao banco
   - Use compressão
   - Implemente paginação

3. **Código**:
   - Siga as convenções do ESLint
   - Use TypeScript (opcional)
   - Documente o código
   - Escreva testes

### Frontend

1. **Performance**:
   - Use React.memo para componentes
   - Implemente code splitting
   - Use lazy loading
   - Otimize imagens

2. **UX**:
   - Use loading states
   - Implemente erro handling
   - Use design system
   - Teste em diferentes dispositivos

3. **Código**:
   - Siga as convenções do ESLint
   - Use TypeScript
   - Documente o código
   - Escreva testes

## Troubleshooting

### Problemas Comuns

1. **Banco de Dados Não Conecta**:
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no `.env`
   - Verifique a rede Docker

2. **Dependências Não Instalam**:
   - Limpe o cache: `npm cache clean --force`
   - Delete `node_modules` e reinstale
   - Use `npm ci` em vez de `npm install`

3. **Frontend Não Carrega**:
   - Verifique se o backend está rodando
   - Confirme as variáveis de ambiente
   - Limpe o cache do navegador

4. **Docker Não Inicia**:
   - Verifique se o Docker está rodando
   - Confirme as permissões
   - Verifique a memória disponível

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -am 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## Suporte

Para suporte e dúvidas:
- Crie uma issue no GitHub
- Email: suporte@sistema-medico.com.br
- Documentação: [docs/](../)

## Licença

Este projeto está sob licença MIT - veja o arquivo LICENSE para detalhes.
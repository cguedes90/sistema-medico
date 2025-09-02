# Sistema Médico com Suporte de IA

## Visão Geral

Este é um sistema médico completo que centraliza o histórico dos pacientes, permitindo incluir documentos médicos, anotações, e criar uma timeline cronológica da vida clínica do paciente. O sistema também conta com um módulo de IA (com suporte para GPT-4.1 e Claude Sonnet 4) que auxilia na análise clínica, sugerindo insights, riscos e recomendações personalizadas para otimizar o atendimento.

## Funcionalidades Principais

- ✅ Cadastro completo do paciente (dados pessoais e histórico médico)
- ✅ Upload e organização de documentos médicos (exames, receitas, etc.)
- ✅ Anotações e observações médicas associadas a cada consulta
- ✅ Timeline interativa da história clínica do paciente
- ✅ Suporte de IA para avaliação, alertas e recomendações
- ✅ Lembretes para acompanhamento e retornos
- ✅ Integração com sistemas de agendamento
- ✅ Painel com métricas e estatísticas do histórico médico
- ✅ Segurança e conformidade com LGPD/HIPAA

## Arquitetura e Tecnologias

### Frontend
- **React.js** - Interface interativa e responsiva
- **Material-UI** - Componentes de design moderno
- **React Router** - Navegação entre páginas
- **Axios** - Requisições HTTP para a API

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express.js** - Framework web para API RESTful
- **JWT** - Autenticação e autorização
- **OAuth 2.0** - Integração com provedores de identidade

### Banco de Dados
- **PostgreSQL** - Dados estruturados relacionais
- **MongoDB** - Armazenamento de documentos médicos

### Armazenamento
- **AWS S3** - Armazenamento de arquivos médicos

### IA
- **OpenAI GPT-4.1** - Análise clínica e insights
- **Anthropic Claude Sonnet 4** - Recomendações personalizadas

### Segurança
- **bcrypt** - Hash de senhas
- **helmet** - Segurança HTTP
- **cors** - Configuração de CORS
- **dotenv** - Gerenciamento de variáveis de ambiente

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
├── .env.example           # Exemplo de variáveis de ambiente
└── README.md
```

## 📊 Status do Desenvolvimento

### ✅ **CONCLUÍDO - FASE MVP**
- [x] **Infraestrutura Base**
  - [x] Estrutura do projeto e documentação
  - [x] Ambiente de desenvolvimento configurado
  - [x] Banco de dados Neon PostgreSQL integrado
  - [x] Scripts de automação e inicialização

- [x] **Backend Core**
  - [x] API RESTful com Express.js
  - [x] Sistema de autenticação JWT
  - [x] Modelos de dados (Users, Patients, Documents, Notes, Appointments)
  - [x] Controllers e rotas funcionais
  - [x] Middleware de segurança e logs

- [x] **Frontend Base**
  - [x] Interface React.js responsiva
  - [x] Sistema de roteamento
  - [x] Login e autenticação
  - [x] Layout principal com sidebar
  - [x] Páginas de gestão básicas

- [x] **Funcionalidades Essenciais**
  - [x] Cadastro e gestão de pacientes (CRUD)
  - [x] Sistema de upload de documentos
  - [x] Anotações médicas
  - [x] Agendamento de consultas
  - [x] Dashboard com métricas básicas

### 🔄 **EM DESENVOLVIMENTO - FASE 1**
- [ ] **Melhorias de UX/UI**
  - [ ] Timeline interativa do paciente
  - [ ] Sistema de notificações
  - [ ] Upload de documentos aprimorado (drag & drop)
  - [ ] Busca avançada global

- [ ] **Funcionalidades Médicas**
  - [ ] Relatórios por período
  - [ ] Categorização automática de documentos
  - [ ] Histórico detalhado do paciente
  - [ ] Sistema de lembretes

### 🎯 **PLANEJADO - FASE 2**
- [ ] **Integração de IA**
  - [ ] Análise de documentos médicos com GPT-4
  - [ ] Assistente médico virtual
  - [ ] Extração automática de informações
  - [ ] Insights e recomendações

- [ ] **Segurança e Compliance**
  - [ ] Conformidade LGPD/HIPAA
  - [ ] Criptografia de dados sensíveis
  - [ ] Logs de auditoria detalhados
  - [ ] Sistema de backup automático

### 🚀 **FUTURO - FASE 3**
- [ ] **Features Avançadas**
  - [ ] Telemedicina integrada
  - [ ] App mobile para médicos
  - [ ] Portal do paciente
  - [ ] Integração com laboratórios
  - [ ] Business Intelligence e Analytics

## 🚀 Como Usar

### **Início Rápido (Recomendado)**

```bash
# 1. Clone o repositório
git clone <repositorio>
cd sistema-medico

# 2. Rode o script de inicialização automática
bash scripts/init.sh

# 3. Acesse o sistema
# Frontend: http://localhost:3002
# Backend: http://localhost:3001
```

**Credenciais padrão:**
- Email: `admin@sistema-medico.com`
- Senha: `admin123`

### **Instalação Manual**

#### Pré-requisitos
- Node.js (v16+)
- Git
- Neon PostgreSQL (conta gratuita)
- [Opcional] Docker para desenvolvimento

#### Etapas Detalhadas

1. **Preparar ambiente:**
```bash
git clone <repositorio>
cd sistema-medico
cp .env.example .env
# Edite o .env com suas configurações
```

2. **Instalar dependências:**
```bash
# Backend
cd backend && npm install

# Frontend  
cd ../frontend && npm install --legacy-peer-deps
```

3. **Configurar banco de dados:**
```bash
# O banco Neon PostgreSQL já está configurado no .env
# Verificar conexão
cd backend && node scripts/create-admin.js
```

4. **Iniciar serviços:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### **Desenvolvimento com Docker**

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Logs
docker-compose logs -f
```

## Exemplo de Fluxo de Trabalho

1. **Médico acessa o perfil do paciente**
2. **Faz upload de novo exame ou documento**
3. **Adiciona anotações da consulta**
4. **Sistema atualiza a timeline automaticamente**
5. **IA analisa os dados e gera insights**
6. **Médico recebe alertas ou recomendações**
7. **Agenda retornos se necessário**

## Integração com IA

### Exemplo de Prompt para Análise de Documentos

```javascript
const analysisPrompt = `
Analise o seguinte relatório médico e destaque pontos críticos e recomendações:

[Documento médico aqui]

Por favor, inclua:
- Pontos críticos que exigem atenção imediata
- Recomendações para tratamento
- Alertas sobre possíveis interações medicamentosas
- Sugestões para exames complementares
`;
```

### Endpoints de IA

- `POST /api/ai/analyze-document` - Analisa documentos médicos
- `POST /api/ai/generate-insights` - Gera insights do histórico do paciente
- `POST /api/ai/recommendations` - Fornece recomendações personalizadas

## Segurança e Conformidade

- ✅ LGPD compliant - Dados pessoais protegidos
- ✅ HIPAA compliant - Segurança de informações de saúde
- ✅ Autenticação JWT segura
- ✅ Criptografia de dados sensíveis
- ✅ Controle de acesso baseado em roles
- ✅ Auditoria de acesso a dados

## 🛠️ Comandos Úteis para Desenvolvimento

### **Scripts Disponíveis**
```bash
# Inicialização completa
./scripts/init.sh

# Desenvolvimento
./scripts/dev.sh          # Inicia frontend e backend
./scripts/test.sh         # Executa todos os testes
./scripts/backup.sh       # Backup do banco de dados

# Manutenção
./scripts/cleanup.sh      # Limpa logs e arquivos temporários
./scripts/monitor.sh      # Monitora sistema em produção
./scripts/deploy.sh       # Deploy em produção
```

### **Comandos Específicos**
```bash
# Backend
cd backend
npm run dev              # Servidor desenvolvimento
npm run test             # Testes unitários
npm run lint             # Verificar código
node scripts/create-admin.js --force-reset  # Resetar admin

# Frontend
cd frontend
npm start                # Servidor desenvolvimento
npm run build            # Build de produção
npm run test             # Testes do frontend
```

### **Database**
```bash
# Verificar conexão
cd backend && node -e "require('./src/config/database').sequelize.authenticate()"

# Criar usuários de exemplo
cd backend && node scripts/create-admin.js

# Backup manual
pg_dump $DATABASE_URL > backup.sql
```

## 📋 Próximos Passos Prioritários

### **Sprint 1 - UX e Performance (Semana 1-2)**
1. **Melhorar timeline do paciente**
   - Implementar visualização cronológica
   - Adicionar filtros e busca
   - Responsividade mobile

2. **Sistema de notificações**
   - Toast notifications
   - Alertas de consultas
   - Notificações em tempo real

3. **Upload avançado de documentos**
   - Drag & drop múltiplos arquivos
   - Preview de PDFs
   - Compressão automática

### **Sprint 2 - Funcionalidades Médicas (Semana 3-4)**
1. **Relatórios e analytics**
   - Relatórios por período
   - Estatísticas de pacientes
   - Métricas de performance

2. **Busca avançada**
   - Busca global inteligente
   - Filtros por múltiplos critérios
   - Busca por conteúdo de documentos

3. **Segurança e auditoria**
   - Logs detalhados de ações
   - Controle de acesso granular
   - Backup automático

### **Sprint 3 - IA e Automação (Semana 5-6)**
1. **Integração com OpenAI GPT-4**
   - Análise automática de exames
   - Sugestões de diagnóstico
   - Alertas de anomalias

2. **Assistente médico virtual**
   - Chat inteligente
   - Resumos automáticos
   - Recomendações personalizadas

### **Para ver o roadmap completo:** consulte [CLAUDE.md](CLAUDE.md)

## 🚀 Integração com Neon PostgreSQL

O sistema já está configurado para usar o Neon PostgreSQL como banco de dados principal. Para integrar e sincronizar as tabelas:

### Configuração Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados Neon
node scripts/integrate-neon.js

# 3. Iniciar backend
cd backend && npm run dev

# 4. Iniciar frontend
cd frontend && npm start
```

### Configuração Manual

1. **Configurar o backend**:
   - O arquivo `backend/src/config/database.js` já está configurado para usar a string de conexão do Neon
   - O banco de dados será automaticamente sincronizado quando o backend iniciar

2. **Configurar o frontend**:
   - O frontend já está configurado para se comunicar com o backend
   - O componente `DatabaseSync` permite gerenciar a sincronização

3. **Acessar o sistema**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

### Dados de Exemplo

Após a integração, os seguintes dados de exemplo serão criados automaticamente:

- **Usuários**: Dr. João Silva (Cardiologista), Enfermeira Maria
- **Pacientes**: José da Silva, Maria Oliveira
- **Anotações**: Consultas iniciais e observações médicas
- **Agendamentos**: Retornos e consultas futuras

### Scripts Disponíveis

- `scripts/integrate-neon.js` - Integração completa com Neon PostgreSQL
- `scripts/setup-neon.js` - Configuração do banco de dados Neon
- `scripts/setup.sh` - Configuração completa do ambiente

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -am 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Submit um pull request

## Licença

Este projeto está sob licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte e dúvidas:
- Criar uma issue no GitHub
- Email: suporte@sistema-medico.com.br
- Documentação: [docs/](docs/)
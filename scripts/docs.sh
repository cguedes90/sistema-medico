#!/bin/bash

# Script de Geração de Documentação para o Sistema Médico
# Este script gera documentação técnica e de usuário

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configurações
DOCS_DIR="docs"
API_DOCS_DIR="$DOCS_DIR/api"
USER_DOCS_DIR="$DOCS_DIR/user"
TECH_DOCS_DIR="$DOCS_DIR/technical"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Criar diretórios de documentação
setup_docs_dir() {
    log_info "Configurando diretórios de documentação..."
    
    mkdir -p "$API_DOCS_DIR"
    mkdir -p "$USER_DOCS_DIR"
    mkdir -p "$TECH_DOCS_DIR"
    mkdir -p "$DOCS_DIR/images"
    
    log_success "Diretórios de documentação criados."
}

# Gerar documentação da API
generate_api_docs() {
    log_info "Gerando documentação da API..."
    
    # Verificar se o backend está rodando
    if ! curl -f http://localhost:3001/api/health &> /dev/null; then
        log_warning "Backend não está rodando. Tentando gerar documentação offline."
    fi
    
    # Gerar documentação OpenAPI/Swagger
    if command -v swagger-cli &> /dev/null; then
        log_info "Gerando documentação OpenAPI..."
        # Aqui você pode adicionar comandos para gerar documentação OpenAPI
        # swagger-cli bundle backend/src/routes/*.js -o "$API_DOCS_DIR/api.yaml" --type yaml
    fi
    
    # Gerar documentação das rotas
    cat > "$API_DOCS_DIR/README.md" << EOF
# Documentação da API - Sistema Médico

## Visão Geral

A API do Sistema Médico fornece endpoints para gerenciar pacientes, documentos, anotações e integração com IA.

## Autenticação

Todos os endpoints (exceto os de autenticação) requerem um token JWT no header Authorization:

\`\`\`
Authorization: Bearer <seu_token_jwt>
\`\`\`

## Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/refresh` - Refresh token

### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Criar paciente
- `GET /api/patients/:id` - Obter paciente por ID
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Deletar paciente

### Documentos
- `GET /api/documents` - Listar documentos
- `POST /api/documents` - Upload de documento
- `GET /api/documents/:id` - Obter documento
- `DELETE /api/documents/:id` - Deletar documento

### Anotações
- `GET /api/notes` - Listar anotações
- `POST /api/notes` - Criar anotação
- `PUT /api/notes/:id` - Atualizar anotação
- `DELETE /api/notes/:id` - Deletar anotação

### IA
- `POST /api/ai/analyze` - Analisar documento com IA
- `POST /api/ai/insights` - Gerar insights do paciente
- `POST /api/ai/recommendations` - Obter recomendações

## Formatos de Resposta

### Sucesso
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Operação realizada com sucesso"
}
\`\`\`

### Erro
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro"
  }
}
\`\`\`

## Códigos de Status

- `200` - Sucesso
- `201` - Criado
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Exemplos de Uso

### Login
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "medico@example.com", "password": "senha123"}'
\`\`\`

### Criar Paciente
\`\`\`bash
curl -X POST http://localhost:3001/api/patients \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <seu_token>" \\
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "12345678900",
    "birth_date": "1990-01-01",
    "gender": "male"
  }'
\`\`\`

EOF

    log_success "Documentação da API gerada."
}

# Gerar documentação do usuário
generate_user_docs() {
    log_info "Gerando documentação do usuário..."
    
    cat > "$USER_DOCS_DIR/README.md" << EOF
# Guia do Usuário - Sistema Médico

## Visão Geral

O Sistema Médico é uma plataforma completa para gestão de pacientes com suporte de IA. Este guia ajudará você a utilizar todas as funcionalidades do sistema.

## Primeiros Passos

### 1. Acessando o Sistema

1. Abra seu navegador e acesse: http://localhost:3000
2. Faça login com suas credenciais
3. Você será redirecionado para o painel principal

### 2. Configurando seu Perfil

1. Clique no seu nome no canto superior direito
2. Selecione "Meu Perfil"
3. Atualize suas informações pessoais
4. Salve as alterações

## Funcionalidades Principais

### Gestão de Pacientes

#### Criar Novo Paciente
1. No menu lateral, clique em "Pacientes"
2. Clique em "Novo Paciente"
3. Preencha todos os campos obrigatórios
4. Clique em "Salvar"

#### Visualizar Pacientes
1. No menu lateral, clique em "Pacientes"
2. Você verá uma lista com todos os pacientes
3. Use a barra de pesquisa para encontrar pacientes específicos
4. Clique em um paciente para ver detalhes

#### Editar Paciente
1. Clique no paciente desejado
2. Clique no botão "Editar"
3. Modifique as informações necessárias
4. Clique em "Salvar Alterações"

### Upload de Documentos

#### Enviar Documento
1. Acesse o perfil do paciente
2. Clique na aba "Documentos"
3. Clique em "Upload de Documento"
4. Selecione o arquivo desejado
5. Preencha as informações do documento
6. Clique em "Enviar"

#### Categorizar Documentos
Os documentos podem ser categorizados como:
- **Exame** - Resultados de exames médicos
- **Receita** - Receitas médicas
- **Laudo** - Laudos médicos
- **Atestado** - Atestados diversos
- **Prontuário** - Documentos do prontuário
- **Imagem** - Imagens médicas
- **Outro** - Outros tipos de documentos

### Anotações Médicas

#### Criar Anotação
1. Acesse o perfil do paciente
2. Clique na aba "Anotações"
3. Clique em "Nova Anotação"
4. Escreva o conteúdo da anotação
5. Selecione a data e o tipo
6. Clique em "Salvar"

#### Visualizar Timeline
1. No perfil do paciente, clique na aba "Timeline"
2. Você verá uma cronologia de todos os eventos
3. Os eventos incluem: criação de anotações, uploads de documentos, etc.

### Recursos de IA

#### Analisar Documentos
1. Faça upload de um documento médico
2. O sistema analisará automaticamente o conteúdo
3. Você verá insights e pontos importantes destacados

#### Gerar Insights
1. Acesse o perfil do paciente
2. Clique na aba "Insights de IA"
3. O sistema gerará insights baseados no histórico do paciente
4. Você pode baixar um relatório completo

### Agendamento e Lembretes

#### Agendar Consulta
1. No menu lateral, clique em "Agendamento"
2. Clique em "Nova Consulta"
3. Selecione o paciente e o médico
4. Escolha a data e hora
5. Preencha os detalhes da consulta
6. Clique em "Agendar"

#### Configurar Lembretes
1. No menu lateral, clique em "Lembretes"
2. Clique em "Novo Lembrete"
3. Selecione o tipo de lembrete
4. Configure a data e hora
5. Adicione uma descrição
6. Clique em "Criar Lembrete"

## Dicas de Uso

### Busca Avançada
- Use filtros para refinar sua busca
- Salve buscas frequentes como favoritas
- Exporte resultados para Excel ou PDF

### Atalhos de Teclado
- `Ctrl + N` - Novo paciente
- `Ctrl + D` - Novo documento
- `Ctrl + A` - Nova anotação
- `Ctrl + F` - Busca rápida
- `F5` - Atualizar página

### Relatórios
- Gere relatórios personalizados
- Exporte dados em múltiplos formatos
- Agende envios automáticos de relatórios

## Suporte

### Problemas Comuns

**Não consigo fazer login**
- Verifique se seu email e senha estão corretos
- Redefina sua senha se necessário
- Entre em contato com o administrador

**Documentos não estão sendo analisados pela IA**
- Verifique se o formato do arquivo é suportado
- Confirme que o conteúdo está em português
- Tente enviar novamente

### Contato

- Email: suporte@sistema-medico.com.br
- Telefone: (11) 9999-8888
- Horário de atendimento: Segunda a Sexta, 9h às 18h

## Atualizações

O sistema é atualizado regularmente com novas funcionalidades. Verifique as notas de versão para saber sobre as novidades.

EOF

    log_success "Documentação do usuário gerada."
}

# Gerar documentação técnica
generate_tech_docs() {
    log_info "Gerando documentação técnica..."
    
    cat > "$TECH_DOCS_DIR/README.md" << EOF
# Documentação Técnica - Sistema Médico

## Arquitetura do Sistema

### Visão Geral

O Sistema Médico é uma aplicação full-stack construída com Node.js/Express no backend e React.js no frontend.

### Componentes Principais

#### Backend (Node.js/Express)
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL com Sequelize ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Upload de Arquivos**: Multer + AWS S3
- **Integração IA**: OpenAI GPT-4.1 e Anthropic Claude Sonnet 4
- **Cache**: Redis
- **Monitoramento**: Winston Logger

#### Frontend (React.js)
- **Framework**: React.js 18
- **Biblioteca UI**: Material-UI
- **Gerenciamento de Estado**: Redux Toolkit
- **Roteamento**: React Router
- **HTTP Client**: Axios
- **Formulários**: React Hook Form
- **Validação**: Yup
- **Testes**: Jest + React Testing Library

#### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Proxy Reverso**: Nginx
- **Banco de Dados**: PostgreSQL 15
- **Cache**: Redis 7
- **Armazenamento**: AWS S3
- **Monitoramento**: Health checks e logs

## Estrutura de Diretórios

\`\`\`
sistema-medico/
├── backend/                 # Backend Node.js
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   ├── services/       # Serviços
│   │   └── utils/          # Utilitários
│   ├── uploads/            # Arquivos temporários
│   └── package.json
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── services/       # Serviços de API
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Contexto global
│   │   └── utils/          # Utilitários
│   └── package.json
├── database/               # Scripts de banco
├── docs/                   # Documentação
├── scripts/                # Scripts de automação
└── docker-compose.yml      # Orquestração Docker
\`\`\`

## Modelos de Dados

### Usuários (Users)
- id: UUID
- name: String
- email: String (único)
- password: String (hash)
- role: Enum (admin, doctor, nurse, assistant)
- crm: String (opcional)
- specialty: String (opcional)
- created_at: Timestamp
- updated_at: Timestamp

### Pacientes (Patients)
- id: UUID
- name: String
- email: String
- cpf: String (único)
- birth_date: Date
- gender: Enum
- address: JSON
- allergies: JSON
- medications: JSON
- created_at: Timestamp
- updated_at: Timestamp

### Documentos (Documents)
- id: UUID
- patient_id: UUID (foreign key)
- filename: String
- original_name: String
- file_path: String
- category: Enum
- extracted_text: Text
- ai_analysis: JSON
- created_at: Timestamp

### Anotações (Notes)
- id: UUID
- patient_id: UUID (foreign key)
- user_id: UUID (foreign key)
- title: String
- content: Text
- note_type: Enum
- created_at: Timestamp

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Criar paciente
- `GET /api/patients/:id` - Obter paciente
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Deletar paciente

### Documentos
- `GET /api/documents` - Listar documentos
- `POST /api/documents` - Upload documento
- `GET /api/documents/:id` - Obter documento
- `DELETE /api/documents/:id` - Deletar documento

### Anotações
- `GET /api/notes` - Listar anotações
- `POST /api/notes` - Criar anotação
- `PUT /api/notes/:id` - Atualizar anotação
- `DELETE /api/notes/:id` - Deletar anotação

### IA
- `POST /api/ai/analyze` - Analisar documento
- `POST /api/ai/insights` - Gerar insights
- `POST /api/ai/recommendations` - Obter recomendações

## Configuração do Ambiente

### Variáveis de Ambiente
\`\`\`
# Backend
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_medico
DB_USER=postgres
DB_PASSWORD=senha
JWT_SECRET=seu_jwt_secret
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
OPENAI_API_KEY=sua_openai_key
ANTHROPIC_API_KEY=sua_anthropic_key

# Frontend
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
\`\`\`

### Scripts Disponíveis
\`\`\`
# Desenvolvimento
./scripts/dev.sh          # Ambiente de desenvolvimento
./scripts/init.sh         # Inicialização rápida
./scripts/test.sh         # Executar testes
./scripts/monitor.sh      # Monitoramento

# Deploy
./scripts/deploy.sh       # Deploy em produção
./scripts/backup.sh       # Backup de dados
./scripts/cleanup.sh      # Limpeza e manutenção

# Documentação
./scripts/docs.sh         # Gerar documentação
\`\`\`

## Segurança

### Medidas de Segurança
- Autenticação JWT com expiração
- Hash de senhas com bcrypt
- Validação de entrada de dados
- Rate limiting
- CORS configurado
- Helmet para segurança HTTP
- Logs de auditoria

### Conformidade
- LGPD (Lei Geral de Proteção de Dados)
- HIPAA (Health Insurance Portability and Accountability Act)
- GDPR (General Data Protection Regulation)

## Monitoramento e Logs

### Logs
- Logs estruturados com Winston
- Níveis de log: error, warn, info, debug
- Logs rotacionados diariamente
- Logs de auditoria para ações sensíveis

### Monitoramento
- Health checks em todos os serviços
- Monitoramento de recursos do sistema
- Alertas para erros críticos
- Métricas de performance

## Desenvolvimento

### Pré-requisitos
- Node.js 16+
- npm 8+
- Docker 20+
- Docker Compose 2+
- PostgreSQL 12+

### Instalação
\`\`\`
git clone <repositorio>
cd sistema-medico
./scripts/init.sh
\`\`\`

### Fluxo de Trabalho
1. Crie uma branch para sua feature
2. Faça suas alterações
3. Adicione testes
4. Atualize a documentação
5. Faça um pull request

## Contribuição

### Padronização de Código
- ESLint para JavaScript/TypeScript
- Prettier para formatação
- Husky para hooks de git
- Commitizen para mensagens de commit

### Testes
- Testes unitários com Jest
- Testes de integração
- Testes E2E com Cypress
- Cobertura mínima de 80%

## Deploy

### Ambiente de Desenvolvimento
- Docker Compose para desenvolvimento
- Hot reload para frontend e backend
- Banco de dados em memória ou local

### Ambiente de Produção
- Docker containers
- Nginx como proxy reverso
- PostgreSQL em produção
- Redis para cache
- AWS S3 para armazenamento

## Manutenção

### Backup
- Backups diários automáticos
- Retenção de 30 dias
- Backup incremental
- Restauração ponto a ponto

### Atualizações
- Atualizações automáticas de dependências
- Rollback automático em caso de falha
- Monitoramento de saúde do sistema

EOF

    log_success "Documentação técnica gerada."
}

# Gerar diagramas
generate_diagrams() {
    log_info "Gerando diagramas..."
    
    # Diagrama de arquitetura
    cat > "$TECH_DOCS_DIR/architecture.md" << EOF
# Diagrama de Arquitetura

## Visão Geral

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │    │ │   Routes    │ │    │ │   Models    │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ ├─────────────┤ │    │ ├─────────────┤ │    │ ├─────────────┤ │
│ │   Pages     │ │    │ │ Controllers │ │    │ │   Services  │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ ├─────────────┤ │    │ ├─────────────┤ │    │ ├─────────────┤ │
│ │   Services  │ │    │ │   Middleware │ │    │ │   Utils     │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                       │                       │
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx        │    │   Redis        │    │   AWS S3       │
│   (Proxy)      │    │   (Cache)      │    │   (Storage)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## Fluxo de Dados

1. **Requisição do Usuário**: O usuário acessa o frontend via navegador
2. **Proxy Reverso**: Nginx direciona as requisições para o backend
3. **Processamento**: O backend processa a requisição e consulta o banco de dados
4. **Cache**: Redis é usado para cache de dados frequentemente acessados
5. **Armazenamento**: Arquivos são armazenados no AWS S3
6. **Resposta**: O backend retorna a resposta para o frontend
7. **Interface**: O frontend exibe os dados para o usuário

EOF

    # Diagrama de banco de dados
    cat > "$TECH_DOCS_DIR/database.md" << EOF
# Diagrama do Banco de Dados

## Relacionamentos Principais

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │    Patients     │    │    Documents    │
│                 │    │                 │    │                 │
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │    │ name            │    │ patient_id (FK) │
│ email (UNIQUE)  │    │ email           │    │ filename        │
│ password        │    │ cpf (UNIQUE)    │    │ category        │
│ role            │    │ birth_date      │    │ created_at      │
│ created_at      │    │ gender          │    │                 │
│                 │    │ created_at      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────┬───────────┼───────────┬───────────┘
                     │           │           │
                     ▼           ▼           ▼
            ┌─────────────────┐    ┌─────────────────┐
            │     Notes       │    │   Appointments  │
            │                 │    │                 │
            │ id (PK)         │    │ id (PK)         │
            │ patient_id (FK) │    │ patient_id (FK) │
            │ user_id (FK)    │    │ doctor_id (FK)  │
            │ title           │    │ date_time       │
            │ content         │    │ type            │
            │ note_type       │    │ status          │
            │ created_at      │    │ created_at      │
            │                 │    │                 │
            └─────────────────┘    └─────────────────┘
\`\`\`

## Descrição das Tabelas

### Users (Usuários)
Armazena informações dos usuários do sistema.

### Patients (Pacientes)
Armazena dados dos pacientes, incluindo informações pessoais e médicas.

### Documents (Documentos)
Armazena informações sobre os documentos médicos dos pacientes.

### Notes (Anotações)
Armazena anotações médicas associadas a pacientes e usuários.

### Appointments (Agendamentos)
Armazena informações sobre consultas e agendamentos.

EOF

    log_success "Diagramas gerados."
}

# Gerar changelog
generate_changelog() {
    log_info "Gerando changelog..."
    
    cat > "$DOCS_DIR/CHANGELOG.md" << EOF
# Changelog - Sistema Médico

## [1.0.0] - $(date +%Y-%m-%d)

### Adicionado
- ✅ Sistema completo de gestão médica
- ✅ Cadastro e gestão de pacientes
- ✅ Upload e organização de documentos
- ✅ Sistema de anotações médicas
- ✅ Timeline interativa da história clínica
- ✅ Integração com IA (GPT-4.1 e Claude Sonnet 4)
- ✅ Painel de métricas e estatísticas
- ✅ Sistema de agendamento e lembretes
- ✅ Autenticação JWT com OAuth 2.0
- ✅ Interface responsiva com Material-UI
- ✅ Dockerização completa
- ✅ Documentação completa
- ✅ Scripts de automação

### Melhorias
- ✅ Performance otimizada
- ✅ Segurança reforçada
- ✅ Experiência do usuário aprimorada
- ✅ Conformidade LGPD/HIPAA

### Correções
- ✅ Correção de bugs menores
- ✅ Melhorias na estabilidade

### Removido
- N/A

---

## Próximas Versões

### [1.1.0] - Planejado
- 🔄 Integração com sistemas de agendamento externos
- 🔄 Relatórios avançados
- 🔄 Notificações por SMS e email
- 🔄 Mobile app

### [1.2.0] - Planejado
- 🔄 Inteligência artificial avançada
- 🔄 Análise preditiva de saúde
- 🔄 Integração com wearables
- 🔄 Telemedicina

EOF

    log_success "Changelog gerado."
}

# Função principal
main() {
    log_info "Sistema de Geração de Documentação - Sistema Médico"
    
    setup_docs_dir
    generate_api_docs
    generate_user_docs
    generate_tech_docs
    generate_diagrams
    generate_changelog
    
    log_success "Documentação gerada com sucesso!"
    log_info "Documentação disponível em:"
    log_info "  - API: $API_DOCS_DIR/"
    log_info "  - Usuário: $USER_DOCS_DIR/"
    log_info "  - Técnica: $TECH_DOCS_DIR/"
    log_info "  - Changelog: $DOCS_DIR/CHANGELOG.md"
}

# Tratar argumentos de linha de comando
case "${1:-}" in
    "api")
        generate_api_docs
        ;;
    "user")
        generate_user_docs
        ;;
    "tech")
        generate_tech_docs
        ;;
    "diagrams")
        generate_diagrams
        ;;
    "changelog")
        generate_changelog
        ;;
    "help"|"-h"|"--help")
        echo "Uagem: $0 [comando]"
        echo ""
        echo "Comandos:"
        echo "  api        - Gera documentação da API"
        echo "  user       - Gera documentação do usuário"
        echo "  tech       - Gera documentação técnica"
        echo "  diagrams   - Gera diagramas"
        echo "  changelog  - Gera changelog"
        echo "  help       - Mostra esta mensagem de ajuda"
        echo ""
        echo "Sem comandos, gera toda a documentação."
        ;;
    *)
        main
        ;;
esac
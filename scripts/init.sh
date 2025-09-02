#!/bin/bash

# Script de Inicialização Rápida para o Sistema Médico
# Este script configura e inicia o projeto em minutos

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

# Banner de boas-vindas
show_banner() {
    echo -e "${BLUE}"
    echo "████████████████████████████████████████████████████████"
    echo "█                                                      █"
    echo "█            SISTEMA MÉDICO COM SUPORTE DE IA           █"
    echo "█                                                      █"
    echo "█          Inicialização Rápida do Projeto             █"
    echo "█                                                      █"
    echo "████████████████████████████████████████████████████████"
    echo -e "${NC}"
    echo ""
}

# Verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Verificar sistema operacional
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        log_error "Sistema operacional não suportado: $OSTYPE"
        exit 1
    fi
    
    log_success "Sistema operacional: $OS"
    
    # Verificar Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js: $NODE_VERSION"
    else
        log_error "Node.js não encontrado. Instale o Node.js (v16+)."
        exit 1
    fi
    
    # Verificar npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm: $NPM_VERSION"
    else
        log_error "npm não encontrado. Instale o npm."
        exit 1
    fi
    
    # Verificar Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        log_success "Git: $GIT_VERSION"
    else
        log_warning "Git não encontrado. Recomendado para controle de versão."
    fi
    
    # Verificar Docker (opcional)
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log_success "Docker e Docker Compose: Instalados"
        USE_DOCKER=true
    else
        log_warning "Docker não encontrado. Usando ambiente local."
        USE_DOCKER=false
    fi
}

# Configurar ambiente
setup_environment() {
    log_info "Configurando ambiente..."
    
    # Criar .env se não existir
    if [ ! -f .env ]; then
        log_info "Criando arquivo .env..."
        cp .env.example .env
        log_warning "Por favor, edite o arquivo .env com suas configurações."
    fi
    
    # Criar diretórios necessários
    mkdir -p logs
    mkdir -p database/backups
    mkdir -p uploads
    mkdir -p backend/uploads
    
    log_success "Ambiente configurado."
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    
    # Backend
    log_info "Instalando dependências do backend..."
    cd backend
    npm install
    cd ..
    
    # Frontend
    log_info "Instalando dependências do frontend..."
    cd frontend
    npm install
    cd ..
    
    log_success "Dependências instaladas."
}

# Configurar banco de dados
setup_database() {
    log_info "Configurando banco de dados..."
    
    if [ "$USE_DOCKER" = true ]; then
        # Usar Docker
        log_info "Iniciando banco de dados com Docker..."
        docker-compose up -d postgres redis
        
        # Aguardar banco de dados iniciar
        log_info "Aguardando banco de dados iniciar..."
        sleep 15
        
        # Rodar migrações
        log_info "Rodando migrações..."
        cd backend
        npm run migrate
        cd ..
        
        log_success "Banco de dados configurado com Docker."
    else
        # Usar PostgreSQL local
        log_warning "Usando PostgreSQL local. Certifique-se de que o PostgreSQL está rodando."
        log_info "Rodando migrações..."
        cd backend
        npm run migrate
        cd ..
        
        log_success "Banco de dados configurado localmente."
    fi
}

# Configurar variáveis de ambiente
setup_environment_variables() {
    log_info "Configurando variáveis de ambiente..."
    
    # Gerar JWT secreto
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    
    # Gerar chave de API de exemplo
    log_warning "Por favor, configure suas chaves de API no arquivo .env:"
    log_warning "  - OPENAI_API_KEY"
    log_warning "  - ANTHROPIC_API_KEY"
    log_warning "  - AWS_ACCESS_KEY_ID"
    log_warning "  - AWS_SECRET_ACCESS_KEY"
    
    log_success "Variáveis de ambiente configuradas."
}

# Criar usuário administrador
create_admin() {
    log_info "Criando usuário administrador..."
    
    cd backend
    if [ -f "scripts/create-admin.js" ]; then
        node scripts/create-admin.js
    else
        log_warning "Script de criação de administrador não encontrado."
        log_info "Você pode criar um administrador manualmente via API."
    fi
    cd ..
    
    log_success "Usuário administrador configurado."
}

# Configurar SSL (opcional)
setup_ssl() {
    log_info "Configurando SSL (opcional)..."
    
    if [ ! -d "nginx/ssl" ]; then
        mkdir -p nginx/ssl
    fi
    
    # Gerar certificado autoassinado (para desenvolvimento)
    if [ ! -f "nginx/ssl/cert.pem" ]; then
        log_info "Gerando certificado SSL autoassinado..."
        openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes -subj "/C=BR/ST=SP/L=Sao Paulo/O=Sistema Medico/CN=localhost"
        log_success "Certificado SSL gerado."
    fi
}

# Iniciar serviços
start_services() {
    log_info "Iniciando serviços..."
    
    if [ "$USE_DOCKER" = true ]; then
        # Iniciar com Docker
        docker-compose up -d
        sleep 10
    else
        # Iniciar localmente
        log_info "Iniciando backend..."
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        
        log_info "Iniciando frontend..."
        cd frontend
        npm start &
        FRONTEND_PID=$!
        cd ..
        
        sleep 15
    fi
    
    log_success "Serviços iniciados."
}

# Verificar saúde da aplicação
check_health() {
    log_info "Verificando saúde da aplicação..."
    
    # Verificar backend
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        log_success "✓ Backend: Saudável"
    else
        log_error "✗ Backend: Não saudável"
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "✓ Frontend: Saudável"
    else
        log_error "✗ Frontend: Não saudável"
    fi
    
    # Verificar banco de dados
    if [ "$USE_DOCKER" = true ]; then
        if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
            log_success "✓ Banco de dados: Saudável"
        else
            log_error "✗ Banco de dados: Não saudável"
        fi
    fi
}

# Mostrar informações de acesso
show_access_info() {
    echo ""
    echo -e "${GREEN}=============================================="
    echo "🎉 SISTEMA MÉDICO INSTALADO COM SUCESSO! 🎉"
    echo "=============================================="
    echo -e "${NC}"
    echo ""
    echo -e "${BLUE}URLs de Acesso:${NC}"
    echo "  🌐 Frontend: http://localhost:3000"
    echo "  🔧 Backend API: http://localhost:3001"
    echo "  📊 Health Check: http://localhost:3001/api/health"
    echo ""
    
    if [ "$USE_DOCKER" = true ]; then
        echo -e "${BLUE}Serviços Adicionais:${NC}"
        echo "  🗄️  PostgreSQL: localhost:5432"
        echo "  🔴 Redis: localhost:6379"
        echo "  📊 pgAdmin: http://localhost:8080"
        echo "  🗃️  MinIO Console: http://localhost:9001"
        echo ""
    fi
    
    echo -e "${BLUE}Credenciais Padrão:${NC}"
    echo "  📧 Email: admin@sistema-medico.com"
    echo "  🔑 Senha: admin123"
    echo ""
    
    echo -e "${BLUE}Próximos Passos:${NC}"
    echo "  1. Configure suas chaves de API no arquivo .env"
    echo "  2. Acesse o painel administrativo"
    echo "  3. Comece a cadastrar pacientes"
    echo "  4. Explore os recursos de IA"
    echo ""
    
    echo -e "${BLUE}Comandos Úteis:${NC}"
    echo "  📝 ./scripts/dev.sh     - Ambiente de desenvolvimento"
    echo "  🚀 ./scripts/deploy.sh  - Deploy em produção"
    echo "  🧪 ./scripts/test.sh    - Executar testes"
    echo "  💾 ./scripts/backup.sh  - Backup de dados"
    echo "  👁️  ./scripts/monitor.sh - Monitoramento"
    echo ""
}

# Função principal
main() {
    show_banner
    
    log_info "Iniciando configuração do Sistema Médico..."
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    setup_environment_variables
    create_admin
    setup_ssl
    start_services
    check_health
    show_access_info
    
    log_success "Configuração concluída!"
}

# Tratar argumentos de linha de comando
case "${1:-}" in
    "check")
        check_prerequisites
        ;;
    "deps")
        install_dependencies
        ;;
    "db")
        setup_database
        ;;
    "env")
        setup_environment_variables
        ;;
    "ssl")
        setup_ssl
        ;;
    "start")
        start_services
        ;;
    "stop")
        log_info "Parando serviços..."
        docker-compose down 2>/dev/null || true
        kill $(pgrep -f "npm run dev") 2>/dev/null || true
        kill $(pgrep -f "npm start") 2>/dev/null || true
        log_success "Serviços parados."
        ;;
    "help"|"-h"|"--help")
        echo "Uagem: $0 [comando]"
        echo ""
        echo "Comandos:"
        echo "  check      - Verifica pré-requisitos"
        echo "  deps       - Instala dependências"
        echo "  db         - Configura banco de dados"
        echo "  env        - Configura variáveis de ambiente"
        echo "  ssl        - Configura SSL"
        echo "  start      - Inicia serviços"
        echo "  stop       - Para serviços"
        echo "  help       - Mostra esta mensagem de ajuda"
        echo ""
        echo "Sem comandos, executa a instalação completa."
        ;;
    *)
        main
        ;;
esac
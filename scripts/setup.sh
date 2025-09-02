#!/bin/bash

# Sistema Médico com Suporte de IA - Script de Configuração
# Este script configura o ambiente de desenvolvimento completo

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

# Verificar se Node.js está instalado
check_nodejs() {
    log_info "Verificando Node.js..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Por favor, instale Node.js 16+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js versão 16+ é necessário. Versão atual: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js $(node --version) encontrado"
}

# Verificar se npm está instalado
check_npm() {
    log_info "Verificando npm..."
    if ! command -v npm &> /dev/null; then
        log_error "npm não encontrado. Por favor, instale npm"
        exit 1
    fi
    
    log_success "npm $(npm --version) encontrado"
}

# Verificar se Docker está instalado
check_docker() {
    log_info "Verificando Docker..."
    if ! command -v docker &> /dev/null; then
        log_warning "Docker não encontrado. Instalação manual será necessária."
        return 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_warning "Docker Compose não encontrado. Instalação manual será necessária."
        return 1
    fi
    
    log_success "Docker e Docker Compose encontrados"
    return 0
}

# Instalar dependências do backend
install_backend_deps() {
    log_info "Instalando dependências do backend..."
    cd backend
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Dependências do backend instaladas"
    else
        log_info "Dependências do backend já instaladas"
    fi
    
    cd ..
}

# Instalar dependências do frontend
install_frontend_deps() {
    log_info "Instalando dependências do frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Dependências do frontend instaladas"
    else
        log_info "Dependências do frontend já instaladas"
    fi
    
    cd ..
}

# Criar arquivo .env
create_env_file() {
    log_info "Criando arquivo .env..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        log_success "Arquivo .env criado a partir do exemplo"
        log_warning "Por favor, edite o arquivo .env com suas configurações"
    else
        log_info "Arquivo .env já existe"
    fi
}

# Iniciar serviços com Docker
start_docker_services() {
    log_info "Iniciando serviços com Docker..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose up -d
        log_success "Serviços Docker iniciados"
        
        # Esperar o banco de dados estar pronto
        log_info "Aguardando banco de dados estar pronto..."
        sleep 10
        
        # Rodar migrações
        docker-compose exec backend npm run migrate
        log_success "Migrações do banco de dados executadas"
    else
        log_warning "docker-compose.yml não encontrado. Pulando inicialização Docker."
    fi
}

# Configurar banco de dados
setup_database() {
    log_info "Configurando banco de dados..."
    
    if command -v psql &> /dev/null; then
        log_info "Configurando banco de dados local..."
        psql -U postgres -c "CREATE DATABASE sistema_medico;"
        psql -U postgres -d sistema_medico -f database/init.sql
        log_success "Banco de dados configurado"
    else
        log_warning "psql não encontrado. Banco de dados será configurado via Docker."
    fi
}

# Iniciar backend
start_backend() {
    log_info "Iniciando backend..."
    cd backend
    npm run dev &
    cd ..
    log_success "Backend iniciado em http://localhost:3001"
}

# Iniciar frontend
start_frontend() {
    log_info "Iniciando frontend..."
    cd frontend
    npm start &
    cd ..
    log_success "Frontend iniciado em http://localhost:3000"
}

# Função principal
main() {
    log_info "Iniciando configuração do Sistema Médico com IA..."
    
    # Verificar pré-requisitos
    check_nodejs
    check_npm
    
    # Verificar Docker (opcional)
    DOCKER_AVAILABLE=false
    if check_docker; then
        DOCKER_AVAILABLE=true
    fi
    
    # Criar arquivo .env
    create_env_file
    
    # Instalar dependências
    install_backend_deps
    install_frontend_deps
    
    # Configurar banco de dados
    if [ "$DOCKER_AVAILABLE" = true ]; then
        start_docker_services
    else
        setup_database
    fi
    
    # Iniciar aplicações
    start_backend
    start_frontend
    
    log_success "Configuração concluída!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend: http://localhost:3001"
    log_info "Health Check: http://localhost:3001/api/health"
    log_info "MailHog: http://localhost:8025 (para testes de email)"
    log_info "MinIO: http://localhost:9001 (para armazenamento de arquivos)"
    
    log_warning "Lembre-se de:"
    log_warning "1. Configurar suas chaves de API no arquivo .env"
    log_warning "2. Configurar o banco de dados PostgreSQL"
    log_warning "3. Configurar o Redis para cache"
    log_warning "4. Configurar o AWS S3 para armazenamento de arquivos"
    log_warning "5. Configurar as credenciais de email"
}

# Tratar interrupções
trap 'log_warning "Script interrompido"; exit 1' INT TERM

# Executar função principal
main "$@"
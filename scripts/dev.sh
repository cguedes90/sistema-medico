#!/bin/bash

# Script de Desenvolvimento para o Sistema Médico
# Este script facilita o desenvolvimento local com hot-reload

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

# Verificar dependências
check_dependencies() {
    log_info "Verificando dependências..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js não está instalado. Por favor, instale o Node.js (v16+)."
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log_error "npm não está instalado. Por favor, instale o npm."
        exit 1
    fi
    
    # Verificar PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL não encontrado. Instale o PostgreSQL ou use Docker Compose."
    fi
    
    log_success "Dependências verificadas."
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

# Configurar ambiente
setup_environment() {
    log_info "Configurando ambiente de desenvolvimento..."
    
    # Criar .env se não existir
    if [ ! -f .env ]; then
        log_warning "Arquivo .env não encontrado. Criando um novo..."
        cp .env.example .env
        log_warning "Por favor, edite o arquivo .env com suas configurações."
    fi
    
    # Criar diretórios necessários
    mkdir -p backend/uploads
    mkdir -p logs
    
    log_success "Ambiente configurado."
}

# Iniciar banco de dados com Docker
start_database() {
    log_info "Iniciando banco de dados..."
    
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        docker-compose up -d postgres redis
        log_success "Banco de dados iniciado com Docker."
    else
        log_warning "Docker não encontrado. Por favor, inicie o PostgreSQL manualmente."
    fi
}

# Rodar migrações
run_migrations() {
    log_info "Rodando migrações do banco de dados..."
    
    cd backend
    npm run migrate
    cd ..
    
    log_success "Migrações concluídas."
}

# Iniciar backend
start_backend() {
    log_info "Iniciando backend..."
    
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    log_success "Backend iniciado (PID: $BACKEND_PID)."
}

# Iniciar frontend
start_frontend() {
    log_info "Iniciando frontend..."
    
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    log_success "Frontend iniciado (PID: $FRONTEND_PID)."
}

# Monitorar processos
monitor_processes() {
    log_info "Monitorando processos..."
    log_info "Pressione Ctrl+C para parar todos os serviços."
    
    # Função para limpar processos ao sair
    cleanup() {
        log_info "Parando serviços..."
        kill $BACKEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        docker-compose down 2>/dev/null || true
        log_success "Serviços parados."
        exit 0
    }
    
    # Capturar sinal de interrupção
    trap cleanup SIGINT SIGTERM
    
    # Esperar processos
    wait $BACKEND_PID $FRONTEND_PID
}

# Mostrar URLs
show_urls() {
    log_success "Serviços iniciados com sucesso!"
    log_info "URLs de acesso:"
    log_info "  - Frontend: http://localhost:3000"
    log_info "  - Backend API: http://localhost:3001"
    log_info "  - Health Check: http://localhost:3001/api/health"
    log_info "  - API Documentation: http://localhost:3001/api/docs"
    
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log_info "  - PostgreSQL: localhost:5432"
        log_info "  - Redis: localhost:6379"
        log_info "  - pgAdmin: http://localhost:8080"
    fi
}

# Função principal
main() {
    log_info "Iniciando ambiente de desenvolvimento..."
    
    check_dependencies
    setup_environment
    install_dependencies
    start_database
    run_migrations
    start_backend
    start_frontend
    
    # Aguardar serviços iniciarem
    sleep 10
    
    show_urls
    monitor_processes
}

# Tratar argumentos de linha de comando
case "${1:-}" in
    "install")
        check_dependencies
        setup_environment
        install_dependencies
        ;;
    "db")
        start_database
        run_migrations
        ;;
    "backend")
        start_backend
        ;;
    "frontend")
        start_frontend
        ;;
    "stop")
        log_info "Parando serviços..."
        kill $(pgrep -f "npm run dev") 2>/dev/null || true
        kill $(pgrep -f "npm start") 2>/dev/null || true
        docker-compose down 2>/dev/null || true
        log_success "Serviços parados."
        ;;
    "restart")
        log_info "Reiniciando serviços..."
        $0 stop
        sleep 2
        $0 start
        ;;
    "logs")
        log_info "Mostrando logs..."
        tail -f logs/backend.log logs/frontend.log 2>/dev/null || \
        echo "Arquivos de log não encontrados. Verifique se os serviços estão em execução."
        ;;
    "help"|"-h"|"--help")
        echo "Uagem: $0 [comando]"
        echo ""
        echo "Comandos:"
        echo "  install    - Instala dependências e configura ambiente"
        echo "  db         - Inicia banco de dados e roda migrações"
        echo "  backend    - Inicia apenas o backend"
        echo "  frontend   - Inicia apenas o frontend"
        echo "  start      - Inicia todos os serviços (padrão)"
        echo "  stop       - Para todos os serviços"
        echo "  restart    - Reinicia todos os serviços"
        echo "  logs       - Mostra logs em tempo real"
        echo "  help       - Mostra esta mensagem de ajuda"
        echo ""
        echo "Sem comandos, executa o ambiente completo de desenvolvimento."
        ;;
    *)
        main
        ;;
esac
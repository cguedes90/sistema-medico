#!/bin/bash

# Script de Deploy para o Sistema Médico
# Este script automatiza o processo de build e deploy da aplicação

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

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado. Por favor, instale o Docker."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado. Por favor, instale o Docker Compose."
        exit 1
    fi
    
    log_success "Docker e Docker Compose estão instalados."
}

# Criar diretórios necessários
create_directories() {
    log_info "Criando diretórios necessários..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p database/backups
    mkdir -p nginx/ssl
    
    log_success "Diretórios criados com sucesso."
}

# Configurar variáveis de ambiente
setup_environment() {
    log_info "Configurando variáveis de ambiente..."
    
    if [ ! -f .env ]; then
        log_warning "Arquivo .env não encontrado. Criando um novo..."
        cp .env.example .env
        log_warning "Por favor, edite o arquivo .env com suas configurações."
    fi
    
    # Verificar se as chaves de API estão configuradas
    if [ -z "$OPENAI_API_KEY" ] || [ -z "$ANTHROPIC_API_KEY" ]; then
        log_warning "Chaves de API não configuradas. Verifique o arquivo .env."
    fi
    
    log_success "Variáveis de ambiente configuradas."
}

# Build da aplicação
build_application() {
    log_info "Iniciando build da aplicação..."
    
    # Build do backend
    log_info "Build do backend..."
    cd backend
    docker build -t sistema-medico-backend:latest .
    cd ..
    
    # Build do frontend
    log_info "Build do frontend..."
    cd frontend
    docker build -t sistema-medico-frontend:latest .
    cd ..
    
    log_success "Build da aplicação concluído."
}

# Iniciar serviços
start_services() {
    log_info "Iniciando serviços..."
    
    # Parar serviços existentes
    docker-compose down
    
    # Iniciar serviços
    docker-compose up -d
    
    log_success "Serviços iniciados."
}

# Verificar saúde dos serviços
check_health() {
    log_info "Verificando saúde dos serviços..."
    
    # Aguardar serviços iniciarem
    sleep 30
    
    # Verificar backend
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "Backend está saudável."
    else
        log_error "Backend não está saudável."
        exit 1
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend está saudável."
    else
        log_error "Frontend não está saudável."
        exit 1
    fi
    
    # Verificar banco de dados
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_success "Banco de dados está saudável."
    else
        log_error "Banco de dados não está saudável."
        exit 1
    fi
}

# Rodar migrações
run_migrations() {
    log_info "Rodando migrações do banco de dados..."
    
    docker-compose exec backend npm run migrate
    
    log_success "Migrações concluídas."
}

# Criar usuário administrador
create_admin() {
    log_info "Criando usuário administrador..."
    
    # Verificar se já existe um administrador
    if docker-compose exec -T postgres psql -U postgres -d sistema_medico -c "SELECT COUNT(*) FROM users WHERE role = 'admin';" | grep -q "1"; then
        log_warning "Usuário administrador já existe."
        return
    fi
    
    # Criar administrador
    docker-compose exec backend npm run create-admin
    
    log_success "Usuário administrador criado."
}

# Backup do banco de dados
backup_database() {
    log_info "Criando backup do banco de dados..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker-compose exec -T postgres pg_dump -U postgres sistema_medico > database/backups/backup_$TIMESTAMP.sql
    
    log_success "Backup criado: database/backups/backup_$TIMESTAMP.sql"
}

# Limpar recursos não utilizados
cleanup() {
    log_info "Limpando recursos não utilizados..."
    
    docker system prune -f
    docker volume prune -f
    
    log_success "Recursos limpos."
}

# Mostrar status
show_status() {
    log_info "Status dos serviços:"
    docker-compose ps
    
    log_info "Logs recentes:"
    docker-compose logs --tail=20
}

# Função principal
main() {
    log_info "Iniciando deploy do Sistema Médico..."
    
    check_docker
    create_directories
    setup_environment
    build_application
    start_services
    check_health
    run_migrations
    create_admin
    backup_database
    
    log_success "Deploy concluído com sucesso!"
    log_info "Acesse a aplicação:"
    log_info "  - Frontend: http://localhost:3000"
    log_info "  - Backend API: http://localhost:3001"
    log_info "  - pgAdmin: http://localhost:8080"
    log_info "  - MinIO Console: http://localhost:9001"
    
    show_status
}

# Tratar argumentos de linha de comando
case "${1:-}" in
    "start")
        start_services
        check_health
        ;;
    "stop")
        log_info "Parando serviços..."
        docker-compose down
        log_success "Serviços parados."
        ;;
    "restart")
        log_info "Reiniciando serviços..."
        docker-compose restart
        check_health
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "backup")
        backup_database
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        echo "Uagem: $0 [comando]"
        echo ""
        echo "Comandos:"
        echo "  start      - Inicia os serviços"
        echo "  stop       - Para os serviços"
        echo "  restart    - Reinicia os serviços"
        echo "  logs       - Mostra logs em tempo real"
        echo "  backup     - Cria backup do banco de dados"
        echo "  cleanup    - Limpa recursos não utilizados"
        echo "  status     - Mostra status dos serviços"
        echo "  help       - Mostra esta mensagem de ajuda"
        echo ""
        echo "Sem comandos, executa o deploy completo."
        ;;
    *)
        main
        ;;
esac
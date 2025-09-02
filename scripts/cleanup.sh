#!/bin/bash

# Script de Limpeza e Manutenção para o Sistema Médico
# Este script limpa recursos e mantém o projeto organizado

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

# Parar serviços
stop_services() {
    log_info "Parando serviços..."
    
    # Parar Docker Compose
    if command -v docker-compose &> /dev/null; then
        docker-compose down
        log_success "Serviços Docker parados."
    fi
    
    # Parar processos npm
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "node" 2>/dev/null || true
    
    log_success "Processos npm parados."
}

# Limpar Docker
cleanup_docker() {
    log_info "Limpando recursos Docker..."
    
    if command -v docker &> /dev/null; then
        # Remover containers parados
        docker container prune -f
        
        # Remover redes não utilizadas
        docker network prune -f
        
        # Remover volumes não utilizados (exceto named volumes importantes)
        docker volume prune -f
        
        # Limpar imagens não utilizadas
        docker image prune -f
        
        # Limpar cache do build
        docker builder prune -f
        
        log_success "Recursos Docker limpos."
    else
        log_warning "Docker não encontrado."
    fi
}

# Limpacnpm cache
cleanup_npm() {
    log_info "Limpando cache npm..."
    
    # Backend
    cd backend
    npm cache clean --force
    cd ..
    
    # Frontend
    cd frontend
    npm cache clean --force
    cd ..
    
    log_success "Cache npm limpo."
}

# Limpar dependências não utilizadas
cleanup_deps() {
    log_info "Verificando dependências não utilizadas..."
    
    # Backend
    cd backend
    if command -v npm-audit &> /dev/null; then
        npm audit --fix
    fi
    cd ..
    
    # Frontend
    cd frontend
    if command -v npm-audit &> /dev/null; then
        npm audit --fix
    fi
    cd ..
    
    log_success "Dependências verificadas e atualizadas."
}

# Limpar arquivos temporários
cleanup_temp_files() {
    log_info "Limpando arquivos temporários..."
    
    # Diretório de logs
    rm -rf logs/*.log 2>/dev/null || true
    
    # Arquivos de build
    rm -rf backend/dist 2>/dev/null || true
    rm -rf frontend/build 2>/dev/null || true
    rm -rf frontend/dist 2>/dev/null || true
    
    # Arquivos de cache
    rm -rf backend/.cache 2>/dev/null || true
    rm -rf frontend/.cache 2>/dev/null || true
    
    # Arquivos de coverage
    rm -rf backend/coverage 2>/dev/null || true
    rm -rf frontend/coverage 2>/dev/null || true
    
    # Arquivos de teste
    rm -rf backend/test-results 2>/dev/null || true
    rm -rf frontend/test-results 2>/dev/null || true
    
    # Arquivos de lock (opcional)
    # rm -rf backend/package-lock.json 2>/dev/null || true
    # rm -rf frontend/package-lock.json 2>/dev/null || true
    
    log_success "Arquivos temporários limpos."
}

# Limpar uploads
cleanup_uploads() {
    log_info "Limpando arquivos de upload..."
    
    # Manter estrutura de diretórios
    find uploads/ -type f -delete 2>/dev/null || true
    find backend/uploads/ -type f -delete 2>/dev/null || true
    
    log_success "Arquivos de upload limpos."
}

# Limpar backups antigos
cleanup_old_backups() {
    log_info "Limpando backups antigos..."
    
    # Manter apenas os últimos 7 backups
    find database/backups/ -name "*.sql" -mtime +7 -delete 2>/dev/null || true
    find database/backups/ -name "*.gz" -mtime +7 -delete 2>/dev/null || true
    
    log_success "Backups antigos limpos."
}

# Limpar Docker Compose
cleanup_docker_compose() {
    log_info "Limpando Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        # Remover volumes do Docker Compose
        docker-compose down -v --remove-orphans
        
        # Limpar imagens do Docker Compose
        docker-compose down --rmi all --remove-orphans
        
        log_success "Docker Compose limpo."
    else
        log_warning "Docker Compose não encontrado."
    fi
}

# Resetar banco de dados
reset_database() {
    log_info "Resetando banco de dados..."
    
    if command -v docker-compose &> /dev/null; then
        # Parar serviços
        docker-compose down
        
        # Remover volume do banco de dados
        docker-compose down -v
        
        # Recriar banco de dados
        docker-compose up -d postgres
        
        # Aguardar banco de dados iniciar
        sleep 10
        
        # Rodar migrações
        cd backend
        npm run migrate
        cd ..
        
        log_success "Banco de dados resetado."
    else
        log_warning "Docker Compose não encontrado. Banco de dados não resetado.")
    fi
}

# Gerar relatório de limpeza
generate_cleanup_report() {
    log_info "Gerando relatório de limpeza..."
    
    local report_file="logs/cleanup_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Relatório de Limpeza - Sistema Médico"
        echo "Data: $(date)"
        echo "=========================================="
        echo ""
        
        # Espaço em disco liberado
        echo "Espaço em disco liberado:"
        echo "  Logs: $(du -sh logs 2>/dev/null | cut -f1 || echo 'Indisponível')"
        echo "  Build: $(du -sh backend/dist frontend/build 2>/dev/null | cut -f1 | head -1 || echo 'Indisponível')"
        echo "  Cache: $(du -sh backend/.cache frontend/.cache 2>/dev/null | cut -f1 | head -1 || echo 'Indisponível')"
        echo ""
        
        # Recursos Docker
        echo "Recursos Docker:"
        if command -v docker &> /dev/null; then
            echo "  Containers: $(docker ps -a | grep -v CONTAINER | wc -l)"
            echo "  Imagens: $(docker images | grep -v REPOSITORY | wc -l)"
            echo "  Volumes: $(docker volume ls | grep -v DRIVER | wc -l)"
        else
            echo "  Docker: Não disponível"
        fi
        echo ""
        
        # Status do projeto
        echo "Status do Projeto:"
        echo "  Arquivos temporários: $(find . -name "*.tmp" -o -name "*.temp" | wc -l)"
        echo "  Logs: $(find logs/ -name "*.log" 2>/dev/null | wc -l)"
        echo "  Backups: $(find database/backups/ -name "*.sql" -o -name "*.gz" 2>/dev/null | wc -l)"
        echo ""
        
    } > "$report_file"
    
    log_success "Relatório de limpeza gerado: $report_file"
}

# Função principal
main() {
    log_info "Sistema de Limpeza e Manutenção do Sistema Médico"
    
    case "${1:-}" in
        "stop")
            stop_services
            ;;
        "docker")
            cleanup_docker
            ;;
        "npm")
            cleanup_npm
            ;;
        "deps")
            cleanup_deps
            ;;
        "temp")
            cleanup_temp_files
            ;;
        "uploads")
            cleanup_uploads
            ;;
        "backups")
            cleanup_old_backups
            ;;
        "docker-compose")
            cleanup_docker_compose
            ;;
        "database")
            reset_database
            ;;
        "report")
            generate_cleanup_report
            ;;
        "all")
            stop_services
            cleanup_docker
            cleanup_npm
            cleanup_deps
            cleanup_temp_files
            cleanup_uploads
            cleanup_old_backups
            generate_cleanup_report
            ;;
        "help"|"-h"|"--help")
            echo "Uagem: $0 [comando]"
            echo ""
            echo "Comandos:"
            echo "  stop          - Para todos os serviços"
            echo "  docker        - Limpa recursos Docker"
            echo "  npm           - Limpa cache npm"
            echo "  deps          - Verifica e atualiza dependências"
            echo "  temp          - Limpa arquivos temporários"
            echo "  uploads       - Limpa arquivos de upload"
            echo "  backups       - Limpa backups antigos"
            echo "  docker-compose - Limpa Docker Compose"
            echo "  database      - Reset banco de dados"
            echo "  report        - Gera relatório de limpeza"
            echo "  all           - Executa todas as limpezas"
            echo "  help          - Mostra esta mensagem de ajuda"
            echo ""
            echo "Exemplos:"
            echo "  $0 stop"
            echo "  $0 all"
            echo "  $0 docker"
            ;;
        *)
            log_info "Executando limpeza completa..."
            stop_services
            cleanup_docker
            cleanup_npm
            cleanup_deps
            cleanup_temp_files
            cleanup_uploads
            cleanup_old_backups
            generate_cleanup_report
            log_success "Limpeza concluída!"
            ;;
    esac
}

# Executar função principal
main "$@"
#!/bin/bash

# Script de Monitoramento para o Sistema Médico
# Este script monitora a saúde da aplicação e gera relatórios

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
LOG_DIR="logs"
MONITOR_INTERVAL=30
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90

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

# Criar diretório de logs
setup_logs() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
    fi
}

# Monitorar serviços
monitor_services() {
    log_info "Monitorando serviços..."
    
    # Verificar se Docker está rodando
    if ! docker info &> /dev/null; then
        log_error "Docker não está rodando."
        return 1
    fi
    
    # Verificar status dos serviços
    services=("postgres" "redis" "backend" "frontend")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "✓ $service: Rodando"
        else
            log_error "✗ $service: Parado"
        fi
    done
    
    # Verificar portas
    check_ports
}

# Verificar portas
check_ports() {
    log_info "Verificando portas..."
    
    ports=("3000" "3001" "5432" "6379" "8080" "9001")
    
    for port in "${ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            log_success "✓ Porta $port: Ocupada"
        else
            log_warning "✗ Porta $port: Livre"
        fi
    done
}

# Monitorar recursos do sistema
monitor_resources() {
    log_info "Monitorando recursos do sistema..."
    
    # CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        log_error "⚠ Uso de CPU alto: ${cpu_usage}%"
    else
        log_success "✓ Uso de CPU: ${cpu_usage}%"
    fi
    
    # Memória
    memory_usage=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
    if (( $(echo "$memory_usage > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
        log_error "⚠ Uso de Memória alto: ${memory_usage}%"
    else
        log_success "✓ Uso de Memória: ${memory_usage}%"
    fi
    
    # Disco
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt "$ALERT_THRESHOLD_DISK" ]; then
        log_error "⚠ Uso de Disco alto: ${disk_usage}%"
    else
        log_success "✓ Uso de Disco: ${disk_usage}%"
    fi
}

# Monitorar banco de dados
monitor_database() {
    log_info "Monitorando banco de dados..."
    
    # Verificar conexão
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        log_success "✓ Banco de dados: Conectado"
    else
        log_error "✗ Banco de dados: Não conectado"
    fi
    
    # Verificar tamanho do banco
    db_size=$(docker-compose exec -T postgres psql -U postgres -d sistema_medico -c "SELECT pg_size_pretty(pg_database_size('sistema_medico'));" | grep -v "pg_size_pretty" | xargs)
    log_info "Tamanho do banco: $db_size"
    
    # Verificar número de conexões
    connections=$(docker-compose exec -T postgres psql -U postgres -d sistema_medico -c "SELECT count(*) FROM pg_stat_activity;" | grep -v "count" | xargs)
    log_info "Conexões ativas: $connections"
}

# Monitorar Redis
monitor_redis() {
    log_info "Monitorando Redis..."
    
    # Verificar conexão
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        log_success "✓ Redis: Conectado"
    else
        log_error "✗ Redis: Não conectado"
    fi
    
    # Verificar uso de memória
    redis_memory=$(docker-compose exec -T redis redis-cli info memory | grep "used_memory_human" | cut -d: -f2 | xargs)
    log_info "Uso de memória Redis: $redis_memory"
    
    # Verificar número de chaves
    redis_keys=$(docker-compose exec -T redis redis-cli info keyspace | grep "db0" | cut -d: -f2 | cut -d, -f1 | cut -d= -f2)
    log_info "Chaves no Redis: $redis_keys"
}

# Monitorar aplicação
monitor_application() {
    log_info "Monitorando aplicação..."
    
    # Verificar health check do backend
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        log_success "✓ Backend: Saudável"
    else
        log_error "✗ Backend: Não saudável"
    fi
    
    # Verificar health check do frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "✓ Frontend: Saudável"
    else
        log_error "✗ Frontend: Não saudável"
    fi
    
    # Verificar logs de erros
    check_error_logs
}

# Verificar logs de erros
check_error_logs() {
    log_info "Verificando logs de erros..."
    
    # Backend logs
    if [ -f "$LOG_DIR/backend.log" ]; then
        error_count=$(grep -i "error\|exception" "$LOG_DIR/backend.log" | wc -l)
        if [ "$error_count" -gt 0 ]; then
            log_warning "⚠ Backend: $error_count erros encontrados"
        else
            log_success "✓ Backend: Sem erros"
        fi
    fi
    
    # Frontend logs
    if [ -f "$LOG_DIR/frontend.log" ]; then
        error_count=$(grep -i "error\|exception" "$LOG_DIR/frontend.log" | wc -l)
        if [ "$error_count" -gt 0 ]; then
            log_warning "⚠ Frontend: $error_count erros encontrados"
        else
            log_success "✓ Frontend: Sem erros"
        fi
    fi
}

# Gerar relatório de performance
generate_performance_report() {
    log_info "Gerando relatório de performance..."
    
    local report_file="$LOG_DIR/performance_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Relatório de Performance - Sistema Médico"
        echo "Data: $(date)"
        echo "=========================================="
        echo ""
        
        # Sistema
        echo "Sistema:"
        echo "  Uso de CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')%"
        echo "  Uso de Memória: $(free | grep Mem | awk '{print ($3/$2) * 100.0}')%"
        echo "  Uso de Disco: $(df / | tail -1 | awk '{print $5}' | sed 's/%//')%"
        echo ""
        
        # Banco de dados
        echo "Banco de Dados:"
        echo "  Status: $(docker-compose exec -T postgres pg_isready -U postgres 2>/dev/null | grep -v "pg_isready" || echo "Não conectado")"
        echo "  Tamanho: $(docker-compose exec -T postgres psql -U postgres -d sistema_medico -c "SELECT pg_size_pretty(pg_database_size('sistema_medico'));" 2>/dev/null | grep -v "pg_size_pretty" | xargs || echo "Indisponível")"
        echo "  Conexões: $(docker-compose exec -T postgres psql -U postgres -d sistema_medico -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | grep -v "count" | xargs || echo "Indisponível")"
        echo ""
        
        # Redis
        echo "Redis:"
        echo "  Status: $(docker-compose exec -T redis redis-cli ping 2>/dev/null || echo "Não conectado")"
        echo "  Uso de memória: $(docker-compose exec -T redis redis-cli info memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | xargs || echo "Indisponível")"
        echo "  Chaves: $(docker-compose exec -T redis redis-cli info keyspace 2>/dev/null | grep "db0" | cut -d: -f2 | cut -d, -f1 | cut -d= -f2 || echo "Indisponível")"
        echo ""
        
        # Serviços
        echo "Serviços:"
        docker-compose ps
        echo ""
        
        # Logs recentes
        echo "Logs Recentes:"
        echo "  Backend:"
        tail -n 10 "$LOG_DIR/backend.log" 2>/dev/null || echo "Logs não encontrados"
        echo ""
        echo "  Frontend:"
        tail -n 10 "$LOG_DIR/frontend.log" 2>/dev/null || echo "Logs não encontrados"
        
    } > "$report_file"
    
    log_success "Relatório gerado: $report_file"
}

# Monitoramento contínuo
continuous_monitoring() {
    log_info "Iniciando monitoramento contínuo (intervalo: $MONITOR_INTERVAL segundos)..."
    log_info "Pressione Ctrl+C para parar."
    
    while true; do
        echo ""
        echo "=========================================="
        echo "Monitoramento em $(date)"
        echo "=========================================="
        
        monitor_services
        monitor_resources
        monitor_database
        monitor_redis
        monitor_application
        
        sleep "$MONITOR_INTERVAL"
    done
}

# Função principal
main() {
    log_info "Sistema de Monitoramento do Sistema Médico"
    
    setup_logs
    
    case "${1:-}" in
        "services")
            monitor_services
            ;;
        "resources")
            monitor_resources
            ;;
        "database")
            monitor_database
            ;;
        "redis")
            monitor_redis
            ;;
        "application")
            monitor_application
            ;;
        "logs")
            check_error_logs
            ;;
        "report")
            generate_performance_report
            ;;
        "continuous")
            continuous_monitoring
            ;;
        "help"|"-h"|"--help")
            echo "Uagem: $0 [comando]"
            echo ""
            echo "Comandos:"
            echo "  services    - Monitora serviços"
            echo "  resources   - Monitora recursos do sistema"
            echo "  database    - Monitora banco de dados"
            echo "  redis       - Monitora Redis"
            echo "  application - Monitora aplicação"
            echo "  logs        - Verifica logs de erros"
            echo "  report      - Gera relatório de performance"
            echo "  continuous  - Monitoramento contínuo"
            echo "  help        - Mostra esta mensagem de ajuda"
            echo ""
            echo "Sem comandos, executa monitoramento completo."
            ;;
        *)
            monitor_services
            monitor_resources
            monitor_database
            monitor_redis
            monitor_application
            check_error_logs
            generate_performance_report
            ;;
    esac
}

# Executar função principal
main "$@"
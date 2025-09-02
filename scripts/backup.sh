#!/bin/bash

# Script de Backup e Restauração para o Sistema Médico
# Este script gerencia backups do banco de dados e permite restauração

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
BACKUP_DIR="database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
RETENTION_DAYS=30

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

# Verificar se o diretório de backup existe
check_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Criando diretório de backup: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Fazer backup do banco de dados
backup_database() {
    log_info "Iniciando backup do banco de dados..."
    
    check_backup_dir
    
    # Verificar se Docker está disponível
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log_info "Usando Docker para backup..."
        docker-compose exec -T postgres pg_dump -U postgres sistema_medico > "$BACKUP_FILE"
    elif command -v psql &> /dev/null; then
        log_info "Usando PostgreSQL local para backup..."
        pg_dump -U postgres sistema_medico > "$BACKUP_FILE"
    else
        log_error "Nenhum cliente PostgreSQL encontrado. Instale o PostgreSQL ou use Docker."
        exit 1
    fi
    
    # Comprimir o backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
    
    # Calcular tamanho do backup
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    log_success "Backup concluído: $BACKUP_FILE (Tamanho: $BACKUP_SIZE)"
    
    # Listar backups recentes
    list_backups
}

# Listar backups disponíveis
list_backups() {
    log_info "Backups disponíveis:"
    ls -lh "$BACKUP_DIR"/*.gz | awk '{print $9 ": " $5 " (" $6 " " $7 " " $8 ")"}'
}

# Restaurar backup do banco de dados
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log_error "Por favor, especifique o arquivo de backup para restaurar."
        echo "Uagem: $0 restore <arquivo_backup>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    log_info "Iniciando restauração do backup: $backup_file"
    
    # Confirmar restauração
    read -p "Tem certeza que deseja restaurar o backup? Isso substituirá todos os dados atuais. (s/N): " confirm
    if [[ $confirm != [sS] ]]; then
        log_info "Restauração cancelada."
        exit 0
    fi
    
    # Parar serviços
    log_info "Parando serviços..."
    docker-compose down
    
    # Restaurar backup
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log_info "Usando Docker para restauração..."
        docker-compose up -d postgres
        sleep 10
        docker-compose exec -T postgres psql -U postgres sistema_medico < <(gunzip -c "$backup_file")
    elif command -v psql &> /dev/null; then
        log_info "Usando PostgreSQL local para restauração..."
        gunzip -c "$backup_file" | psql -U postgres sistema_medico
    else
        log_error "Nenhum cliente PostgreSQL encontrado. Instale o PostgreSQL ou use Docker."
        exit 1
    fi
    
    # Rodar migrações
    log_info "Rodando migrações..."
    docker-compose exec backend npm run migrate
    
    # Iniciar serviços
    log_info "Iniciando serviços..."
    docker-compose up -d
    
    log_success "Restauração concluída com sucesso!"
}

# Agendar backups automáticos
schedule_backup() {
    local frequency="$1"
    
    if [ -z "$frequency" ]; then
        log_error "Por favor, especifique a frequência do backup."
        echo "Uagem: $0 schedule <diario|semanal|mensal>"
        exit 1
    fi
    
    case $frequency in
        "diario")
            cron_expression="0 2 * * *"  # Todos os dias às 2h da manhã
            ;;
        "semanal")
            cron_expression="0 2 * * 0"  # Todos os domingos às 2h da manhã
            ;;
        "mensal")
            cron_expression="0 2 1 * *"  # No primeiro dia do mês às 2h da manhã
            ;;
        *)
            log_error "Frequência inválida. Use: diario|semanal|mensal"
            exit 1
            ;;
    esac
    
    # Criar script de backup
    cat > "$BACKUP_DIR/backup_$frequency.sh" << EOF
#!/bin/bash
$(realpath "$0") backup
EOF
    
    chmod +x "$BACKUP_DIR/backup_$frequency.sh"
    
    # Adicionar ao cron
    (crontab -l 2>/dev/null; echo "$cron_expression $(realpath "$BACKUP_DIR/backup_$frequency.sh")") | crontab -
    
    log_success "Backup agendado para $frequency com sucesso!"
    log_info "Cron job adicionado: $cron_expression"
}

# Limpar backups antigos
clean_old_backups() {
    log_info "Limpando backups antigos (retenção: $RETENTION_DAYS dias)..."
    
    find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
    
    log_success "Limpeza concluída."
}

# Verificar integridade dos backups
verify_backups() {
    log_info "Verificando integridade dos backups..."
    
    local backup_count=0
    local valid_count=0
    
    for backup_file in "$BACKUP_DIR"/*.gz; do
        if [ -f "$backup_file" ]; then
            backup_count=$((backup_count + 1))
            
            # Tentar descomprimir e verificar formato
            if gunzip -t "$backup_file" 2>/dev/null; then
                valid_count=$((valid_count + 1))
                log_info "✓ $backup_file: Válido"
            else
                log_error "✗ $backup_file: Inválido ou corrompido"
            fi
        fi
    done
    
    log_info "Backups verificados: $valid_count/$backup_count válidos"
    
    if [ $valid_count -eq $backup_count ]; then
        log_success "Todos os backups estão íntegros."
    else
        log_warning "Alguns backups podem estar corrompidos."
    fi
}

# Exportar backup para S3
export_to_s3() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log_error "Por favor, especifique o arquivo de backup para exportar."
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    # Verificar se AWS CLI está instalado
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI não encontrado. Instale a AWS CLI para exportar para S3."
        exit 1
    fi
    
    # Verificar se as credenciais estão configuradas
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "Credenciais da AWS não configuradas. Configure as credenciais da AWS."
        exit 1
    fi
    
    log_info "Exportando backup para S3..."
    
    # Exportar para S3
    aws s3 cp "$backup_file" "s3://$S3_BUCKET_NAME/backups/$(basename "$backup_file")"
    
    log_success "Backup exportado para S3 com sucesso!"
}

# Função principal
main() {
    log_info "Sistema de Backup e Restauração do Sistema Médico"
    
    # Verificar se o diretório de backup existe
    check_backup_dir
    
    case "${1:-}" in
        "backup")
            backup_database
            ;;
        "list")
            list_backups
            ;;
        "restore")
            restore_database "$2"
            ;;
        "schedule")
            schedule_backup "$2"
            ;;
        "clean")
            clean_old_backups
            ;;
        "verify")
            verify_backups
            ;;
        "export")
            export_to_s3 "$2"
            ;;
        "help"|"-h"|"--help")
            echo "Uagem: $0 [comando] [opções]"
            echo ""
            echo "Comandos:"
            echo "  backup      - Cria um backup do banco de dados"
            echo "  list        - Lista todos os backups disponíveis"
            echo "  restore     - Restaura um backup específico"
            echo "  schedule    - Agenda backups automáticos"
            echo "  clean       - Limpa backups antigos"
            echo "  verify      - Verifica integridade dos backups"
            echo "  export      - Exporta backup para S3"
            echo "  help        - Mostra esta mensagem de ajuda"
            echo ""
            echo "Exemplos:"
            echo "  $0 backup"
            echo "  $0 restore backup_20231201_120000.sql.gz"
            echo "  $0 schedule diario"
            echo "  $0 export backup_20231201_120000.sql.gz"
            ;;
        *)
            backup_database
            ;;
    esac
}

# Executar função principal
main "$@"
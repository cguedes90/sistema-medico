#!/bin/bash

# Script de Testes para o Sistema Médico
# Este script executa testes automatizados da aplicação

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

# Verificar se estamos no diretório correto
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        log_error "Por favor, execute este script do diretório raiz do projeto."
        exit 1
    fi
}

# Instalar dependências de teste
install_test_dependencies() {
    log_info "Instalando dependências de teste..."
    
    # Backend
    cd backend
    npm install --only=dev
    cd ..
    
    # Frontend
    cd frontend
    npm install --only=dev
    cd ..
    
    log_success "Dependências de teste instaladas."
}

# Rodar testes unitários do backend
test_backend_unit() {
    log_info "Rodando testes unitários do backend..."
    
    cd backend
    npm run test
    cd ..
    
    log_success "Testes unitários do backend concluídos."
}

# Rodar testes de integração do backend
test_backend_integration() {
    log_info "Rodando testes de integração do backend..."
    
    # Iniciar serviços de teste
    docker-compose up -d postgres redis
    
    # Aguardar serviços estarem prontos
    sleep 10
    
    cd backend
    npm run test:integration
    cd ..
    
    log_success "Testes de integração do backend concluídos."
}

# Rodar testes de API
test_backend_api() {
    log_info "Rodando testes de API..."
    
    cd backend
    npm run test:api
    cd ..
    
    log_success "Testes de API concluídos."
}

# Rodar testes do frontend
test_frontend() {
    log_info "Rodando testes do frontend..."
    
    cd frontend
    npm test
    cd ..
    
    log_success "Testes do frontend concluídos."
}

# Rodar testes de ponta a ponta (E2E)
test_e2e() {
    log_info "Rodando testes de ponta a ponta (E2E)..."
    
    # Iniciar todos os serviços
    docker-compose up -d
    
    # Aguardar serviços estarem prontos
    sleep 30
    
    # Rodar testes E2E
    cd frontend
    npm run test:e2e
    cd ..
    
    log_success "Testes E2E concluídos."
}

# Rodar testes de carga
test_performance() {
    log_info "Rodando testes de performance..."
    
    cd backend
    npm run test:load
    cd ..
    
    log_success "Testes de performance concluídos."
}

# Gerar relatório de cobertura
generate_coverage() {
    log_info "Gerando relatório de cobertura..."
    
    # Backend
    cd backend
    npm run test:coverage
    cd ..
    
    # Frontend
    cd frontend
    npm run test:coverage
    cd ..
    
    log_success "Relatório de cobertura gerado."
}

# Analisar segurança
security_scan() {
    log_info "Realizando análise de segurança..."
    
    # Backend
    cd backend
    npm audit
    cd ..
    
    # Frontend
    cd frontend
    npm audit
    cd ..
    
    log_success "Análise de segurança concluída."
}

# Validar código
lint_code() {
    log_info "Validando código com ESLint..."
    
    # Backend
    cd backend
    npm run lint
    cd ..
    
    # Frontend
    cd frontend
    npm run lint
    cd ..
    
    log_success "Validação de código concluída."
}

# Formatar código
format_code() {
    log_info "Formatando código..."
    
    # Backend
    cd backend
    npm run format
    cd ..
    
    # Frontend
    cd frontend
    npm run format
    cd ..
    
    log_success "Formatação de código concluída."
}

# Rodar todos os testes
run_all_tests() {
    log_info "Rodando todos os testes..."
    
    lint_code
    format_code
    test_backend_unit
    test_backend_integration
    test_backend_api
    test_frontend
    test_e2e
    test_performance
    generate_coverage
    security_scan
    
    log_success "Todos os testes concluídos!"
}

# Função principal
main() {
    log_info "Iniciando processo de testes..."
    
    check_directory
    
    case "${1:-}" in
        "install")
            install_test_dependencies
            ;;
        "unit")
            test_backend_unit
            test_frontend
            ;;
        "integration")
            test_backend_integration
            ;;
        "api")
            test_backend_api
            ;;
        "e2e")
            test_e2e
            ;;
        "performance")
            test_performance
            ;;
        "coverage")
            generate_coverage
            ;;
        "security")
            security_scan
            ;;
        "lint")
            lint_code
            ;;
        "format")
            format_code
            ;;
        "all")
            run_all_tests
            ;;
        "help"|"-h"|"--help")
            echo "Uagem: $0 [comando]"
            echo ""
            echo "Comandos:"
            echo "  install     - Instala dependências de teste"
            echo "  unit        - Roda testes unitários"
            echo "  integration - Roda testes de integração"
            echo "  api         - Roda testes de API"
            echo "  e2e         - Roda testes de ponta a ponta"
            echo "  performance - Roda testes de performance"
            echo "  coverage    - Gera relatório de cobertura"
            echo "  security    - Realiza análise de segurança"
            echo "  lint        - Valida código com ESLint"
            echo "  format      - Formata código"
            echo "  all         - Roda todos os testes"
            echo "  help        - Mostra esta mensagem de ajuda"
            echo ""
            echo "Sem comandos, executa todos os testes."
            ;;
        *)
            run_all_tests
            ;;
    esac
}

# Executar função principal
main "$@"
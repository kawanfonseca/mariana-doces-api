#!/bin/bash

# Scripts auxiliares para desenvolvimento com Supabase
# Execute: chmod +x scripts/supabase-helpers.sh

echo "🚀 Mariana Doces API - Supabase Helpers"
echo "======================================"

# Função para testar conexão
test_connection() {
    echo "🔍 Testando conexão com Supabase..."
    npm run db:test
}

# Função para executar migrações
run_migrations() {
    echo "📊 Executando migrações do Prisma..."
    npx prisma migrate dev --name init
    npx prisma generate
}

# Função para popular banco com dados iniciais
seed_database() {
    echo "🌱 Populando banco com dados iniciais..."
    npm run prisma:seed
}

# Função para reset completo do banco
reset_database() {
    echo "⚠️  ATENÇÃO: Isso irá apagar todos os dados!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Resetando banco de dados..."
        npx prisma migrate reset --force
    else
        echo "❌ Operação cancelada."
    fi
}

# Função para abrir Prisma Studio
open_studio() {
    echo "🎨 Abrindo Prisma Studio..."
    npm run prisma:studio
}

# Função para deploy em produção
deploy_production() {
    echo "🚀 Deploy das migrações em produção..."
    echo "⚠️  Certifique-se de que DATABASE_URL aponta para produção!"
    read -p "Continuar? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma migrate deploy
        npx prisma generate
        echo "✅ Deploy concluído!"
    else
        echo "❌ Deploy cancelado."
    fi
}

# Menu principal
case "$1" in
    "test")
        test_connection
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        seed_database
        ;;
    "reset")
        reset_database
        ;;
    "studio")
        open_studio
        ;;
    "deploy")
        deploy_production
        ;;
    "setup")
        echo "🔧 Setup completo do banco..."
        test_connection
        run_migrations
        seed_database
        echo "✅ Setup concluído!"
        ;;
    *)
        echo "Uso: ./scripts/supabase-helpers.sh [comando]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  test     - Testar conexão com Supabase"
        echo "  migrate  - Executar migrações"
        echo "  seed     - Popular banco com dados iniciais"
        echo "  reset    - Reset completo do banco (CUIDADO!)"
        echo "  studio   - Abrir Prisma Studio"
        echo "  deploy   - Deploy em produção"
        echo "  setup    - Setup completo (test + migrate + seed)"
        echo ""
        echo "Exemplo: ./scripts/supabase-helpers.sh setup"
        ;;
esac

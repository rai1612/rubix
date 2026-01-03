#!/bin/bash

# Production Database Management Script for rubiX
# Usage: ./scripts/manage-algorithms.sh [load|reload|count|clear|init]
# Designed for scalable loading of large datasets

set -e

POSTGRES_CONTAINER=$(docker ps | grep postgres | awk '{print $1}')

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo "❌ Error: PostgreSQL container not found. Is it running?"
    exit 1
fi

case "${1:-help}" in
    "load")
        echo "🚀 Loading algorithms..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/load-algorithms.sql
        echo "✅ Algorithm loading complete!"
        ;;
    "reload")
        echo "🔄 Reloading algorithms (clearing existing)..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix -c "DELETE FROM algorithms WHERE is_public = true;"
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/load-algorithms.sql
        echo "✅ Algorithm reload complete!"
        ;;
    "count")
        echo "📊 Algorithm Statistics:"
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix -c "
            SELECT 
                algorithm_set,
                COUNT(*) as count,
                ROUND(AVG(difficulty), 1) as avg_difficulty,
                COUNT(*) FILTER (WHERE is_favorite = true) as favorites
            FROM algorithms 
            WHERE is_public = true 
            GROUP BY algorithm_set 
            ORDER BY algorithm_set;
        "
        echo ""
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix -c "
            SELECT COUNT(*) || ' total public algorithms' as summary 
            FROM algorithms WHERE is_public = true;
        "
        echo ""
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix -c "
            SELECT COUNT(*) || ' total users' as users 
            FROM users;
        "
        ;;
    "users")
        echo "👤 Managing demo user..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < backend/src/main/resources/db/data_minimal.sql
        echo "✅ Demo user management complete!"
        ;;
    "load-users-basic")
        echo "👥 Loading basic users (demo only)..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < backend/src/main/resources/db/data_minimal.sql
        echo "✅ Basic users loaded!"
        ;;
    "load-users-test")
        echo "🧪 Loading test users (demo + test accounts)..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/user-data.sql
        echo "✅ Test users loaded!"
        ;;
    "load-users-all")
        echo "🏆 Loading all users (demo + test + speedcuber personas)..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/user-data.sql
        echo "✅ All users loaded!"
        ;;
    "init")
        echo "🚀 Initializing fresh rubiX database..."
        echo "📋 Step 1: Loading demo user..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < backend/src/main/resources/db/data_minimal.sql
        echo "📋 Step 2: Loading algorithms..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/load-algorithms.sql
        echo "📊 Final status:"
        ./scripts/manage-algorithms.sh count
        echo "✅ Database initialization complete!"
        ;;
    "load-full")
        echo "📚 Loading COMPLETE algorithm dataset..."
        echo "Will load: ALL categories - OLL, PLL, F2L, Cross, ZBLL, COLL, WV (~50+ algorithms)"
        echo "💡 Note: Only adds algorithms that don't already exist (duplicate-safe)"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/load-full-algorithms.sql
            echo "✅ Complete algorithm dataset loaded!"
            ./scripts/manage-algorithms.sh count
        else
            echo "❌ Operation cancelled"
        fi
        ;;
    "load-basic")
        echo "📖 Loading BASIC algorithms..."
        echo "Will load: Essential OLL, PLL, F2L, Cross (~20 algorithms)"
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/load-basic-algorithms.sql
        echo "✅ Basic algorithms loaded!"
        ./scripts/manage-algorithms.sh count
        ;;
    "load-advanced")
        echo "🎯 Loading ADVANCED algorithms only..."
        echo "Will load: Advanced OLL, PLL, F2L, Cross (~40 algorithms)"
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/load-advanced-algorithms.sql
        echo "✅ Advanced algorithms loaded!"
        ./scripts/manage-algorithms.sh count
        ;;
    "load-expert")
        echo "🔥 Loading EXPERT level algorithms..."
        echo "Will load: ZBLL, COLL, Winter Variation (~25 algorithms)"
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix < scripts/load-expert-algorithms.sql
        echo "✅ Expert algorithms loaded!"
        ./scripts/manage-algorithms.sh count
        ;;
    "clear")
        echo "🗑️  Clearing all public algorithms..."
        docker exec -i $POSTGRES_CONTAINER psql -U rubix -d rubix -c "DELETE FROM algorithms WHERE is_public = true;"
        echo "✅ All public algorithms cleared!"
        ;;
    "help"|*)
        echo "rubiX Production Database Management"
        echo ""
        echo "🔧 PRODUCTION READY: Handles large datasets efficiently"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "📋 BASIC COMMANDS:"
        echo "  init       - Initialize fresh database (users + starter algorithms)"
        echo "  load       - Load starter algorithms (24 curated algorithms)"
        echo "  reload     - Clear and reload all algorithms"
        echo "  count      - Show algorithm and user statistics"
        echo "  users      - Ensure demo user exists (duplicate-safe)"
        echo "  clear      - Remove all public algorithms"
        echo ""
        echo "📚 ALGORITHM LOADING (Choose your level):"
        echo "  load-basic    - Load BASIC algorithms (~20 algorithms)"
        echo "                  ✓ Essential OLL, PLL, F2L, Cross"
        echo "  load-advanced - Load ADVANCED algorithms (~40 algorithms)"  
        echo "                  ✓ Advanced OLL, PLL, F2L, Cross techniques"
        echo "  load-expert   - Load EXPERT algorithms (~25 algorithms)"
        echo "                  ✓ ZBLL, COLL, Winter Variation only"
        echo "  load-full     - Load COMPLETE dataset (100+ algorithms)"
        echo "                  ✓ Everything from all categories"
        echo ""
        echo "👥 USER MANAGEMENT (Control test data):"
        echo "  load-users-basic - Load demo user only"
        echo "  load-users-test  - Load demo + test users (dev/testing)"
        echo "  load-users-all   - Load demo + test + speedcuber personas"
        echo ""
        echo "🚀 QUICK START:"
        echo "  First time: ./scripts/manage-algorithms.sh init"
        echo "  More algs:  ./scripts/manage-algorithms.sh load-basic"
        echo "  Expert:     ./scripts/manage-algorithms.sh load-full"
        echo ""
        ;;
esac

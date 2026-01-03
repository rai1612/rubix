#!/bin/bash

# rubiX Database Management Script
# Consolidated management of database seeds and migrations
# Usage: ./scripts/manage-db.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Find PostgreSQL container
POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "${RED}Error: PostgreSQL container not found. Is Docker running?${NC}"
    exit 1
fi

# Database connection details
DB_USER="rubix"
DB_NAME="rubix"

# Execute SQL file
exec_sql_file() {
    docker exec -i "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$1"
}

# Execute SQL command
exec_sql() {
    docker exec -i "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "$1"
}

case "${1:-help}" in
    "setup")
        echo -e "${BLUE}Complete database setup (schema + all seed data)...${NC}"
        echo ""
        echo -e "${YELLOW}[1/7] Creating schema...${NC}"
        exec_sql_file scripts/db/schema/001_initial_schema.sql
        echo -e "${YELLOW}[2/7] Loading demo users...${NC}"
        exec_sql_file scripts/db/seeds/users/demo_users.sql
        echo -e "${YELLOW}[3/7] Loading OLL algorithms (57 cases)...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/oll_complete.sql
        echo -e "${YELLOW}[4/7] Loading PLL algorithms (21 cases)...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/pll_complete.sql
        echo -e "${YELLOW}[5/7] Loading F2L and CROSS algorithms...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/f2l_algorithms.sql
        echo -e "${YELLOW}[6/7] Loading advanced algorithms...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/advanced_sets.sql
        echo ""
        echo -e "${GREEN}Complete database setup done!${NC}"
        $0 status
        ;;

    "schema")
        echo -e "${BLUE}Creating database schema...${NC}"
        exec_sql_file scripts/db/schema/001_initial_schema.sql
        echo -e "${GREEN}Schema created!${NC}"
        ;;

    "init")
        echo -e "${BLUE}Loading all seed data (assumes schema exists)...${NC}"
        echo ""
        # Run files in same order as docker-entrypoint-initdb.d
        echo -e "${YELLOW}[1/5] Loading demo users...${NC}"
        exec_sql_file scripts/db/seeds/users/demo_users.sql
        echo -e "${YELLOW}[2/5] Loading OLL algorithms (57 cases)...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/oll_complete.sql
        echo -e "${YELLOW}[3/5] Loading PLL algorithms (21 cases)...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/pll_complete.sql
        echo -e "${YELLOW}[4/5] Loading F2L and CROSS algorithms...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/f2l_algorithms.sql
        echo -e "${YELLOW}[5/5] Loading advanced algorithms...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/advanced_sets.sql
        echo ""
        echo -e "${GREEN}Seed data loaded!${NC}"
        $0 status
        ;;

    "seed-users")
        echo -e "${BLUE}Loading user seed data...${NC}"
        exec_sql_file scripts/db/seeds/users/demo_users.sql
        echo -e "${GREEN}User seed data loaded!${NC}"
        ;;

    "seed-algorithms")
        echo -e "${BLUE}Loading all algorithm seed data...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/oll_complete.sql
        exec_sql_file scripts/db/seeds/algorithms/pll_complete.sql
        exec_sql_file scripts/db/seeds/algorithms/f2l_algorithms.sql
        exec_sql_file scripts/db/seeds/algorithms/advanced_sets.sql
        echo -e "${GREEN}Algorithm seed data loaded!${NC}"
        ;;

    "seed-oll")
        echo -e "${BLUE}Loading OLL algorithms (57 cases)...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/oll_complete.sql
        echo -e "${GREEN}OLL algorithms loaded!${NC}"
        ;;

    "seed-pll")
        echo -e "${BLUE}Loading PLL algorithms (21 cases)...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/pll_complete.sql
        echo -e "${GREEN}PLL algorithms loaded!${NC}"
        ;;

    "seed-f2l")
        echo -e "${BLUE}Loading F2L and CROSS algorithms...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/f2l_algorithms.sql
        echo -e "${GREEN}F2L and CROSS algorithms loaded!${NC}"
        ;;

    "seed-advanced")
        echo -e "${BLUE}Loading advanced algorithms (ZBLL, COLL, WV)...${NC}"
        exec_sql_file scripts/db/seeds/algorithms/advanced_sets.sql
        echo -e "${GREEN}Advanced algorithms loaded!${NC}"
        ;;

    "status")
        echo -e "${BLUE}Database Status:${NC}"
        echo ""
        exec_sql "
            SELECT 'Users' as entity, COUNT(*) as count FROM users
            UNION ALL
            SELECT 'Algorithms (Total)', COUNT(*) FROM algorithms WHERE is_public = true
            UNION ALL
            SELECT algorithm_set::text, COUNT(*) FROM algorithms 
            WHERE is_public = true GROUP BY algorithm_set
            ORDER BY entity;
        "
        ;;

    "validate")
        echo -e "${BLUE}Validating database data...${NC}"
        echo ""
        echo -e "${YELLOW}Expected algorithm counts:${NC}"
        echo "  OLL: 57 cases"
        echo "  PLL: 21 cases"
        echo "  F2L: 25+ cases"
        echo "  CROSS: 8+ cases"
        echo ""
        echo -e "${YELLOW}Current counts:${NC}"
        exec_sql "
            SELECT 
                algorithm_set as set,
                COUNT(*) as count,
                CASE 
                    WHEN algorithm_set = 'OLL' AND COUNT(*) = 57 THEN 'COMPLETE'
                    WHEN algorithm_set = 'PLL' AND COUNT(*) = 21 THEN 'COMPLETE'
                    ELSE 'PARTIAL'
                END as status
            FROM algorithms 
            WHERE is_public = true 
            GROUP BY algorithm_set
            ORDER BY algorithm_set;
        "
        echo ""
        echo -e "${YELLOW}Checking for missing image URLs:${NC}"
        exec_sql "
            SELECT algorithm_set, COUNT(*) as missing_images
            FROM algorithms 
            WHERE is_public = true AND image_url IS NULL
            GROUP BY algorithm_set
            ORDER BY algorithm_set;
        "
        ;;

    "reset")
        echo -e "${YELLOW}This will delete ALL algorithms and reload seed data.${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Clearing algorithms...${NC}"
            exec_sql "DELETE FROM algorithms WHERE is_public = true;"
            echo -e "${BLUE}Reloading seed data...${NC}"
            # Run each file individually (same as init command)
            exec_sql_file scripts/db/seeds/users/demo_users.sql
            exec_sql_file scripts/db/seeds/algorithms/oll_complete.sql
            exec_sql_file scripts/db/seeds/algorithms/pll_complete.sql
            exec_sql_file scripts/db/seeds/algorithms/f2l_algorithms.sql
            exec_sql_file scripts/db/seeds/algorithms/advanced_sets.sql
            echo -e "${GREEN}Database reset complete!${NC}"
            $0 status
        else
            echo -e "${YELLOW}Operation cancelled.${NC}"
        fi
        ;;

    "clear-algorithms")
        echo -e "${YELLOW}Clearing all public algorithms...${NC}"
        exec_sql "DELETE FROM algorithms WHERE is_public = true;"
        echo -e "${GREEN}Algorithms cleared!${NC}"
        ;;

    "clear-users")
        echo -e "${YELLOW}Clearing all users except demo_user...${NC}"
        exec_sql "DELETE FROM users WHERE username != 'demo_user';"
        echo -e "${GREEN}Users cleared (demo_user preserved)!${NC}"
        ;;

    # Legacy compatibility commands (redirect to new structure)
    "load")
        echo -e "${YELLOW}Note: 'load' is deprecated. Use 'seed-algorithms' instead.${NC}"
        $0 seed-algorithms
        ;;

    "reload")
        echo -e "${YELLOW}Note: 'reload' is deprecated. Use 'reset' instead.${NC}"
        $0 reset
        ;;

    "count")
        $0 status
        ;;

    "users")
        $0 seed-users
        ;;

    "help"|*)
        echo -e "${BLUE}rubiX Database Management${NC}"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo -e "${YELLOW}INITIALIZATION:${NC}"
        echo "  setup             Complete setup: schema + all seed data"
        echo "  schema            Create/update database schema only"
        echo "  init              Load all seed data (assumes schema exists)"
        echo "  reset             Clear and reload all data (interactive)"
        echo ""
        echo -e "${YELLOW}SEED DATA:${NC}"
        echo "  seed-users        Load demo and test users"
        echo "  seed-algorithms   Load all algorithm sets"
        echo "  seed-oll          Load OLL algorithms (57 cases)"
        echo "  seed-pll          Load PLL algorithms (21 cases)"
        echo "  seed-f2l          Load F2L and CROSS algorithms"
        echo "  seed-advanced     Load advanced sets (ZBLL, COLL, WV)"
        echo ""
        echo -e "${YELLOW}STATUS & VALIDATION:${NC}"
        echo "  status            Show database statistics"
        echo "  validate          Check data completeness"
        echo ""
        echo -e "${YELLOW}CLEANUP:${NC}"
        echo "  clear-algorithms  Remove all public algorithms"
        echo "  clear-users       Remove all users except demo_user"
        echo ""
        echo -e "${GREEN}Quick Start:${NC}"
        echo "  Docker auto-init: Just start container (docker-compose up)"
        echo "  Manual full setup: $0 setup"
        echo "  Reload seed data:  $0 init"
        echo "  Check status:      $0 status"
        echo ""
        echo -e "${BLUE}Note: Docker automatically runs all init scripts on first container start.${NC}"
        echo -e "${BLUE}Use this script to reload/modify data in existing containers.${NC}"
        echo ""
        ;;
esac


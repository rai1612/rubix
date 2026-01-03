# rubiX Database Management Scripts

## Overview

All database initialization happens from `scripts/db/` - this is the **single source of truth** for both:
- **Docker auto-init**: Files are mounted to `docker-entrypoint-initdb.d/` and run on first container start
- **Manual management**: `manage-db.sh` runs the same files in the same order

## Quick Start

```bash
# Docker (automatic): Just start the container
docker compose up -d

# Check database status
./scripts/manage-db.sh status

# Reload seed data (after container exists)
./scripts/manage-db.sh init

# Complete manual setup (schema + data)
./scripts/manage-db.sh setup
```

## Directory Structure

```
scripts/
├── db/                                 # Single source of truth for all DB files
│   ├── schema/
│   │   └── 001_initial_schema.sql     # Database schema (tables, indexes, triggers)
│   ├── seeds/
│   │   ├── algorithms/
│   │   │   ├── oll_complete.sql       # All 57 OLL algorithms
│   │   │   ├── pll_complete.sql       # All 21 PLL algorithms
│   │   │   ├── f2l_algorithms.sql     # F2L and CROSS algorithms
│   │   │   └── advanced_sets.sql      # ZBLL, COLL, WV algorithms
│   │   └── users/
│   │       └── demo_users.sql         # Demo and test user accounts
│   └── migrations/                    # Future schema migrations
├── manage-db.sh                       # Database management script
├── download-algorithm-images.py       # Image download utility
└── README.md                          # This file
```

## How It Works

### Docker Flow (Automatic)

When you run `docker compose up`, PostgreSQL mounts files from `scripts/db/` into `/docker-entrypoint-initdb.d/`:

| Order | Source File | Mounts As |
|-------|-------------|-----------|
| 1 | `schema/001_initial_schema.sql` | `01-schema.sql` |
| 2 | `seeds/users/demo_users.sql` | `02-users.sql` |
| 3 | `seeds/algorithms/oll_complete.sql` | `03-oll.sql` |
| 4 | `seeds/algorithms/pll_complete.sql` | `04-pll.sql` |
| 5 | `seeds/algorithms/f2l_algorithms.sql` | `05-f2l.sql` |
| 6 | `seeds/algorithms/advanced_sets.sql` | `06-advanced.sql` |

These run **once** on first container creation (when the data volume is empty).

### Manual Flow (manage-db.sh)

The `manage-db.sh` script executes the same files in the same order:

```bash
./scripts/manage-db.sh setup  # Runs schema + all seed files
./scripts/manage-db.sh init   # Runs all seed files (assumes schema exists)
```

## Commands

### Initialization

| Command | Description |
|---------|-------------|
| `setup` | Complete setup: schema + all seed data |
| `schema` | Create/update database schema only |
| `init` | Load all seed data (assumes schema exists) |
| `reset` | Clear and reload all data (interactive) |

### Seed Data

| Command | Description |
|---------|-------------|
| `seed-users` | Load demo and test users |
| `seed-algorithms` | Load all algorithm sets |
| `seed-oll` | Load OLL algorithms (57 cases) |
| `seed-pll` | Load PLL algorithms (21 cases) |
| `seed-f2l` | Load F2L and CROSS algorithms |
| `seed-advanced` | Load advanced sets (ZBLL, COLL, WV) |

### Status & Validation

| Command | Description |
|---------|-------------|
| `status` | Show database statistics |
| `validate` | Check data completeness |

### Cleanup

| Command | Description |
|---------|-------------|
| `clear-algorithms` | Remove all public algorithms |
| `clear-users` | Remove users (keeps demo_user) |

## Algorithm Coverage

### Complete Sets (with PNG images)

| Set | Count | Status |
|-----|-------|--------|
| OLL | 57 | Complete |
| PLL | 21 | Complete |

### Partial Sets

| Set | Count | Description |
|-----|-------|-------------|
| F2L | 25 | Core F2L cases |
| CROSS | 8 | Basic cross techniques |
| ZBLL | 6 | Sample cases |
| COLL | 6 | Sample cases |
| WV | 6 | Sample cases |

## Test Users

All test users use password: `demo123`

| Username | Email | Description |
|----------|-------|-------------|
| `demo_user` | demo@rubix.local | Primary test account |
| `beginner_cuber` | beginner@test.local | Beginner skill level |
| `intermediate_cuber` | intermediate@test.local | Intermediate skill level |
| `advanced_cuber` | advanced@test.local | Advanced skill level |
| `expert_cuber` | expert@test.local | Expert/competitor level |
| `onehanded_pro` | onehanded@speedcube.local | One-handed specialist |
| `roux_master` | roux@speedcube.local | Roux method user |
| `bigcube_specialist` | bigcube@speedcube.local | Big cube specialist |

## Key Features

- **Single Source of Truth**: All SQL files in `scripts/db/`
- **Unified Flow**: Docker and manual use the exact same files
- **Idempotent**: All scripts use conditional inserts, safe to run multiple times
- **Complete Coverage**: All 57 OLL and 21 PLL algorithms included
- **Image Support**: Image URLs set for OLL/PLL cases
- **Setup Moves**: Many algorithms include setup moves for visualization
- **Consistent Naming**: Standardized `{SET} {NUMBER} - {Name}` format

## Troubleshooting

### PostgreSQL container not found

Make sure Docker is running and the container is started:

```bash
docker compose up -d postgres
```

### Database already initialized (changes not appearing)

Docker's init scripts only run on first container creation. To reload:

```bash
# Option 1: Use manage-db.sh to reload data
./scripts/manage-db.sh init

# Option 2: Reset entire database
make db-reset
docker compose up -d
```

### Duplicate entries

The scripts are designed to be idempotent. If you get duplicates, clear and reload:

```bash
./scripts/manage-db.sh reset
```

### Missing algorithms

Run the validate command to check:

```bash
./scripts/manage-db.sh validate
```

Then load the missing set:

```bash
./scripts/manage-db.sh seed-oll  # or seed-pll, seed-f2l, etc.
```

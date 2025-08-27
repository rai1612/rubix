# Timer + Scrambler + Save - Core Loop Breakdown

This document breaks down the foundational "Timer + Scrambler + Save" feature into detailed sub-tasks, API specifications, and database schema.

## Overview

The core cubing practice loop:
1. **Generate scramble** → 2. **Start timer** → 3. **Solve cube** → 4. **Stop timer** → 5. **Save solve** → Repeat

## Sub-Tasks Breakdown

### 1. Scramble Generation (`HIGH PRIORITY`)
- **Task 1.1**: Research and integrate 3x3 scrambler library
- **Task 1.2**: Create scramble generation API endpoint
- **Task 1.3**: Implement scramble validation (WCA compliance)
- **Task 1.4**: Add custom scramble support (manual entry)

### 2. Timer Implementation (`HIGH PRIORITY`)
- **Task 2.1**: Build timer UI component (mobile-first)
- **Task 2.2**: Implement inspection timer (15s countdown)
- **Task 2.3**: Add keyboard controls (spacebar start/stop)
- **Task 2.4**: Add touch controls (tap/hold to start/stop)
- **Task 2.5**: Implement timing accuracy (millisecond precision)
- **Task 2.6**: Add penalties system (DNF, +2)

### 3. Solve Persistence (`HIGH PRIORITY`)
- **Task 3.1**: Design solve data model and database schema
- **Task 3.2**: Create save solve API endpoint
- **Task 3.3**: Implement client-side offline storage (IndexedDB)
- **Task 3.4**: Build offline sync mechanism
- **Task 3.5**: Add solve validation (server-side)

### 4. Session Management (`MEDIUM PRIORITY`)
- **Task 4.1**: Design session data model
- **Task 4.2**: Create session CRUD API endpoints
- **Task 4.3**: Implement auto-session creation
- **Task 4.4**: Add manual session management

### 5. Basic Statistics (`MEDIUM PRIORITY`)
- **Task 5.1**: Implement Ao5 calculation
- **Task 5.2**: Implement Ao12 calculation
- **Task 5.3**: Track personal best times
- **Task 5.4**: Create statistics API endpoints

## API Specifications

### 1. Scramble API

#### `GET /api/scrambles/generate`
Generate a new 3x3 scramble.

**Response:**
```json
{
  "id": "uuid",
  "scramble": "R U R' U' R U R' F' R U R' U' R' F R",
  "type": "3x3",
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

#### `POST /api/scrambles/validate`
Validate a scramble string.

**Request:**
```json
{
  "scramble": "R U R' U' R U R' F' R U R' U' R' F R",
  "type": "3x3"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

### 2. Solve API

#### `POST /api/solves`
Save a completed solve.

**Request:**
```json
{
  "scrambleId": "uuid",
  "timeMs": 15420,
  "inspectionTimeMs": 12500,
  "penalty": "NONE", // NONE, PLUS_TWO, DNF
  "solvedAt": "2024-01-15T10:35:00Z",
  "notes": "Good F2L, slow OLL recognition"
}
```

**Response:**
```json
{
  "id": "uuid",
  "scrambleId": "uuid",
  "timeMs": 15420,
  "adjustedTimeMs": 15420,
  "inspectionTimeMs": 12500,
  "penalty": "NONE",
  "solvedAt": "2024-01-15T10:35:00Z",
  "sessionId": "uuid",
  "notes": "Good F2L, slow OLL recognition",
  "createdAt": "2024-01-15T10:35:00Z"
}
```

#### `GET /api/solves`
Get user's solve history with pagination.

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)
- `sessionId`: Filter by session (optional)
- `from`: Date range start (optional)
- `to`: Date range end (optional)

**Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "scramble": "R U R' U' ...",
      "timeMs": 15420,
      "adjustedTimeMs": 15420,
      "penalty": "NONE",
      "solvedAt": "2024-01-15T10:35:00Z",
      "notes": "Good solve"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "first": true,
    "last": false
  }
}
```

### 3. Session API

#### `POST /api/sessions`
Create a new practice session.

**Request:**
```json
{
  "name": "Morning Practice",
  "puzzleType": "3x3"
}
```

#### `GET /api/sessions/current`
Get or create current active session.

**Response:**
```json
{
  "id": "uuid",
  "name": "Morning Practice",
  "puzzleType": "3x3",
  "startedAt": "2024-01-15T10:00:00Z",
  "solveCount": 12,
  "averageTime": 16250,
  "bestTime": 13420,
  "isActive": true
}
```

### 4. Statistics API

#### `GET /api/statistics/summary`
Get current statistics summary.

**Response:**
```json
{
  "totalSolves": 1247,
  "ao5": {
    "average": 15420,
    "solves": [14200, 15600, 15420, 16100, 14800],
    "calculatedAt": "2024-01-15T10:35:00Z"
  },
  "ao12": {
    "average": 15950,
    "solves": [...],
    "calculatedAt": "2024-01-15T10:35:00Z"
  },
  "personalBests": {
    "single": 11240,
    "ao5": 13820,
    "ao12": 14950,
    "ao100": 15890
  },
  "sessionStats": {
    "solveCount": 12,
    "sessionAverage": 16250,
    "sessionBest": 13420
  }
}
```

## Database Schema

### Core Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Scrambles table
CREATE TABLE scrambles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scramble_text VARCHAR(500) NOT NULL,
    puzzle_type VARCHAR(20) NOT NULL DEFAULT '3x3',
    algorithm_moves INTEGER NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_custom BOOLEAN DEFAULT false
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    puzzle_type VARCHAR(20) NOT NULL DEFAULT '3x3',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    solve_count INTEGER DEFAULT 0,
    notes TEXT
);

-- Solves table (main table)
CREATE TABLE solves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    scramble_id UUID NOT NULL REFERENCES scrambles(id) ON DELETE RESTRICT,
    time_ms INTEGER NOT NULL,
    inspection_time_ms INTEGER DEFAULT 0,
    penalty VARCHAR(20) DEFAULT 'NONE', -- NONE, PLUS_TWO, DNF
    adjusted_time_ms INTEGER NOT NULL, -- time_ms + penalty adjustments
    solved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    tags VARCHAR(255)[]
);

-- Indexes for performance
CREATE INDEX idx_solves_user_id_solved_at ON solves(user_id, solved_at DESC);
CREATE INDEX idx_solves_session_id ON solves(session_id);
CREATE INDEX idx_solves_user_time ON solves(user_id, adjusted_time_ms) WHERE penalty != 'DNF';
CREATE INDEX idx_sessions_user_active ON sessions(user_id, is_active);
```

### Statistics Tables (for precomputed averages)

```sql
-- Precomputed statistics for fast queries
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puzzle_type VARCHAR(20) NOT NULL DEFAULT '3x3',
    total_solves INTEGER DEFAULT 0,
    best_single INTEGER,
    best_ao5 INTEGER,
    best_ao12 INTEGER,
    best_ao100 INTEGER,
    current_ao5 INTEGER,
    current_ao12 INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, puzzle_type)
);

-- Rolling averages cache
CREATE TABLE rolling_averages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    average_type VARCHAR(10) NOT NULL, -- 'ao5', 'ao12', 'ao100'
    average_value INTEGER NOT NULL,
    solve_count INTEGER NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_personal_best BOOLEAN DEFAULT false
);

CREATE INDEX idx_rolling_averages_user_type ON rolling_averages(user_id, average_type, calculated_at DESC);
```

## Implementation Priority

### Sprint 2 (Weeks 3-4) Focus:
1. **Week 1**: Scramble generation + Timer UI + Basic save
2. **Week 2**: Offline storage + Sync + Session management + Basic stats

### Key Technical Decisions:
1. **Scrambler Library**: Use `scrambow` (JavaScript) or `TNoodle` (Java port)
2. **Timer Precision**: Use `performance.now()` for microsecond accuracy
3. **Offline Storage**: IndexedDB with Dexie.js wrapper
4. **Real-time Sync**: Background sync on network reconnection
5. **State Management**: Zustand store for timer state

### Success Criteria:
- [ ] User can generate scramble in <100ms
- [ ] Timer accuracy within ±1ms
- [ ] Solves save offline and sync when online
- [ ] Ao5/Ao12 calculations are correct
- [ ] Works on mobile touch and desktop keyboard
- [ ] 99.9% uptime for timer functionality

This breakdown provides a clear roadmap for implementing the core cubing practice loop with proper API design and scalable database architecture.

# Cube Libraries Research & Selection

## Overview
Research and selection of cube-related libraries for scrambling, solving, and 3D visualization to avoid reinventing the wheel and ensure WCA compliance.

## Scrambler Libraries

### 1. JavaScript Libraries

#### `scrambow` (Recommended ⭐)
- **Status**: Active, modern JavaScript library
- **Features**: WCA-compliant scrambles for 3x3, 2x2, 4x4+, pyraminx, megaminx
- **Pros**: TypeScript support, modern API, lightweight, well-maintained
- **Cons**: Smaller community compared to older libraries
- **Installation**: `npm install scrambow`
- **License**: MIT

#### `cubejs` / `cube-js`
- **Status**: Mature library for cube solving and scrambling
- **Features**: Multiple puzzle support, solving algorithms, state representation
- **Pros**: Comprehensive, proven in production
- **Cons**: Larger bundle size, less modern API
- **Installation**: `npm install cube`
- **License**: GPL-3.0

#### `twisty-puzzles`
- **Status**: Modern library from cubing.js ecosystem
- **Features**: WCA scrambles, puzzle definitions, state management
- **Pros**: Very modern, TypeScript-first, comprehensive
- **Cons**: Newer, may have breaking changes
- **Installation**: `npm install cubing`
- **License**: GPL-3.0

### 2. Java Libraries (Backend Options)

#### TNoodle (Official WCA)
- **Status**: Official WCA scrambler used in competitions
- **Features**: All WCA puzzle scrambles, verified algorithms
- **Pros**: Official standard, maximum trust and accuracy
- **Cons**: Complex integration, heavyweight
- **Implementation**: Can run as microservice or embed
- **License**: GPL-3.0

#### Custom Java Port
- **Option**: Port `scrambow` algorithms to Java
- **Pros**: Consistent algorithms between frontend/backend
- **Cons**: Maintenance overhead, potential bugs

## 3D Visualization Libraries

### 1. Three.js Ecosystem (Recommended ⭐)

#### `three.js` + `react-three-fiber`
- **Status**: Industry standard for WebGL in React
- **Features**: Full 3D rendering, animations, interactions
- **Pros**: Mature, extensive community, great performance
- **Cons**: Learning curve, bundle size
- **Installation**: `npm install three @react-three/fiber @react-three/drei`

#### `@react-three/drei`
- **Status**: Helper library for react-three-fiber
- **Features**: Common 3D components, materials, helpers
- **Pros**: Reduces boilerplate, well-maintained
- **Cons**: Additional dependency

### 2. Cube-Specific Visualization

#### `twisty-puzzles` 3D Player
- **Status**: Modern 3D cube player from cubing.js
- **Features**: Built-in cube rendering, animation controls
- **Pros**: Cube-specific, handles algorithms automatically
- **Cons**: Less customizable, newer library

#### Custom Three.js Implementation
- **Approach**: Build cube geometry from scratch
- **Pros**: Full control, optimized for our needs
- **Cons**: Significant development time

## Cube State Representation

### Facelet String Format (Recommended)
```
Standard 54-character representation:
UUU UUU UUU RRR RRR RRR FFF FFF FFF DDD DDD DDD LLL LLL LLL BBB BBB BBB
```
- **Pros**: Standard format, widely supported
- **Cons**: Less intuitive for beginners

### Matrix/Array Format
```javascript
{
  U: [['W','W','W'], ['W','W','W'], ['W','W','W']],
  R: [['R','R','R'], ['R','R','R'], ['R','R','R']],
  // ... other faces
}
```
- **Pros**: Intuitive, easy to work with
- **Cons**: Larger data size, conversion needed

## Selected Libraries & Architecture

### Frontend Stack
```json
{
  "scrambling": "scrambow",
  "3d-visualization": "@react-three/fiber + @react-three/drei",
  "cube-utilities": "cubing (twisty-puzzles)",
  "state-format": "facelet-string"
}
```

### Backend Stack
```xml
<!-- For initial MVP: Use frontend scrambling -->
<!-- Later: Integrate TNoodle as verification service -->
<dependency>
    <groupId>org.worldcubeassociation</groupId>
    <artifactId>tnoodle</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Implementation Plan

### Phase 1: Frontend-Only Scrambling
1. **Use `scrambow`** for client-side scramble generation
2. **Store scrambles** in database as strings for replay
3. **Validate** basic format on backend (length, characters)

### Phase 2: Backend Verification
1. **Add TNoodle** integration for scramble verification
2. **Compare** frontend vs backend scrambles for consistency
3. **Flag** any mismatches for investigation

### Phase 3: Advanced Features
1. **Custom scrambles** support
2. **Algorithm visualization** with 3D player
3. **Multi-puzzle** support

## Library Integration Examples

### Scrambow Integration
```typescript
import { randomScrambleForEvent } from 'scrambow';

// Generate 3x3 scramble
const scramble = randomScrambleForEvent('333');
console.log(scramble); // "R U R' U' R U R' F' R U R' U' R' F R"
```

### Three.js Cube Component
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function CubeVisualizer({ scramble }: { scramble: string }) {
  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <CubeGeometry scramble={scramble} />
      <OrbitControls />
    </Canvas>
  );
}
```

### State Management
```typescript
interface CubeState {
  faceletString: string; // 54-character standard format
  moveHistory: string[]; // Array of moves applied
  isScrambled: boolean;
  isSolved: boolean;
}
```

## Testing Strategy

### Scramble Validation
- **WCA Compliance**: Compare with TNoodle output
- **Randomness**: Statistical analysis of generated scrambles
- **Format**: Validate move notation and syntax

### 3D Visualization
- **Performance**: 60fps on mobile devices
- **Accuracy**: Visual state matches logical state
- **Interactions**: Smooth rotation and animation

### Integration Testing
- **Scramble → State**: Verify scramble applies correctly
- **State → Visual**: Ensure visual matches state
- **Round-trip**: Scramble → apply → serialize → deserialize

## Risk Mitigation

### Scrambler Risks
- **Wrong scrambles**: Use official libraries only
- **Performance**: Profile on mobile devices
- **Consistency**: Validate frontend vs backend

### 3D Visualization Risks
- **Bundle size**: Use code splitting, lazy loading
- **Performance**: Test on low-end devices
- **Browser support**: Progressive enhancement

### Dependencies
- **Breaking changes**: Pin versions, automated testing
- **Maintenance**: Choose actively maintained libraries
- **Licensing**: Ensure GPL compliance where needed

## Success Criteria

- [ ] Generate WCA-compliant 3x3 scrambles in <50ms
- [ ] 3D visualization runs at 60fps on iPhone 12
- [ ] Bundle size for cube libraries <200KB gzipped
- [ ] 100% accuracy compared to TNoodle scrambles
- [ ] Support offline scramble generation
- [ ] Visual state matches logical state 100% of the time

This research provides a solid foundation for implementing reliable, performant cube functionality while leveraging proven open-source libraries.

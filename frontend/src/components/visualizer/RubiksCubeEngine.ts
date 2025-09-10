import * as THREE from 'three';

interface CubieUserData {
  position: [number, number, number];
  originalPosition: [number, number, number];
  colorState: {
    faces: string[];
    history: string[][];
  };
}

export class RubiksCubeEngine {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cubeGroup!: THREE.Group;
  private cubies: THREE.Mesh[] = [];
  private isAnimating = false;
  private animationSpeed = 1;
  private stepMode = false;
  private algorithmQueue: string[] = [];
  private currentStep = 0;
  private moveHistory: string[] = [];
  private isPaused = false;
  private pauseResolver: (() => void) | null = null;
  private animationId: number | null = null;
  private originalColors = new Map<THREE.Mesh, string[]>();
  private isDisposed = false;

  // WCA Standard Colors
  private colors = {
    white: 0xffffff,   // U (Up)
    yellow: 0xffff00,  // D (Down)  
    green: 0x00ff00,   // F (Front)
    blue: 0x0000ff,    // B (Back)
    red: 0xff0000,     // R (Right)
    orange: 0xff8000,  // L (Left)
    black: 0x000000    // Internal faces
  };

  // Face mappings for WCA notation (unused but kept for reference)
  // private faceMap = {
  //   'U': 'white',   // Up
  //   'D': 'yellow',  // Down
  //   'F': 'green',   // Front
  //   'B': 'blue',    // Back
  //   'R': 'red',     // Right
  //   'L': 'orange'   // Left
  // };

  constructor(container: HTMLElement) {
    this.setupScene(container);
    this.createCube();
    this.setupControls();
    this.animate();
  }

  private setupScene(container: HTMLElement): void {
    // Scene
    this.scene = new THREE.Scene();
    // Remove background to make it transparent
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);
    
    // Cube group for rotations
    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);
  }

  private createCube(): void {
    this.cubies = [];
    
    const size = 0.95;
    const gap = 0.05;
    
    // Create 27 individual cubies (3x3x3)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cubie = this.createCubie(x, y, z, size);
          cubie.position.set(
            x * (size + gap),
            y * (size + gap),
            z * (size + gap)
          );
          
          // Position tracking
          const userData: CubieUserData = {
            position: [x, y, z],
            originalPosition: [x, y, z],
            colorState: {
              faces: [],
              history: []
            }
          };
          cubie.userData = userData;

          // Store original colors for reset
          this.storeOriginalColors(cubie);
          
          this.cubeGroup.add(cubie);
          this.cubies.push(cubie);
        }
      }
    }
  }

  private createCubie(x: number, y: number, z: number, size: number): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(size, size, size);
    
    // Face order: right, left, top, bottom, front, back
    const faceColors = [
      x === 1 ? 'red' : 'black',      // Right face
      x === -1 ? 'orange' : 'black',  // Left face  
      y === 1 ? 'white' : 'black',    // Top face
      y === -1 ? 'yellow' : 'black',  // Bottom face
      z === 1 ? 'green' : 'black',    // Front face
      z === -1 ? 'blue' : 'black'     // Back face
    ];

    // Create materials
    const materials = faceColors.map(colorName => {
      const colorHex = this.colors[colorName as keyof typeof this.colors];
      const material = new THREE.MeshLambertMaterial({ color: colorHex });
      material.needsUpdate = true;
      return material;
    });
    
    const cubie = new THREE.Mesh(geometry, materials);
    
    // Add black edges
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    cubie.add(wireframe);

    cubie.castShadow = true;
    cubie.receiveShadow = true;

    // Initialize color state tracking
    const userData = cubie.userData as CubieUserData;
    userData.colorState = {
      faces: [...faceColors],
      history: []
    };
    
    return cubie;
  }

  private storeOriginalColors(cubie: THREE.Mesh): void {
    const userData = cubie.userData as CubieUserData;
    this.originalColors.set(cubie, [...userData.colorState.faces]);
  }

  private setupControls(): void {
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('mousedown', (event) => {
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    
    canvas.addEventListener('mouseup', () => {
      mouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (event) => {
      if (!mouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      // Rotate camera around cube
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(this.camera.position);
      
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    
    // Zoom with mouse wheel
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const distance = this.camera.position.length();
      const newDistance = Math.max(3, Math.min(15, distance + event.deltaY * 0.01));
      this.camera.position.normalize().multiplyScalar(newDistance);
    });
  }

  parseAlgorithm(algorithm: string): string[] {
    const moves: string[] = [];
    const tokens = algorithm.trim().split(/\s+/);
    
    for (const token of tokens) {
      if (token.length === 0) continue;
      
      // Updated pattern to handle both uppercase/lowercase, explicit wide moves, and double prime moves
      const movePattern = /^([FRULBDfrulbd]|[MESmes]|[xyzXYZ])([w]?)(2'|'|2)?$/;
      const match = token.match(movePattern);
      
      if (match) {
        const [, face, wide, modifier] = match;
        let move = face;
        
        // Handle lowercase letters as wide moves (standard cube notation)
        if (/[frulbd]/.test(face)) {
          move = face.toUpperCase() + 'w';
        } else if (/[FRULBD]/.test(face)) {
          // Uppercase letters are regular face moves
          move = face;
          if (wide) move += 'w'; // Explicit wide notation like Rw
        } else {
          // Middle layer moves (M, E, S) and rotations (x, y, z)
          move = face.toUpperCase();
        }
        
        if (modifier) move += modifier;
        
        moves.push(move);
      }
    }
    
    return moves;
  }

  async executeAlgorithm(algorithm: string): Promise<void> {
    if (this.isAnimating) return;
    
    const moves = this.parseAlgorithm(algorithm);
    this.algorithmQueue = moves;
    this.currentStep = 0;
    
    return this.executeAllMoves();
  }

  private async executeAllMoves(): Promise<void> {
    for (let i = 0; i < this.algorithmQueue.length; i++) {
      if (this.isDisposed) break;
      
      // Check for pause before each move
      if (this.isPaused) {
        await this.waitForResume();
        if (this.isDisposed) break;
      }
      
      const move = this.algorithmQueue[i];
      this.currentStep = i + 1; // Update current step for tracking
      await this.executeMove(move);
      
      // Small delay between moves (also check for pause during delay)
      await this.pausableDelay(200);
    }
  }

  private waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isPaused) {
        resolve();
        return;
      }
      this.pauseResolver = resolve;
    });
  }

  private async pausableDelay(ms: number): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < ms) {
      if (this.isPaused) {
        await this.waitForResume();
        if (this.isDisposed) break;
      }
      if (this.isDisposed) break;
      await this.delay(10); // Small incremental delay
    }
  }

  private executeMove(move: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.isDisposed) {
        resolve();
        return;
      }
      
      // If already animating, wait a bit and try again (unless we're disposed)
      if (this.isAnimating) {
        setTimeout(() => {
          if (!this.isDisposed) {
            this.executeMove(move).then(resolve);
          } else {
            resolve();
          }
        }, 50);
        return;
      }
      
      this.isAnimating = true;
      
      // Parse move
      const movePattern = /^([FRULBDfrulbd]|[MESmes]|[xyzXYZ])([w]?)(2'|'|2)?$/;
      const match = move.match(movePattern);
      
      if (!match) {
        this.isAnimating = false;
        resolve();
        return;
      }
      
      const [, face, wide, modifier] = match;
      const normalizedFace = face.toLowerCase().replace('w', '');
      
      let angle = Math.PI / 2; // 90 degrees base (clockwise)
      
      // WCA standard rotation directions (when looking at the face directly)
      // Positive angle = clockwise, Negative angle = counterclockwise
      switch (normalizedFace) {
        case 'r':
          // R move: clockwise when looking at right face
          angle = -angle; // Negative (clockwise from right face view)
          break;
        case 'l':
          // L move: clockwise when looking at left face (appears counterclockwise from front view)
          angle = angle; // Positive (counterclockwise from front view)
          break;
        case 'u':
          // U move: clockwise when looking at top face
          angle = -angle; // Negative (clockwise from top view)
          break;
        case 'd':
          // D move: clockwise when looking at bottom face (appears counterclockwise from front view)
          angle = angle; // Positive (counterclockwise from front view)
          break;
        case 'f':
          // F move: clockwise when looking at front face
          angle = -angle; // Negative (clockwise from front view)
          break;
        case 'b':
          // B move: clockwise when looking at back face (appears counterclockwise from front view)
          angle = angle; // Positive (counterclockwise from front view)
          break;
        case 'm':
          // M move: same direction as L
          angle = angle;
          break;
        case 'e':
          // E move: same direction as D
          angle = angle;
          break;
        case 's':
          // S move: same direction as F
          angle = -angle;
          break;
        case 'x':
          // x rotation: same direction as R
          angle = -angle;
          break;
        case 'y':
          // y rotation: same direction as U
          angle = -angle;
          break;
        case 'z':
          // z rotation: same direction as F
          angle = -angle;
          break;
      }
      
      // Apply modifiers consistently
      if (modifier === "'") {
        // Prime moves: reverse the direction
        angle = -angle;
      } else if (modifier === "2") {
        // Double moves: 180° in the same direction as base move
        angle = angle > 0 ? Math.PI : -Math.PI;
      } else if (modifier === "2'") {
        // Double prime moves: 180° in opposite direction of base move
        angle = angle > 0 ? -Math.PI : Math.PI;
      }
      
      const cubiesToRotate = this.getCubiesForFace(face, wide);
      const axis = this.getRotationAxis(face);
      
      this.animateRotation(cubiesToRotate, axis, angle, () => {
        this.updateCubiePositions(cubiesToRotate);
        this.isAnimating = false;
        resolve();
      });
    });
  }

  private getCubiesForFace(face: string, wide?: string): THREE.Mesh[] {
    const cubies: THREE.Mesh[] = [];
    const normalizedFace = face.toLowerCase();
    
    for (const cubie of this.cubies) {
      const userData = cubie.userData as CubieUserData;
      const pos = userData.position;
      let shouldInclude = false;
      
      const [x, y, z] = pos;
      
      switch (normalizedFace) {
        case 'f':
          shouldInclude = z === 1 || (!!wide && z === 0);
          break;
        case 'b':
          shouldInclude = z === -1 || (!!wide && z === 0);
          break;
        case 'r':
          shouldInclude = x === 1 || (!!wide && x === 0);
          break;
        case 'l':
          shouldInclude = x === -1 || (!!wide && x === 0);
          break;
        case 'u':
          shouldInclude = y === 1 || (!!wide && y === 0);
          break;
        case 'd':
          shouldInclude = y === -1 || (!!wide && y === 0);
          break;
        case 'm':
          shouldInclude = x === 0;
          break;
        case 'e':
          shouldInclude = y === 0;
          break;
        case 's':
          shouldInclude = z === 0;
          break;
        case 'x':
        case 'y':
        case 'z':
          shouldInclude = true;
          break;
      }
      
      if (shouldInclude) {
        cubies.push(cubie);
      }
    }
    
    return cubies;
  }

  private getRotationAxis(face: string): THREE.Vector3 {
    const normalizedFace = face.toLowerCase();
    switch (normalizedFace) {
      case 'f':
      case 'b':
      case 's':
      case 'z':
        return new THREE.Vector3(0, 0, 1);
      case 'r':
      case 'l':
      case 'm':
      case 'x':
        return new THREE.Vector3(1, 0, 0);
      case 'u':
      case 'd':
      case 'e':
      case 'y':
        return new THREE.Vector3(0, 1, 0);
      default:
        return new THREE.Vector3(0, 1, 0);
    }
  }

  private animateRotation(
    cubies: THREE.Mesh[], 
    axis: THREE.Vector3, 
    angle: number, 
    callback: () => void
  ): void {
    const duration = 500 / this.animationSpeed;
    const startTime = Date.now();
    
    const rotationGroup = new THREE.Group();
    this.scene.add(rotationGroup);
    
    // Move cubies to rotation group
    cubies.forEach(cubie => {
      if (cubie.parent === this.cubeGroup) {
        this.cubeGroup.remove(cubie);
      }
      rotationGroup.add(cubie);
    });
    
    const animate = () => {
      if (this.isDisposed) {
        callback();
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Apply rotation
      rotationGroup.setRotationFromAxisAngle(axis, angle * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationAxis(axis, angle);
        
        cubies.forEach(cubie => {
          const worldPosition = new THREE.Vector3();
          const worldQuaternion = new THREE.Quaternion();
          const worldScale = new THREE.Vector3();
          
          cubie.getWorldPosition(worldPosition);
          cubie.getWorldQuaternion(worldQuaternion);
          cubie.getWorldScale(worldScale);
          
          rotationGroup.remove(cubie);
          
          cubie.position.copy(worldPosition);
          cubie.quaternion.copy(worldQuaternion);
          cubie.scale.copy(worldScale);
          
          this.cubeGroup.add(cubie);
        });
        
        this.scene.remove(rotationGroup);
        callback();
      }
    };
    
    animate();
  }

  private updateCubiePositions(
    cubies: THREE.Mesh[]
  ): void {
    const size = 0.95 + 0.05; // size + gap
    
    cubies.forEach(cubie => {
      const worldPos = cubie.position;
      
      // Round to nearest grid position
      const newX = Math.round(worldPos.x / size);
      const newY = Math.round(worldPos.y / size);
      const newZ = Math.round(worldPos.z / size);
      
      // Clamp to valid range
      const clampedX = Math.max(-1, Math.min(1, newX));
      const clampedY = Math.max(-1, Math.min(1, newY));
      const clampedZ = Math.max(-1, Math.min(1, newZ));
      
      // Update logical position
      const userData = cubie.userData as CubieUserData;
      userData.position = [clampedX, clampedY, clampedZ];
      
      // Snap to exact grid position
      cubie.position.set(
        clampedX * size,
        clampedY * size,
        clampedZ * size
      );
    });
  }

  resetCube(): void {
    // Force stop any ongoing animations
    this.isAnimating = false;
    
    // Cancel any pending animation frames - but don't cancel the main animation loop
    // (We need to keep the main render loop running)
    
    // Clear all algorithm queues and step mode
    this.algorithmQueue = [];
    this.currentStep = 0;
    this.moveHistory = [];
    this.stepMode = false;
    
    // Clear pause state
    this.isPaused = false;
    if (this.pauseResolver) {
      this.pauseResolver();
      this.pauseResolver = null;
    }
    
    // Remove any temporary rotation groups that might be left over
    const rotationGroups = this.scene.children.filter(child => 
      child instanceof THREE.Group && child !== this.cubeGroup
    );
    rotationGroups.forEach(group => {
      // Move any cubies back to main group before removing
      const cubiesInGroup = group.children.filter(child => 
        this.cubies.includes(child as THREE.Mesh)
      );
      cubiesInGroup.forEach(cubie => {
        group.remove(cubie);
        this.cubeGroup.add(cubie);
      });
      this.scene.remove(group);
    });
    
    // Ensure all cubies are in the main cube group
    this.cubies.forEach(cubie => {
      if (cubie.parent !== this.cubeGroup) {
        if (cubie.parent) {
          cubie.parent.remove(cubie);
        }
        this.cubeGroup.add(cubie);
      }
    });
    
    // Reset each cubie to original state
    this.cubies.forEach(cubie => {
      const userData = cubie.userData as CubieUserData;
      
      // Reset position
      userData.position = [...userData.originalPosition];
      const size = 0.95;
      const gap = 0.05;
      cubie.position.set(
        userData.originalPosition[0] * (size + gap),
        userData.originalPosition[1] * (size + gap),
        userData.originalPosition[2] * (size + gap)
      );

      // Reset orientation completely
      cubie.quaternion.set(0, 0, 0, 1);
      cubie.rotation.set(0, 0, 0);
      cubie.scale.set(1, 1, 1);
      
      // Reset matrix to identity
      cubie.matrix.identity();
      cubie.matrixAutoUpdate = true;
      cubie.updateMatrix();
      
      // Reset colors to original
      const originalColors = this.originalColors.get(cubie);
      if (originalColors && cubie.material && Array.isArray(cubie.material)) {
        userData.colorState.faces = [...originalColors];
        userData.colorState.history = [];
        
        // Update visual materials
        originalColors.forEach((colorName, index) => {
          const colorHex = this.colors[colorName as keyof typeof this.colors];
          if (cubie.material && Array.isArray(cubie.material) && cubie.material[index]) {
            const material = cubie.material[index] as THREE.MeshLambertMaterial;
            if (material.color) {
              material.color.setHex(colorHex);
              material.needsUpdate = true;
            }
          }
        });
      }
    });
    
    // Force render update
    this.renderer.render(this.scene, this.camera);
    
    // Ensure the engine is ready for new animations
    this.isAnimating = false; // Explicitly set to false to allow new animations
    
    // Clear orientation tracking since we're back to solved state
    this.orientationMoves = [];
    
    console.log('Cube forcefully reset to original solved state');
  }

  generateScramble(): string {
    const moves = ['F', 'B', 'R', 'L', 'U', 'D'];
    const modifiers = ['', "'", '2'];
    const scramble: string[] = [];
    
    for (let i = 0; i < 20; i++) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      scramble.push(move + modifier);
    }
    
    return scramble.join(' ');
  }

  setAnimationSpeed(speed: number): void {
    this.animationSpeed = speed;
  }

  setStepMode(enabled: boolean, moves?: string[]): void {
    this.stepMode = enabled;
    if (moves) {
      this.algorithmQueue = moves;
      this.currentStep = 0;
      this.moveHistory = []; // Clear history when starting new algorithm
    }
  }

  executeNextStep(): boolean {
    if (!this.stepMode || this.currentStep >= this.algorithmQueue.length) {
      return false;
    }
    
    const move = this.algorithmQueue[this.currentStep];
    this.moveHistory.push(move); // Store the move in history
    this.currentStep++;
    this.executeMove(move);
    return true;
  }

  executePrevStep(): boolean {
    if (!this.stepMode || this.currentStep <= 0 || this.moveHistory.length === 0) {
      return false;
    }
    
    // Get the last executed move and execute its inverse
    const lastMove = this.moveHistory.pop();
    if (lastMove) {
      const inverseMove = this.getInverseMove(lastMove);
      this.currentStep--;
      this.executeMove(inverseMove);
      return true;
    }
    
    return false;
  }

  private getInverseMove(move: string): string {
    // Get the inverse of a WCA move
    const movePattern = /^([FRULBD]|[MES]|[xyzXYZ])([w]?)(['2]?)$/;
    const match = move.match(movePattern);
    
    if (!match) return move;
    
    const [, face, wide, modifier] = match;
    let inverseFace = face;
    let inverseWide = wide || '';
    let inverseModifier = '';
    
    if (modifier === "'") {
      // Counter-clockwise becomes clockwise
      inverseModifier = '';
    } else if (modifier === "2") {
      // 180 degree move is its own inverse
      inverseModifier = '2';
    } else {
      // Clockwise becomes counter-clockwise
      inverseModifier = "'";
    }
    
    return inverseFace + inverseWide + inverseModifier;
  }

  pauseExecution(): void {
    this.isPaused = true;
    console.log('Algorithm execution paused');
  }

  resumeExecution(): void {
    this.isPaused = false;
    if (this.pauseResolver) {
      this.pauseResolver();
      this.pauseResolver = null;
    }
    console.log('Algorithm execution resumed');
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate(): void {
    if (this.isDisposed) return;
    
    this.animationId = requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  dispose(): void {
    this.isDisposed = true;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Clean up Three.js objects
    this.cubies.forEach(cubie => {
      if (cubie.geometry) cubie.geometry.dispose();
      if (Array.isArray(cubie.material)) {
        cubie.material.forEach(material => material.dispose());
      } else if (cubie.material) {
        cubie.material.dispose();
      }
    });
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }

  // Setup a specific case state using setup moves
  async setupCaseState(setupMoves: string): Promise<void> {
    if (!setupMoves.trim()) return;
    
    // Reset to solved state first
    this.resetCube();
    
    // Wait a bit for reset to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Apply setup moves silently (faster animation)
    const originalSpeed = this.animationSpeed;
    this.setAnimationSpeed(3); // Faster setup
    
    try {
      await this.executeAlgorithm(setupMoves);
    } finally {
      // Restore original animation speed
      this.setAnimationSpeed(originalSpeed);
    }
  }

  // Get a preview of what the case looks like (for thumbnails)
  async getCasePreview(setupMoves: string): Promise<string> {
    if (!setupMoves.trim()) return '';
    
    // This could be extended to return a base64 image or state description
    // For now, just return the setup moves as a preview
    return setupMoves;
  }

  // Orientation control methods - using actual cube rotations
  async rotateViewLeft(): Promise<void> {
    if (this.isAnimating) return;
    // y' rotation (90° counter-clockwise around y-axis)
    const move = "y'";
    await this.executeAlgorithm(move);
    this.orientationMoves.push(move);
  }

  async rotateViewRight(): Promise<void> {
    if (this.isAnimating) return;
    // y rotation (90° clockwise around y-axis)
    const move = 'y';
    await this.executeAlgorithm(move);
    this.orientationMoves.push(move);
  }

  async rotateViewUp(): Promise<void> {
    if (this.isAnimating) return;
    // x rotation (90° clockwise around x-axis)
    const move = 'x';
    await this.executeAlgorithm(move);
    this.orientationMoves.push(move);
  }

  async rotateViewDown(): Promise<void> {
    if (this.isAnimating) return;
    // x' rotation (90° counter-clockwise around x-axis)
    const move = "x'";
    await this.executeAlgorithm(move);
    this.orientationMoves.push(move);
  }

  // Reset cube orientation to default view by tracking and reversing rotations
  private orientationMoves: string[] = [];

  async resetOrientation(): Promise<void> {
    if (this.isAnimating) return;
    
    // Apply inverse of all orientation moves to get back to default
    const inverseMoves = this.orientationMoves.slice().reverse().map(move => this.getInverseMove(move));
    
    if (inverseMoves.length > 0) {
      // Execute all inverse moves to return to default orientation
      for (const move of inverseMoves) {
        await this.executeAlgorithm(move);
      }
    }
    
    // Clear the orientation history
    this.orientationMoves = [];
  }


  // Additional cube rotations for completeness
  async rotateCubeZ(): Promise<void> {
    if (this.isAnimating) return;
    // z rotation (90° clockwise around z-axis)
    await this.executeAlgorithm('z');
  }

  async rotateCubeZPrime(): Promise<void> {
    if (this.isAnimating) return;
    // z' rotation (90° counter-clockwise around z-axis)
    await this.executeAlgorithm("z'");
  }

  // Get current orientation as a readable string (for debugging)
  getCurrentOrientation(): string {
    // Since we're using actual cube moves, orientation is part of cube state
    return 'Cube rotated via x/y/z moves';
  }
}

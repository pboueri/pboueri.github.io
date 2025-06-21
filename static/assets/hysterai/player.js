// Player Manager
class PlayerManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.position = { x: 0, z: 0 };
        this.velocity = { x: 0, z: 0 };
        this.speed = 0.3;
        this.jumpHeight = 0;
        this.isJumping = false;
        this.isCrouching = false;
        this.isCrawling = false;
        
        // Mouse look - start facing forward (towards positive Z / goal)
        this.mouseX = Math.PI; // Face towards positive Z (goal direction)
        this.mouseY = 0;
        this.pitch = 0;
        this.yaw = Math.PI;
        
        // Input state
        this.keys = {};
        
        this.setupControls();
        this.createPlayerArms();
    }
    
    setupControls() {
        // Keyboard input
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Mouse input
        document.addEventListener('mousemove', (event) => {
            this.mouseX += event.movementX * 0.002;
            this.mouseY += event.movementY * 0.002;
            
            // Clamp vertical look
            this.mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.mouseY));
        });
        
        // Pointer lock for mouse look
        document.addEventListener('click', () => {
            if (window.gameState && window.gameState.isGameRunning) {
                document.body.requestPointerLock();
            }
        });
    }
    
    createPlayerArms() {
        // Create simple arm representations for first-person view
        this.arms = new THREE.Group();
        
        // Left arm
        const leftArmGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac }); // Skin color
        
        const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        leftArm.position.set(-0.6, -0.8, -1.2);
        leftArm.rotation.z = 0.3;
        
        // Right arm
        const rightArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        rightArm.position.set(0.6, -0.8, -1.2);
        rightArm.rotation.z = -0.3;
        
        this.arms.add(leftArm);
        this.arms.add(rightArm);
        
        // Attach arms to camera
        this.camera.add(this.arms);
        
        // Store arm references for animation
        this.leftArm = leftArm;
        this.rightArm = rightArm;
    }
    
    update(gameModifiers) {
        this.handleInput(gameModifiers);
        this.updateMovement(gameModifiers);
        this.updateCamera(gameModifiers);
        this.animateArms();
    }
    
    handleInput(gameModifiers) {
        const moveSpeed = this.speed * (gameModifiers.playerSpeedMultiplier || 1.0);
        this.velocity.x = 0;
        this.velocity.z = 0;
        
        // Get movement keys (considering inverted controls) - support both arrow keys and WASD
        const forward = gameModifiers.invertedControls ? 
            (this.keys['ArrowDown'] || this.keys['KeyS']) : 
            (this.keys['ArrowUp'] || this.keys['KeyW']);
        const backward = gameModifiers.invertedControls ? 
            (this.keys['ArrowUp'] || this.keys['KeyW']) : 
            (this.keys['ArrowDown'] || this.keys['KeyS']);
        const left = gameModifiers.invertedControls ? 
            (this.keys['ArrowRight'] || this.keys['KeyD']) : 
            (this.keys['ArrowLeft'] || this.keys['KeyA']);
        const right = gameModifiers.invertedControls ? 
            (this.keys['ArrowLeft'] || this.keys['KeyA']) : 
            (this.keys['ArrowRight'] || this.keys['KeyD']);
        
        // Calculate movement direction based on camera orientation
        const yawRadians = this.mouseX + (gameModifiers.rotatedView * Math.PI / 180);
        
        // Calculate forward/right vectors based on camera yaw
        // Fix: Invert the forward direction so W moves toward where you're looking
        const forwardX = -Math.sin(yawRadians);
        const forwardZ = -Math.cos(yawRadians);
        const rightX = Math.cos(yawRadians);
        const rightZ = -Math.sin(yawRadians);
        
        if (forward) {
            this.velocity.x += forwardX * moveSpeed;
            this.velocity.z += forwardZ * moveSpeed;
        }
        if (backward) {
            this.velocity.x -= forwardX * moveSpeed;
            this.velocity.z -= forwardZ * moveSpeed;
        }
        if (left) {
            this.velocity.x -= rightX * moveSpeed;
            this.velocity.z -= rightZ * moveSpeed;
        }
        if (right) {
            this.velocity.x += rightX * moveSpeed;
            this.velocity.z += rightZ * moveSpeed;
        }
        
        // Handle special movement states
        this.handleSpecialMovement(gameModifiers);
    }
    
    handleSpecialMovement(gameModifiers) {
        // Jumping
        if (this.keys['Space'] || gameModifiers.forcedMovement === 'jump') {
            if (!this.isJumping) {
                this.isJumping = true;
                this.jumpHeight = 0.3;
            }
        }
        
        // Crouching
        this.isCrouching = this.keys['ShiftLeft'] || gameModifiers.forcedMovement === 'crouch';
        
        // Crawling
        this.isCrawling = (this.keys['ControlLeft'] && this.keys['ShiftLeft']) || 
                         gameModifiers.forcedMovement === 'crawl';
        
        // Apply movement modifiers
        if (this.isCrawling) {
            this.velocity.x *= 0.3;
            this.velocity.z *= 0.3;
        } else if (this.isCrouching) {
            this.velocity.x *= 0.6;
            this.velocity.z *= 0.6;
        }
    }
    
    updateMovement(gameModifiers) {
        // Update position
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        
        // Terrain collision and height calculation
        const terrainHeight = window.gameState?.terrain?.getHeightAt(this.position.x, this.position.z) || 0;
        
        // Handle jumping
        if (this.isJumping) {
            this.jumpHeight -= 0.02; // Gravity
            if (this.jumpHeight <= 0) {
                this.jumpHeight = 0;
                this.isJumping = false;
            }
        }
        
        // Calculate final camera height
        let cameraHeight = terrainHeight + 1.5; // Standard eye level
        
        if (this.isCrawling) {
            cameraHeight = terrainHeight + 0.5;
        } else if (this.isCrouching) {
            cameraHeight = terrainHeight + 1.0;
        }
        
        cameraHeight += this.jumpHeight;
        
        // Update camera position
        this.camera.position.x = this.position.x;
        this.camera.position.y = cameraHeight;
        this.camera.position.z = this.position.z;
        
        // Bounds checking
        if (!window.gameState?.terrain?.isValidPosition(this.position.x, this.position.z)) {
            // Revert movement if out of bounds
            this.position.x -= this.velocity.x;
            this.position.z -= this.velocity.z;
            this.camera.position.x = this.position.x;
            this.camera.position.z = this.position.z;
        }
    }
    
    updateCamera(gameModifiers) {
        // Apply mouse look
        this.yaw = this.mouseX;
        this.pitch = this.mouseY;
        
        // Apply view rotation modifier
        const totalYaw = this.yaw + (gameModifiers.rotatedView * Math.PI / 180);
        
        // Update camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = totalYaw;
        this.camera.rotation.x = this.pitch;
        this.camera.rotation.z = 0;
    }
    
    animateArms() {
        if (!this.leftArm || !this.rightArm) return;
        
        // Arm swaying based on movement
        const time = Date.now() * 0.005;
        const movementIntensity = Math.abs(this.velocity.x) + Math.abs(this.velocity.z);
        
        if (movementIntensity > 0.01) {
            // Walking animation
            this.leftArm.rotation.x = Math.sin(time * 4) * 0.3 * movementIntensity * 10;
            this.rightArm.rotation.x = -Math.sin(time * 4) * 0.3 * movementIntensity * 10;
        } else {
            // Idle animation
            this.leftArm.rotation.x = Math.sin(time) * 0.1;
            this.rightArm.rotation.x = Math.sin(time + Math.PI) * 0.1;
        }
        
        // Adjust arm position based on movement state
        if (this.isCrawling) {
            this.arms.position.y = -0.3;
            this.arms.rotation.x = 0.5;
        } else if (this.isCrouching) {
            this.arms.position.y = -0.1;
            this.arms.rotation.x = 0.2;
        } else {
            this.arms.position.y = 0;
            this.arms.rotation.x = 0;
        }
    }
    
    setPosition(x, z) {
        this.position.x = x;
        this.position.z = z;
        
        const terrainHeight = window.gameState?.terrain?.getHeightAt(x, z) || 0;
        
        this.camera.position.x = x;
        this.camera.position.y = terrainHeight + 1.5;
        this.camera.position.z = z;
    }
    
    getPosition() {
        return { ...this.position };
    }
    
    lookAt(x, z) {
        const dx = x - this.position.x;
        const dz = z - this.position.z;
        
        this.yaw = Math.atan2(dx, dz);
        this.mouseX = this.yaw;
    }
} 
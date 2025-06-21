// Amoeba Manager
class AmoebaManager {
    constructor(scene) {
        this.scene = scene;
        this.amoeba = null;
        this.tentacles = [];
        this.position = { x: 0, z: -50 };
        this.size = 1.0;
        this.speed = 0.01;
        this.animationTime = 0;
        
        this.createAmoeba();
    }
    
    createAmoeba() {
        this.amoeba = new THREE.Group();
        
        // Create main body with multiple interconnected spheres
        this.createMainBody();
        
        // Create tentacles/pseudopods
        this.createTentacles();
        
        // Position the amoeba
        this.amoeba.position.set(this.position.x, 2, this.position.z);
        
        this.scene.add(this.amoeba);
    }
    
    createMainBody() {
        // Central core
        const coreGeometry = new THREE.SphereGeometry(2, 16, 16);
        const coreMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4a0e4e, // Dark purple
            transparent: true,
            opacity: 0.8
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.castShadow = true;
        this.amoeba.add(core);
        
        // Add pulsing inner glow
        const glowGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x9932cc, // Medium purple
            transparent: true,
            opacity: 0.3
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.amoeba.add(glow);
        
        // Create smaller orbiting blobs for organic look
        this.organelles = [];
        for (let i = 0; i < 6; i++) {
            const organelleGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 8, 8);
            const organelleMaterial = new THREE.MeshLambertMaterial({
                color: 0x2a0845, // Very dark purple
                transparent: true,
                opacity: 0.6
            });
            
            const organelle = new THREE.Mesh(organelleGeometry, organelleMaterial);
            organelle.userData = {
                angle: (i / 6) * Math.PI * 2,
                radius: 1.2 + Math.random() * 0.8,
                speed: 0.02 + Math.random() * 0.02
            };
            
            this.organelles.push(organelle);
            this.amoeba.add(organelle);
        }
        
        // Store core reference for pulsing animation
        this.core = core;
        this.glow = glow;
    }
    
    createTentacles() {
        // Create multiple tentacles using connected cylinders
        for (let i = 0; i < 8; i++) {
            const tentacle = this.createSingleTentacle(i);
            this.tentacles.push(tentacle);
            this.amoeba.add(tentacle);
        }
    }
    
    createSingleTentacle(index) {
        const tentacleGroup = new THREE.Group();
        const segments = 5;
        
        // Create tentacle segments
        for (let j = 0; j < segments; j++) {
            const segmentRadius = 0.3 - (j * 0.04); // Taper towards end
            const segmentHeight = 0.8;
            
            const segmentGeometry = new THREE.CylinderGeometry(segmentRadius, segmentRadius * 0.8, segmentHeight, 6);
            const segmentMaterial = new THREE.MeshLambertMaterial({
                color: 0x660066, // Dark magenta
                transparent: true,
                opacity: 0.7
            });
            
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.y = j * segmentHeight * 0.7; // Overlap segments slightly
            
            // Add rotation data for animation
            segment.userData = {
                originalRotation: { x: 0, y: 0, z: 0 },
                animationPhase: (index * Math.PI / 4) + (j * Math.PI / 8)
            };
            
            segment.castShadow = true;
            tentacleGroup.add(segment);
        }
        
        // Position tentacle around the main body
        const angle = (index / 8) * Math.PI * 2;
        tentacleGroup.position.set(
            Math.cos(angle) * 1.5,
            -1,
            Math.sin(angle) * 1.5
        );
        
        tentacleGroup.userData = {
            baseAngle: angle,
            animationOffset: index * 0.5
        };
        
        return tentacleGroup;
    }
    
    update() {
        if (!this.amoeba) return;
        
        this.animationTime += 0.05;
        
        // Animate main body pulsing
        this.animateMainBody();
        
        // Animate organelles
        this.animateOrganelles();
        
        // Animate tentacles
        this.animateTentacles();
        
        // Basic movement towards player every frame (in addition to AI decisions)
        if (window.gameState && window.gameState.player && window.gameState.isGameRunning) {
            this.moveTowardsPlayer(0.02); // Very slow constant movement
        }
    }
    
    moveTowardsPlayer(speed) {
        const playerPos = window.gameState.player.getPosition();
        const dx = playerPos.x - this.position.x;
        const dz = playerPos.z - this.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 5) { // Only move if not too close
            const moveSpeed = speed * (window.gameState?.gameModifiers?.amoebaSpeedMultiplier || 1.0);
            this.position.x += (dx / distance) * moveSpeed;
            this.position.z += (dz / distance) * moveSpeed;
            
            // Update visual position
            this.amoeba.position.x = this.position.x;
            this.amoeba.position.z = this.position.z;
        }
    }
    
    animateMainBody() {
        if (this.core && this.glow) {
            // Pulsing animation
            const pulse = 1 + Math.sin(this.animationTime * 2) * 0.1;
            this.core.scale.setScalar(pulse);
            
            const glowPulse = 1 + Math.sin(this.animationTime * 3) * 0.2;
            this.glow.scale.setScalar(glowPulse);
            
            // Slight floating motion
            this.amoeba.position.y = 2 + Math.sin(this.animationTime) * 0.3;
        }
    }
    
    animateOrganelles() {
        this.organelles.forEach(organelle => {
            const data = organelle.userData;
            data.angle += data.speed;
            
            organelle.position.set(
                Math.cos(data.angle) * data.radius,
                Math.sin(data.angle * 1.5) * 0.5,
                Math.sin(data.angle) * data.radius
            );
        });
    }
    
    animateTentacles() {
        this.tentacles.forEach(tentacle => {
            const baseData = tentacle.userData;
            
            // Undulating motion
            tentacle.children.forEach((segment, segmentIndex) => {
                const segmentData = segment.userData;
                const wave = Math.sin(this.animationTime * 2 + segmentData.animationPhase) * 0.3;
                
                segment.rotation.x = segmentData.originalRotation.x + wave;
                segment.rotation.z = segmentData.originalRotation.z + wave * 0.5;
            });
            
            // Tentacle swaying
            const sway = Math.sin(this.animationTime + baseData.animationOffset) * 0.2;
            tentacle.rotation.y = sway;
        });
    }
    
    move(direction, speed) {
        if (!this.amoeba) return;
        
        speed *= window.gameState?.gameModifiers?.amoebaSpeedMultiplier || 1.0;
        
        switch (direction) {
            case 'forward':
                this.position.z += speed;
                break;
            case 'backward':
                this.position.z -= speed;
                break;
            case 'left':
                this.position.x -= speed;
                break;
            case 'right':
                this.position.x += speed;
                break;
            case 'towards_player':
                if (window.gameState && window.gameState.player) {
                    const playerPos = window.gameState.player.getPosition();
                    const dx = playerPos.x - this.position.x;
                    const dz = playerPos.z - this.position.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    if (distance > 0) {
                        this.position.x += (dx / distance) * speed * 20; // Increase speed multiplier
                        this.position.z += (dz / distance) * speed * 20;
                    }
                }
                break;
        }
        
        // Update visual position
        this.amoeba.position.x = this.position.x;
        this.amoeba.position.z = this.position.z;
        
        // Add movement animation - leaning in direction
        const targetRotation = this.getMovementRotation(direction);
        this.amoeba.rotation.z = THREE.MathUtils.lerp(this.amoeba.rotation.z, targetRotation, 0.1);
    }
    
    getMovementRotation(direction) {
        switch (direction) {
            case 'left': return 0.2;
            case 'right': return -0.2;
            case 'forward': return 0;
            case 'backward': return 0;
            default: return 0;
        }
    }
    
    setPosition(x, z) {
        this.position.x = x;
        this.position.z = z;
        
        if (this.amoeba) {
            this.amoeba.position.x = x;
            this.amoeba.position.z = z;
        }
    }
    
    getPosition() {
        return { ...this.position };
    }
    
    updateSize(sizeMultiplier) {
        if (this.amoeba) {
            this.amoeba.scale.setScalar(sizeMultiplier);
            this.size = sizeMultiplier;
        }
    }
    
    getSize() {
        return this.size;
    }
} 
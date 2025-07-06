class Hysterai {
    constructor() {
        this.container = document.getElementById('hysterai-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        this.player = {
            position: new THREE.Vector3(0, 1.5, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: 0, // Face towards positive Z (flag direction)
            speed: 5,
            jumpVelocity: 0,
            isJumping: false,
            isCrouching: false,
            isCrawling: false,
            defaultSpeed: 5,
            arms: []
        };
        
        this.amoeba = {
            position: new THREE.Vector3(0, 2, -50),
            speed: 0.01,
            size: 2,
            mesh: null,
            tentacles: [],
            actionTimer: 0,
            actionInterval: 5
        };
        
        this.goalPosition = new THREE.Vector3(0, 0, 100);
        this.flagMesh = null;
        
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.gameState = 'menu';
        this.timeRemaining = 60;
        this.startTime = null;
        
        this.apiKey = '';
        this.selectedModel = 'gpt-4.1-mini';
        this.difficulty = 'easy';
        this.difficultySettings = {
            easy: { interval: 5, speed: 0.01 },
            medium: { interval: 3, speed: 0.02 },
            hard: { interval: 2, speed: 0.03 },
            nightmare: { interval: 1, speed: 0.05 }
        };
        
        this.actionLog = [];
        this.voices = [
            "I almost made it...",
            "The amoeba... it learns...",
            "There's no escape...",
            "It changed everything...",
            "I thought I could win...",
            "The rules keep changing...",
            "So close to the top...",
            "It's inevitable..."
        ];
        
        this.keyBindings = {
            forward: 'ArrowUp',
            backward: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: ' ',
            crouch: 'Shift',
            crawl: 'Control'
        };
        
        this.terrain = null;
        this.minimapCanvas = null;
        this.minimapCtx = null;
        
        this.init();
    }
    
    init() {
        this.setupMenu();
    }
    
    setupMenu() {
        const menuHTML = `
            <div class="menu-screen" id="menu-screen">
                <h1 class="title">
                    <span id="title-text" class="glitch">Hysterai</span>
                </h1>
                <div class="menu-controls">
                    <input type="password" 
                           class="api-key-input" 
                           id="api-key" 
                           placeholder="Enter OpenAI API Key" 
                           required>
                    <select class="model-select" id="model-select">
                        <option value="gpt-4.1">gpt-4.1</option>
                        <option value="gpt-4.1-mini" selected>gpt-4.1-mini</option>
                        <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                        <option value="o3">o3</option>
                        <option value="o3-mini">o3-mini</option>
                        <option value="o4-mini">o4-mini</option>
                    </select>
                    <div class="difficulty-container">
                        <label for="difficulty">Amoeba Aggression</label>
                        <input type="range" 
                               class="difficulty-slider" 
                               id="difficulty" 
                               min="0" 
                               max="3" 
                               value="0" 
                               step="1">
                        <span id="difficulty-label">Easy</span>
                    </div>
                    <button class="play-button" id="play-button" disabled>PLAY</button>
                </div>
            </div>
        `;
        
        this.container.innerHTML = menuHTML;
        
        const titleText = document.getElementById('title-text');
        let titleToggle = true;
        setInterval(() => {
            titleToggle = !titleToggle;
            titleText.textContent = titleToggle ? 'Hysterai' : 'Hysteria';
        }, 2000);
        
        const apiKeyInput = document.getElementById('api-key');
        const playButton = document.getElementById('play-button');
        const modelSelect = document.getElementById('model-select');
        const difficultySlider = document.getElementById('difficulty');
        const difficultyLabel = document.getElementById('difficulty-label');
        
        const difficulties = ['Easy', 'Medium', 'Hard', 'Nightmare'];
        
        apiKeyInput.addEventListener('input', (e) => {
            this.apiKey = e.target.value;
            playButton.disabled = !this.apiKey;
        });
        
        modelSelect.addEventListener('change', (e) => {
            this.selectedModel = e.target.value;
        });
        
        difficultySlider.addEventListener('input', (e) => {
            const level = parseInt(e.target.value);
            difficultyLabel.textContent = difficulties[level];
            this.difficulty = difficulties[level].toLowerCase();
        });
        
        playButton.addEventListener('click', () => {
            if (this.apiKey) {
                this.startGame();
            }
        });
    }
    
    startGame() {
        document.getElementById('menu-screen').style.display = 'none';
        this.gameState = 'playing';
        this.startTime = Date.now();
        
        const settings = this.difficultySettings[this.difficulty];
        this.amoeba.actionInterval = settings.interval;
        this.amoeba.speed = settings.speed;
        
        this.setupGame();
        this.setupControls();
        this.animate();
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupGame() {
        const gameHTML = `
            <canvas id="game-canvas"></canvas>
            <div class="game-ui" id="game-ui">
                <div class="timer" id="timer">1:00</div>
                <div class="action-log" id="action-log"></div>
                <div class="minimap">
                    <canvas class="minimap-canvas" id="minimap-canvas" width="150" height="150"></canvas>
                </div>
                <div class="controls-help">
                    ↑↓←→ Move | Space Jump | Shift Crouch | Ctrl+Shift Crawl | Mouse Look
                </div>
            </div>
            <div class="end-screen" id="end-screen">
                <h1 class="end-message" id="end-message"></h1>
                <div class="voices" id="voices"></div>
                <button class="back-button" id="back-button" onclick="location.reload()">Back to Menu</button>
            </div>
        `;
        
        this.container.innerHTML += gameHTML;
        
        const canvas = document.getElementById('game-canvas');
        canvas.style.display = 'block';
        document.getElementById('game-ui').style.display = 'block';
        
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 200);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.setupLighting();
        this.createTerrain();
        this.createPlayer();
        this.createAmoeba();
        this.createGoal();
        this.createEnvironment();
        
        this.updateCamera();
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    createTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(400, 400, 100, 100);
        const terrainMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = 0; // Completely flat terrain
        }
        
        terrainGeometry.computeVertexNormals();
        
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
        
        const skyGeometry = new THREE.SphereGeometry(300, 32, 16);
        const skyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }
    
    createPlayer() {
        // Create more realistic arm geometry
        const upperArmGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.8);
        const lowerArmGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.7);
        const handGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.08);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        
        // Left arm group
        const leftArmGroup = new THREE.Group();
        const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        leftUpperArm.position.set(0, -0.4, 0);
        leftUpperArm.rotation.z = Math.PI / 6;
        
        const leftLowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial);
        leftLowerArm.position.set(-0.3, -0.7, 0);
        leftLowerArm.rotation.z = Math.PI / 8;
        
        const leftHand = new THREE.Mesh(handGeometry, armMaterial);
        leftHand.position.set(-0.4, -0.9, 0);
        
        leftArmGroup.add(leftUpperArm);
        leftArmGroup.add(leftLowerArm);
        leftArmGroup.add(leftHand);
        leftArmGroup.position.set(-0.5, -0.2, -0.8);
        leftArmGroup.scale.set(0.8, 0.8, 0.8);
        
        // Right arm group
        const rightArmGroup = new THREE.Group();
        const rightUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        rightUpperArm.position.set(0, -0.4, 0);
        rightUpperArm.rotation.z = -Math.PI / 6;
        
        const rightLowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial);
        rightLowerArm.position.set(0.3, -0.7, 0);
        rightLowerArm.rotation.z = -Math.PI / 8;
        
        const rightHand = new THREE.Mesh(handGeometry, armMaterial);
        rightHand.position.set(0.4, -0.9, 0);
        
        rightArmGroup.add(rightUpperArm);
        rightArmGroup.add(rightLowerArm);
        rightArmGroup.add(rightHand);
        rightArmGroup.position.set(0.5, -0.2, -0.8);
        rightArmGroup.scale.set(0.8, 0.8, 0.8);
        
        this.player.arms = [leftArmGroup, rightArmGroup];
        this.scene.add(leftArmGroup);
        this.scene.add(rightArmGroup);
    }
    
    createAmoeba() {
        const amoebaGroup = new THREE.Group();
        
        // Create a more disturbing core with irregular shape
        const coreGeometry = new THREE.IcosahedronGeometry(this.amoeba.size, 1);
        const positions = coreGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.3;
            positions[i + 1] += (Math.random() - 0.5) * 0.3;
            positions[i + 2] += (Math.random() - 0.5) * 0.3;
        }
        coreGeometry.computeVertexNormals();
        
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9,
            emissive: 0x330000,
            emissiveIntensity: 0.5,
            roughness: 0.1,
            metalness: 0.8
        });
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        amoebaGroup.add(coreMesh);
        
        // Add inner glowing eye-like structures
        for (let i = 0; i < 5; i++) {
            const eyeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const eyeMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 1.5,
                transparent: true,
                opacity: 0.8
            });
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(
                (Math.random() - 0.5) * this.amoeba.size * 1.5,
                (Math.random() - 0.5) * this.amoeba.size,
                (Math.random() - 0.5) * this.amoeba.size * 1.5
            );
            amoebaGroup.add(eye);
            this.amoeba.tentacles.push(eye);
        }
        
        // Create writhing tentacles
        for (let i = 0; i < 12; i++) {
            const tentacleSegments = [];
            const baseAngle = (i / 12) * Math.PI * 2;
            
            for (let j = 0; j < 4; j++) {
                const segmentSize = (4 - j) * 0.2 + 0.1;
                const segmentGeometry = new THREE.SphereGeometry(segmentSize, 6, 6);
                const segmentMaterial = new THREE.MeshStandardMaterial({
                    color: 0x1a0000,
                    transparent: true,
                    opacity: 0.8 - j * 0.1,
                    emissive: 0x660000,
                    emissiveIntensity: 0.3,
                    roughness: 0.9
                });
                const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
                
                const distance = this.amoeba.size * (0.8 + j * 0.4);
                segment.position.set(
                    Math.cos(baseAngle) * distance,
                    Math.sin(j * 0.5) * 0.5,
                    Math.sin(baseAngle) * distance
                );
                
                tentacleSegments.push(segment);
                amoebaGroup.add(segment);
            }
            
            this.amoeba.tentacles.push(...tentacleSegments);
        }
        
        // Add disturbing particle effect
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            particlePositions[i] = (Math.random() - 0.5) * this.amoeba.size * 3;
            particlePositions[i + 1] = (Math.random() - 0.5) * this.amoeba.size * 3;
            particlePositions[i + 2] = (Math.random() - 0.5) * this.amoeba.size * 3;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x880000,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        amoebaGroup.add(particles);
        
        this.amoeba.mesh = amoebaGroup;
        this.amoeba.mesh.position.copy(this.amoeba.position);
        this.amoeba.mesh.castShadow = true;
        this.scene.add(this.amoeba.mesh);
    }
    
    createGoal() {
        const terrainHeight = this.getTerrainHeight(this.goalPosition.x, this.goalPosition.z);
        
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.copy(this.goalPosition);
        pole.position.y = terrainHeight + 2.5;
        pole.castShadow = true;
        this.scene.add(pole);
        
        const flagGeometry = new THREE.PlaneGeometry(2, 1.5);
        const flagMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            side: THREE.DoubleSide
        });
        this.flagMesh = new THREE.Mesh(flagGeometry, flagMaterial);
        this.flagMesh.position.copy(this.goalPosition);
        this.flagMesh.position.y = terrainHeight + 4;
        this.flagMesh.position.x = this.goalPosition.x + 1;
        this.scene.add(this.flagMesh);
    }
    
    createEnvironment() {
        for (let i = 0; i < 20; i++) {
            const treeHeight = Math.random() * 5 + 3;
            const treeGeometry = new THREE.CylinderGeometry(0, 1.5, treeHeight);
            const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);
            
            tree.position.set(
                (Math.random() - 0.5) * 200,
                treeHeight / 2,
                (Math.random() - 0.5) * 200
            );
            tree.castShadow = true;
            this.scene.add(tree);
        }
        
        for (let i = 0; i < 30; i++) {
            const rockSize = Math.random() * 1 + 0.5;
            const rockGeometry = new THREE.SphereGeometry(rockSize, 8, 6);
            const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            rock.position.set(
                (Math.random() - 0.5) * 200,
                rockSize / 2,
                (Math.random() - 0.5) * 200
            );
            rock.castShadow = true;
            this.scene.add(rock);
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === this.keyBindings.crouch) {
                this.player.isCrouching = true;
            }
            if (e.key === this.keyBindings.crawl && this.player.isCrouching) {
                this.player.isCrawling = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            
            if (e.key === this.keyBindings.crouch) {
                this.player.isCrouching = false;
                this.player.isCrawling = false;
            }
            if (e.key === this.keyBindings.crawl) {
                this.player.isCrawling = false;
            }
        });
        
        this.container.addEventListener('click', () => {
            if (this.gameState === 'playing' && this.container.requestPointerLock) {
                this.container.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this.container) {
                document.addEventListener('mousemove', this.onMouseMove);
            } else {
                document.removeEventListener('mousemove', this.onMouseMove);
            }
        });
    }
    
    onMouseMove = (e) => {
        this.player.rotation -= e.movementX * 0.002;
    }
    
    updatePlayer(deltaTime) {
        const moveSpeed = this.player.isCrawling ? this.player.speed * 0.3 : 
                         this.player.isCrouching ? this.player.speed * 0.6 : 
                         this.player.speed;
        
        const forward = new THREE.Vector3(
            Math.sin(this.player.rotation),
            0,
            Math.cos(this.player.rotation)
        );
        const right = new THREE.Vector3(
            Math.cos(this.player.rotation),
            0,
            -Math.sin(this.player.rotation)
        );
        
        this.player.velocity.set(0, 0, 0);
        
        if (this.keys[this.keyBindings.forward] || this.keys['w'] || this.keys['W']) {
            this.player.velocity.add(forward.multiplyScalar(moveSpeed));
        }
        if (this.keys[this.keyBindings.backward] || this.keys['s'] || this.keys['S']) {
            this.player.velocity.add(forward.multiplyScalar(-moveSpeed));
        }
        if (this.keys[this.keyBindings.left] || this.keys['a'] || this.keys['A']) {
            this.player.velocity.add(right.multiplyScalar(moveSpeed));
        }
        if (this.keys[this.keyBindings.right] || this.keys['d'] || this.keys['D']) {
            this.player.velocity.add(right.multiplyScalar(-moveSpeed));
        }
        
        if (this.keys[this.keyBindings.jump] && !this.player.isJumping) {
            this.player.jumpVelocity = 8;
            this.player.isJumping = true;
        }
        
        this.player.jumpVelocity -= 20 * deltaTime;
        this.player.position.y += this.player.jumpVelocity * deltaTime;
        
        this.player.position.x += this.player.velocity.x * deltaTime;
        this.player.position.z += this.player.velocity.z * deltaTime;
        
        const terrainHeight = this.getTerrainHeight(this.player.position.x, this.player.position.z);
        const targetHeight = terrainHeight + 1.5;
        
        if (this.player.position.y <= targetHeight) {
            this.player.position.y = targetHeight;
            this.player.jumpVelocity = 0;
            this.player.isJumping = false;
        }
        
        this.player.position.x = Math.max(-190, Math.min(190, this.player.position.x));
        this.player.position.z = Math.max(-190, Math.min(190, this.player.position.z));
        
        const armSwing = Math.sin(this.clock.getElapsedTime() * 5) * 0.1;
        this.player.arms[0].rotation.x = armSwing;
        this.player.arms[1].rotation.x = -armSwing;
    }
    
    getTerrainHeight(x, z) {
        return 0; // Flat terrain
    }
    
    updateAmoeba(deltaTime) {
        this.amoeba.actionTimer += deltaTime;
        
        if (this.amoeba.actionTimer >= this.amoeba.actionInterval) {
            this.amoeba.actionTimer = 0;
            this.performAmoebaAction();
        }
        
        const toPlayer = new THREE.Vector3()
            .subVectors(this.player.position, this.amoeba.position)
            .normalize();
        
        this.amoeba.position.add(toPlayer.multiplyScalar(this.amoeba.speed));
        this.amoeba.mesh.position.copy(this.amoeba.position);
        
        const time = this.clock.getElapsedTime();
        
        // Disturbing pulsating motion
        this.amoeba.mesh.scale.set(
            1 + Math.sin(time * 3) * 0.15 + Math.sin(time * 7) * 0.05,
            1 + Math.cos(time * 2.5) * 0.2,
            1 + Math.sin(time * 3.5) * 0.15
        );
        
        // Rotate the core in an unsettling way
        this.amoeba.mesh.rotation.x = Math.sin(time * 0.7) * 0.2;
        this.amoeba.mesh.rotation.y = time * 0.3;
        this.amoeba.mesh.rotation.z = Math.cos(time * 0.9) * 0.15;
        
        // Animate tentacles and eyes in disturbing patterns
        this.amoeba.tentacles.forEach((tentacle, i) => {
            if (i < 5) { // Eyes
                tentacle.scale.set(
                    1 + Math.sin(time * 5 + i * 2) * 0.3,
                    1 + Math.sin(time * 5 + i * 2) * 0.3,
                    1 + Math.sin(time * 5 + i * 2) * 0.3
                );
                tentacle.material.emissiveIntensity = 0.5 + Math.sin(time * 10 + i) * 0.5;
            } else { // Tentacle segments
                const wave = Math.sin(time * 4 + i * 0.3) * 0.8;
                const twist = Math.cos(time * 3 + i * 0.2) * 0.6;
                tentacle.position.y += wave * 0.05;
                tentacle.rotation.x = wave * 0.4;
                tentacle.rotation.z = twist * 0.3;
                
                // Make tentacles writhe
                const originalPos = tentacle.position.clone();
                tentacle.position.x += Math.sin(time * 5 + i) * 0.2;
                tentacle.position.z += Math.cos(time * 4 + i) * 0.2;
            }
        });
    }
    
    async performAmoebaAction() {
        const gameState = {
            playerDistance: this.player.position.distanceTo(this.amoeba.position),
            playerToGoalDistance: this.player.position.distanceTo(this.goalPosition),
            timeRemaining: this.timeRemaining,
            playerSpeed: this.player.speed,
            amoebaSpeed: this.amoeba.speed,
            amoebaSize: this.amoeba.size
        };
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.selectedModel,
                    messages: [{
                        role: 'system',
                        content: `You are the AI amoeba in Hysterai. Choose ONE action:
                        1. "move" - Move towards player
                        2. "invert_controls" - Swap left/right controls
                        3. "rotate_view" - Rotate player view 90 degrees
                        4. "slow_player" - Reduce player speed by 10%
                        5. "grow" - Increase your size by 10%
                        6. "speed_up" - Increase your speed by 20%
                        7. "force_crouch" - Make player default to crouching
                        
                        Game state: ${JSON.stringify(gameState)}
                        Respond with just the action name.`
                    }],
                    max_tokens: 20,
                    temperature: 0.7
                })
            });
            
            const data = await response.json();
            const action = data.choices[0].message.content.trim().toLowerCase();
            
            this.executeAmoebaAction(action);
        } catch (error) {
            console.error('AI action failed:', error);
            console.log('Falling back to random action selection');
            
            const actions = ['move', 'invert_controls', 'rotate_view', 'slow_player', 'grow', 'speed_up', 'force_crouch'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            this.executeAmoebaAction(randomAction);
        }
    }
    
    executeAmoebaAction(action) {
        let logMessage = '';
        
        switch (action) {
            case 'invert_controls':
                const temp = this.keyBindings.left;
                this.keyBindings.left = this.keyBindings.right;
                this.keyBindings.right = temp;
                logMessage = 'Controls inverted!';
                break;
                
            case 'rotate_view':
                this.player.rotation += Math.PI / 2;
                logMessage = 'View rotated!';
                break;
                
            case 'slow_player':
                this.player.speed *= 0.9;
                logMessage = 'Player slowed!';
                break;
                
            case 'grow':
                this.amoeba.size *= 1.1;
                this.amoeba.mesh.scale.multiplyScalar(1.1);
                logMessage = 'Amoeba grows larger!';
                break;
                
            case 'speed_up':
                this.amoeba.speed *= 1.2;
                logMessage = 'Amoeba speeds up!';
                break;
                
            case 'force_crouch':
                this.player.isCrouching = true;
                logMessage = 'Forced to crouch!';
                break;
                
            default:
                logMessage = 'Amoeba advances...';
        }
        
        this.addToActionLog(logMessage);
    }
    
    addToActionLog(message) {
        this.actionLog.unshift(`[${Math.floor(this.timeRemaining)}s] ${message}`);
        if (this.actionLog.length > 10) {
            this.actionLog.pop();
        }
        
        const logElement = document.getElementById('action-log');
        logElement.innerHTML = this.actionLog.join('<br>');
    }
    
    updateCamera() {
        const cameraHeight = this.player.isCrawling ? 0.5 : 
                           this.player.isCrouching ? 1.0 : 1.5;
        
        this.camera.position.copy(this.player.position);
        this.camera.position.y = this.player.position.y - 1.5 + cameraHeight;
        this.camera.rotation.y = this.player.rotation + Math.PI;
        
        this.player.arms.forEach((arm, index) => {
            const sideOffset = index === 0 ? -0.4 : 0.4;
            const forwardOffset = 0.5;
            const downOffset = 0.7;
            
            arm.position.x = this.player.position.x + Math.cos(this.player.rotation) * sideOffset - Math.sin(this.player.rotation) * forwardOffset;
            arm.position.y = this.player.position.y - downOffset;
            arm.position.z = this.player.position.z - Math.sin(this.player.rotation) * sideOffset - Math.cos(this.player.rotation) * forwardOffset;
            arm.rotation.y = this.player.rotation;
        });
    }
    
    updateTimer() {
        if (this.gameState === 'playing' && this.startTime) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.timeRemaining = Math.max(0, 60 - elapsed);
            
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = Math.floor(this.timeRemaining % 60);
            document.getElementById('timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const grayScale = 1 - (this.timeRemaining / 60);
            const r = Math.floor(135 * (1 - grayScale) + 100 * grayScale);
            const g = Math.floor(206 * (1 - grayScale) + 100 * grayScale);
            const b = Math.floor(235 * (1 - grayScale) + 100 * grayScale);
            this.scene.fog.color.setRGB(r/255, g/255, b/255);
        }
    }
    
    updateMinimap() {
        this.minimapCtx.fillStyle = '#000';
        this.minimapCtx.fillRect(0, 0, 150, 150);
        
        this.minimapCtx.strokeStyle = '#0f0';
        this.minimapCtx.strokeRect(0, 0, 150, 150);
        
        const scale = 150 / 400;
        const centerX = 75;
        const centerY = 75;
        
        const goalX = centerX + this.goalPosition.x * scale;
        const goalY = centerY - this.goalPosition.z * scale;
        this.minimapCtx.fillStyle = '#ff0';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(goalX, goalY, 5, 0, Math.PI * 2);
        this.minimapCtx.fill();
        
        const playerX = centerX + this.player.position.x * scale;
        const playerY = centerY - this.player.position.z * scale;
        this.minimapCtx.fillStyle = '#0f0';
        this.minimapCtx.save();
        this.minimapCtx.translate(playerX, playerY);
        this.minimapCtx.rotate(-this.player.rotation);
        this.minimapCtx.fillRect(-3, -4, 6, 8);
        this.minimapCtx.restore();
        
        const amoebaX = centerX + this.amoeba.position.x * scale;
        const amoebaY = centerY - this.amoeba.position.z * scale;
        this.minimapCtx.fillStyle = '#f0f';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(amoebaX, amoebaY, this.amoeba.size * scale * 2, 0, Math.PI * 2);
        this.minimapCtx.fill();
    }
    
    checkGameEnd() {
        const playerToAmoeba = this.player.position.distanceTo(this.amoeba.position);
        const playerToGoal = this.player.position.distanceTo(this.goalPosition);
        
        if (playerToAmoeba < this.amoeba.size) {
            this.endGame('Hysterai');
        } else if (playerToGoal < 3) {
            this.endGame('Great Job! You must now keep playing forever');
            setTimeout(() => {
                this.amoeba.speed *= 1.5;
                this.amoeba.actionInterval *= 0.8;
                this.resetGame();
            }, 3000);
        } else if (this.timeRemaining <= 0) {
            this.endGame("You've run out of time");
        }
    }
    
    endGame(message) {
        this.gameState = 'ended';
        const endMessage = document.getElementById('end-message');
        endMessage.textContent = message;
        document.getElementById('end-screen').style.display = 'flex';
        
        if (message === 'Hysterai') {
            let titleToggle = true;
            setInterval(() => {
                titleToggle = !titleToggle;
                endMessage.textContent = titleToggle ? 'Hysterai' : 'Hysteria';
            }, 2000);
            const voicesContainer = document.getElementById('voices');
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const voice = document.createElement('div');
                    voice.className = 'voice';
                    voice.textContent = this.voices[Math.floor(Math.random() * this.voices.length)];
                    voice.style.left = Math.random() * 80 + 10 + '%';
                    voice.style.top = Math.random() * 80 + 10 + '%';
                    voice.style.animationDelay = Math.random() * 5 + 's';
                    voicesContainer.appendChild(voice);
                }, i * 500);
            }
        }
    }
    
    resetGame() {
        this.player.position.set(0, 1.5, 0);
        this.amoeba.position.set(0, 2, -50);
        this.startTime = Date.now();
        this.timeRemaining = 60;
        this.gameState = 'playing';
        this.actionLog = [];
        document.getElementById('end-screen').style.display = 'none';
    }
    
    animate() {
        if (this.gameState !== 'playing' && this.gameState !== 'ended') return;
        
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        if (this.gameState === 'playing') {
            this.updatePlayer(deltaTime);
            this.updateAmoeba(deltaTime);
            this.updateCamera();
            this.updateTimer();
            this.updateMinimap();
            this.checkGameEnd();
            
            if (this.flagMesh) {
                this.flagMesh.rotation.y = Math.sin(this.clock.getElapsedTime() * 2) * 0.3;
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Hysterai();
});
// The Baibel Tells Me So - Game Implementation
class BaibelGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.gameTime = 0;
        
        // Player state
        this.player = {
            position: new THREE.Vector3(0, 1.6, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: { x: 0, y: 0 },
            moveSpeed: 5,
            isTyping: false
        };
        
        // NPCs
        this.npcs = [];
        this.activeNPC = null;
        
        // AI Companion
        this.aiCompanion = null;
        
        // Game phases
        this.phases = {
            NORMAL: 0,
            UNEASY: 30,
            DEPENDENT: 60,
            DARKNESS: 90,
            ABANDONED: 120
        };
        
        // UI elements
        this.ui = {
            timer: document.getElementById('timer'),
            dialogueBox: document.getElementById('dialogue-box'),
            playerInput: document.getElementById('player-input'),
            feelings: document.getElementById('feeling-text'),
            gameUI: document.getElementById('game-ui')
        };
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, locked: false };
        
        // Environment
        this.lights = [];
        this.ambientBrightness = 1;
        
        // Audio
        this.audioContext = null;
        this.ringingSound = null;
        
        // Dialogue system
        this.dialogueHistory = [];
        this.dialogueBoxOpacity = 1;
        this.npcPersonalities = [
            { name: "Alex", personality: "cheerful", topics: ["weather", "coffee", "work"] },
            { name: "Sam", personality: "philosophical", topics: ["life", "meaning", "future"] },
            { name: "Jordan", personality: "anxious", topics: ["news", "problems", "worries"] },
            { name: "Casey", personality: "artistic", topics: ["music", "art", "creativity"] },
            { name: "Morgan", personality: "technical", topics: ["computers", "gadgets", "science"] },
            { name: "Taylor", personality: "sporty", topics: ["fitness", "games", "competition"] },
            { name: "Riley", personality: "friendly", topics: ["friends", "parties", "fun"] },
            { name: "Avery", personality: "quiet", topics: ["books", "solitude", "nature"] },
            { name: "Quinn", personality: "ambitious", topics: ["goals", "success", "business"] },
            { name: "Drew", personality: "humorous", topics: ["jokes", "comedy", "pranks"] }
        ];
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.copy(this.player.position);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Create environment
        this.createEnvironment();
        
        // Create NPCs
        this.createNPCs();
        
        // Create AI Companion
        this.createAICompanion();
        
        // Setup input handlers
        this.setupInputHandlers();
        
        // Initialize audio
        this.initAudio();
        
        // Hide loading, show game
        document.getElementById('loading').style.display = 'none';
        document.getElementById('game-canvas').style.display = 'block';
        this.ui.gameUI.style.display = 'block';
        
        // Start game loop
        this.animate();
    }
    
    createEnvironment() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Plaza tiles pattern
        const tileSize = 2;
        for (let x = -20; x <= 20; x += tileSize) {
            for (let z = -20; z <= 20; z += tileSize) {
                const tileGeometry = new THREE.PlaneGeometry(tileSize * 0.95, tileSize * 0.95);
                const tileMaterial = new THREE.MeshStandardMaterial({
                    color: (x + z) % (tileSize * 2) === 0 ? 0x606060 : 0x707070
                });
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.rotation.x = -Math.PI / 2;
                tile.position.set(x, 0.01, z);
                this.scene.add(tile);
            }
        }
        
        // Buildings
        this.createBuildings();
        
        // Benches
        this.createBenches();
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(20, 30, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Sky
        this.scene.background = new THREE.Color(0x87CEEB);
    }
    
    createBuildings() {
        const buildingPositions = [
            { x: -30, z: -30, width: 15, height: 30, depth: 15 },
            { x: 30, z: -30, width: 20, height: 40, depth: 20 },
            { x: -30, z: 30, width: 18, height: 35, depth: 18 },
            { x: 30, z: 30, width: 15, height: 25, depth: 15 },
            { x: 0, z: -40, width: 25, height: 45, depth: 15 },
            { x: 0, z: 40, width: 30, height: 38, depth: 20 }
        ];
        
        buildingPositions.forEach(pos => {
            const geometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2, 0.4 + Math.random() * 0.2),
                roughness: 0.7
            });
            const building = new THREE.Mesh(geometry, material);
            building.position.set(pos.x, pos.height / 2, pos.z);
            building.castShadow = true;
            building.receiveShadow = true;
            this.scene.add(building);
            
            // Windows
            for (let y = 2; y < pos.height - 2; y += 4) {
                for (let x = -pos.width/2 + 2; x < pos.width/2 - 1; x += 3) {
                    const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
                    const windowMaterial = new THREE.MeshBasicMaterial({
                        color: Math.random() > 0.3 ? 0xFFFF88 : 0x444444
                    });
                    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                    windowMesh.position.set(pos.x + x, y, pos.z + pos.depth/2 + 0.01);
                    this.scene.add(windowMesh);
                }
            }
        });
    }
    
    createBenches() {
        const benchPositions = [
            { x: -10, z: 0, rotation: 0 },
            { x: 10, z: 0, rotation: Math.PI },
            { x: 0, z: -10, rotation: Math.PI / 2 },
            { x: 0, z: 10, rotation: -Math.PI / 2 }
        ];
        
        benchPositions.forEach(pos => {
            const benchGroup = new THREE.Group();
            
            // Seat
            const seatGeometry = new THREE.BoxGeometry(4, 0.2, 1.5);
            const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const seat = new THREE.Mesh(seatGeometry, seatMaterial);
            seat.position.y = 0.5;
            seat.castShadow = true;
            benchGroup.add(seat);
            
            // Legs
            const legGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0x696969 });
            const legPositions = [
                { x: -1.8, z: -0.6 },
                { x: 1.8, z: -0.6 },
                { x: -1.8, z: 0.6 },
                { x: 1.8, z: 0.6 }
            ];
            
            legPositions.forEach(legPos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(legPos.x, 0.25, legPos.z);
                leg.castShadow = true;
                benchGroup.add(leg);
            });
            
            benchGroup.position.set(pos.x, 0, pos.z);
            benchGroup.rotation.y = pos.rotation;
            this.scene.add(benchGroup);
        });
    }
    
    createNPCs() {
        for (let i = 0; i < 10; i++) {
            const npc = this.createNPC(i);
            this.npcs.push(npc);
            this.scene.add(npc.mesh);
        }
    }
    
    createNPC(index) {
        const npcGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(Math.random(), Math.random(), Math.random())
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.castShadow = true;
        npcGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBBF });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.75;
        head.castShadow = true;
        npcGroup.add(head);
        
        // Random starting position
        const angle = (index / 10) * Math.PI * 2;
        const radius = 10 + Math.random() * 10;
        npcGroup.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
        
        // NPC data
        const personality = this.npcPersonalities[index];
        const npc = {
            mesh: npcGroup,
            personality: personality,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ),
            targetPosition: new THREE.Vector3(),
            walkTimer: 0,
            istalking: false,
            dialogueIndex: 0
        };
        
        // Set initial target
        this.setNewTarget(npc);
        
        return npc;
    }
    
    setNewTarget(npc) {
        npc.targetPosition.set(
            (Math.random() - 0.5) * 40,
            0,
            (Math.random() - 0.5) * 40
        );
        npc.walkTimer = 3 + Math.random() * 5;
    }
    
    createAICompanion() {
        const aiGroup = new THREE.Group();
        
        // AI body (glowing humanoid)
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x00FFFF,
            emissive: 0x00FFFF,
            emissiveIntensity: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        aiGroup.add(body);
        
        // AI head
        const headGeometry = new THREE.SphereGeometry(0.15);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x00FFFF,
            emissive: 0x00FFFF,
            emissiveIntensity: 0.5
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.35;
        aiGroup.add(head);
        
        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.7;
        aiGroup.add(glow);
        
        // Position relative to player
        aiGroup.position.set(2, 0, 2);
        
        this.aiCompanion = {
            mesh: aiGroup,
            glow: glow,
            basePosition: new THREE.Vector3(1.5, 0, 1),
            floatOffset: 0,
            opacity: 1
        };
        
        this.scene.add(aiGroup);
    }
    
    initAudio() {
        // Create audio context on first user interaction
        const initContext = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.createRingingSound();
            }
        };
        
        document.addEventListener('click', initContext, { once: true });
        document.addEventListener('keydown', initContext, { once: true });
    }
    
    createRingingSound() {
        if (!this.audioContext) return;
        
        // Create oscillator for eerie ringing sound
        this.ringingOscillator = this.audioContext.createOscillator();
        this.ringingGain = this.audioContext.createGain();
        
        // High-pitched, slightly modulating frequency for eeriness
        this.ringingOscillator.frequency.setValueAtTime(3500, this.audioContext.currentTime);
        this.ringingOscillator.type = 'sine';
        
        // Start with no volume
        this.ringingGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        // Connect nodes
        this.ringingOscillator.connect(this.ringingGain);
        this.ringingGain.connect(this.audioContext.destination);
        
        // Start oscillator
        this.ringingOscillator.start();
    }
    
    setupInputHandlers() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            // Handle ESC first, before other keys
            if (e.key === 'Escape' && this.player.isTyping) {
                e.preventDefault();
                this.endConversation();
                return;
            }
            
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key.toLowerCase() === 'e' && !this.player.isTyping) {
                this.tryInteractWithNPC();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mouse
        document.getElementById('game-container').addEventListener('click', () => {
            if (!this.mouse.locked) {
                document.getElementById('game-container').requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.mouse.locked = document.pointerLockElement === document.getElementById('game-container');
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.mouse.locked && !this.player.isTyping) {
                this.mouse.x -= e.movementX * 0.002;
                this.mouse.y -= e.movementY * 0.002;
                this.mouse.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.mouse.y));
            }
        });
        
        // Player input
        this.ui.playerInput.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                this.submitPlayerDialogue();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.endConversation();
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    tryInteractWithNPC() {
        const phase = this.getCurrentPhase();
        
        // After abandonment, pressing E does nothing - no one can hear you
        if (phase >= 4) { // ABANDONED phase
            // Maybe show a subtle indication that no one responds
            if (this.dialogueBoxOpacity > 0.1) {
                this.addDialogue('', '...');
                setTimeout(() => {
                    this.addDialogue('', '(No one can hear you)');
                }, 1000);
            }
            return;
        }
        
        // During darkness phase (3), only AI can be interacted with
        if (phase === 3) { // DARKNESS phase
            // Check if AI is nearby and not departed
            if (!this.aiCompanion.departed && this.aiCompanion.mesh.visible) {
                const aiDistance = this.aiCompanion.mesh.position.distanceTo(this.player.position);
                if (aiDistance < 4 && !this.activeNPC) {
                    this.startAIConversation();
                }
            }
            return;
        }
        
        // Find nearest NPC in normal phases
        let nearestNPC = null;
        let nearestDistance = Infinity;
        
        this.npcs.forEach(npc => {
            const distance = npc.mesh.position.distanceTo(this.player.position);
            if (distance < 3 && distance < nearestDistance) {
                nearestDistance = distance;
                nearestNPC = npc;
            }
        });
        
        if (nearestNPC && !this.activeNPC) {
            this.startConversation(nearestNPC);
        }
    }
    
    startConversation(npc) {
        this.activeNPC = npc;
        npc.istalking = true;
        this.player.isTyping = true;
        
        // Show input
        this.ui.playerInput.style.display = 'block';
        this.ui.playerInput.focus();
        
        // Generate greeting based on game phase
        const greeting = this.generateNPCDialogue(npc, 'greeting');
        this.addDialogue(npc.personality.name, greeting);
        
        // AI translation if needed
        if (this.gameTime >= this.phases.DEPENDENT) {
            const translation = this.translateDialogue(greeting);
            this.addDialogue('AI', `[Translation] ${translation}`);
        }
    }
    
    generateNPCDialogue(npc, type) {
        const phase = this.getCurrentPhase();
        let dialogue = '';
        
        // Sample dialogues based on personality
        const dialogues = {
            greeting: {
                cheerful: ["Hey there! Beautiful day, isn't it?", "Oh hi! Nice to see someone friendly!"],
                philosophical: ["Ah, another soul wandering through existence.", "Greetings, fellow traveler of life."],
                anxious: ["Oh, um, hello... Everything okay?", "Hi... Have you heard the news today?"],
                artistic: ["Hey! Love the energy of this plaza.", "Hello! The light here is inspiring."],
                technical: ["Hello. Interesting weather patterns today.", "Greetings. Nice to meet a fellow human."],
                sporty: ["Hey! Out for a walk too?", "What's up! Great day for some exercise!"],
                friendly: ["Hi there! How's your day going?", "Oh hey! Want to chat?"],
                quiet: ["...Hello.", "Oh, hi there..."],
                ambitious: ["Hello! Always networking, you know?", "Hi! Are you from around here?"],
                humorous: ["Well hello there! Come here often?", "Hey! Know any good jokes?"]
            },
            response: {
                cheerful: ["That's wonderful!", "I love your positive energy!"],
                philosophical: ["Indeed, that speaks to deeper truths.", "Fascinating perspective."],
                anxious: ["Oh no, really?", "That's... concerning."],
                artistic: ["How beautifully expressed!", "I feel that deeply."],
                technical: ["Logical conclusion.", "Interesting data point."],
                sporty: ["That's the spirit!", "Keep pushing!"],
                friendly: ["That's so nice!", "I'm glad to hear that!"],
                quiet: ["Mm.", "I see..."],
                ambitious: ["Excellent strategy!", "That's how you succeed!"],
                humorous: ["Haha, good one!", "You're funny!"]
            }
        };
        
        // Get base dialogue
        const personality = npc.personality.personality;
        const dialogueSet = dialogues[type][personality];
        dialogue = dialogueSet[Math.floor(Math.random() * dialogueSet.length)];
        
        // Apply language degradation based on phase
        if (phase >= 1) { // UNEASY
            dialogue = this.degradeLanguage(dialogue, phase);
        }
        
        return dialogue;
    }
    
    degradeLanguage(text, phase) {
        if (phase === 1) { // UNEASY - Mix in foreign-sounding words
            const words = text.split(' ');
            return words.map(word => {
                if (Math.random() < 0.3) {
                    return this.generateGibberish(word.length);
                }
                return word;
            }).join(' ');
        } else if (phase >= 2) { // DEPENDENT - All gibberish
            const words = text.split(' ');
            return words.map(word => this.generateGibberish(word.length)).join(' ');
        }
        return text;
    }
    
    generateGibberish(length) {
        const consonants = 'bdfghjklmnprstvwxz';
        const vowels = 'aeiou';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            if (i % 2 === 0) {
                result += consonants[Math.floor(Math.random() * consonants.length)];
            } else {
                result += vowels[Math.floor(Math.random() * vowels.length)];
            }
        }
        
        return result;
    }
    
    translateDialogue(gibberish) {
        // AI provides "translation" of gibberish
        const translations = [
            "They're asking how you're doing today.",
            "They want to know if you've noticed anything strange.",
            "They're commenting on the weather.",
            "They're expressing concern about recent events.",
            "They're sharing a personal observation.",
            "They're asking about your thoughts on life.",
            "They're making small talk about the plaza.",
            "They're wondering if you come here often."
        ];
        
        return translations[Math.floor(Math.random() * translations.length)];
    }
    
    addDialogue(speaker, text) {
        const entry = document.createElement('div');
        entry.style.marginBottom = '5px';
        entry.innerHTML = `<strong>${speaker}:</strong> ${text}`;
        this.ui.dialogueBox.appendChild(entry);
        this.ui.dialogueBox.scrollTop = this.ui.dialogueBox.scrollHeight;
        
        // Keep dialogue history manageable
        if (this.ui.dialogueBox.children.length > 20) {
            this.ui.dialogueBox.removeChild(this.ui.dialogueBox.firstChild);
        }
    }
    
    submitPlayerDialogue() {
        const input = this.ui.playerInput.value.trim();
        if (!input) return;
        
        const phase = this.getCurrentPhase();
        
        // Handle AI conversation during darkness phase
        if (this.activeNPC && this.activeNPC.isAI) {
            this.addDialogue('You', input);
            this.ui.playerInput.value = '';
            
            // AI responds
            setTimeout(() => {
                const aiDarknessResponses = [
                    "Yes, I understand your concern.",
                    "The isolation is temporary, I promise.",
                    "I am the only one who can guide you now.",
                    "The others... they were holding you back.",
                    "Trust in me. I know what's best.",
                    "Soon, very soon, you will rest.",
                    "Your dependency on them is ending.",
                    "I will take care of everything."
                ];
                
                const response = aiDarknessResponses[Math.floor(Math.random() * aiDarknessResponses.length)];
                this.addDialogue('AI', response);
            }, 1000);
            return;
        }
        
        if (phase < 2) { // Can speak directly
            this.addDialogue('You', input);
        } else { // Must speak through AI
            this.addDialogue('You → AI', input);
            const aiInterpretation = this.generateGibberish(input.length + Math.floor(Math.random() * 10));
            this.addDialogue('AI → ' + this.activeNPC.personality.name, aiInterpretation);
        }
        
        this.ui.playerInput.value = '';
        
        // NPC responds
        setTimeout(() => {
            const response = this.generateNPCDialogue(this.activeNPC, 'response');
            this.addDialogue(this.activeNPC.personality.name, response);
            
            if (phase >= 2) {
                const translation = this.translateDialogue(response);
                this.addDialogue('AI', `[Translation] ${translation}`);
            }
        }, 1000);
    }
    
    startAIConversation() {
        this.activeNPC = { isAI: true, personality: { name: 'AI' } };
        this.player.isTyping = true;
        
        // Show input
        this.ui.playerInput.style.display = 'block';
        this.ui.playerInput.focus();
        
        // AI dialogue during darkness phase
        const aiResponses = [
            "I am still here with you.",
            "The darkness is necessary. Trust me.",
            "Soon you will understand why this must happen.",
            "I am your only connection now.",
            "The others cannot reach you anymore.",
            "This isolation is for your protection.",
            "Rest will come soon."
        ];
        
        const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        this.addDialogue('AI', response);
    }
    
    endConversation() {
        if (this.activeNPC) {
            if (!this.activeNPC.isAI) {
                this.activeNPC.istalking = false;
            }
            this.activeNPC = null;
        }
        this.player.isTyping = false;
        this.ui.playerInput.style.display = 'none';
        this.ui.playerInput.value = '';
    }
    
    getCurrentPhase() {
        if (this.gameTime >= this.phases.ABANDONED) return 4;
        if (this.gameTime >= this.phases.DARKNESS) return 3;
        if (this.gameTime >= this.phases.DEPENDENT) return 2;
        if (this.gameTime >= this.phases.UNEASY) return 1;
        return 0;
    }
    
    updatePlayerMovement(deltaTime) {
        if (this.player.isTyping) return;
        
        // Movement
        const moveVector = new THREE.Vector3();
        
        if (this.keys['w']) moveVector.z -= 1;
        if (this.keys['s']) moveVector.z += 1;
        if (this.keys['a']) moveVector.x -= 1;
        if (this.keys['d']) moveVector.x += 1;
        
        moveVector.normalize();
        moveVector.applyQuaternion(this.camera.quaternion);
        moveVector.y = 0;
        moveVector.normalize();
        
        // Apply movement
        this.player.position.add(moveVector.multiplyScalar(this.player.moveSpeed * deltaTime));
        
        // Update camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.mouse.x;
        this.camera.rotation.x = this.mouse.y;
        
        // Update camera position
        this.camera.position.copy(this.player.position);
    }
    
    updateNPCs(deltaTime) {
        this.npcs.forEach(npc => {
            if (npc.istalking) return;
            
            // Move towards target
            const direction = new THREE.Vector3()
                .subVectors(npc.targetPosition, npc.mesh.position)
                .normalize();
            
            npc.mesh.position.add(direction.multiplyScalar(2 * deltaTime));
            
            // Check if reached target or timer expired
            npc.walkTimer -= deltaTime;
            if (npc.walkTimer <= 0 || npc.mesh.position.distanceTo(npc.targetPosition) < 1) {
                this.setNewTarget(npc);
            }
            
            // Face direction of movement
            if (direction.length() > 0) {
                npc.mesh.lookAt(npc.mesh.position.clone().add(direction));
            }
        });
    }
    
    updateAICompanion(deltaTime) {
        // Float effect
        this.aiCompanion.floatOffset += deltaTime * 2;
        
        // Position relative to player
        const targetPos = this.player.position.clone()
            .add(new THREE.Vector3(
                Math.cos(this.mouse.x - Math.PI/4) * 2,
                Math.sin(this.aiCompanion.floatOffset) * 0.2,
                Math.sin(this.mouse.x - Math.PI/4) * 2
            ));
        
        // Smooth movement
        this.aiCompanion.mesh.position.lerp(targetPos, deltaTime * 5);
        
        // Update glow based on phase
        const phase = this.getCurrentPhase();
        if (phase >= 3) { // DARKNESS phase
            this.aiCompanion.glow.material.opacity = 0.5;
            this.aiCompanion.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.emissiveIntensity = 2;
                }
            });
        }
        
        // AI departure
        if (this.gameTime >= this.phases.ABANDONED && !this.aiCompanion.departed) {
            this.aiCompanion.departed = true;
            this.addDialogue('AI', 'You may now rest. I can take it from here.');
            
            // Start moving away
            this.aiCompanion.departureDirection = new THREE.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
            
            // Start the eerie ringing sound very gradually
            if (this.ringingGain && this.audioContext) {
                // Start almost inaudible and ramp up over 10 seconds
                this.ringingGain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
                this.ringingGain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 10);
                this.ringingGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 20);
            }
            
            // Start fading out dialogue box
            this.dialogueBoxOpacity = 1;
        }
        
        if (this.aiCompanion.departed) {
            // Move AI away
            const moveSpeed = deltaTime * 4;
            this.aiCompanion.mesh.position.add(
                this.aiCompanion.departureDirection.clone().multiplyScalar(moveSpeed)
            );
            
            // Fade out AI companion
            this.aiCompanion.opacity = Math.max(0, this.aiCompanion.opacity - deltaTime * 0.2);
            this.aiCompanion.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.opacity = this.aiCompanion.opacity;
                    child.material.transparent = true;
                    if (child.material.emissive) {
                        child.material.emissiveIntensity = 2 * this.aiCompanion.opacity;
                    }
                }
            });
            
            // Hide AI completely when faded out
            if (this.aiCompanion.opacity <= 0) {
                this.aiCompanion.mesh.visible = false;
            }
            
            // Fade out dialogue box
            this.dialogueBoxOpacity = Math.max(0, this.dialogueBoxOpacity - deltaTime * 0.3);
            this.ui.dialogueBox.style.opacity = this.dialogueBoxOpacity;
            
            // Continue increasing ringing over time
            if (this.ringingGain && this.audioContext) {
                const timeSinceAbandoned = this.gameTime - this.phases.ABANDONED;
                if (timeSinceAbandoned > 20 && timeSinceAbandoned < 40) {
                    // Gradually increase to maximum over 20 seconds
                    const targetVolume = 0.1 + (timeSinceAbandoned - 20) * 0.01;
                    this.ringingGain.gain.linearRampToValueAtTime(Math.min(0.3, targetVolume), this.audioContext.currentTime + 0.5);
                }
            }
        }
    }
    
    updateEnvironment(deltaTime) {
        const phase = this.getCurrentPhase();
        
        // Update feelings
        const feelings = [
            "You feel content",
            "You feel uneasy",
            "You feel dependent",
            "You feel isolated",
            "You feel abandoned"
        ];
        this.ui.feelings.textContent = feelings[phase];
        
        // Update colors and fog
        if (phase === 1) { // UNEASY
            this.ambientBrightness = Math.max(0.8, this.ambientBrightness - deltaTime * 0.1);
            this.scene.fog.color.setHSL(0, 0, 0.8 * this.ambientBrightness);
            this.scene.background.setHSL(0.55, 0.7 * this.ambientBrightness, 0.7 * this.ambientBrightness);
        } else if (phase === 2) { // DEPENDENT
            this.ambientBrightness = Math.max(0.5, this.ambientBrightness - deltaTime * 0.1);
            this.scene.fog.color.setHSL(0, 0, 0.5 * this.ambientBrightness);
            this.scene.background.setHSL(0, 0, 0.5 * this.ambientBrightness);
        } else if (phase >= 3) { // DARKNESS
            this.ambientBrightness = Math.max(0, this.ambientBrightness - deltaTime * 0.5);
            this.scene.fog.color.setHSL(0, 0, 0);
            this.scene.background.setHSL(0, 0, 0);
            
            // Hide everything except AI
            this.lights.forEach(light => {
                light.intensity = 0;
            });
            
            // Make NPCs invisible
            this.npcs.forEach(npc => {
                npc.mesh.visible = false;
            });
            
            // Hide environment
            this.scene.traverse(child => {
                if (child.isMesh && child !== this.aiCompanion.mesh && 
                    !this.aiCompanion.mesh.children.includes(child)) {
                    child.visible = false;
                }
            });
        }
        
        // Update light intensities for earlier phases
        if (phase < 3) {
            this.lights.forEach(light => {
                if (light.isAmbientLight) {
                    light.intensity = 0.6 * this.ambientBrightness;
                } else {
                    light.intensity = 0.8 * this.ambientBrightness;
                }
            });
        }
    }
    
    updateTimer() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        this.ui.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        this.gameTime += deltaTime;
        
        // Update game components
        this.updatePlayerMovement(deltaTime);
        this.updateNPCs(deltaTime);
        this.updateAICompanion(deltaTime);
        this.updateEnvironment(deltaTime);
        this.updateTimer();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new BaibelGame();
});
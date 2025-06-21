// Game State Manager
class GameState {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.amoeba = null;
        this.terrain = null;
        this.ai = null;
        this.ui = null;
        
        this.gameStartTime = null;
        this.gameDuration = 60; // 60 seconds
        this.isGameRunning = false;
        this.isGameEnded = false;
        
        this.playerPosition = { x: 0, z: 0 };
        this.amoebaPosition = { x: 0, z: -50 };
        this.goalPosition = { x: 0, z: 100 };
        
        this.difficulty = 2; // 1=Easy, 2=Medium, 3=Hard, 4=Nightmare
        this.difficultySettings = {
            1: { interval: 5000, speed: 0.1 }, // Easy: 5s intervals, slow
            2: { interval: 3000, speed: 0.15 }, // Medium: 3s intervals
            3: { interval: 2000, speed: 0.2 }, // Hard: 2s intervals
            4: { interval: 1000, speed: 0.25 }  // Nightmare: 1s intervals
        };
        
        this.gameModifiers = {
            invertedControls: false,
            rotatedView: 0,
            forcedMovement: null, // 'crouch', 'jump', 'crawl'
            playerSpeedMultiplier: 1.0,
            amoebaSpeedMultiplier: 1.0,
            amoebaSizeMultiplier: 1.0
        };
    }
    
    initializeScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 300);
        
        // Create camera with proper ground-level positioning
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.5, 0); // At ground level + 1.5 units
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Append renderer to game canvas
        const gameCanvas = document.getElementById('game-canvas');
        gameCanvas.appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    startGame(openaiKey, openaiModel, difficulty) {
        this.isGameRunning = true;
        this.isGameEnded = false;
        this.gameStartTime = Date.now();
        this.difficulty = difficulty;
        
        // Reset game modifiers
        this.gameModifiers = {
            invertedControls: false,
            rotatedView: 0,
            forcedMovement: null,
            playerSpeedMultiplier: 1.0,
            amoebaSpeedMultiplier: 1.0,
            amoebaSizeMultiplier: 1.0
        };
        
        // Initialize game components
        this.terrain = new TerrainManager(this.scene);
        this.player = new PlayerManager(this.scene, this.camera);
        this.amoeba = new AmoebaManager(this.scene);
        this.ai = new AIManager(openaiKey, openaiModel);
        this.ui = new UIManager();
        
        // Position entities
        this.player.setPosition(this.playerPosition.x, this.playerPosition.z);
        this.amoeba.setPosition(this.amoebaPosition.x, this.amoebaPosition.z);
        
        // Start AI decision loop
        this.startAILoop();
        
        // Start game loop
        this.gameLoop();
    }
    
    startAILoop() {
        if (!this.isGameRunning) return;
        
        const settings = this.difficultySettings[this.difficulty];
        
        setTimeout(() => {
            if (this.isGameRunning && !this.isGameEnded) {
                console.log(`🎮 GAME: AI decision cycle starting (${this.getDifficultyName(this.difficulty)} difficulty, ${settings.interval}ms interval)`);
                
                this.ai.makeDecision(this.getGameStateForAI())
                    .then(action => {
                        if (action && this.isGameRunning) {
                            console.log('🎮 GAME: Executing AI action:', action);
                            this.executeAmoebaAction(action);
                        } else {
                            console.warn('🎮 GAME: No action received from AI');
                        }
                    })
                    .catch(error => {
                        console.error('❌ GAME: AI decision failed, using fallback:', error.message);
                        // Fallback to basic AI behavior
                        const fallbackAction = this.getFallbackAIAction();
                        if (fallbackAction && this.isGameRunning) {
                            console.log('🔄 GAME: Executing fallback action:', fallbackAction);
                            // Log fallback to in-game action log BEFORE executing action
                            this.ui.logAction('⚠️ AI OFFLINE - Backup AI active');
                            this.executeAmoebaAction(fallbackAction);
                            // Add additional context about the fallback action
                            this.ui.logAction(`🤖 Backup AI: ${this.getActionDescription(fallbackAction)}`);
                        }
                    });
                
                this.startAILoop(); // Continue the loop
            }
        }, settings.interval);
    }
    
    getGameStateForAI() {
        const playerPos = this.player.getPosition();
        const amoebaPos = this.amoeba.getPosition();
        const timeLeft = this.getTimeLeft();
        const distanceToPlayer = Math.sqrt(
            Math.pow(playerPos.x - amoebaPos.x, 2) + 
            Math.pow(playerPos.z - amoebaPos.z, 2)
        );
        
        return {
            playerPosition: playerPos,
            amoebaPosition: amoebaPos,
            goalPosition: this.goalPosition,
            timeLeft: timeLeft,
            distanceToPlayer: distanceToPlayer,
            currentModifiers: { ...this.gameModifiers },
            difficulty: this.difficulty
        };
    }
    
    executeAmoebaAction(action) {
        console.log('🧬 AMOEBA: Executing action:', action.type, action);
        
        switch (action.type) {
            case 'move':
                this.amoeba.move(action.direction, action.speed || this.difficultySettings[this.difficulty].speed);
                this.ui.logAction(`Amoeba moves ${action.direction}`);
                console.log('🧬 AMOEBA: Moved', action.direction);
                break;
                
            case 'invert_controls':
                this.gameModifiers.invertedControls = !this.gameModifiers.invertedControls;
                this.ui.logAction('Amoeba inverts your controls!');
                console.log('🧬 AMOEBA: Inverted controls, now:', this.gameModifiers.invertedControls);
                break;
                
            case 'rotate_view':
                this.gameModifiers.rotatedView = (this.gameModifiers.rotatedView + 90) % 360;
                this.ui.logAction('Amoeba rotates your view!');
                console.log('🧬 AMOEBA: Rotated view to:', this.gameModifiers.rotatedView + '°');
                break;
                
            case 'force_movement':
                this.gameModifiers.forcedMovement = action.movement;
                this.ui.logAction(`Amoeba forces you to ${action.movement}!`);
                console.log('🧬 AMOEBA: Forced movement:', action.movement);
                break;
                
            case 'decrease_speed':
                const oldSpeed = this.gameModifiers.playerSpeedMultiplier;
                this.gameModifiers.playerSpeedMultiplier = Math.max(0.3, this.gameModifiers.playerSpeedMultiplier - 0.1);
                this.ui.logAction('Amoeba slows you down!');
                console.log('🧬 AMOEBA: Decreased player speed from', oldSpeed.toFixed(2), 'to', this.gameModifiers.playerSpeedMultiplier.toFixed(2));
                break;
                
            case 'increase_size':
                this.gameModifiers.amoebaSizeMultiplier += 0.2;
                this.amoeba.updateSize(this.gameModifiers.amoebaSizeMultiplier);
                this.ui.logAction('Amoeba grows larger!');
                console.log('🧬 AMOEBA: Increased size to:', this.gameModifiers.amoebaSizeMultiplier.toFixed(2));
                break;
                
            case 'increase_speed':
                this.gameModifiers.amoebaSpeedMultiplier += 0.1;
                this.ui.logAction('Amoeba moves faster!');
                console.log('🧬 AMOEBA: Increased amoeba speed to:', this.gameModifiers.amoebaSpeedMultiplier.toFixed(2));
                break;
                
            default:
                console.warn('🧬 AMOEBA: Unknown action type:', action.type);
                break;
        }
    }
    
    gameLoop() {
        if (!this.isGameRunning) return;
        
        // Update game time and UI
        const timeLeft = this.getTimeLeft();
        this.ui.updateTimer(timeLeft);
        
        // Update color saturation based on time
        this.updateEnvironmentColor(timeLeft);
        
        // Update entities
        if (this.player) this.player.update(this.gameModifiers);
        if (this.amoeba) this.amoeba.update();
        
        // Check win/lose conditions
        this.checkGameConditions();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
        
        // Continue game loop
        if (this.isGameRunning && !this.isGameEnded) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    getTimeLeft() {
        if (!this.gameStartTime) return this.gameDuration;
        const elapsed = (Date.now() - this.gameStartTime) / 1000;
        return Math.max(0, this.gameDuration - elapsed);
    }
    
    updateEnvironmentColor(timeLeft) {
        const colorIntensity = timeLeft / this.gameDuration;
        const grayValue = Math.floor((1 - colorIntensity) * 255);
        
        // Update fog color
        this.scene.fog.color.setRGB(
            (135 + grayValue * 0.5) / 255,
            (206 + grayValue * 0.3) / 255,
            (235 + grayValue * 0.1) / 255
        );
        
        // Update clear color
        this.renderer.setClearColor(new THREE.Color(
            (135 + grayValue * 0.5) / 255,
            (206 + grayValue * 0.3) / 255,
            (235 + grayValue * 0.1) / 255
        ));
    }
    
    checkGameConditions() {
        const playerPos = this.player.getPosition();
        const amoebaPos = this.amoeba.getPosition();
        const timeLeft = this.getTimeLeft();
        
        // Check if amoeba caught player
        const distanceToAmoeba = Math.sqrt(
            Math.pow(playerPos.x - amoebaPos.x, 2) + 
            Math.pow(playerPos.z - amoebaPos.z, 2)
        );
        
        if (distanceToAmoeba < 3) {
            this.endGame('Hysterai');
            return;
        }
        
        // Check if player reached goal
        const distanceToGoal = Math.sqrt(
            Math.pow(playerPos.x - this.goalPosition.x, 2) + 
            Math.pow(playerPos.z - this.goalPosition.z, 2)
        );
        
        if (distanceToGoal < 5) {
            this.endGame('Great Job! You must now keep playing forever');
            return;
        }
        
        // Check if time ran out
        if (timeLeft <= 0) {
            this.endGame("You've run out of time");
            return;
        }
    }
    
    endGame(message) {
        this.isGameRunning = false;
        this.isGameEnded = true;
        
        // Show end screen
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('end-screen').classList.add('active');
        document.getElementById('end-message').textContent = message;
        
        // If player won, increase difficulty for next round
        if (message.includes('Great Job')) {
            this.difficulty = Math.min(4, this.difficulty + 1);
        }
    }
    
    getDifficultyName(difficulty) {
        const names = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Nightmare' };
        return names[difficulty] || 'Medium';
    }
    
    getActionDescription(action) {
        switch (action.type) {
            case 'move':
                return `Moving ${action.direction}`;
            case 'invert_controls':
                return 'Inverting player controls';
            case 'rotate_view':
                return 'Rotating player view';
            case 'decrease_speed':
                return 'Slowing player down';
            case 'increase_speed':
                return 'Increasing amoeba speed';
            case 'increase_size':
                return 'Growing larger';
            case 'force_movement':
                return `Forcing player to ${action.movement}`;
            default:
                return `Unknown action: ${action.type}`;
        }
    }
    
    getFallbackAIAction() {
        // More varied fallback AI when OpenAI is not available
        const playerPos = this.player.getPosition();
        const amoebaPos = this.amoeba.getPosition();
        const distanceToPlayer = Math.sqrt(
            Math.pow(playerPos.x - amoebaPos.x, 2) + 
            Math.pow(playerPos.z - amoebaPos.z, 2)
        );
        
        const timeLeft = this.getTimeLeft();
        
        // Strategic actions with more variety - reduce movement bias
        const possibleActions = [
            { type: 'move', direction: 'towards_player' },
            { type: 'invert_controls' },
            { type: 'rotate_view' },
            { type: 'decrease_speed' },
            { type: 'increase_speed' },
            { type: 'increase_size' },
            { type: 'force_movement', movement: 'crouch' },
            { type: 'force_movement', movement: 'crawl' },
            { type: 'force_movement', movement: 'jump' }
        ];
        
        // Filter actions based on game state
        let availableActions = [...possibleActions];
        
        // Prioritize different actions based on situation
        if (distanceToPlayer > 25) {
            // Far from player - prefer movement and speed
            availableActions = [
                { type: 'move', direction: 'towards_player' },
                { type: 'increase_speed' },
                { type: 'increase_size' }
            ];
        } else if (distanceToPlayer < 15) {
            // Close to player - prefer disruption
            availableActions = [
                { type: 'invert_controls' },
                { type: 'rotate_view' },
                { type: 'decrease_speed' },
                { type: 'force_movement', movement: 'crouch' },
                { type: 'force_movement', movement: 'crawl' }
            ];
        } else if (timeLeft < 20) {
            // Time pressure - be aggressive
            availableActions = [
                { type: 'invert_controls' },
                { type: 'decrease_speed' },
                { type: 'rotate_view' },
                { type: 'force_movement', movement: 'crawl' },
                { type: 'increase_size' }
            ];
        }
        
        // Random selection from filtered actions
        const randomIndex = Math.floor(Math.random() * availableActions.length);
        return availableActions[randomIndex];
    }
    
    cleanup() {
        this.isGameRunning = false;
        this.isGameEnded = true;
        
        if (this.renderer && this.renderer.domElement) {
            const gameCanvas = document.getElementById('game-canvas');
            if (gameCanvas && gameCanvas.contains(this.renderer.domElement)) {
                gameCanvas.removeChild(this.renderer.domElement);
            }
        }
        
        if (this.scene) {
            // Clean up scene objects
            while (this.scene.children.length > 0) {
                this.scene.remove(this.scene.children[0]);
            }
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.amoeba = null;
        this.terrain = null;
        this.ai = null;
        this.ui = null;
    }
}

// Global game instance
window.gameState = null; 
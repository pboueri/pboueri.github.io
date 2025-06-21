// Main Application Entry Point
class HysteraiApp {
    constructor() {
        this.gameState = null;
        this.titleSwitchInterval = null;
        this.titleElement = document.getElementById('game-title');
        this.isHysteria = true;
        
        this.initializeApp();
    }
    
    initializeApp() {
        // Start title switching animation
        this.startTitleSwitching();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup pointer lock change listener
        document.addEventListener('pointerlockchange', () => {
            if (!document.pointerLockElement && this.gameState && this.gameState.isGameRunning) {
                // Re-request pointer lock if it was lost during gameplay
                setTimeout(() => {
                    document.body.requestPointerLock();
                }, 100);
            }
        });
    }
    
    startTitleSwitching() {
        // Switch between "HYSTERIA" and "HYSTERAI" with static effect
        this.titleSwitchInterval = setInterval(() => {
            if (this.titleElement) {
                this.isHysteria = !this.isHysteria;
                this.titleElement.textContent = this.isHysteria ? 'HYSTERIA' : 'HYSTERAI';
                
                // Add static effect
                this.titleElement.style.textShadow = this.isHysteria ? 
                    '0 0 20px #0ff, 0 0 40px #0ff' : 
                    '0 0 20px #f0f, 0 0 40px #f0f, 2px 2px 0px #fff';
            }
        }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
    }
    
    setupEventListeners() {
        // Play button
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.startGame());
        }
        
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        // Difficulty slider
        const difficultySlider = document.getElementById('difficulty');
        if (difficultySlider) {
            difficultySlider.addEventListener('input', (e) => {
                this.updateDifficultyDisplay(e.target.value);
            });
        }
        
        // API key input - show/hide functionality
        const apiKeyInput = document.getElementById('openai-key');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('focus', () => {
                apiKeyInput.type = 'text';
            });
            
            apiKeyInput.addEventListener('blur', () => {
                apiKeyInput.type = 'password';
            });
        }
        
        // Prevent default behavior for game controls
        document.addEventListener('keydown', (e) => {
            if (this.gameState && this.gameState.isGameRunning) {
                // Prevent default for arrow keys, WASD, and space
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
                    e.preventDefault();
                }
            }
        });
    }
    
    updateDifficultyDisplay(value) {
        const labels = ['Easy', 'Medium', 'Hard', 'Nightmare'];
        const difficultyLabels = document.querySelectorAll('.difficulty-labels span');
        
        difficultyLabels.forEach((label, index) => {
            label.style.color = (index + 1) == value ? '#0ff' : '#666';
            label.style.fontWeight = (index + 1) == value ? 'bold' : 'normal';
        });
    }
    
    async startGame() {
        // Validate inputs
        const apiKey = document.getElementById('openai-key').value.trim();
        const model = document.getElementById('openai-model').value;
        const difficulty = parseInt(document.getElementById('difficulty').value);
        
        if (!apiKey) {
            alert('Please enter your OpenAI API key');
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            alert('Please enter a valid OpenAI API key (starts with sk-)');
            return;
        }
        
        // Stop title switching
        if (this.titleSwitchInterval) {
            clearInterval(this.titleSwitchInterval);
        }
        
        // Show loading state
        const playBtn = document.getElementById('play-btn');
        const originalText = playBtn.textContent;
        playBtn.textContent = 'INITIALIZING...';
        playBtn.disabled = true;
        
        try {
            // Test API connection
            const aiManager = new AIManager(apiKey, model);
            const connectionTest = await aiManager.testConnection();
            
            if (!connectionTest) {
                throw new Error('Failed to connect to OpenAI API. Please check your API key.');
            }
            
            // Initialize game
            this.gameState = new GameState();
            this.gameState.initializeScene();
            
            // Switch to game screen
            this.switchToGameScreen();
            
            // Start the game
            this.gameState.startGame(apiKey, model, difficulty);
            
            // Store reference globally
            window.gameState = this.gameState;
            
        } catch (error) {
            console.error('Game initialization error:', error);
            alert(`Failed to start game: ${error.message}`);
            
            // Reset button state
            playBtn.textContent = originalText;
            playBtn.disabled = false;
            
            // Restart title switching
            this.startTitleSwitching();
        }
    }
    
    switchToGameScreen() {
        document.getElementById('menu-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        document.getElementById('end-screen').classList.remove('active');
        
        // Request pointer lock
        setTimeout(() => {
            document.body.requestPointerLock();
        }, 100);
    }
    
    restartGame() {
        // Clean up current game
        if (this.gameState) {
            this.gameState.cleanup();
            this.gameState = null;
            window.gameState = null;
        }
        
        // Reset screens
        document.getElementById('menu-screen').classList.add('active');
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('end-screen').classList.remove('active');
        
        // Reset button states
        const playBtn = document.getElementById('play-btn');
        playBtn.textContent = 'PLAY';
        playBtn.disabled = false;
        
        // Restart title switching
        this.startTitleSwitching();
        
        // Exit pointer lock
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    
    // Static method to initialize the app
    static initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new HysteraiApp();
            });
        } else {
            new HysteraiApp();
        }
    }
}

// Initialize the application
HysteraiApp.initialize();

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Uncaught error:', e.error);
    
    // If game is running, try to recover
    if (window.gameState && window.gameState.isGameRunning) {
        console.log('Attempting to recover from error...');
        
        // Show error message to user
        if (window.gameState.ui) {
            window.gameState.ui.showMessage('Error occurred - game may be unstable', 5000);
        }
    }
});

// Handle window beforeunload to clean up
window.addEventListener('beforeunload', () => {
    if (window.gameState) {
        window.gameState.cleanup();
    }
});

// Console debug helpers
window.debugHysterai = {
    getGameState: () => window.gameState,
    toggleAI: () => {
        if (window.gameState && window.gameState.ai) {
            console.log('AI Debug - Current game state:', window.gameState.getGameStateForAI());
        }
    },
    forceAIAction: (action) => {
        if (window.gameState) {
            window.gameState.executeAmoebaAction(action);
        }
    }
};

console.log('Hysterai loaded. Use window.debugHysterai for debugging.'); 
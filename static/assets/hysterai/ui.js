// UI Manager
class UIManager {
    constructor() {
        this.timerElement = document.getElementById('timer');
        this.minimapElement = document.getElementById('minimap');
        this.actionLogElement = document.getElementById('action-log');
        this.minimapCanvas = null;
        this.minimapCtx = null;
        
        this.actionLog = [];
        this.maxLogEntries = 20;
        
        this.initializeMinimap();
        this.initializeActionLog();
    }
    
    initializeMinimap() {
        // Create canvas for minimap
        this.minimapCanvas = document.createElement('canvas');
        this.minimapCanvas.width = 180;
        this.minimapCanvas.height = 180;
        this.minimapCanvas.style.width = '100%';
        this.minimapCanvas.style.height = '100%';
        this.minimapCanvas.style.borderRadius = '5px';
        
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        this.minimapElement.appendChild(this.minimapCanvas);
        
        // Start minimap update loop
        this.updateMinimap();
    }
    
    initializeActionLog() {
        this.actionLogElement.innerHTML = `
            <div style="color: #0ff; font-weight: bold; margin-bottom: 10px;">Amoeba Activity Log</div>
            <div style="color: #888; font-size: 0.8rem;">Game started. The amoeba is awakening...</div>
        `;
    }
    
    updateTimer(timeLeft) {
        if (!this.timerElement) return;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.timerElement.textContent = timeString;
        
        // Update timer styling based on time left
        this.timerElement.className = '';
        if (timeLeft <= 15) {
            this.timerElement.classList.add('danger');
        } else if (timeLeft <= 30) {
            this.timerElement.classList.add('warning');
        }
    }
    
    updateMinimap() {
        if (!this.minimapCtx || !window.gameState) {
            requestAnimationFrame(() => this.updateMinimap());
            return;
        }
        
        const ctx = this.minimapCtx;
        const canvas = this.minimapCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up coordinate system (map -250 to 250 world coords to 0-180 canvas coords)
        const worldSize = 500; // -250 to 250
        const canvasSize = 180;
        const scale = canvasSize / worldSize;
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 100, 0, 0.3)'; // Dark green
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 9; i++) {
            const x = (i * canvasSize) / 9;
            const y = (i * canvasSize) / 9;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasSize);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasSize, y);
            ctx.stroke();
        }
        
        // Draw hill/goal area
        const goalX = centerX + (window.gameState.goalPosition.x * scale);
        const goalY = centerY - (window.gameState.goalPosition.z * scale); // Flip Y for screen coords
        
        ctx.fillStyle = 'rgba(255, 255, 0, 0.6)'; // Yellow for goal
        ctx.beginPath();
        ctx.arc(goalX, goalY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw goal label
        ctx.fillStyle = '#ff0';
        ctx.font = '10px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('GOAL', goalX, goalY - 12);
        
        // Draw player position
        if (window.gameState.player) {
            const playerPos = window.gameState.player.getPosition();
            const playerX = centerX + (playerPos.x * scale);
            const playerY = centerY - (playerPos.z * scale);
            
            ctx.fillStyle = '#0ff'; // Cyan for player
            ctx.beginPath();
            ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw player direction indicator
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(playerX, playerY);
            ctx.lineTo(playerX, playerY - 8);
            ctx.stroke();
        }
        
        // Draw amoeba position
        if (window.gameState.amoeba) {
            const amoebaPos = window.gameState.amoeba.getPosition();
            const amoebaX = centerX + (amoebaPos.x * scale);
            const amoebaY = centerY - (amoebaPos.z * scale);
            
            ctx.fillStyle = '#f0f'; // Magenta for amoeba
            ctx.beginPath();
            ctx.arc(amoebaX, amoebaY, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw amoeba glow effect
            ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(amoebaX, amoebaY, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw distance line between player and amoeba
        if (window.gameState.player && window.gameState.amoeba) {
            const playerPos = window.gameState.player.getPosition();
            const amoebaPos = window.gameState.amoeba.getPosition();
            
            const playerX = centerX + (playerPos.x * scale);
            const playerY = centerY - (playerPos.z * scale);
            const amoebaX = centerX + (amoebaPos.x * scale);
            const amoebaY = centerY - (amoebaPos.z * scale);
            
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(playerX, playerY);
            ctx.lineTo(amoebaX, amoebaY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Continue animation
        requestAnimationFrame(() => this.updateMinimap());
    }
    
    logAction(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            message: message,
            timestamp: timestamp,
            id: Date.now()
        };
        
        this.actionLog.push(logEntry);
        
        // Limit log size
        if (this.actionLog.length > this.maxLogEntries) {
            this.actionLog.shift();
        }
        
        this.updateActionLogDisplay();
    }
    
    updateActionLogDisplay() {
        if (!this.actionLogElement) return;
        
        const logHtml = this.actionLog.map(entry => 
            `<div style="margin-bottom: 5px; padding: 3px; background: rgba(0, 255, 255, 0.1); border-radius: 3px;">
                <span style="color: #888; font-size: 0.7rem;">[${entry.timestamp}]</span><br/>
                <span style="color: #0ff;">${entry.message}</span>
            </div>`
        ).join('');
        
        this.actionLogElement.innerHTML = `
            <div style="color: #0ff; font-weight: bold; margin-bottom: 10px;">Amoeba Activity Log</div>
            ${logHtml}
        `;
        
        // Auto-scroll to bottom
        this.actionLogElement.scrollTop = this.actionLogElement.scrollHeight;
    }
    
    showMessage(message, duration = 3000) {
        // Create temporary message overlay
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #0ff;
            padding: 20px;
            border: 2px solid #0ff;
            border-radius: 10px;
            font-size: 1.5rem;
            font-family: 'Orbitron', monospace;
            text-align: center;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        // Remove message after duration
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, duration);
    }
    
    updateGameStats(stats) {
        // Could be used to display additional game statistics
        console.log('Game stats:', stats);
    }
} 
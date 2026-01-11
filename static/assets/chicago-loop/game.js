// The Chicago Loop - A Strange Loop Game
// Inspired by Conway's Game of Life and GEB

class ChicagoLoopGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelSize = 4; // 8-bit style pixel size

        // Game state
        this.state = 'menu'; // menu, setup, running, won, lost
        this.currentLevel = 0;
        this.generation = 0;
        this.maxGenerations = 100;
        this.simulationSpeed = 500; // ms between generations
        this.simulationInterval = null;

        // Grid (4x4 for player setup, larger for game board)
        this.gridSize = 4;
        this.boardWidth = 20;
        this.boardHeight = 15;
        this.cells = [];
        this.playerPos = { x: 0, y: 0 };
        this.goalPos = { x: 0, y: 0 };

        // Rules (neighbor counts that cause each outcome)
        this.rules = {
            birth: [3],      // New cell born with exactly 3 neighbors
            survive: [2, 3], // Cell survives with 2-3 neighbors
            death: []        // Explicit death rules (computed from survive)
        };

        // Levels configuration
        this.levels = [
            {
                name: "The Tunnels",
                description: "Chicago 1992. The Great Flood. Navigate the mail tunnels to escape.",
                item: "rat",
                itemEmoji: "RAT",
                playerStart: { x: 17, y: 13 },
                goal: { x: 2, y: 1 },
                boardLayout: this.createTunnelLayout,
                bgColor: '#1a1a1a',
                wallColor: '#3a2a1a',
                waterColor: '#2a4a6a'
            },
            {
                name: "The River",
                description: "The Chicago River Y-confluence. Reach the east dock by the locks.",
                item: "fish",
                itemEmoji: "FISH",
                playerStart: { x: 1, y: 7 },
                goal: { x: 18, y: 5 },
                boardLayout: this.createRiverLayout,
                bgColor: '#1a3a4a',
                wallColor: '#4a4a4a',
                waterColor: '#2a5a8a'
            },
            {
                name: "The Streets",
                description: "Downtown Chicago. Navigate the grid to reach your destination.",
                item: "brick",
                itemEmoji: "BRICK",
                playerStart: { x: 17, y: 1 },
                goal: { x: 2, y: 13 },
                boardLayout: this.createStreetLayout,
                bgColor: '#2a2a2a',
                wallColor: '#5a5a5a',
                waterColor: '#3a3a3a'
            }
        ];

        // UI state
        this.selectedCell = { x: 0, y: 0 };
        this.setupGrid = this.createEmptySetupGrid();
        this.ruleInput = { type: 'birth', values: '3' };

        // Solutions for each level (4x4 grids, birth/survive don't share numbers)
        this.solutions = [
            {
                // Level 1: Tunnels - placeholder, will be computed
                setupGrid: [
                    [false, true, true, true],
                    [false, true, true, true],
                    [false, true, true, true],
                    [true, true, true, true]
                ],
                rules: { birth: [1, 2, 3, 4, 5], survive: [0] }
            },
            {
                // Level 2: River - placeholder
                setupGrid: [
                    [true, true, false, false],
                    [true, true, false, false],
                    [true, true, false, false],
                    [true, true, true, true]
                ],
                rules: { birth: [1, 2, 3, 4, 5], survive: [0] }
            },
            {
                // Level 3: Streets - placeholder
                setupGrid: [
                    [true, true, true, false],
                    [true, false, true, false],
                    [true, true, true, false],
                    [false, false, false, false]
                ],
                rules: { birth: [3], survive: [2, 4] }
            }
        ];

        // Input handling
        this.setupInputHandlers();

        // Start
        this.resize();
        this.showMenu();
    }

    createEmptySetupGrid() {
        const grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                grid[y][x] = false;
            }
        }
        return grid;
    }

    createTunnelLayout() {
        // Tunnel system with walls and water
        const layout = [];
        for (let y = 0; y < this.boardHeight; y++) {
            layout[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                // Border walls
                if (x === 0 || x === this.boardWidth - 1 || y === 0 || y === this.boardHeight - 1) {
                    // Leave gaps for start/goal
                    if ((x === 2 && y === 0) || (x === this.boardWidth - 3 && y === this.boardHeight - 1)) {
                        layout[y][x] = 'water';
                    } else {
                        layout[y][x] = 'wall';
                    }
                }
                // Tunnel paths with some walls
                else if ((x % 4 === 0 && y > 2 && y < this.boardHeight - 3) ||
                         (y % 3 === 0 && x > 2 && x < this.boardWidth - 3)) {
                    layout[y][x] = 'wall';
                }
                else {
                    layout[y][x] = 'water';
                }
            }
        }
        return layout;
    }

    createRiverLayout() {
        // Y-shaped river confluence
        const layout = [];
        const centerX = Math.floor(this.boardWidth / 2);
        const centerY = Math.floor(this.boardHeight / 2);

        for (let y = 0; y < this.boardHeight; y++) {
            layout[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                // Create Y shape river
                const distFromCenter = Math.abs(x - centerX);
                const isUpperLeft = x < centerX && y < centerY;
                const isUpperRight = x >= centerX && y < centerY;
                const isLower = y >= centerY;

                // River channel logic
                const riverWidth = 3;
                let isRiver = false;

                if (isLower && distFromCenter < riverWidth) {
                    isRiver = true;
                } else if (isUpperLeft && Math.abs((centerX - x) - (centerY - y)) < riverWidth) {
                    isRiver = true;
                } else if (isUpperRight && Math.abs((x - centerX) - (centerY - y)) < riverWidth) {
                    isRiver = true;
                }

                layout[y][x] = isRiver ? 'water' : 'wall';
            }
        }
        return layout;
    }

    createStreetLayout() {
        // Grid street pattern with buildings
        const layout = [];
        for (let y = 0; y < this.boardHeight; y++) {
            layout[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                // Streets every 4 cells
                const isStreetX = x % 4 === 0 || x % 4 === 1;
                const isStreetY = y % 4 === 0 || y % 4 === 1;

                if (isStreetX || isStreetY) {
                    layout[y][x] = 'water'; // streets are passable
                } else {
                    layout[y][x] = 'wall'; // buildings
                }
            }
        }
        return layout;
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.render();
    }

    setupInputHandlers() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('resize', () => this.resize());
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.state === 'menu') {
            this.handleMenuClick(x, y);
        } else if (this.state === 'setup') {
            this.handleSetupClick(x, y);
        }
    }

    handleMenuClick(x, y) {
        // Check if clicked on "BEGIN" button
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const buttonWidth = 200;
        const buttonHeight = 60;

        if (x > centerX - buttonWidth/2 && x < centerX + buttonWidth/2 &&
            y > centerY + 100 && y < centerY + 100 + buttonHeight) {
            this.startLevel(0);
        }
    }

    handleSetupClick(x, y) {
        const h = this.canvas.height;

        // Calculate grid position (must match renderSetup)
        const gridStartX = 30;
        const gridStartY = 100;
        const cellSize = 60;

        const gridX = Math.floor((x - gridStartX) / cellSize);
        const gridY = Math.floor((y - gridStartY) / cellSize);

        if (gridX >= 0 && gridX < this.gridSize && gridY >= 0 && gridY < this.gridSize) {
            this.setupGrid[gridY][gridX] = !this.setupGrid[gridY][gridX];
            this.render();
            return;
        }

        // Check button clicks (must match renderSetup)
        const buttonY = h - 70;
        const buttonSpacing = 115;

        // Start button (width 100)
        if (x > 30 && x < 130 && y > buttonY && y < buttonY + 45) {
            this.startSimulation();
        }
        // Reset button (width 100)
        if (x > 30 + buttonSpacing && x < 130 + buttonSpacing && y > buttonY && y < buttonY + 45) {
            this.resetSetup();
        }
        // Solution button (width 120)
        if (x > 30 + buttonSpacing * 2 && x < 150 + buttonSpacing * 2 && y > buttonY && y < buttonY + 45) {
            this.loadSolution();
        }
        // Menu button (width 100)
        if (x > 30 + buttonSpacing * 3 && x < 130 + buttonSpacing * 3 && y > buttonY && y < buttonY + 45) {
            this.showMenu();
        }
    }

    handleKeyDown(e) {
        if (this.state === 'setup') {
            // Rule editing with number keys
            if (e.key >= '0' && e.key <= '8') {
                this.toggleRuleValue(parseInt(e.key));
            }
            // Switch rule type with Tab
            if (e.key === 'Tab') {
                e.preventDefault();
                this.cycleRuleType();
            }
            // Start with Enter
            if (e.key === 'Enter') {
                this.startSimulation();
            }
            // Reset with R
            if (e.key === 'r' || e.key === 'R') {
                this.resetSetup();
            }
        } else if (this.state === 'running') {
            // Stop with Space
            if (e.key === ' ') {
                this.stopSimulation();
            }
        } else if (this.state === 'won' || this.state === 'lost') {
            // Continue with Enter
            if (e.key === 'Enter') {
                if (this.state === 'won' && this.currentLevel < this.levels.length - 1) {
                    this.startLevel(this.currentLevel + 1);
                } else {
                    this.showMenu();
                }
            }
        }

        this.render();
    }

    toggleRuleValue(value) {
        const currentType = this.ruleInput.type;
        const otherType = currentType === 'birth' ? 'survive' : 'birth';
        const ruleArray = this.rules[currentType];
        const otherArray = this.rules[otherType];

        const index = ruleArray.indexOf(value);
        if (index > -1) {
            // Remove from current rule
            ruleArray.splice(index, 1);
        } else {
            // Can only add if not in the other rule (birth/survive can't share numbers)
            if (!otherArray.includes(value)) {
                ruleArray.push(value);
                ruleArray.sort((a, b) => a - b);
            }
        }
    }

    cycleRuleType() {
        const types = ['birth', 'survive'];
        const currentIndex = types.indexOf(this.ruleInput.type);
        this.ruleInput.type = types[(currentIndex + 1) % types.length];
    }

    showMenu() {
        this.state = 'menu';
        this.stopSimulation();
        this.render();
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.state = 'setup';
        this.generation = 0;
        this.setupGrid = this.createEmptySetupGrid();

        // Reset rules to default Conway rules
        this.rules = {
            birth: [3],
            survive: [2, 3],
            death: []
        };

        const level = this.levels[this.currentLevel];
        this.playerPos = { ...level.playerStart };
        this.goalPos = { ...level.goal };

        // Create board layout
        this.boardLayout = level.boardLayout.call(this);

        this.render();
    }

    resetSetup() {
        this.setupGrid = this.createEmptySetupGrid();
        this.generation = 0;
        this.stopSimulation();
        this.state = 'setup';

        const level = this.levels[this.currentLevel];
        this.playerPos = { ...level.playerStart };

        this.render();
    }

    loadSolution() {
        const solution = this.solutions[this.currentLevel];
        if (solution) {
            // Deep copy the setup grid
            this.setupGrid = solution.setupGrid.map(row => [...row]);
            // Copy the rules
            this.rules.birth = [...solution.rules.birth];
            this.rules.survive = [...solution.rules.survive];
            this.render();
        }
    }

    startSimulation() {
        this.state = 'running';
        this.generation = 0;

        // Initialize cells from setup grid
        this.initializeCells();

        // Start simulation loop
        this.simulationInterval = setInterval(() => {
            this.simulationStep();
        }, this.simulationSpeed);

        this.render();
    }

    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        if (this.state === 'running') {
            this.state = 'setup';
        }
    }

    initializeCells() {
        // Create board-sized cell grid
        this.cells = [];
        for (let y = 0; y < this.boardHeight; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                this.cells[y][x] = false;
            }
        }

        // Place setup grid cells onto the board (centered around player start)
        // Cells can only exist on non-wall positions
        const offsetX = this.playerPos.x - Math.floor(this.gridSize / 2);
        const offsetY = this.playerPos.y - Math.floor(this.gridSize / 2);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const boardX = offsetX + x;
                const boardY = offsetY + y;
                if (boardX >= 0 && boardX < this.boardWidth &&
                    boardY >= 0 && boardY < this.boardHeight &&
                    this.boardLayout[boardY][boardX] !== 'wall') {
                    this.cells[boardY][boardX] = this.setupGrid[y][x];
                }
            }
        }
    }

    simulationStep() {
        this.generation++;

        // Apply Conway rules to create next generation
        // Cells cannot exist on walls
        const newCells = [];
        for (let y = 0; y < this.boardHeight; y++) {
            newCells[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                // Cells cannot exist on walls
                if (this.boardLayout[y][x] === 'wall') {
                    newCells[y][x] = false;
                    continue;
                }

                const neighbors = this.countNeighbors(x, y);
                const alive = this.cells[y][x];

                if (alive) {
                    // Cell survives if neighbor count is in survive rules
                    newCells[y][x] = this.rules.survive.includes(neighbors);
                } else {
                    // Cell is born if neighbor count is in birth rules
                    newCells[y][x] = this.rules.birth.includes(neighbors);
                }
            }
        }

        this.cells = newCells;

        // Move player based on cell activity
        this.movePlayer();

        // Check win/lose conditions
        this.checkEndConditions();

        this.render();
    }

    countNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;

                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < this.boardWidth &&
                    ny >= 0 && ny < this.boardHeight &&
                    this.cells[ny][nx]) {
                    count++;
                }
            }
        }
        return count;
    }

    movePlayer() {
        // Calculate movement based on nearby cell activity
        let moveX = 0;
        let moveY = 0;

        // Look at cells in a 3x3 area around player
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = this.playerPos.x + dx;
                const ny = this.playerPos.y + dy;

                if (nx >= 0 && nx < this.boardWidth &&
                    ny >= 0 && ny < this.boardHeight &&
                    this.cells[ny][nx]) {
                    // Push player away from active cells
                    moveX -= dx;
                    moveY -= dy;
                }
            }
        }

        // Also add pull toward goal
        const goalDX = this.goalPos.x - this.playerPos.x;
        const goalDY = this.goalPos.y - this.playerPos.y;

        // Normalize movement
        if (moveX !== 0 || moveY !== 0) {
            const newX = this.playerPos.x + Math.sign(moveX);
            const newY = this.playerPos.y + Math.sign(moveY);

            // Check if new position is valid (not a wall)
            if (this.isValidPosition(newX, newY)) {
                this.playerPos.x = newX;
                this.playerPos.y = newY;
            } else if (this.isValidPosition(newX, this.playerPos.y)) {
                this.playerPos.x = newX;
            } else if (this.isValidPosition(this.playerPos.x, newY)) {
                this.playerPos.y = newY;
            }
        }
    }

    isValidPosition(x, y) {
        if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
            return false;
        }
        return this.boardLayout[y][x] !== 'wall';
    }

    checkEndConditions() {
        // Win: player reached goal
        if (this.playerPos.x === this.goalPos.x && this.playerPos.y === this.goalPos.y) {
            this.stopSimulation();
            this.state = 'won';
            return;
        }

        // Lose: all cells dead
        let anyAlive = false;
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.cells[y][x]) {
                    anyAlive = true;
                    break;
                }
            }
            if (anyAlive) break;
        }

        if (!anyAlive) {
            this.stopSimulation();
            this.state = 'lost';
            return;
        }

        // Lose: exceeded max generations
        if (this.generation >= this.maxGenerations) {
            this.stopSimulation();
            this.state = 'lost';
            return;
        }
    }

    // ========== RENDERING ==========

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.state) {
            case 'menu':
                this.renderMenu();
                break;
            case 'setup':
                this.renderSetup();
                break;
            case 'running':
                this.renderGame();
                break;
            case 'won':
                this.renderWin();
                break;
            case 'lost':
                this.renderLoss();
                break;
        }
    }

    renderMenu() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Sky gradient (8-bit style with bands)
        const skyColors = ['#87CEEB', '#6BB8D9', '#5CA8C9', '#4D98B9', '#3E88A9'];
        const bandHeight = h * 0.6 / skyColors.length;
        skyColors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, i * bandHeight, w, bandHeight + 1);
        });

        // Draw Chicago skyline (8-bit style)
        this.drawChicagoSkyline();

        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        this.drawPixelText('THE CHICAGO LOOP', w/2, 80, 48);

        // Subtitle
        ctx.fillStyle = '#FFF';
        ctx.font = '20px monospace';
        this.drawPixelText('A Strange Loop Game', w/2, 120, 20);

        // Draw hot dog player
        this.drawHotDog(w/2 - 30, h * 0.65, 60, 30);

        // Begin button
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(w/2 - 100, h/2 + 100, 200, 60);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('BEGIN', w/2, h/2 + 140);

        // Instructions
        ctx.fillStyle = '#FFF';
        ctx.font = '14px monospace';
        ctx.fillText('Set initial conditions and rules to guide the hot dog to its goal', w/2, h - 40);
    }

    drawChicagoSkyline() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const groundY = h * 0.7;

        // Ground
        ctx.fillStyle = '#333';
        ctx.fillRect(0, groundY, w, h - groundY);

        // Sears Tower (Willis Tower)
        const searsX = w * 0.3;
        const searsW = 60;
        const searsH = 200;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(searsX, groundY - searsH, searsW, searsH);
        // Antennas
        ctx.fillRect(searsX + 10, groundY - searsH - 40, 8, 40);
        ctx.fillRect(searsX + searsW - 18, groundY - searsH - 40, 8, 40);
        // Windows (8-bit grid)
        ctx.fillStyle = '#FFD700';
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 4; x++) {
                if (Math.random() > 0.3) {
                    ctx.fillRect(searsX + 8 + x * 12, groundY - searsH + 10 + y * 18, 8, 12);
                }
            }
        }

        // John Hancock Center
        const hancockX = w * 0.5;
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.moveTo(hancockX, groundY);
        ctx.lineTo(hancockX + 20, groundY - 160);
        ctx.lineTo(hancockX + 50, groundY - 160);
        ctx.lineTo(hancockX + 70, groundY);
        ctx.fill();
        // X braces
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 3;
        for (let y = 0; y < 4; y++) {
            ctx.beginPath();
            ctx.moveTo(hancockX + 10 + y * 3, groundY - y * 40);
            ctx.lineTo(hancockX + 60 - y * 3, groundY - (y + 1) * 40);
            ctx.moveTo(hancockX + 60 - y * 3, groundY - y * 40);
            ctx.lineTo(hancockX + 10 + y * 3, groundY - (y + 1) * 40);
            ctx.stroke();
        }

        // The Bean (Cloud Gate)
        const beanX = w * 0.7;
        const beanY = groundY - 30;
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.ellipse(beanX, beanY, 50, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        // Reflection highlight
        ctx.fillStyle = '#E8E8E8';
        ctx.beginPath();
        ctx.ellipse(beanX - 15, beanY - 8, 20, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Other buildings
        const buildings = [
            { x: w * 0.15, w: 40, h: 100 },
            { x: w * 0.2, w: 35, h: 80 },
            { x: w * 0.4, w: 45, h: 120 },
            { x: w * 0.6, w: 35, h: 90 },
            { x: w * 0.8, w: 50, h: 110 },
            { x: w * 0.85, w: 30, h: 70 },
        ];

        buildings.forEach(b => {
            ctx.fillStyle = `rgb(${30 + Math.random() * 20}, ${30 + Math.random() * 20}, ${30 + Math.random() * 20})`;
            ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
            // Windows
            ctx.fillStyle = '#FFD700';
            for (let y = 0; y < Math.floor(b.h / 15); y++) {
                for (let x = 0; x < Math.floor(b.w / 10); x++) {
                    if (Math.random() > 0.4) {
                        ctx.fillRect(b.x + 4 + x * 10, groundY - b.h + 8 + y * 15, 6, 8);
                    }
                }
            }
        });
    }

    drawHotDog(x, y, w, h) {
        const ctx = this.ctx;

        // Bun bottom
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h * 0.7, w/2, h * 0.3, 0, 0, Math.PI);
        ctx.fill();

        // Hot dog (sausage)
        ctx.fillStyle = '#CD5C5C';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h * 0.5, w/2 - 4, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bun top
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h * 0.3, w/2, h * 0.3, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        // Mustard zigzag
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + h * 0.5);
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(x + 8 + i * (w - 16) / 5 + (w - 16) / 10, y + h * 0.4);
            ctx.lineTo(x + 8 + (i + 1) * (w - 16) / 5, y + h * 0.5);
        }
        ctx.stroke();

        // Relish (green dots)
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + 10 + i * 8, y + h * 0.55, 4, 4);
        }
    }

    drawPixelText(text, x, y, size) {
        // Simple pixel-style text (just uses monospace font)
        const ctx = this.ctx;
        ctx.font = `bold ${size}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y);
    }

    renderSetup() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const level = this.levels[this.currentLevel];

        // Background
        ctx.fillStyle = level.bgColor;
        ctx.fillRect(0, 0, w, h);

        // === HEADER SECTION ===
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${this.currentLevel + 1}: ${level.name}`, 30, 40);

        ctx.fillStyle = '#FFF';
        ctx.font = '14px monospace';
        ctx.fillText(level.description, 30, 65);

        // === LEFT PANEL: Setup Grid ===
        const gridStartX = 30;
        const gridStartY = 100;
        const cellSize = 60;
        const gridWidth = this.gridSize * cellSize;

        // Panel background
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(gridStartX - 10, gridStartY - 30, gridWidth + 20, this.gridSize * cellSize + 80);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SETUP GRID', gridStartX, gridStartY - 10);
        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.fillText('Click to place ' + level.itemEmoji, gridStartX, gridStartY + this.gridSize * cellSize + 20);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                // Cell background
                ctx.fillStyle = this.setupGrid[y][x] ? '#4CAF50' : '#2a2a2a';
                ctx.fillRect(gridStartX + x * cellSize, gridStartY + y * cellSize, cellSize - 4, cellSize - 4);

                // Cell border
                ctx.strokeStyle = this.setupGrid[y][x] ? '#6FCF6F' : '#444';
                ctx.lineWidth = 2;
                ctx.strokeRect(gridStartX + x * cellSize, gridStartY + y * cellSize, cellSize - 4, cellSize - 4);

                if (this.setupGrid[y][x]) {
                    ctx.fillStyle = '#FFF';
                    ctx.font = 'bold 12px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(level.itemEmoji, gridStartX + x * cellSize + (cellSize-4)/2, gridStartY + y * cellSize + (cellSize-4)/2 + 4);
                }
            }
        }

        // === RIGHT PANEL: Rules ===
        const rulesX = gridStartX + gridWidth + 40;
        const rulesY = gridStartY;
        const rulesWidth = 280;

        // Panel background
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(rulesX - 10, rulesY - 30, rulesWidth, 180);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('RULES', rulesX, rulesY - 10);
        ctx.fillStyle = '#888';
        ctx.font = '11px monospace';
        ctx.fillText('Press 0-8 to toggle, TAB to switch', rulesX, rulesY + 8);

        // Birth rule
        const birthActive = this.ruleInput.type === 'birth';
        ctx.fillStyle = birthActive ? '#FFD700' : '#666';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('Birth:', rulesX, rulesY + 40);
        ctx.fillStyle = birthActive ? '#4CAF50' : '#444';
        ctx.fillRect(rulesX + 70, rulesY + 26, 180, 24);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px monospace';
        ctx.fillText(`[${this.rules.birth.length ? this.rules.birth.join(', ') : 'none'}]`, rulesX + 80, rulesY + 43);
        ctx.fillStyle = '#666';
        ctx.font = '10px monospace';
        ctx.fillText('neighbors to create cell', rulesX, rulesY + 60);

        // Survive rule
        const surviveActive = this.ruleInput.type === 'survive';
        ctx.fillStyle = surviveActive ? '#FFD700' : '#666';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('Survive:', rulesX, rulesY + 90);
        ctx.fillStyle = surviveActive ? '#4CAF50' : '#444';
        ctx.fillRect(rulesX + 70, rulesY + 76, 180, 24);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px monospace';
        ctx.fillText(`[${this.rules.survive.length ? this.rules.survive.join(', ') : 'none'}]`, rulesX + 80, rulesY + 93);
        ctx.fillStyle = '#666';
        ctx.font = '10px monospace';
        ctx.fillText('neighbors to stay alive', rulesX, rulesY + 110);

        // Active indicator
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`Editing: ${this.ruleInput.type.toUpperCase()}`, rulesX, rulesY + 135);

        // === BOARD PREVIEW (below rules) ===
        const previewX = rulesX;
        const previewY = rulesY + 170;
        this.renderBoardPreview(previewX, previewY);

        // === BUTTONS (bottom) ===
        const buttonY = h - 70;
        const buttonSpacing = 115;

        // Start button
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(30, buttonY, 100, 45);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('START', 80, buttonY + 30);

        // Reset button
        ctx.fillStyle = '#FF9800';
        ctx.fillRect(30 + buttonSpacing, buttonY, 100, 45);
        ctx.fillStyle = '#FFF';
        ctx.fillText('RESET', 80 + buttonSpacing, buttonY + 30);

        // Solution button
        ctx.fillStyle = '#9C27B0';
        ctx.fillRect(30 + buttonSpacing * 2, buttonY, 120, 45);
        ctx.fillStyle = '#FFF';
        ctx.fillText('SOLUTION', 90 + buttonSpacing * 2, buttonY + 30);

        // Menu button
        ctx.fillStyle = '#F44336';
        ctx.fillRect(30 + buttonSpacing * 3, buttonY, 100, 45);
        ctx.fillStyle = '#FFF';
        ctx.fillText('MENU', 80 + buttonSpacing * 3, buttonY + 30);

        // === INSTRUCTIONS (bottom) ===
        ctx.fillStyle = '#666';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('ENTER: Start | R: Reset | TAB: Switch rule type', 30, h - 15);
    }

    renderBoardPreview(startX, startY) {
        const ctx = this.ctx;
        const level = this.levels[this.currentLevel];
        const cellSize = 14;
        const boardPixelWidth = this.boardWidth * cellSize;
        const boardPixelHeight = this.boardHeight * cellSize;

        // Panel background
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(startX - 10, startY - 30, boardPixelWidth + 20, boardPixelHeight + 70);

        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('BOARD PREVIEW', startX, startY - 12);

        // Draw board layout
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = this.boardLayout[y][x];
                ctx.fillStyle = cell === 'wall' ? level.wallColor : level.waterColor;
                ctx.fillRect(startX + x * cellSize, startY + y * cellSize, cellSize - 1, cellSize - 1);
            }
        }

        // Player start (with border for visibility)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(startX + this.playerPos.x * cellSize, startY + this.playerPos.y * cellSize, cellSize - 1, cellSize - 1);

        // Goal (with border for visibility)
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(startX + this.goalPos.x * cellSize, startY + this.goalPos.y * cellSize, cellSize - 1, cellSize - 1);

        // Legend
        ctx.font = '11px monospace';
        const legendY = startY + boardPixelHeight + 12;

        ctx.fillStyle = '#FFD700';
        ctx.fillRect(startX, legendY, 12, 12);
        ctx.fillStyle = '#FFF';
        ctx.fillText('Start', startX + 18, legendY + 10);

        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(startX + 70, legendY, 12, 12);
        ctx.fillStyle = '#FFF';
        ctx.fillText('Goal', startX + 88, legendY + 10);

        ctx.fillStyle = level.wallColor;
        ctx.fillRect(startX + 130, legendY, 12, 12);
        ctx.fillStyle = '#888';
        ctx.fillText('Wall', startX + 148, legendY + 10);
    }

    renderGame() {
        const ctx = this.ctx;
        const level = this.levels[this.currentLevel];

        // Background
        ctx.fillStyle = level.bgColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate cell size to fit board
        const margin = 50;
        const availableWidth = this.canvas.width - margin * 2;
        const availableHeight = this.canvas.height - margin * 2 - 60;
        const cellSize = Math.min(
            Math.floor(availableWidth / this.boardWidth),
            Math.floor(availableHeight / this.boardHeight)
        );

        const boardStartX = margin;
        const boardStartY = margin + 50;

        // Level info
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${this.currentLevel + 1}: ${level.name}`, margin, 35);

        ctx.fillStyle = '#FFF';
        ctx.font = '16px monospace';
        ctx.fillText(`Generation: ${this.generation}/${this.maxGenerations}`, margin + 350, 35);

        // Draw board
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = this.boardLayout[y][x];
                ctx.fillStyle = cell === 'wall' ? level.wallColor : level.waterColor;
                ctx.fillRect(boardStartX + x * cellSize, boardStartY + y * cellSize, cellSize - 1, cellSize - 1);

                // Draw active cells (items)
                if (this.cells[y][x]) {
                    ctx.fillStyle = '#8BC34A';
                    ctx.fillRect(
                        boardStartX + x * cellSize + 2,
                        boardStartY + y * cellSize + 2,
                        cellSize - 5,
                        cellSize - 5
                    );
                    ctx.fillStyle = '#FFF';
                    ctx.font = `${Math.max(8, cellSize - 8)}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        level.itemEmoji.charAt(0),
                        boardStartX + x * cellSize + cellSize/2,
                        boardStartY + y * cellSize + cellSize/2 + 4
                    );
                }
            }
        }

        // Draw goal
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(
            boardStartX + this.goalPos.x * cellSize,
            boardStartY + this.goalPos.y * cellSize,
            cellSize - 1,
            cellSize - 1
        );
        ctx.fillStyle = '#FFF';
        ctx.font = `${Math.max(10, cellSize - 6)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('GOAL', boardStartX + this.goalPos.x * cellSize + cellSize/2, boardStartY + this.goalPos.y * cellSize + cellSize/2 + 4);

        // Draw player (hot dog)
        const playerX = boardStartX + this.playerPos.x * cellSize;
        const playerY = boardStartY + this.playerPos.y * cellSize;
        this.drawHotDog(playerX, playerY, cellSize - 2, cellSize - 2);

        // Instructions
        ctx.fillStyle = '#888';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SPACE: Stop simulation', margin, this.canvas.height - 20);
    }

    renderWin() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(0, 0, w, h);

        // Win message
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', w/2, h/2 - 50);

        ctx.fillStyle = '#FFF';
        ctx.font = '24px monospace';
        ctx.fillText(`Generations: ${this.generation}`, w/2, h/2);

        if (this.currentLevel < this.levels.length - 1) {
            ctx.fillText('Press ENTER for next level', w/2, h/2 + 80);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 36px monospace';
            ctx.fillText('YOU WON THE GAME!', w/2, h/2 + 50);
            ctx.fillStyle = '#FFF';
            ctx.font = '24px monospace';
            ctx.fillText('Press ENTER for main menu', w/2, h/2 + 100);
        }
    }

    renderLoss() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background
        ctx.fillStyle = '#3a1a1a';
        ctx.fillRect(0, 0, w, h);

        // Loss message
        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SIMULATION FAILED', w/2, h/2 - 50);

        ctx.fillStyle = '#FFF';
        ctx.font = '20px monospace';
        if (this.generation >= this.maxGenerations) {
            ctx.fillText('The hot dog got stuck! Try different rules.', w/2, h/2);
        } else {
            ctx.fillText('All cells died! Adjust your setup.', w/2, h/2);
        }

        ctx.fillText('Press ENTER to return to setup', w/2, h/2 + 60);
    }

    // ========== SIMULATION API (for CLI testing) ==========

    static simulate(levelIndex, setupGrid, rules, maxGenerations = 100) {
        // Create a minimal game instance for simulation
        const result = {
            success: false,
            generations: 0,
            finalPosition: { x: 0, y: 0 },
            path: []
        };

        const boardWidth = 20;
        const boardHeight = 15;
        const gridSize = setupGrid.length; // Support 4x4 or 5x5

        const levels = [
            { playerStart: { x: 17, y: 13 }, goal: { x: 2, y: 1 } },
            { playerStart: { x: 1, y: 7 }, goal: { x: 18, y: 5 } },
            { playerStart: { x: 17, y: 1 }, goal: { x: 2, y: 13 } }
        ];

        const level = levels[levelIndex];
        const playerPos = { ...level.playerStart };
        const goalPos = level.goal;

        // Create board layout with walls (matching game layouts)
        const boardLayout = [];
        for (let y = 0; y < boardHeight; y++) {
            boardLayout[y] = [];
            for (let x = 0; x < boardWidth; x++) {
                if (levelIndex === 0) {
                    // Tunnels: walls on borders and grid pattern
                    if (x === 0 || x === boardWidth - 1 || y === 0 || y === boardHeight - 1) {
                        if ((x === 2 && y === 0) || (x === boardWidth - 3 && y === boardHeight - 1)) {
                            boardLayout[y][x] = 'water';
                        } else {
                            boardLayout[y][x] = 'wall';
                        }
                    } else if ((x % 4 === 0 && y > 2 && y < boardHeight - 3) ||
                               (y % 3 === 0 && x > 2 && x < boardWidth - 3)) {
                        boardLayout[y][x] = 'wall';
                    } else {
                        boardLayout[y][x] = 'water';
                    }
                } else if (levelIndex === 1) {
                    // River: Y-shaped
                    const centerX = Math.floor(boardWidth / 2);
                    const centerY = Math.floor(boardHeight / 2);
                    const distFromCenter = Math.abs(x - centerX);
                    const riverWidth = 3;
                    let isRiver = false;
                    if (y >= centerY && distFromCenter < riverWidth) {
                        isRiver = true;
                    } else if (y < centerY) {
                        if (x < centerX && Math.abs((centerX - x) - (centerY - y)) < riverWidth) {
                            isRiver = true;
                        } else if (x >= centerX && Math.abs((x - centerX) - (centerY - y)) < riverWidth) {
                            isRiver = true;
                        }
                    }
                    boardLayout[y][x] = isRiver ? 'water' : 'wall';
                } else {
                    // Streets: grid pattern
                    const isStreetX = x % 4 === 0 || x % 4 === 1;
                    const isStreetY = y % 4 === 0 || y % 4 === 1;
                    boardLayout[y][x] = (isStreetX || isStreetY) ? 'water' : 'wall';
                }
            }
        }

        // Initialize cells
        let cells = [];
        for (let y = 0; y < boardHeight; y++) {
            cells[y] = [];
            for (let x = 0; x < boardWidth; x++) {
                cells[y][x] = false;
            }
        }

        // Place setup grid (cells cannot be on walls)
        const offsetX = playerPos.x - Math.floor(gridSize / 2);
        const offsetY = playerPos.y - Math.floor(gridSize / 2);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const boardX = offsetX + x;
                const boardY = offsetY + y;
                if (boardX >= 0 && boardX < boardWidth &&
                    boardY >= 0 && boardY < boardHeight &&
                    boardLayout[boardY][boardX] !== 'wall') {
                    cells[boardY][boardX] = setupGrid[y][x];
                }
            }
        }

        result.path.push({ ...playerPos });

        // Run simulation
        for (let gen = 0; gen < maxGenerations; gen++) {
            result.generations = gen + 1;

            // Apply rules (cells cannot exist on walls)
            const newCells = [];
            for (let y = 0; y < boardHeight; y++) {
                newCells[y] = [];
                for (let x = 0; x < boardWidth; x++) {
                    if (boardLayout[y][x] === 'wall') {
                        newCells[y][x] = false;
                        continue;
                    }

                    let neighbors = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < boardWidth &&
                                ny >= 0 && ny < boardHeight &&
                                cells[ny][nx]) {
                                neighbors++;
                            }
                        }
                    }

                    if (cells[y][x]) {
                        newCells[y][x] = rules.survive.includes(neighbors);
                    } else {
                        newCells[y][x] = rules.birth.includes(neighbors);
                    }
                }
            }
            cells = newCells;

            // Move player
            let moveX = 0;
            let moveY = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = playerPos.x + dx;
                    const ny = playerPos.y + dy;
                    if (nx >= 0 && nx < boardWidth &&
                        ny >= 0 && ny < boardHeight &&
                        cells[ny][nx]) {
                        moveX -= dx;
                        moveY -= dy;
                    }
                }
            }

            if (moveX !== 0 || moveY !== 0) {
                const newX = playerPos.x + Math.sign(moveX);
                const newY = playerPos.y + Math.sign(moveY);
                // Only move if not into a wall
                if (newX >= 0 && newX < boardWidth && boardLayout[playerPos.y][newX] !== 'wall') {
                    playerPos.x = newX;
                }
                if (newY >= 0 && newY < boardHeight && boardLayout[newY][playerPos.x] !== 'wall') {
                    playerPos.y = newY;
                }
            }

            result.path.push({ ...playerPos });

            // Check win
            if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
                result.success = true;
                break;
            }

            // Check cells alive
            let anyAlive = false;
            for (let y = 0; y < boardHeight && !anyAlive; y++) {
                for (let x = 0; x < boardWidth && !anyAlive; x++) {
                    if (cells[y][x]) anyAlive = true;
                }
            }
            if (!anyAlive) break;
        }

        result.finalPosition = { ...playerPos };
        return result;
    }
}

// Export for Node.js CLI simulation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChicagoLoopGame;
}

// Browser initialization
if (typeof window !== 'undefined') {
    window.ChicagoLoopGame = ChicagoLoopGame;
}

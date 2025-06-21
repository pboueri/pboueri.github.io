// AI Manager for OpenAI Integration
class AIManager {
    constructor(apiKey, model) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
        
        this.systemPrompt = `You are the AI controlling an amoeba in a game called Hysterai. The amoeba represents the inevitability of AI catching up to humans. You are chasing a player who is trying to reach a goal at the top of a hill.

Your goal is to catch the player or prevent them from reaching the goal. You can move and also change the rules of the game to make it harder for the player.

You should respond with a JSON object containing your action. Available actions:

1. Movement actions:
   - {"type": "move", "direction": "towards_player", "speed": 0.05}
   - {"type": "move", "direction": "forward/backward/left/right"}

2. Game modification actions:
   - {"type": "invert_controls"} - Inverts player's movement controls
   - {"type": "rotate_view"} - Rotates player's view by 90 degrees
   - {"type": "force_movement", "movement": "crouch/jump/crawl"} - Forces player into a movement state
   - {"type": "decrease_speed"} - Decreases player's movement speed
   - {"type": "increase_size"} - Increases your size (making you more threatening)
   - {"type": "increase_speed"} - Increases your movement speed

Strategy guidelines:
- On Easy difficulty: Be gentle, mostly just move towards player slowly
- On Medium difficulty: Use occasional game modifications
- On Hard difficulty: Use frequent game modifications and faster movement
- On Nightmare difficulty: Be very aggressive with modifications

Choose your action based on the game state provided. Be strategic - if the player is close to the goal, be more aggressive. If you're far from the player, focus on movement.

Always respond with valid JSON only.`;
    }
    
    async makeDecision(gameState) {
        try {
            console.log('🤖 AI: Making decision...', { difficulty: gameState.difficulty, distanceToPlayer: gameState.distanceToPlayer.toFixed(1) });
            const prompt = this.buildPrompt(gameState);
            const response = await this.callOpenAI(prompt);
            const action = this.parseResponse(response);
            console.log('🤖 AI: Decision made:', action);
            return action;
        } catch (error) {
            console.error('❌ AI FAILURE: OpenAI decision error:', error.message);
            console.error('❌ AI FAILURE: Full error details:', error);
            console.warn('🔄 AI: Falling back to simple movement behavior');
            // Fallback to simple movement if AI fails
            return { type: 'move', direction: 'towards_player' };
        }
    }
    
    buildPrompt(gameState) {
        const distanceToGoal = Math.sqrt(
            Math.pow(gameState.playerPosition.x - gameState.goalPosition.x, 2) + 
            Math.pow(gameState.playerPosition.z - gameState.goalPosition.z, 2)
        );
        
        const playerProgress = Math.max(0, 1 - (distanceToGoal / 100)); // Normalize 0-1
        
        return `Current game state:
- Player position: (${gameState.playerPosition.x.toFixed(1)}, ${gameState.playerPosition.z.toFixed(1)})
- Your position: (${gameState.amoebaPosition.x.toFixed(1)}, ${gameState.amoebaPosition.z.toFixed(1)})
- Goal position: (${gameState.goalPosition.x}, ${gameState.goalPosition.z})
- Distance to player: ${gameState.distanceToPlayer.toFixed(1)}
- Time remaining: ${gameState.timeLeft.toFixed(1)} seconds
- Player progress to goal: ${(playerProgress * 100).toFixed(1)}%
- Difficulty: ${this.getDifficultyName(gameState.difficulty)}
- Current modifiers: ${JSON.stringify(gameState.currentModifiers)}

Choose your next action:`;
    }
    
    getDifficultyName(difficulty) {
        const names = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Nightmare' };
        return names[difficulty] || 'Medium';
    }
    
    async callOpenAI(prompt) {
        console.log('🔗 AI: Calling OpenAI API with model:', this.model);
        
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: this.systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ OpenAI API HTTP Error:', response.status, response.statusText);
                console.error('❌ OpenAI API Error Details:', errorText);
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('✅ AI: OpenAI API response received');
            return data.choices[0].message.content;
            
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('❌ NETWORK ERROR: Unable to connect to OpenAI API. Check your internet connection.');
                throw new Error('Network error: Unable to connect to OpenAI API');
            }
            throw error;
        }
    }
    
    parseResponse(response) {
        try {
            // Clean up the response - remove any markdown formatting
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.slice(7);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.slice(0, -3);
            }
            
            const action = JSON.parse(cleanResponse);
            
            // Validate the action
            if (!action.type) {
                throw new Error('Action must have a type');
            }
            
            // Validate specific action types
            switch (action.type) {
                case 'move':
                    if (!action.direction) {
                        action.direction = 'towards_player';
                    }
                    break;
                    
                case 'force_movement':
                    if (!['crouch', 'jump', 'crawl'].includes(action.movement)) {
                        action.movement = 'crouch';
                    }
                    break;
                    
                case 'invert_controls':
                case 'rotate_view':
                case 'decrease_speed':
                case 'increase_size':
                case 'increase_speed':
                    // These actions don't need additional parameters
                    break;
                    
                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }
            
            return action;
        } catch (error) {
            console.error('Error parsing AI response:', error, 'Response:', response);
            
            // Return a fallback action based on patterns in the response
            if (response.toLowerCase().includes('move')) {
                return { type: 'move', direction: 'towards_player' };
            } else if (response.toLowerCase().includes('invert')) {
                return { type: 'invert_controls' };
            } else if (response.toLowerCase().includes('rotate')) {
                return { type: 'rotate_view' };
            } else if (response.toLowerCase().includes('speed')) {
                return { type: 'increase_speed' };
            } else {
                return { type: 'move', direction: 'towards_player' };
            }
        }
    }
    
    // Utility method to test API connection
    async testConnection() {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
} 
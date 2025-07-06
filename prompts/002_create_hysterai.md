# Hysterai Prompt - UPDATED

Hysterai is meant to capture the inevitability of AI and how it will catch up to us. Modeled after the myth of sisyphus, the concept art / game is a first person game where the character attempts to reach their goal location, where they win. Behind them if they were to turn around is an amoeba that initially moves at a moderate pace, but steadily grows over time and becomes more aggressive. The amoeba represents AI and is able to change the rules of the game as it goes. This makes it hard for you to reach the top of the hill, as the amoeba seeks to consume you. The player must actively run away from the amoeba. Ultimately it does so and the screens goes black, with voices of others who have tried to reach the top all around you. 

Opening Page:
- An electronic font that switches from Hysteria to Hysterai every so often with static
- CRITICAL: The main game title must switch between "Hysterai" and "Hysteria" continuously
- A button that says play
- A box to enter an OpenAI key -- required to play
- A drop down for which openai model to use (include latest models: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o3, o3-mini, o4-mini) - ENSURE THESE EXACT MODELS ARE USED
- A difficulty slider for "Amoeba Aggression" to control how often the amoeba takes actions

Gameplay:
- The character is moved with the arrow keys up/left/down/right
- The character can just with spacebar and crouch with shift and crawl with ctrl+shift
- The character can turn around with the mouse to point to a different direction. Up moves you in that direction
- CRITICAL: Mouse look must work properly - moving mouse should rotate the player view smoothly
- CRITICAL: Implement pointer lock for proper first-person controls
- The character only sees their arms as they walk and not much else

Interface:
- A timer that ticks down from 1:00 minute for you to reach the goal
- A log of the amoeba's actions as it tries to catch up to you including what it has changed
- A minimap and where you need to reach (the goal), your arrow (the player), and the amoeba (the ai)

Start State:
- The player is in front of the amoeba by an appropriate amount
- The amoeba starts smaller than the player

End State:
- If the timer is 0:00 and the amoeba has not caught you, then it's "You've run out of time"
- If the amoeba catches you, then the end state is "Hysterai"
- If you reach the flag, it says "Great Job! You must now keep playing forever" and the game restarts with an increased amoeba agression

Environment:
- Color at first, and fades to gray as the minute timer gets closer to 0:00
- CRITICAL: Terrain must be clearly visible with high contrast colors (bright green terrain against blue sky)
- CRITICAL: Use PlaneGeometry with proper rotation and positioning to create a visible ground plane
- CRITICAL: The terrain must be rendered as a visible floor/ground that extends in all directions
- CRITICAL: Player must be able to see the terrain/ground they are walking on - it cannot be invisible
- CRITICAL: Ground must have proper lighting and be clearly distinguishable from the sky
- Solid ground that the player can clearly see and walk on with proper collision detection
- A visible goal location marked by a flag
- CRITICAL: Fix terrain rendering - player must not appear to be floating in air. The camera should be positioned close to the ground (1-2 units above terrain surface)
- CRITICAL: Ensure the terrain floor is visible and rendered properly with proper perspective - the player must be able to see the ground they're walking on extending into the distance
- CRITICAL: All objects (player, amoeba, trees, rocks, flag) must be positioned ON the terrain floor, not floating in air
- CRITICAL: The terrain must extend properly in all directions with visible ground geometry, not appear as a flat line on the horizon
- The hill/terrain must be clearly visible with proper geometry and texturing
- CRITICAL: Camera positioning must be at ground level (terrain height + 1.5 units) to give proper first-person perspective of walking on ground
- CRITICAL: the player must not start at the goal location, the goal should be away from them in the distance
- CRITICAL: Player height must track terrain properly - always maintain consistent height above terrain as it changes
- CRITICAL: Use proper terrain height calculation to ensure player never clips through or floats above ground

Amoeba Design & Behavior:
- The amoeba should NOT be a simple purple orb - it should be a more realistic, organic, blob-like creature
- Use multiple interconnected spheres or create a more complex geometry to simulate organic blob movement
- Add tentacles or pseudopods that move and writhe using animated geometry
- Semi-transparent with internal structure visible
- Pulsing/breathing animation with organic movement
- Should have a more menacing appearance with darker colors (dark purples, blacks, with glowing edges)
- Consider using animated vertex shaders for more organic movement
- CRITICAL: The amoeba should move at a speed that makes it a real threat - it should be able to catch up to the player if they don't actively try to escape
- CRITICAL: Amoeba must be fast enough to create genuine tension - players should feel the urgency to escape

Amoeba Abilities:
- It can move forward to reach the player but should start VERY SLOW to allow proper gameplay balance
- It must be big enough (the size of the player) to consume the player
- Each action is to be taken by invoking OpenAI. An appropriate game state is sent to OpenAI, and OpenAI responds with the appropriate next action for the amoeba
- CRITICAL: When API call fails, console log the error and execute a random action from the available actions
- CRITICAL: In fallback mode (when API fails), amoeba should randomly choose between all available actions, not just "move"
- CRITICAL: The amoeba should start at a VERY SLOW speed (0.01-0.02) to ensure Easy mode is actually easy
- CRITICAL: Easy mode should be VERY EASY - player should be able to reach the flag without much difficulty
- Actions should be taken based on difficulty setting: Easy (5s), Medium (3s), Hard (2s), Nightmare (1s)
- CRITICAL: Implement difficulty slider that controls amoeba action frequency for varying challenge levels
- CRITICAL: Amoeba should start much further away from player 
- The amoeba can move left/right/up/down
- It can change the rules of the game by:
    - Inverting or rotating the viewport of the player
    - Changing the keybinding so that left / right/ up down mean different things
    - Making the player default to crawling or crouching or jumping
    - Decrease the players speed by a little
    - Increase the amoeba's size by a little
    - Increase the amoeba's speed by a little 

## Implementation Instructions

**Essential Requirements:**
- Use Three.js r128 CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- Use CylinderGeometry instead of CapsuleGeometry (r128 compatibility)
- Store mesh references properly when creating complex geometries
- Self-contained JavaScript files with no external dependencies

**File Structure To Generate:**
- Content: `content/projects/hysterai.md`
- Layout: `layouts/projects/hysterai.html` using `{{ .RawContent | safeHTML }}`
- Code Assets `static/assets/hysterai/` and all the .js files needed go here

**Must Include:**
- OpenAI models: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o3, o3-mini, o4-mini
- Camera at ground level (terrain height + 1.5 units max)
- Flag positioned at goal location on terrain

## Testing & Validation

**Critical Checks:**
1. Hugo build succeeds: `hugo --buildDrafts`
2. Camera at ground level - no floating player
3. All JavaScript files load without errors
4. OpenAI integration works with specified models
5. Difficulty slider controls amoeba aggression properly
# Hysterai Prompt - UPDATED

Hysterai is meant to capture the inevitability of AI and how it will catch up to us. Modeled after the myth of sisyphus, the concept art / game is a first person game where the character attempts to walk up the hill to reach the top and their goal, where they win. Behind them if they were to turn around is an amoeba that initially moves at a moderate pace, but steadily grows over time and becomes more aggressive. The amoeba represents AI and is able to change the rules of the game as it goes. This makes it hard for you to reach the top of the hill, as the amoeba seeks to consume you. The player must actively run away from the amoeba. Ultimately it does so and the screens goes black, with voices of others who have tried to reach the top all around you. 

Opening Page:
- An electronic font that switches from Hysteria to Hysterai every so often with static
- A button that says play
- A box to enter an OpenAI key -- required to play
- A drop down for which openai model to use (include latest models: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o3, o3-mini, o4-mini) - ENSURE THESE EXACT MODELS ARE USED

Gameplay:
- The character is moved with the arrow keys up/left/down/right
- The character can just with spacebar and crouch with shift and crawl with ctrl+shift
- The character can turn around with the mouse to point to a different direction. Up moves you in that direction
- The character only sees their arms as they walk and not much else

Interface:
- A timer that ticks down from 1:00 minute for you to reach the top of the hill
- A log of the amoeba's actions as it tries to catch up to you including what it has changed
- A minimap and where you need to reach (the goal), your arrow (the player), and the amoeba (the ai)

Start State:
- The player is in front of the amoeba by an appropriate amount
- The amoeba starts smaller than the player

End State:
- If the timer is 0:00 and the amoeba has not caught you, then it's "
- If the amoeba catches you, then the end state is "Hysterai"
- If you reach the flag, it says "Great Job! You must now keep playing forever"

Environment:
- Color at first, and fades to gray as the minute timer gets closer to 0:00
- Visible grass terrain with contrasting colors (dark green terrain against lighter sky)
- Solid ground that the player can clearly see and walk on with proper collision detection
- A hill that has a flag for "goal" at the top of it
- Ensure terrain is properly lit and visible (not blending with sky color)
- CRITICAL: Ensure the terrain floor is visible and rendered properly - the player must be able to see the ground they're walking on
- CRITICAL: All objects (player, amoeba, trees, rocks, flag) must be positioned ON the terrain floor, not floating in air
- The hill/terrain must be clearly visible with proper geometry and texturing

Amoeba Design & Behavior:
- The amoeba should NOT be a simple purple orb - it should be a more realistic, organic, blob-like creature
- Use multiple interconnected spheres or create a more complex geometry to simulate organic blob movement
- Add tentacles or pseudopods that move and writhe using animated geometry
- Semi-transparent with internal structure visible
- Pulsing/breathing animation with organic movement
- Should have a more menacing appearance with darker colors (dark purples, blacks, with glowing edges)
- Consider using animated vertex shaders for more organic movement
- CRITICAL: The amoeba should move at a speed that makes it a real threat - it should be able to catch up to the player if they don't actively try to escape
- Initial speed should be around 0.05-0.08 (much faster than previous 0.02)
- The amoeba should be challenging and require the player to run away actively

Amoeba Abilities:
- It can move forward to reach the player at a threatening pace
- It must be big enough (the size of the player) to consume the player
- Each action is to be taken by invoking OpenAI. An appropriate game state is sent to OpenAI, and OpenAI responds with the appropriate next action for the amoeba
- The amoeba starts at a moderate speed (0.05-0.08) to make it a real threat
- Actions should be taken every 8-12 seconds initially, not every 15 seconds
- The amoeba can move left/right/up/down
- It can change the rules of the game by:
    - Inverting or rotating the viewport of the player
    - Changing the keybinding so that left / right/ up down mean different things
    - Making the player default to crawling or crouching or jumping
    - Decrease the players speed by a little
    - Increase the amoeba's size by a little
    - Increase the amoeba's speed by a little (increments of 0.02-0.05)

Instructions for generating:
- Use Three.js CDN version r128 or higher (https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js)
- CRITICAL: Only use Three.js geometries available in r128 - avoid CapsuleGeometry (use CylinderGeometry instead)
- CRITICAL: Test all Three.js constructors for compatibility with the specified CDN version
- CRITICAL: When creating complex nested geometries (like tentacles), store mesh references properly to avoid accessing undefined children arrays
- Generate your own assets in your own assets folder. If you're unable to, create a stub for the image to be placed later. Keep the number of assets to a minimal amount (less than 20). Use code to generate the other shapes
- All the code generated must be isolated to content/projects/hysterai
- All the assets must be isolated to static/assets/projects/hysterai (NOT assets/projects/hysterai)
- Break down the task into steps and execute those steps. This should be a one shot generation with no intermediate states.
- Separate out the game engine into distinct js files and knit them together with hugo into the main index file
- CRITICAL: Do not reference any external files that don't exist (utils.js, heuristicsRedefinitions.js, etc.)
- CRITICAL: Ensure all JavaScript files are self-contained with no external dependencies beyond Three.js CDN
- CRITICAL: When adding child objects to meshes, store direct references rather than relying on children array indices
- Ensure the JavaScript is copied to the right folder (static/assets/projects/hysterai/) and keep track of MIME type issues.
- Name the prompt "hysterai.md" different than the project. Call it "hysterai_prompt" just so it doesn't get routed in the wrong place when knitting the Hugo.
- Ensure that the game renders in all different types of window browsers. Scale the game according to the browser size.
- CRITICAL: Fix terrain rendering issues - ensure the ground is visible and all objects are properly positioned on the terrain surface
- CRITICAL: Ensure the OpenAI model dropdown uses the exact models specified: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o3, o3-mini, o4-mini
- CRITICAL: Test Hugo server startup and resolve any port conflicts before deployment
- CRITICAL: Validate all JavaScript syntax and Three.js API calls before finalizing files

## Lessons Learned & Prompt Improvements

Based on implementation experience, the following improvements should be made to this prompt:

### Critical Technical Fixes Required

**Three.js Compatibility**: CRITICAL JavaScript errors occur due to API incompatibility:
- THREE.CapsuleGeometry does not exist in r128 - use THREE.CylinderGeometry instead
- Always verify Three.js constructor availability in specified CDN version
- Test all geometry types before using them in the implementation
- Specify exact CDN version in prompt to avoid compatibility issues

**Object Reference Management**: CRITICAL errors when building complex 3D objects:
- When creating nested geometries (tentacles), store mesh references in arrays before using them
- DO NOT use `group.children[i-1].add()` directly - store segment references separately
- Example: `const segmentMeshes = []; segmentMeshes.push(segment); segmentMeshes[i-1].add(segment);`
- Always test object hierarchy creation to avoid "Cannot read properties of undefined" errors

**File Structure**: File loading errors prevent game initialization:
- JavaScript files must be in static/assets/projects/hysterai/ (not assets/)
- Do not reference non-existent files (utils.js, heuristicsRedefinitions.js, extensionState.js)
- Ensure all JavaScript is self-contained with no external dependencies
- Test file serving paths before finalizing implementation

**Hugo Server Issues**: Port conflicts prevent testing:
- Always kill existing Hugo processes before starting new server
- Include server cleanup instructions in deployment steps
- Test build process separate from server startup

**Terrain Rendering**: The terrain/hill is not rendering properly in the initial implementation. Ensure:
- The terrain geometry is properly created and visible
- Ground collision detection works correctly
- All objects are positioned on the terrain surface, not floating
- Proper lighting makes the terrain clearly visible
- The hill shape is obvious and climbable

**Amoeba Design**: The amoeba appears as a simple purple orb. Improve by:
- Creating a more complex, organic blob-like appearance
- Adding animated tentacles or pseudopods
- Using more sophisticated materials and shaders
- Making it more visually threatening and realistic

**Game Balance**: The amoeba is too slow and non-threatening. Fix by:
- Increasing initial speed to 0.05-0.08
- Reducing action intervals to 8-12 seconds
- Making the amoeba genuinely able to catch the player
- Ensuring players must actively flee to survive

**Timer**: Change from 3 minutes to 1 minute for more intense gameplay

**OpenAI Models**: Ensure the exact latest models are used in the dropdown:
- gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o3, o3-mini, o4-mini

### Implementation Requirements

**Hugo Integration**: Create a custom Hugo layout (`layouts/projects/hysterai.html`) that bypasses default site styling and renders raw HTML using `{{ .RawContent | safeHTML }}` for full-screen game experience.

**File Structure**: 
- Source: `assets/projects/hysterai/*.js` 
- Served: `static/assets/projects/hysterai/*.js` (copy from assets)
- Content: `content/projects/hysterai.md` with Hugo front matter
- Layout: `layouts/projects/hysterai.html`

**Error Handling**: Include graceful fallback when OpenAI API fails, clear error messages, WebGL support detection, and responsive design for mobile/tablet/desktop.

**Performance**: Optimize Three.js loading, implement proper memory management, add loading indicators, and ensure smooth 60fps gameplay.

### Pre-Implementation Validation Checklist

Before generating any code, validate:

1. **Three.js API Compatibility**:
   - Check Three.js r128 documentation for all geometry types
   - Verify all Three.js constructors exist in the specified version
   - Use alternatives for missing APIs (CylinderGeometry instead of CapsuleGeometry)

2. **Object Hierarchy Design**:
   - Plan complex nested object creation (tentacles, arms, etc.)
   - Use explicit mesh reference arrays for parent-child relationships
   - Never rely on group.children array indices for adding objects

3. **File Structure Verification**:
   - Confirm all JavaScript files go to static/assets/projects/hysterai/
   - Ensure no references to non-existent external files
   - Test file serving paths match Hugo static file conventions

4. **Dependencies Check**:
   - Only use Three.js CDN and native JavaScript
   - No external libraries beyond what's explicitly included
   - Self-contained modules with no missing imports

5. **Build Process Validation**:
   - Test Hugo build process (hugo --buildDrafts)
   - Verify server startup without port conflicts
   - Confirm all assets are properly served

### Post-Implementation Testing Requirements

After code generation, must verify:

1. **Hugo Build Success**: `hugo --buildDrafts` completes without errors
2. **File Serving**: All JavaScript files accessible via HTTP
3. **Console Clean**: No JavaScript errors in browser console
4. **Game Initialization**: Title screen loads and accepts input
5. **Three.js Loading**: All 3D objects render without geometry errors
6. **Object Hierarchy**: Complex objects (amoeba tentacles) create without reference errors

**If any validation fails, fix the specific issue before proceeding to the next component.**
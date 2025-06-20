# Hysterai Prompt

Hysterai is meant to capture the inevitability of AI and how it will catch up to us. Modeled after the myth of sisyphus, the concept art / game is a first person game where the character attempts to walk up the hill to reach the top and their goal, where they win. Behind them if they were to turn around is an amoeba that initially moved very slowly, but slowly grows over time. The amoeba represents AI and is able to change the rules of the game as it goes. This makes it hard for you to reach the top of the hill, as the amoeba seeks to consume you. Ultimately it does so and the screens goes black, with voices of others who have tried to reach the top all around you. 

Opening Page:
- An electronic font that switches from Hysteria to Hysterai every so often with static
- A button that says play
- A box to enter an OpenAI key -- required to play
- A drop down for which openai model to use

Gameplay:
- The character is moved with the arrow keys up/left/down/right
- The character can just with spacebar and crouch with shift and crawl with ctrl+shift
- The character can turn around with the mouse to point to a different direction. Up moves you in that direction
- The character only sees their arms as they walk and not much else

Interface:
- A timer that ticks down from 3:00 minutes for you to reach the top of the hill
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
- Grass and sky with a hill that has a flag for "goal" at the top of it

Amoeba Abilities:
- It can move forward to reach the player
- It must be big enough (the size of the player) to consume the player
- Each action is to be taken by invoking OpenAI. An appropriate game state is sent to OpenAI, and OpenAI responds with the appropriate next action for the amoeba
- The amoeba can move left/right/up/down
- It can change the rules of the game by:
    - Inverting or rotating the viewport of the player
    - Changing the keybinding so that left / right/ up down mean different things
    - Making the player default to crawling or crouching or jumping
    - Decrease the players speed by a little
    - Increase the amoeba's size by a little
    - Increase the amoeba's speed by a little


Instructions for generating:
- Use Three.js
- Generate your own assets in your own assets folder. If you're unable to, create a stub for the image to be placed later. Keep the number of assets to a minimal amount (less than 20). Use code to generate the other shapes
- All the code generated must be isolated to content/projects/hysterai
- All the assets must be isolated to assets/projects/hysterai
- Break down the task into steps and execute those steps. This should be a one shot generation with no intermediate states.
- Seperate out the game engine into distinct js files and knit them together with hugo into the main index file
- Use cheerio.js to inspect the output after rendering with hugo and validate it looks correct to spec. If you see any bugs make note of them and fix them until it seems all good.
- Ensure the JavaScript is copied to the right folder and keep track of MIME type issues.
- Name the prompt "hysterai.md" different than the project. Call it "hysteriai_prompt" just so it doesn't get routed in the wrong place when knitting the Hugo.
- Ensure that the game renders in all different types of window browsers. Scale the game according to the browser size.

## Lessons Learned & Prompt Improvements

Based on implementation experience, the following improvements should be made to this prompt:

### Hugo Integration Issues
- **Problem**: Hugo wraps content in layouts, causing conflicts with full-screen games
- **Solution**: Specify that a custom Hugo layout (`layouts/projects/hysterai.html`) should be created that renders raw HTML content using `{{ .RawContent | safeHTML }}`
- **Improvement**: Add explicit instruction: "Create a custom Hugo layout that bypasses the default site layout to allow full-screen game experience"

### Testing & Debugging Requirements
- **Problem**: No clear testing methodology specified for debugging integration issues
- **Solution**: Replace cheerio.js instruction (not applicable in Hugo context) with:
  - "Test the game loading process with browser developer console"
  - "Add debug logging to track initialization steps"
  - "Verify all static assets are correctly served by Hugo"
  - "Test game functionality end-to-end before considering complete"

### File Structure Clarity
- **Problem**: Ambiguity about where JavaScript files should be placed and copied
- **Solution**: Specify explicit file structure:
  ```
  assets/projects/hysterai/*.js (source files)
  static/assets/projects/hysterai/*.js (served files - copy from assets)
  content/projects/hysterai/index.html (game page with Hugo front matter)
  layouts/projects/hysterai.html (custom layout)
  ```

### Error Handling & Fallbacks
- **Problem**: No specification for handling script loading failures or API issues
- **Solution**: Add requirements for:
  - Graceful fallback when OpenAI API fails
  - Clear error messages for missing dependencies
  - Progressive loading with visual feedback
  - Fallback AI behavior when API is unavailable

### Browser Compatibility
- **Problem**: "Scale according to browser size" was too vague
- **Solution**: Specify:
  - Responsive design breakpoints for mobile/tablet/desktop
  - WebGL support detection and fallback
  - Touch controls for mobile devices
  - Minimum browser requirements (WebGL, ES6 support)

### Performance Considerations
- **Additional Requirements**:
  - Optimize Three.js asset loading
  - Implement proper memory management for 3D objects
  - Add loading progress indicators for large assets
  - Use efficient rendering techniques for smooth gameplay

### Content Management
- **Problem**: Game content conflicts with site navigation
- **Solution**: Specify CSS overrides to hide site elements during gameplay
- **Improvement**: "Ensure game takes full control of viewport when active, hiding all site navigation and content"
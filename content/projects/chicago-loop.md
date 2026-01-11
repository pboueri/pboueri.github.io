---
title: "The Chicago Loop"
date: 2025-01-11
description: "A Conway's Game of Life puzzle game exploring strange loops and abstraction, set in Chicago"
tags: ["game", "conway", "puzzle", "interactive", "strange-loop"]
---

A puzzle game marrying the concept of strange loops with Chicago's iconic downtown Loop. Inspired by Conway's Game of Life and Douglas Hofstadter's Godel, Escher, Bach, you control a Chicago hot dog navigating through multimodal transportation challenges.

<div style="text-align: center; margin: 40px 0;">
    <a href="/assets/chicago-loop/play.html" class="play-button" style="display: inline-block; padding: 20px 40px; background: #FFD700; color: #000; text-decoration: none; font-size: 24px; font-weight: bold; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.3s; font-family: monospace;">
        PLAY GAME
    </a>
</div>

<style>
.play-button:hover {
    background: #FFC000 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.4) !important;
}
</style>

## The Concept

The game borrows from Conway's Game of Life: you set up initial conditions and rules, then watch the simulation unfold. Your goal is to guide a Chicago hot dog from one corner of the map to another by strategically placing cells and defining the rules that govern their birth, survival, and death.

## How to Play

1. **Set Up Your Grid**: Click cells in the 5x5 setup grid to toggle them on/off
2. **Configure Rules**: Use number keys (0-8) to toggle neighbor counts for birth/survival
   - **Birth**: How many neighbors cause a new cell to spawn
   - **Survive**: How many neighbors let a cell stay alive
3. **Run the Simulation**: Press START and watch your cells evolve
4. **Guide the Hot Dog**: Active cells push the hot dog away - use this to navigate to the goal

## Controls

- **Click**: Toggle cells in setup grid
- **0-8 Keys**: Toggle rule values
- **TAB**: Switch between Birth/Survive rules
- **ENTER**: Start simulation
- **R**: Reset level
- **SPACE**: Stop simulation (during play)

## The Levels

### Level 1: The Tunnels
It's the Chicago Flood of 1992 and all the basements are flooded. Navigate through the old mail and sewage tunnels using **rats** to escape through the hole in the top left.

### Level 2: The River
You're in the Chicago River at the famous Y-confluence. Use **dead fish** to reach the east dock next to the locks.

### Level 3: The Streets
Navigate downtown Chicago's famous grid structure. The Wrigley Building and Thompson Center loom between the streets. Use **bricks** to reach your destination.

## Themes Explored

The game explores the concept of **strange loops** - self-referential systems that take on a life of their own. Like Hofstadter's exploration of consciousness emerging from simple rules, you create emergent behavior from basic cellular automata rules.

The **Chicago Loop** serves as the perfect metaphor: a self-contained system where multiple modes of transportation (boats, trains, automobiles, buses, airplanes) create complex, interconnected patterns from simple individual movements.

## Technical Notes

- Built with vanilla JavaScript and HTML5 Canvas
- 8-bit pixel art aesthetic
- Simulatable via command-line for solution verification
- No external dependencies

## Solutions

Each level has at least one working solution. The challenge is discovering the right combination of initial cell placement and rules that will guide the hot dog to its goal within 100 generations.

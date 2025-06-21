---
title: "Hysterai"
date: 2025-06-20T23:40:26-05:00
draft: false
layout: hysterai
---

<div id="hysterai-container">
    <div id="menu-screen" class="screen active">
        <div class="title-container">
            <h1 id="game-title">HYSTERIA</h1>
        </div>
        <div class="menu-controls">
            <div class="control-group">
                <label for="openai-key">OpenAI API Key (Required):</label>
                <input type="password" id="openai-key" placeholder="sk-..." />
            </div>
            <div class="control-group">
                <label for="openai-model">OpenAI Model:</label>
                <select id="openai-model">
                    <option value="gpt-4.1">gpt-4.1</option>
                    <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                    <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                    <option value="o3">o3</option>
                    <option value="o3-mini">o3-mini</option>
                    <option value="o4-mini">o4-mini</option>
                </select>
            </div>
            <div class="control-group">
                <label for="difficulty">Amoeba Aggression:</label>
                <input type="range" id="difficulty" min="1" max="4" value="2" />
                <div class="difficulty-labels">
                    <span>Easy</span>
                    <span>Medium</span>
                    <span>Hard</span>
                    <span>Nightmare</span>
                </div>
            </div>
            <button id="play-btn">PLAY</button>
        </div>
    </div>
    <div id="game-screen" class="screen">
        <div id="game-ui">
            <div id="timer">1:00</div>
            <div id="minimap"></div>
            <div id="action-log"></div>
        </div>
        <div id="game-canvas"></div>
    </div>
    <div id="end-screen" class="screen">
        <div id="end-message"></div>
        <button id="restart-btn">RESTART</button>
    </div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="/assets/hysterai/game.js"></script>
<script src="/assets/hysterai/terrain.js"></script>
<script src="/assets/hysterai/amoeba.js"></script>
<script src="/assets/hysterai/player.js"></script>
<script src="/assets/hysterai/ai.js"></script>
<script src="/assets/hysterai/ui.js"></script>
<script src="/assets/hysterai/main.js"></script> 
/**
 * Library:      lib_bejson_engine_core.js
 * Family:       Gaming
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Main engine loop for JavaScript gaming libraries.
 */

'use strict';

class ChunkManager {
    constructor() {
        this.activeChunks = new Map();
        this.loadingChunks = new Set();
    }
}

class CoreEngine {
    constructor() {
        this.systems = [];
        this.chunkManager = new ChunkManager();
        this.activeChunks = new Map(); // Compatibility with bejson_game.js
        this.chunks = { Values: [] };   // Compatibility with bejson_game.js
    }

    addSystem(sys) { this.systems.push(sys); }

    start() {
        let last = performance.now();
        const loop = (now) => {
            const dt = (now - last) / 1000;
            last = now;
            this.systems.forEach(s => s.update && s.update(dt));
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

export { CoreEngine, ChunkManager };

if (typeof window !== 'undefined') {
    window.CoreEngine = CoreEngine;
    window.ChunkManager = ChunkManager;
}

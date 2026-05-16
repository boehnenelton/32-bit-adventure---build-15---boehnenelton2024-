export class ChunkManager {
    constructor(engine, options = {}) {
        this.engine = engine;
        this.chunkSize = options.chunkSize || 256; // Pixels
        this.loadRadius = options.loadRadius || 1; // 1 = 3x3 grid
        this.activeChunks = new Map(); // key -> bejson
        this.loadingChunks = new Set();
        this.basePath = options.basePath || 'data/chunks/';
    }

    getChunkKey(x, y) {
        const cx = Math.floor(x / this.chunkSize);
        const cy = Math.floor(y / this.chunkSize);
        return "" + cx + "_" + cy;
    }

    async update(camera) {
        const centerCX = Math.floor((camera.x + (camera.width || 640) / 2) / this.chunkSize);
        const centerCY = Math.floor((camera.y + (camera.height || 480) / 2) / this.chunkSize);

        const needed = new Set();
        for (let dy = -this.loadRadius; dy <= this.loadRadius; dy++) {
            for (let dx = -this.loadRadius; dx <= this.loadRadius; dx++) {
                const cx = centerCX + dx;
                const cy = centerCY + dy;
                needed.add("" + cx + "_" + cy);
            }
        }

        // 1. Unload distant chunks
        for (const key of this.activeChunks.keys()) {
            if (!needed.has(key)) {
                this.activeChunks.delete(key);
                console.log("[ChunkManager] Deallocated: " + key);
            }
        }

        // 2. Load new chunks
        for (const key of needed) {
            if (!this.activeChunks.has(key) && !this.loadingChunks.has(key)) {
                this.loadChunk(key);
            }
        }
    }

    async loadChunk(key) {
        this.loadingChunks.add(key);
        const url = this.basePath + "tile_chunk_" + key + ".bejson";
        try {
            console.log("[ChunkManager] Asynchronously fetching: " + url);
            const response = await fetch(url);
            if (!response.ok) throw new Error("HTTP " + response.status);
            const data = await response.json();
            this.activeChunks.set(key, data);
        } catch (e) {
            console.warn("[ChunkManager] Failed to load chunk " + key + ": " + e.message);
        } finally {
            this.loadingChunks.delete(key);
        }
    }

    getNearbyTiles() {
        const tiles = [];
        this.activeChunks.forEach(doc => {
            if (doc.Values) {
                tiles.push(...doc.Values);
            }
        });
        return tiles;
    }
}

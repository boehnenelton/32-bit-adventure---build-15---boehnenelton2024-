/**
 * Library:      lib_bejson_renderer.ts
 * Family:       Gaming
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Graphics rendering abstraction for BEJSON-based visuals.
 */

'use strict';

class BEJSONRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.dpr = window.devicePixelRatio || 1;
    }

    clear(color = '#000') {
        if (!this.ctx) return;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize() {
        if (!this.canvas) return;
        // Standard high-DPI resize logic
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }

    drawChunkedLayer(chunkManager, images, tileSize, assets) {
        if (!this.ctx) return;
        const ctx = this.ctx;
        
        chunkManager.activeChunks.forEach((file, chunkKey) => {
            if (!file || !file.Values) return;
            
            file.Values.forEach(row => {
                const x = row[2];
                const y = row[3];
                const type = row[4] || row[5]; // terrain_type or object_type
                
                const screenX = x * tileSize - this.camera.x;
                const screenY = y * tileSize - this.camera.y;
                
                // Culling
                if (screenX + tileSize < 0 || screenX > this.canvas.width / this.camera.zoom ||
                    screenY + tileSize < 0 || screenY > this.canvas.height / this.camera.zoom) {
                    return;
                }

                if (images[type] && images[type].complete) {
                    ctx.drawImage(images[type], screenX, screenY, tileSize, tileSize);
                } else {
                    const rules = assets[type];
                    ctx.fillStyle = rules?.fallback_color || '#333';
                    ctx.fillRect(screenX, screenY, tileSize, tileSize);
                }
            });
        });
    }
}

export default BEJSONRenderer;

if (typeof window !== 'undefined') {
    window.BEJSON_Renderer = BEJSONRenderer;
}

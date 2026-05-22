/**
 * Library:      lib_bejson_assets.js
 * Family:       Gaming
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Game asset loader and manager for BEJSON-defined resources.
 */

'use strict';

class BEJSONAssets {
    constructor() {
        this.cache = new Map();
    }

    async load(id, type, path) {
        if (this.cache.has(id)) return this.cache.get(id);
        
        let asset;
        if (type === 'image') {
            asset = await new Promise((res, rej) => {
                const img = new Image();
                img.onload = () => res(img);
                img.onerror = rej;
                img.src = path;
            });
        }
        
        this.cache.set(id, asset);
        return asset;
    }

    get(id) { return this.cache.get(id); }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BEJSONAssets;
} else {
    window.BEJSON_Assets = BEJSONAssets;
}

/**
 * Library:      lib_bejson_grid.js
 * Family:       Gaming
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Universal grid-based data layout manager.
 */

'use strict';

class BEJSONGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.layers = new Map();
    }

    createLayer(name, initialVal = 0) {
        this.layers.set(name, new Array(this.width * this.height).fill(initialVal));
    }

    getTile(layer, x, y) {
        const data = this.layers.get(layer);
        if (!data) return null;
        return data[y * this.width + x];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BEJSONGrid;
} else {
    window.BEJSON_Grid = BEJSONGrid;
}

/**
 * Library:      lib_bejson_input.js
 * Family:       Gaming
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Multi-modal input abstraction (Keyboard, Mouse, Touch).
 */

'use strict';

class BEJSONInput {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this.bindings = {
            'w': 'up', 'a': 'left', 's': 'down', 'd': 'right',
            'ArrowUp': 'up', 'ArrowLeft': 'left', 'ArrowDown': 'down', 'ArrowRight': 'right',
            ' ': 'action', 'e': 'action',
            'm': 'menu', 'Escape': 'menu'
        };
        
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', e => this._onKey(e, true));
            window.addEventListener('keyup', e => this._onKey(e, false));
        }
    }

    _onKey(e, isDown) {
        const key = e.key;
        if (isDown && !this.keys[key]) {
            this.justPressed[key] = true;
            const bound = this.bindings[key];
            if (bound) this.justPressed[bound] = true;
        }
        this.keys[key] = isDown;
        const bound = this.bindings[key];
        if (bound) this.keys[bound] = isDown;
    }

    update() {
        this.justPressed = {};
    }

    isPressed(key) {
        return !!this.keys[key];
    }

    _isBoundJustPressed(binding) {
        return !!this.justPressed[binding];
    }

    getVector() {
        let x = 0, y = 0;
        if (this.keys['left'] || this.keys['a']) x -= 1;
        if (this.keys['right'] || this.keys['d']) x += 1;
        if (this.keys['up'] || this.keys['w']) y -= 1;
        if (this.keys['down'] || this.keys['s']) y += 1;
        
        return { x, y, action: !!this.keys['action'] };
    }
}

export default BEJSONInput;

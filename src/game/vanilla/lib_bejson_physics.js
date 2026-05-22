/**
 * Library:      lib_bejson_physics.js
 * Family:       Gaming
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  2D/3D physics calculation engine for BEJSON-based simulations.
 */

'use strict';

class BEJSONPhysics {
    constructor() {
        this.bodies = { Values: [] }; // [id, x, y, w, h, vx, vy, isStatic]
        this.bounds = { x: 0, y: 0, w: 1000, h: 1000 };
    }

    addBody(id, x, y, w, h, opts = {}) {
        const idx = this.bodies.Values.findIndex(b => b[0] === id);
        if (idx !== -1) {
            const b = this.bodies.Values[idx];
            b[1] = x; b[2] = y; b[3] = w; b[4] = h;
            b[7] = !!opts.isStatic;
            return;
        }
        this.bodies.Values.push([id, x, y, w, h, 0, 0, !!opts.isStatic]);
    }

    applyImpulse(id, vx, vy) {
        const body = this.bodies.Values.find(b => b[0] === id);
        if (body && !body[7]) {
            body[5] = vx;
            body[6] = vy;
        }
    }

    setBounds(rect) {
        this.bounds = rect;
    }

    step(dt, colliders = []) {
        this.bodies.Values.forEach(body => {
            if (body[7]) return; // isStatic
            
            let nextX = body[1] + body[5] * dt;
            let nextY = body[2] + body[6] * dt;
            
            // Collision with static tiles
            colliders.forEach(c => {
                const [cx, cy, cw, ch] = c;
                if (nextX < cx + cw && nextX + body[3] > cx &&
                    nextY < cy + ch && nextY + body[4] > cy) {
                    // Primitive collision resolution: stop movement
                    nextX = body[1];
                    nextY = body[2];
                    body[5] = 0;
                    body[6] = 0;
                }
            });

            body[1] = nextX;
            body[2] = nextY;
            
            // Friction
            body[5] *= 0.9;
            body[6] *= 0.9;
        });
    }
}

export default BEJSONPhysics;

if (typeof window !== 'undefined') {
    window.BEJSON_Physics = BEJSONPhysics;
}

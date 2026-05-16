/**
 * switch_physics.js
 * game1 aka the BEJSON Game Engine (#1)
 * Author: Elton Boehnen: AABB Physics & Collision Engine (v1.5)
 * Date: 2026-05-09
 * 
 * Optimized for BEJSON 104 performance.
 * Refactored for: Independent Axis Resolution, Impulse Support, and Wall-Sliding fix.
 */

window.Switch = window.Switch || {};

class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary; // {x, y, w, h}
        this.capacity = capacity;
        this.points = []; // Stores bodies
        this.divided = false;
    }

    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w / 2;
        const h = this.boundary.h / 2;

        this.northeast = new QuadTree({ x: x + w, y: y, w: w, h: h }, this.capacity);
        this.northwest = new QuadTree({ x: x, y: y, w: w, h: h }, this.capacity);
        this.southeast = new QuadTree({ x: x + w, y: y + h, w: w, h: h }, this.capacity);
        this.southwest = new QuadTree({ x: x, y: y + h, w: w, h: h }, this.capacity);

        this.divided = true;
    }

    insert(body) {
        const bx = body[1];
        const by = body[2];
        const bw = body[3];
        const bh = body[4];

        if (bx > this.boundary.x + this.boundary.w || bx + bw < this.boundary.x ||
            by > this.boundary.y + this.boundary.h || by + bh < this.boundary.y) {
            return false;
        }

        if (this.points.length < this.capacity && !this.divided) {
            this.points.push(body);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
            // Migrate points to children
            for (let p of this.points) {
                this.northeast.insert(p);
                this.northwest.insert(p);
                this.southeast.insert(p);
                this.southwest.insert(p);
            }
            this.points = [];
        }

        let inserted = false;
        if (this.northeast.insert(body)) inserted = true;
        if (this.northwest.insert(body)) inserted = true;
        if (this.southeast.insert(body)) inserted = true;
        if (this.southwest.insert(body)) inserted = true;
        
        return inserted;
    }

    query(range, found, foundSet) {
        if (!found) {
            found = [];
            foundSet = new Set();
        }

        if (range.x > this.boundary.x + this.boundary.w || range.x + range.w < this.boundary.x ||
            range.y > this.boundary.y + this.boundary.h || range.y + range.h < this.boundary.y) {
            return found;
        }

        for (let p of this.points) {
            if (!foundSet.has(p[0])) {
                if (p[1] <= range.x + range.w && p[1] + p[3] >= range.x &&
                    p[2] <= range.y + range.h && p[2] + p[4] >= range.y) {
                    found.push(p);
                    foundSet.add(p[0]);
                }
            }
        }

        if (this.divided) {
            this.northeast.query(range, found, foundSet);
            this.northwest.query(range, found, foundSet);
            this.southeast.query(range, found, foundSet);
            this.southwest.query(range, found, foundSet);
        }

        return found;
    }
}

class SwitchPhysics {
    constructor(options = {}) {
        this.gravity = options.gravity || { x: 0, y: 0 }; // Default to top-down (no gravity)
        this.friction = options.friction || 0.9;
        this.worldBounds = options.worldBounds || { x: 0, y: 0, w: 2000, h: 2000 };
        this.bodies = Switch.BEJSON.create104("PhysicsWorld", [
            { name: "id", type: "string" },
            { name: "x", type: "number" },
            { name: "y", type: "number" },
            { name: "w", type: "number" },
            { name: "h", type: "number" },
            { name: "vx", type: "number" },
            { name: "vy", type: "number" },
            { name: "isStatic", type: "boolean" },
            { name: "mass", type: "number" }
        ], []);
        
        // Impulse queue to be applied during step
        this.impulses = new Map();
    }

    addBody(id, x, y, w, h, options = {}) {
        this.bodies.Values.push([
            id, x, y, w, h, 
            options.vx || 0, options.vy || 0, 
            options.isStatic || false, 
            options.mass || 1
        ]);
    }

    applyImpulse(id, ix, iy) {
        if (!this.impulses.has(id)) this.impulses.set(id, { x: 0, y: 0 });
        const imp = this.impulses.get(id);
        imp.x += ix;
        imp.y += iy;
    }

    setBounds(bounds) {
        this.worldBounds = bounds;
    }

    step(dt, staticColliders = []) {
        const values = this.bodies.Values;

        // Build static QuadTree cache if not empty
        let staticQt = null;
        if (staticColliders.length > 0) {
            staticQt = new QuadTree(this.worldBounds, 4);
            for (let i = 0; i < staticColliders.length; i++) {
                const c = staticColliders[i];
                staticQt.insert([
                    "static_" + i, 
                    Array.isArray(c) ? c[0] : c.x, 
                    Array.isArray(c) ? c[1] : c.y, 
                    Array.isArray(c) ? c[2] : (c.w || c.width), 
                    Array.isArray(c) ? c[3] : (c.h || c.height)
                ]);
            }
        }

        for (let i = 0; i < values.length; i++) {
            const b = values[i];
            if (b[7]) continue; // isStatic

            // 1. Apply Impulses
            if (this.impulses.has(b[0])) {
                const imp = this.impulses.get(b[0]);
                b[5] += imp.x;
                b[6] += imp.y;
                this.impulses.delete(b[0]);
            }

            // 2. Apply Gravity & Friction
            b[5] += this.gravity.x * dt;
            b[6] += this.gravity.y * dt;
            b[5] *= this.friction;
            b[6] *= this.friction;

            // 3. Resolve X Axis
            const oldX = b[1];
            b[1] += b[5] * dt;
            const colX = this._checkStaticCollisionsQT(b, staticQt, staticColliders);
            if (colX) {
                if (colX.overlapY < 5) {
                    b[2] += colX.pushY;
                } else {
                    b[1] = oldX;
                    b[5] = 0;
                }
            }

            // 4. Resolve Y Axis
            const oldY = b[2];
            b[2] += b[6] * dt;
            const colY = this._checkStaticCollisionsQT(b, staticQt, staticColliders);
            if (colY) {
                if (colY.overlapX < 5) {
                    b[1] += colY.pushX;
                } else {
                    b[2] = oldY;
                    b[6] = 0;
                }
            }
        }

        // 5. Resolve Dynamic Collisions using QuadTree
        const qt = new QuadTree(this.worldBounds, 4);
        for (let i = 0; i < values.length; i++) {
            qt.insert(values[i]);
        }

        for (let i = 0; i < values.length; i++) {
            const bA = values[i];
            const range = { x: bA[1], y: bA[2], w: bA[3], h: bA[4] };
            const nearby = qt.query(range);

            for (let j = 0; j < nearby.length; j++) {
                const bB = nearby[j];
                if (bA[0] !== bB[0] && this._checkAABB(bA, bB)) {
                    // Quick check to mostly prevent resolving twice
                    if (bA[0] < bB[0]) continue; 
                    this._resolveCollision(bA, bB);
                }
            }
        }
    }

    _checkStaticCollisionsQT(b, staticQt, fallbackColliders) {
        if (!staticQt) return this._checkStaticCollisions(b, fallbackColliders);
        const range = { x: b[1], y: b[2], w: b[3], h: b[4] };
        const nearby = staticQt.query(range);
        for (let i = 0; i < nearby.length; i++) {
            if (this._checkAABB(b, nearby[i])) {
                const cx = nearby[i][1];
                const cy = nearby[i][2];
                const cw = nearby[i][3];
                const ch = nearby[i][4];

                const overlapX1 = (b[1] + b[3]) - cx;
                const overlapX2 = (cx + cw) - b[1];
                const overlapX = Math.min(overlapX1, overlapX2);
                const pushX = overlapX1 < overlapX2 ? -overlapX1 : overlapX2;

                const overlapY1 = (b[2] + b[4]) - cy;
                const overlapY2 = (cy + ch) - b[2];
                const overlapY = Math.min(overlapY1, overlapY2);
                const pushY = overlapY1 < overlapY2 ? -overlapY1 : overlapY2;

                return { hit: true, overlapX, overlapY, pushX, pushY };
            }
        }
        return false;
    }

    _checkStaticCollisions(b, colliders) {
        for (const c of colliders) {
            const cx = Array.isArray(c) ? c[0] : c.x;
            const cy = Array.isArray(c) ? c[1] : c.y;
            const cw = Array.isArray(c) ? c[2] : (c.w || c.width);
            const ch = Array.isArray(c) ? c[3] : (c.h || c.height);

            if (b[1] < cx + cw && b[1] + b[3] > cx && b[2] < cy + ch && b[2] + b[4] > cy) {
                const overlapX1 = (b[1] + b[3]) - cx;
                const overlapX2 = (cx + cw) - b[1];
                const overlapX = Math.min(overlapX1, overlapX2);
                const pushX = overlapX1 < overlapX2 ? -overlapX1 : overlapX2;

                const overlapY1 = (b[2] + b[4]) - cy;
                const overlapY2 = (cy + ch) - b[2];
                const overlapY = Math.min(overlapY1, overlapY2);
                const pushY = overlapY1 < overlapY2 ? -overlapY1 : overlapY2;

                return { hit: true, overlapX, overlapY, pushX, pushY };
            }
        }
        return false;
    }

    _checkAABB(a, b) {
        return (a[1] < b[1] + b[3] && a[1] + a[3] > b[1] && a[2] < b[2] + b[4] && a[2] + a[4] > b[2]);
    }

    _resolveCollision(a, b) {
        if (a[7] && b[7]) return;
        const tempVx = a[5]; a[5] = b[5]; b[5] = tempVx;
        const tempVy = a[6]; a[6] = b[6]; b[6] = tempVy;
    }
}

Switch.Physics = SwitchPhysics;
export default SwitchPhysics;

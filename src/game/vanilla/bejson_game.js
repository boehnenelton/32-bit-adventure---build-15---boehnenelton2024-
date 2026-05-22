/**
 * bejson_game.js
 * game1 aka the BEJSON Game Engine (#1)
 * Author: Elton Boehnen: Vanilla Game Wrapper (Build 116)
 * Date: 2026-05-16
 */

import { CoreEngine as BejsonEngine, ChunkManager } from './lib_bejson_engine_core';
import BejsonRenderer from './lib_bejson_renderer';
import BejsonPhysics from './lib_bejson_physics';
import BejsonInput from './lib_bejson_input';
import BejsonEvents from './lib_bejson_events';

export class VanillaGame {
    constructor(canvasId, mfdb) {
        this.canvasId = canvasId;
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error("No canvas found with ID " + canvasId);
            return;
        }

        this.mfdb = mfdb;

        this.state = 'TITLE';
        this.flags = {};
        this.score = 0;
        this._dialogText = null;
        this.tileSize = 32;
        this.camera = { x: 0, y: 0, width: 640, height: 480 };

        this.engine = new BejsonEngine();
        this.renderer = new BejsonRenderer(canvasId);
        this.physics = new BejsonPhysics();
        this.input = new BejsonInput();
        this.events = new BejsonEvents(this);

        this.assets = {};
        this.sprites = {};
        this.loadedImages = {};
        this.actors = [];
        this.tiles = [];
        this.player = null;
        this.sword = null;
        
        this.listeners = {};
        
        this.animationFrameId = 0;
        this.intervalId = 0;
        this.lastTime = performance.now();

        this.loop = this.loop.bind(this);
        this.updateLoop = this.updateLoop.bind(this);
        this.init();
        
        this.intervalId = setInterval(this.updateLoop, 1000 / 60);
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    on(event, cb) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(cb);
    }

    emit(event, data) {
        if (this.listeners[event]) this.listeners[event].forEach(cb => cb(data));
    }

    notifyPlayerChange() {
        this.emit('onHealthChange', this.player?.health || 0);
        this.emit('UIUpdate');
    }

    init() {
        this.assets = {}; this.sprites = {}; this.loadedImages = {}; this.actors = []; this.tiles = [];
        this.player = null; this.sword = null; this.score = 0;

        const manifest = this.mfdb["104a.mfdb.bejson"];
        const fileOrder = manifest?.Values?.slice().sort((a, b) => a[2] - b[2]) || [];
        const loadedFiles = new Set();
        
        for (const record of fileOrder) {
            const [entity, path, order] = record;
            if (!this.mfdb[path]) continue;
            if (order >= 2 && (!loadedFiles.has("data/object_rules.bejson") || !loadedFiles.has("data/actor_stats.bejson") || !loadedFiles.has("data/events.bejson"))) {
                console.error("Dependency error.");
                return;
            }
            loadedFiles.add(path);
        }

        const objectRulesDb = this.mfdb["data/object_rules.bejson"]?.Values || [];
        objectRulesDb.forEach(a => { this.assets[a[0]] = { asset_id: a[0], is_solid: a[1], interactable: a[2], damage: a[3], description: a[4], fallback_color: a[5], speed_mult: a[6], knockback_force: a[7], hitbox_width: a[8], hitbox_height: a[9], lifespan: a[10] }; });
        
        Object.keys(this.mfdb).forEach(filename => {
            if (filename.startsWith("assets/") && filename.endsWith(".bejson")) {
                const fileContent = this.mfdb[filename];
                if (fileContent.Records_Type && 
                    fileContent.Records_Type[0] && 
                    fileContent.Records_Type[0].startsWith("Asset") && 
                    fileContent.Values && 
                    fileContent.Values.length > 0) {
                    const spriteId = fileContent.Values[0][0]; // asset_id is now the first field
                    const dataUri = fileContent.Values[0][1];  // data_uri is now the second field
                    if (spriteId && dataUri) {
                        this.sprites[spriteId] = dataUri;
                        const img = new Image(); img.src = dataUri; this.loadedImages[spriteId] = img;
                    }
                }
            }
        });
        
        const actorStatsDb = this.mfdb["data/actor_stats.bejson"]?.Values || [];
        const actorStats = {};
        actorStatsDb.forEach(s => { actorStats[s[0]] = { actor_type: s[0], max_health: s[1], atk: s[2], def: s[3], speed: s[4], xp_reward: s[5], fallback_color: s[6], start_potions: s[7] || 0, level_up_hp: s[8] || 0, level_up_atk: s[9] || 0, level_up_def: s[10] || 0, knockback_force: s[11] || 0, potion_heal_amount: s[12] || 0, is_victory_target: s[13] || false }; });
        this.actorStats = actorStats;

        const levelDb = this.mfdb["data/level.bejson"]?.Values || [];
        if (levelDb.length > 0) this.loadLevel(levelDb[0][0]); else return;
    }

    loadLevel(levelId, spawnX, spawnY) {
        const levelDb = this.mfdb["data/level.bejson"]?.Values || [];
        const levelRow = levelDb.find(l => l[0] === levelId);
        if (!levelRow) return;

        this.level = { id: levelRow[0], width: levelRow[1], height: levelRow[2], biome: levelRow[3], victory_condition: levelRow[4] || 'none' };

        // BEJSON engine uses prefix for chunks using format data/level_id_tile_chunk_ or data/tile_chunk_ fallback
        // We'll reset chunks, physics here
        this.engine.activeChunks.clear();
        this.engine.chunks.Values = [];

        this.physics.bodies.Values = []; // clear physics bodies
        
        const actorDb = this.mfdb["data/actor.bejson"]?.Values || [];
        const oldPlayer = this.player;
        this.actors = []; this.player = null;

        actorDb.forEach((a, index) => {
            if (a[2] !== 'player' && a[1] !== this.level.id) return;
            if (a[2] === 'player' && oldPlayer) {
               this.player = oldPlayer;
               if (spawnX !== undefined && spawnY !== undefined) {
                  this.player.x = spawnX; this.player.y = spawnY;
               }
               this.actors.push(this.player);
               this.physics.addBody(this.player.id, this.player.x, this.player.y, this.player.width, this.player.height, { isStatic: false });
               return;
            }

            const statsConfig = this.actorStats[a[2]] || { max_health: 50, atk: 5, def: 2, speed: 50, xp_reward: 10, start_potions: 0 };
            const actor = {
                id: a[0] || `actor_${index}`, type: a[2], x: a[3] * this.tileSize, y: a[4] * this.tileSize, width: 32, height: 32,
                health: a[5] || statsConfig.max_health, maxHealth: statsConfig.max_health, speed: statsConfig.speed,
                color: statsConfig.fallback_color || '#ffffff', vx: 0, vy: 0, facing: { x: 1, y: 0 },
                atk: a[6] || statsConfig.atk, def: a[7] || statsConfig.def, level: 1, xp: 0, maxXp: 100,
                potions: statsConfig.start_potions || 0, xpReward: statsConfig.xp_reward, levelUpHp: statsConfig.level_up_hp,
                levelUpAtk: statsConfig.level_up_atk, levelUpDef: statsConfig.level_up_def, knockback_force: statsConfig.knockback_force, potion_heal_amount: statsConfig.potion_heal_amount
            };
            if (a[2] === 'player') {
               this.player = actor;
               if (spawnX !== undefined && spawnY !== undefined) {
                  this.player.x = spawnX; this.player.y = spawnY;
               }
            }
            this.actors.push(actor);
            this.physics.addBody(actor.id, actor.x, actor.y, actor.width, actor.height, { isStatic: false });
        });

        this.input.update(); // Flush input
    }
    
    destroy() {
        cancelAnimationFrame(this.animationFrameId);
    }
    
    get scoreValue() { return this.score; }
    set scoreValue(v) { this.score = v; this.emit('onScoreUpdate', v); this.emit('UIUpdate'); }
    get stateStatus() { return this.state; }
    set stateStatus(v) { this.state = v; this.emit('onStateChange', v); this.emit('UIUpdate'); }
    get dialogText() { return this._dialogText; }
    set dialogText(v) { this._dialogText = v; this.emit('UIUpdate'); }

    serialize() { return JSON.stringify({ score: this.score, player: this.player, actors: this.actors, level: this.level }); }
    deserialize(data) {
        try {
            const parsed = JSON.parse(data); this.scoreValue = parsed.score; this.actors = parsed.actors;
            const playerRef = this.actors.find(a => a.type === 'player');
            if (playerRef) this.player = playerRef; else { this.player = parsed.player; if (this.player) this.actors.push(this.player); }
            this.level = parsed.level; this.stateStatus = 'PLAYING';
        } catch (e) {}
    }

    destroy() {
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }

    updateLoop() {
        if (this.state !== 'PLAYING') return;
        this.update(1 / 60);
        this.input.update(); // clear just pressed
    }

    loop(time) {
        if (this.state === 'PLAYING') {
             this.draw();
        }
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    checkCollision(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }

    updateChunksAsync() {
        if (!this.player) return;
        const CHUNK_PIXELS = 10 * this.tileSize;
        const cx = Math.floor(this.player.x / CHUNK_PIXELS);
        const cy = Math.floor(this.player.y / CHUNK_PIXELS);

        const neededChunks = new Set();
        for (let i = -1; i <= 1; i++) {
            for(let j = -1; j <= 1; j++) {
                const nx = cx + i; const ny = cy + j;
                if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) neededChunks.add(`${nx}_${ny}`);
            }
        }

        neededChunks.forEach(chunkKey => {
            if (!this.engine.chunkManager.activeChunks.has(chunkKey) && !this.engine.chunkManager.loadingChunks.has(chunkKey)) {
                this.engine.chunkManager.loadingChunks.add(chunkKey);
                Promise.resolve().then(() => {
                    const [xStr, yStr] = chunkKey.split('_');
                    const file1 = this.mfdb[`data/${this.level.id}_tile_chunk_${xStr}_${yStr}.bejson`];
                    const file2 = this.mfdb[`data/tile_chunk_${xStr}_${yStr}.bejson`];
                    const file = file1 || file2;
                    if (file) {
                        const newTiles = file.Values.map(t => ({ tile_id: t[0], level_id: t[1], x: t[2], y: t[3], terrain_type: t[4], object_type: t[5], chunkKey }));
                        this.tiles.push(...newTiles);
                    }
                    this.engine.chunkManager.activeChunks.set(chunkKey, file || {});
                    this.engine.chunkManager.loadingChunks.delete(chunkKey);
                    
                    // Wake up actors
                    this.actors.forEach(actor => {
                        const acx = Math.floor(actor.x / CHUNK_PIXELS);
                        const acy = Math.floor(actor.y / CHUNK_PIXELS);
                        if (`${acx}_${acy}` === chunkKey) {
                            actor.sleeping = false;
                        }
                    });
                });
            } else if (this.engine.chunkManager.activeChunks.has(chunkKey)) {
                this.actors.forEach(actor => {
                     const acx = Math.floor(actor.x / CHUNK_PIXELS);
                     const acy = Math.floor(actor.y / CHUNK_PIXELS);
                     if (`${acx}_${acy}` === chunkKey) {
                         actor.sleeping = false;
                     }
                });
            }
        });

        const toUnload = Array.from(this.engine.chunkManager.activeChunks.keys()).filter(c => !neededChunks.has(c));
        toUnload.forEach(chunkKey => {
            this.engine.chunkManager.activeChunks.delete(chunkKey);
            this.tiles = this.tiles.filter(t => t.chunkKey !== chunkKey);
            
            // Sleep actors
            this.actors.forEach(actor => {
                if (actor.type === 'player') return; // never sleep player
                const acx = Math.floor(actor.x / CHUNK_PIXELS);
                const acy = Math.floor(actor.y / CHUNK_PIXELS);
                if (`${acx}_${acy}` === chunkKey) {
                    actor.sleeping = true;
                }
            });
        });
    }

    update(dt) {
        const inp = this.input.getVector();

        if (inp.action) {
            if (this.state === 'TITLE') { this.stateStatus = 'PLAYING'; return; }
            if (this.state === 'GAMEOVER' || this.state === 'VICTORY') { this.init(); this.stateStatus = 'PLAYING'; return; }
            if (this.state === 'DIALOG') { this.stateStatus = 'PLAYING'; this.dialogText = null; return; }
            
            if (this.state === 'PLAYING' && !this.sword && this.player) {
                const npc = this.actors.find(a => {
                    if (a.type !== 'npc') return false;
                    const dist = Math.sqrt(Math.pow((a.x + a.width/2) - (this.player.x + this.player.width/2), 2) + Math.pow((a.y + a.height/2) - (this.player.y + this.player.height/2), 2));
                    return dist < 60;
                });
                if (npc) { this.events.run(npc.id + "_talk"); }
                else {
                    this.sword = {
                        x: this.player.x + this.player.facing.x * 24, y: this.player.y + this.player.facing.y * 24,
                        width: this.assets['sword']?.hitbox_width || 24, height: this.assets['sword']?.hitbox_height || 24, damage: (this.assets['sword'] || {damage: 10}).damage, life: 0.15,
                        maxLife: 0.15,
                        facingAngle: Math.atan2(this.player.facing.y, this.player.facing.x)
                    };
                }
            }
        }

        if (this.input._isBoundJustPressed('menu')) {
            if (this.state === 'PLAYING') { this.stateStatus = 'MENU'; return; }
            else if (this.state === 'MENU' || this.state === 'ITEM_MENU') { this.stateStatus = 'PLAYING'; return; }
        }

        if (this.input.keys['KeyC'] || this.input.keys['KeyR']) {
             if (this.state === 'PLAYING' && this.player && this.player.potions > 0 && this.player.health < this.player.maxHealth) {
                this.player.potions--; this.player.health = Math.min(this.player.maxHealth, this.player.health + (this.player.potion_heal_amount ?? 50));
                this.input.keys['KeyC'] = false; // consume it manually
                this.notifyPlayerChange();
             }
        }

        if (this.state !== 'PLAYING' || !this.player || !this.level) return;

        this.updateChunksAsync();

        const levelWidth = this.level.width * this.tileSize; 
        const levelHeight = this.level.height * this.tileSize;

        const colliders = this.tiles
            .filter(t => {
                const rules = this.assets[t.terrain_type || t.object_type];
                return rules && rules.is_solid;
            })
            .map(t => {
                const rules = this.assets[t.terrain_type || t.object_type];
                const hw = rules.hitbox_width || this.tileSize;
                const hh = rules.hitbox_height || this.tileSize;
                const ox = (this.tileSize - hw) / 2;
                const oy = (this.tileSize - hh) / 2;
                return [t.x * this.tileSize + ox, t.y * this.tileSize + oy, hw, hh];
            });


        for (let i = this.actors.length - 1; i >= 0; i--) {
            const actor = this.actors[i];
            if (actor.sleeping) continue;
            actor.pendingVx = 0; actor.pendingVy = 0;
            if (actor.type === 'enemy' || actor.type === 'chest') {
                if (actor.type === 'enemy') {
                    const dx = this.player.x - actor.x; const dy = this.player.y - actor.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0 && dist < 300) {
                        actor.pendingVx = (dx / dist) * actor.speed;
                        actor.pendingVy = (dy / dist) * actor.speed;
                    }
                }
                if (this.sword && this.checkCollision(actor, this.sword)) {
                    if (actor.type === 'chest') { this.player.potions++; this.notifyPlayerChange(); this.actors.splice(i, 1); continue; }
                    actor.health -= Math.max(1, this.player.atk - actor.def);
                    const kbForce = this.assets['sword']?.knockback_force || this.player.knockback_force || 400;
                    this.physics.applyImpulse(actor.id, this.player.facing.x * kbForce, this.player.facing.y * kbForce); 
                    if (actor.health <= 0) {
                        this.actors.splice(i, 1); this.scoreValue += actor.xpReward; this.player.xp += actor.xpReward;
                        if (this.player.xp >= this.player.maxXp) {
                            this.player.level++; this.player.xp -= this.player.maxXp; this.player.maxXp = Math.floor(100 * Math.pow(1.5, this.player.level));
                            this.player.atk += this.player.levelUpAtk || 0; this.player.def += this.player.levelUpDef || 0;
                            this.player.maxHealth += this.player.levelUpHp || 0; this.player.health = this.player.maxHealth;
                        }
                        this.notifyPlayerChange();
                    }
                }
                if (actor.type === 'enemy' && this.checkCollision(actor, this.player)) {
                    if (!this.player.iFrames || this.player.iFrames <= 0) {
                         this.player.health -= Math.max(1, actor.atk - Math.floor(this.player.def / 2)); this.player.iFrames = 1.0;
                         this.notifyPlayerChange();
                         const len = Math.sqrt(Math.pow(this.player.x - actor.x, 2) + Math.pow(this.player.y - actor.y, 2)) || 1;
                         const eKbForce = actor.knockback_force || 500;
                         this.physics.applyImpulse(this.player.id, ((this.player.x - actor.x)/len) * eKbForce, ((this.player.y - actor.y)/len) * eKbForce); 
                         if (this.player.health <= 0) this.stateStatus = 'GAMEOVER';
                    }
                }
            }
        }

        const currentTile = this.tiles.find(t => t.x === Math.floor((this.player.x + this.player.width/2) / this.tileSize) && t.y === Math.floor((this.player.y + this.player.height/2) / this.tileSize));
        const currentTileId = currentTile ? (currentTile.terrain_type || currentTile.object_type) : null;
        const speedMult = currentTileId ? (this.assets[currentTileId]?.speed_mult || 1.0) : 1.0;
        const currentSpeed = this.player.speed * speedMult;
        
        // Calculate the actual pull distance of the joystick
        const inputMag = Math.sqrt(inp.x * inp.x + inp.y * inp.y);
        
        // Only update the facing direction if the joystick is pushed past a 10% deadzone.
        // This prevents stick-drift or a {0,0} release state from resetting your rotation!
        if (inputMag > 0.1) {
            // Save the normalized analog vector for smooth 360-degree rotation
            this.player.facing = { 
                x: inp.x / inputMag, 
                y: inp.y / inputMag 
            };
        }
        
        this.physics.applyImpulse(this.player.id, inp.x * currentSpeed, inp.y * currentSpeed);
        
        this.actors.forEach(actor => {
             const body = this.physics.bodies.Values.find(b => b[0] === actor.id);
             if (!body) return;
             body[1] = actor.x; body[2] = actor.y; body[3] = actor.width; body[4] = actor.height;
             if (actor.type !== 'player') {
                 this.physics.applyImpulse(actor.id, actor.pendingVx || 0, actor.pendingVy || 0);
             }
        });

        this.physics.setBounds({ x: 0, y: 0, w: levelWidth, h: levelHeight });
        this.physics.step(dt, colliders);

        this.actors.forEach(actor => {
             const body = this.physics.bodies.Values.find(b => b[0] === actor.id);
             if (!body) return;
             actor.x = Math.max(0, Math.min(body[1], levelWidth - actor.width));
             actor.y = Math.max(0, Math.min(body[2], levelHeight - actor.height));
        });

        // Check for Portals
        const px = Math.floor((this.player.x + this.player.width/2) / this.tileSize);
        const py = Math.floor((this.player.y + this.player.height/2) / this.tileSize);
        const portals = this.mfdb["data/portal.bejson"]?.Values || [];
        const triggeredPortal = portals.find(p => p[1] === this.level.id && p[2] === px && p[3] === py);
        if (triggeredPortal) {
            this.loadLevel(triggeredPortal[4], triggeredPortal[5] * this.tileSize, triggeredPortal[6] * this.tileSize);
            return; // abort rest of frame
        }

        if (this.sword) {
            this.sword.life -= dt;
            // Calculate progress from 0.0 (start) to 1.0 (end)
            const progress = 1 - (Math.max(0, this.sword.life) / this.sword.maxLife);
            
            // Start at -90 deg (270° / left hand)
            const startAngle = this.sword.facingAngle - (Math.PI / 2);
            // Sweep 150 degrees (90 deg to center + 60 deg follow-through)
            const totalSweep = Math.PI * (150 / 180);
            const sweepAngle = startAngle + (progress * totalSweep);
            
            // Move the physical collision box along the arc
            const reach = 28; 
            this.sword.x = this.player.x + (this.player.width / 2) + Math.cos(sweepAngle) * reach - (this.sword.width / 2);
            this.sword.y = this.player.y + (this.player.height / 2) + Math.sin(sweepAngle) * reach - (this.sword.height / 2);
            
            if (this.sword.life <= 0) this.sword = null;
        }
        if (this.player.iFrames > 0) this.player.iFrames -= dt;
        
        if (this.level.victory_condition === 'eliminate_all' && !this.actors.some(a => a.type === 'enemy' || a.type === 'enemy_boss')) {
            this.stateStatus = 'VICTORY';
        } else if (this.level.victory_condition === 'eliminate_boss' && !this.actors.some(a => this.actorStats[a.type]?.is_victory_target)) {
            this.stateStatus = 'VICTORY';
        }
        
        this.camera.x = Math.max(0, Math.min(this.player.x - this.camera.width / 2 + this.player.width / 2, levelWidth - this.camera.width));
        this.camera.y = Math.max(0, Math.min(this.player.y - this.camera.height / 2 + this.player.height / 2, levelHeight - this.camera.height));
        
        this.renderer.camera = { x: this.camera.x, y: this.camera.y, zoom: 1 };
    }

    draw() {
        this.renderer.clear('#0f172a');
        
        if (this.state === 'TITLE' || !this.player || !this.level) return;

        const scale = this.renderer.canvas.width / (this.camera.width * this.renderer.dpr);
        this.renderer.camera.zoom = scale;
        this.renderer.resize();

        // Draw chunks using Renderer
        this.renderer.drawChunkedLayer(this.engine.chunkManager, this.loadedImages, this.tileSize, this.assets);
        
        const ctx = this.renderer.ctx;

        // Draw portals
        const portals = this.mfdb["data/portal.bejson"]?.Values || [];
        portals.forEach(p => {
           if (p[1] === this.level.id) {
               const px = p[2] * this.tileSize + this.tileSize / 2 - this.camera.x;
               const py = p[3] * this.tileSize + this.tileSize / 2 - this.camera.y;
               ctx.fillStyle = `rgba(168, 85, 247, ${0.5 + 0.5 * Math.sin(performance.now() / 200)})`;
               ctx.beginPath(); ctx.arc(px, py, this.tileSize / 3, 0, Math.PI * 2); ctx.fill();
           }
        });
        
        // Draw actors
        // Draw actors with safe 4-way rotation
        this.actors.forEach(actor => {
            if (actor.type === 'player' && this.player.iFrames > 0 && Math.floor(this.player.iFrames * 10) % 2 === 0) return;
            const ax = actor.x - this.camera.x;
            const ay = actor.y - this.camera.y;
            
            ctx.save();
            const cx = ax + actor.width / 2;
            const cy = ay + actor.height / 2;

            // Default to the actor's normal type (e.g. 'player', 'enemy')
            let spriteId = actor.type; 

            // If the player is walking UP, switch the graphic
            if (actor.type === 'player' && actor.facing && actor.facing.y < 0) {
                spriteId = 'player_back';
            }
            
            // Mirror left
            if (actor.facing && actor.facing.x < 0) {
                ctx.translate(cx, cy);
                ctx.scale(-1, 1);
                ctx.translate(-cx, -cy);
            }

            if (this.loadedImages[spriteId] && this.loadedImages[spriteId].complete && this.loadedImages[spriteId].naturalWidth > 0) {
                ctx.drawImage(this.loadedImages[spriteId], ax, ay, actor.width, actor.height);
            } else { 
                ctx.fillStyle = actor.color; 
                if (actor.type === 'player') { 
                    ctx.beginPath(); ctx.arc(cx, cy, actor.width/2, 0, Math.PI*2); ctx.fill(); 
                } else {
                    ctx.fillRect(ax, ay, actor.width, actor.height); 
                }
            }
            ctx.restore();
            
            // Draw health bars AFTER restore so they don't spin sideways
            if (actor.type === 'enemy' && actor.health < actor.maxHealth) { 
                ctx.fillStyle = 'red'; ctx.fillRect(ax, ay - 6, actor.width, 4); 
                ctx.fillStyle = 'green'; ctx.fillRect(ax, ay - 6, actor.width * (actor.health / Math.max(1, actor.maxHealth)), 4); 
            }
        });
        
        // Draw dynamically animated sword sweep
        if (this.sword) {
            const progress = 1 - (Math.max(0, this.sword.life) / this.sword.maxLife);
            
            const startAngle = this.sword.facingAngle - (Math.PI / 2); // 270 degrees
            const totalSweep = Math.PI * (150 / 180);
            const currentSweep = startAngle + (progress * totalSweep);
            
            const pcx = (this.player.x - this.camera.x) + (this.player.width / 2);
            const pcy = (this.player.y - this.camera.y) + (this.player.height / 2);
            const reach = 32;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(pcx, pcy);
            
            // Draw an arc from the starting left-hand position to the current frame's position
            ctx.arc(pcx, pcy, reach, startAngle, currentSweep);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - progress)})`;
            ctx.fill();

            // Add a sharp, bright leading edge to the "woosh"
            ctx.beginPath();
            ctx.arc(pcx, pcy, reach, startAngle, currentSweep);
            ctx.strokeStyle = `rgba(200, 230, 255, ${1 - progress})`;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();
        }
    }
}

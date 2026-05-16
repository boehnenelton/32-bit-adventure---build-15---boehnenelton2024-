export const ENGINE_VERSION = "1.6.7";

export class GameEngine {
  canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; mfdb: Record<string, any>;
  assets: Record<string, any> = {}; sprites: Record<string, any> = {}; loadedImages: Record<string, HTMLImageElement> = {};
  actors: any[] = []; tiles: any[] = []; level: any = null; keys: Record<string, boolean> = {};
  lastTime: number = 0; player: any = null; sword: any = null; tileSize: number = 32;
  camera = { x: 0, y: 0, width: 480, height: 480 };
  screenHeight: number = 480; // Top playable area
  private _score = 0; private _state = 'TITLE'; private _dialogText: string | null = null; animationFrameId = 0; intervalId: any = 0;
  listeners: Record<string, Function[]> = {};
  activeChunks: Set<string> = new Set(); loadingChunks: Set<string> = new Set();
  actorStats: Record<string, any> = {};

  get score() { return this._score; }
  set score(v) { this._score = v; this.emit('onScoreUpdate', v); this.emit('UIUpdate'); }
  get state() { return this._state; }
  set state(v) { this._state = v; this.emit('onStateChange', v); this.emit('UIUpdate'); }
  get dialogText() { return this._dialogText; }
  set dialogText(v) { this._dialogText = v; this.emit('UIUpdate'); }

  on(event: string, cb: Function) { if (!this.listeners[event]) this.listeners[event] = []; this.listeners[event].push(cb); }
  emit(event: string, data?: any) { if (this.listeners[event]) this.listeners[event].forEach(cb => cb(data)); }
  notifyPlayerChange() { this.emit('onHealthChange', this.player?.health); this.emit('UIUpdate'); }

  constructor(canvas: HTMLCanvasElement, mfdb: Record<string, any>) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d')!; this.mfdb = mfdb;
    
    this.init();
    this.onKeyDown = this.onKeyDown.bind(this); this.onKeyUp = this.onKeyUp.bind(this);
    this.loop = this.loop.bind(this); this.updateLoop = this.updateLoop.bind(this); this.handleCanvasPointer = this.handleCanvasPointer.bind(this);
    window.addEventListener('keydown', this.onKeyDown); window.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('pointerdown', this.handleCanvasPointer);
    this.lastTime = performance.now(); 
    this.intervalId = setInterval(this.updateLoop, 1000 / 60);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  
  handleCanvasPointer(e: PointerEvent) {
    if (this.state === 'TITLE') this.state = 'PLAYING';
    else if (this.state === 'GAMEOVER' || this.state === 'VICTORY') { this.init(); this.state = 'PLAYING'; }
  }
  
  init() {
    this.assets = {}; this.sprites = {}; this.loadedImages = {}; this.actors = []; this.tiles = [];
    this.player = null; this.sword = null; this.score = 0;

    // Establish strict dependency graph from MFDB manifest
    const manifest = this.mfdb["104a.mfdb.bejson"];
    if (!manifest) {
       console.warn("Manifest '104a.mfdb.bejson' not found in provided MFDB context. Engine initialization aborted.");
       return;
    }
    const fileOrder = manifest?.Values?.slice().sort((a: any, b: any) => a[2] - b[2]) || [];
    const loadedFiles = new Set<string>();

    for (const record of fileOrder) {
      const [entity, path, order] = record;
      if (!this.mfdb[path]) continue;
      
      // Strict dependency validation: Ensure order 0 (Static Config registries) are loaded before any world instantiation (order >= 2)
      if (order >= 2 && (!loadedFiles.has("data/object_rules.bejson") || !loadedFiles.has("data/actor_stats.bejson") || !loadedFiles.has("data/events.bejson"))) {
         console.error("Inclusion Error: Cannot instantiate world before static configuration registries (physics rules, base stats, events) are strictly validated as loaded.");
         return;
      }
      loadedFiles.add(path);
    }
    
    if (!loadedFiles.has("data/object_rules.bejson") || !loadedFiles.has("data/actor_stats.bejson") || !loadedFiles.has("data/events.bejson")) return;

    const objectRulesDb = this.mfdb["data/object_rules.bejson"].Values;
    objectRulesDb.forEach((a: any) => { this.assets[a[0]] = { asset_id: a[0], is_solid: a[1], interactable: a[2], damage: a[3], description: a[4], fallback_color: a[5], speed_mult: a[6], knockback_force: a[7], hitbox_width: a[8], hitbox_height: a[9], lifespan: a[10] }; });
    Object.keys(this.mfdb).forEach(filename => {
      if (filename.startsWith("assets/") && filename.endsWith(".bejson")) {
        const fileContent = this.mfdb[filename];
        if (fileContent.Records_Type && fileContent.Records_Type[0]?.startsWith("Asset") && fileContent.Values && fileContent.Values.length > 0) {
          const spriteId = fileContent.Asset_Id || filename.split('/').pop()?.split('.')[0];
          const dataUri = fileContent.Values[0][0];
          if (spriteId && dataUri) {
            this.sprites[spriteId] = dataUri; const img = new Image(); img.src = dataUri; this.loadedImages[spriteId] = img;
          }
        }
      }
    });
    
    const actorStatsDb = this.mfdb["data/actor_stats.bejson"]?.Values || [];
    const actorStats: Record<string, any> = {};
    actorStatsDb.forEach((s: any) => { actorStats[s[0]] = { actor_type: s[0], max_health: s[1], atk: s[2], def: s[3], speed: s[4], xp_reward: s[5], fallback_color: s[6], start_potions: s[7] || 0, level_up_hp: s[8] || 0, level_up_atk: s[9] || 0, level_up_def: s[10] || 0, knockback_force: s[11] || 0, potion_heal_amount: s[12] || 0, is_victory_target: s[13] || false }; });
    this.actorStats = actorStats;

    const levelDb = this.mfdb["data/level.bejson"]?.Values || [];
    if (levelDb.length > 0) this.loadLevel(levelDb[0][0]); else return;
  }

  loadLevel(levelId: string, spawnX?: number, spawnY?: number) {
    const levelDb = this.mfdb["data/level.bejson"]?.Values || [];
    const levelRow = levelDb.find((l: any) => l[0] === levelId);
    if (!levelRow) return;
    this.level = { id: levelRow[0], width: levelRow[1], height: levelRow[2], biome: levelRow[3], victory_condition: levelRow[4] || 'none' };
    this.activeChunks.clear(); this.loadingChunks.clear(); this.tiles = [];
    
    const actorData = this.mfdb["data/actor.bejson"];
    const actorDb = actorData?.Values || [];
    const actorFields = actorData?.Fields || [];
    const nameIdx = actorFields.findIndex((f: any) => f.name === "name");
    
    const oldPlayer = this.player;
    this.actors = []; this.player = null;

    actorDb.forEach((a: any) => {
      // Only load actors for this level, or the player
      if (a[2] !== 'player' && a[1] !== this.level.id) return;
      
      if (a[2] === 'player' && oldPlayer) {
          // Keep existing player state
          this.player = oldPlayer;
          if (spawnX !== undefined && spawnY !== undefined) {
              this.player.x = spawnX; this.player.y = spawnY;
          }
          this.actors.push(this.player);
          return;
      }

      const statsConfig = this.actorStats[a[2]] || { max_health: 50, atk: 5, def: 2, speed: 50, xp_reward: 10, start_potions: 0 };
      const actor = {
        id: a[0], type: a[2], x: a[3] * this.tileSize, y: a[4] * this.tileSize, width: 32, height: 32,
        name: (nameIdx !== -1 && a[nameIdx]) ? a[nameIdx] : (a[2].toUpperCase()),
        health: a[5] || statsConfig.max_health, maxHealth: statsConfig.max_health, speed: statsConfig.speed,
        color: statsConfig.fallback_color || '#ffffff', vx: 0, vy: 0, facing: { x: 1, y: 0 },
        atk: a[6] || statsConfig.atk, def: a[7] || statsConfig.def, level: a[2] === 'player' ? 1 : (Math.floor(Math.random() * 2) + 1), xp: 0, maxXp: 100,
        potions: statsConfig.start_potions || 0, xpReward: statsConfig.xp_reward, levelUpHp: statsConfig.level_up_hp,
        levelUpAtk: statsConfig.level_up_atk, levelUpDef: statsConfig.level_up_def, knockback_force: statsConfig.knockback_force, potion_heal_amount: statsConfig.potion_heal_amount,
        equipment: { weapon: null as any, armor: null as any }
      };
      if (a[2] === 'player') {
          this.player = actor;
          
          // Starting gear for player
          const itemsDb = this.mfdb["data/items.bejson"]?.Values || [];
          const rustySword = itemsDb.find((i: any) => i[0] === 'wep_rusty');
          const clothTunic = itemsDb.find((i: any) => i[0] === 'arm_cloth');
          
          if (rustySword) {
              this.player.equipment.weapon = { item_id: rustySword[0], name: rustySword[1], type: rustySword[2], attack_bonus: rustySword[7], defense_bonus: rustySword[8] };
          }
          if (clothTunic) {
              this.player.equipment.armor = { item_id: clothTunic[0], name: clothTunic[1], type: clothTunic[2], attack_bonus: clothTunic[7], defense_bonus: clothTunic[8] };
          }

          if (spawnX !== undefined && spawnY !== undefined) {
              this.player.x = spawnX; this.player.y = spawnY;
          }
      }
      this.actors.push(actor);
    });
  }
  
  destroy() {
    window.removeEventListener('keydown', this.onKeyDown); window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('pointerdown', this.handleCanvasPointer); 
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }
  
  serialize() { return JSON.stringify({ score: this.score, player: this.player, actors: this.actors, level: this.level }); }
  deserialize(data: string) {
    try {
      const parsed = JSON.parse(data); this.score = parsed.score; this.actors = parsed.actors;
      const playerRef = this.actors.find((a: any) => a.type === 'player');
      if (playerRef) this.player = playerRef; else { this.player = parsed.player; if (this.player) this.actors.push(this.player); }
      this.level = parsed.level; this.state = 'PLAYING';
    } catch (e) {}
  }

  handleInput(code: string, isDown: boolean) {
    this.keys[code] = isDown;
    if (isDown) {
      if (this.state === 'TITLE') { if (code === 'Space' || code === 'KeyA') this.state = 'PLAYING'; return; }
      if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
        if (code === 'Space' || code === 'KeyA') { this.init(); this.state = 'PLAYING'; } return;
      }
      if (this.state === 'PLAYING' && (code === 'Escape' || code === 'Enter' || code === 'Start')) { this.state = 'MENU'; return; }
      else if (this.state === 'MENU' && (code === 'Escape' || code === 'Enter' || code === 'Start' || code === 'KeyB')) { this.state = 'PLAYING'; return; }
      if (this.state === 'PLAYING' && (code === 'Select' || code === 'ShiftRight' || code === 'ShiftLeft')) { this.state = 'ITEM_MENU'; return; }
      else if (this.state === 'ITEM_MENU' && (code === 'Select' || code === 'ShiftRight' || code === 'ShiftLeft' || code === 'KeyB')) { this.state = 'PLAYING'; return; }
      if (this.state === 'MENU' || this.state === 'ITEM_MENU') return;
      if (this.state === 'DIALOG') { if (code === 'Space' || code === 'KeyA') { this.state = 'PLAYING'; this.dialogText = null; } return; }

      if ((code === 'Space' || code === 'KeyA') && !this.sword && this.player) {
        const npc = this.actors.find(a => {
           if (a.type !== 'npc') return false;
           const dist = Math.sqrt(Math.pow((a.x + a.width/2) - (this.player.x + this.player.width/2), 2) + Math.pow((a.y + a.height/2) - (this.player.y + this.player.height/2), 2));
           return dist < 60;
        });
        if (npc) { this.runEvent(npc.id + "_talk"); } else this.attack();
      }
      if ((code === 'KeyC' || code === 'KeyR') && this.state === 'PLAYING') {
         if (this.player && this.player.potions > 0 && this.player.health < this.player.maxHealth) {
            this.player.potions--; this.player.health = Math.min(this.player.maxHealth, this.player.health + (this.player.potion_heal_amount ?? 50));
            this.notifyPlayerChange();
         }
      }
    }
  }

  onKeyDown(e: KeyboardEvent) { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); this.handleInput(e.code, true); }
  onKeyUp(e: KeyboardEvent) { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); this.handleInput(e.code, false); }
  
  runEvent(eventId: string) {
      const eventsDb = this.mfdb["data/events.bejson"]?.Values || [];
      const ev = eventsDb.find((e: any) => e[0] === eventId);
      if (ev && ev[4]) {
          ev[4].forEach((cmd: any) => {
             if (cmd[0] === "SET_DIALOG") {
                 this.state = 'DIALOG';
                 this.dialogText = cmd[1];
             }
          });
      }
  }

  calculateDamage(attacker: any, defender: any, weapon?: any, armor?: any) {
    const baseAtk = attacker.atk || 1;           
    const weaponBonus = weapon ? weapon.attack_bonus || 0 : 0;
    const totalAtk = baseAtk + weaponBonus;

    const baseDef = defender.def || 0;           
    const armorBonus = armor ? armor.defense_bonus || 0 : 0;
    const totalDef = baseDef + armorBonus;

    // Core formula: Attack vs Defense with 60% armor mitigation
    let damage = Math.max(1, Math.floor(totalAtk - (totalDef * 0.6)));

    // Critical hit chance (10% crit for 1.75x damage)
    if (Math.random() < 0.1) {  
      damage = Math.floor(damage * 1.75);
    }

    // Level advantage bonus
    const levelDiff = (attacker.level || 1) - (defender.level || 1);
    if (levelDiff > 0) {
        damage += Math.floor(levelDiff * 1.5);
    }

    return Math.max(1, damage); 
  }

  attack() {
    this.sword = {
      x: this.player.x + this.player.facing.x * 24, y: this.player.y + this.player.facing.y * 24,
      width: this.assets['sword']?.hitbox_width || 24, height: this.assets['sword']?.hitbox_height || 24, damage: (this.assets['sword'] || {damage: 10}).damage, life: this.assets['sword']?.lifespan || 0.2
    };
  }
  
  updateChunksAsync() {
    if (!this.player) return;
    const CHUNK_PIXELS = 10 * this.tileSize;
    const cx = Math.floor(this.player.x / CHUNK_PIXELS);
    const cy = Math.floor(this.player.y / CHUNK_PIXELS);

    const neededChunks = new Set<string>();
    for (let i = -1; i <= 1; i++) {
       for(let j = -1; j <= 1; j++) {
          const nx = cx + i; const ny = cy + j;
          if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) neededChunks.add(`${nx}_${ny}`);
       }
    }

    neededChunks.forEach(chunkKey => {
      if (!this.activeChunks.has(chunkKey) && !this.loadingChunks.has(chunkKey)) {
        this.loadingChunks.add(chunkKey);
        Promise.resolve().then(() => {
           const [xStr, yStr] = chunkKey.split('_');
           const file1 = this.mfdb[`data/${this.level.id}_tile_chunk_${xStr}_${yStr}.bejson`];
           const file2 = this.mfdb[`data/tile_chunk_${xStr}_${yStr}.bejson`];
           const file = file1 || file2;
           if (file) {
             const newTiles = file.Values.map((t: any) => ({ tile_id: t[0], level_id: t[1], x: t[2], y: t[3], terrain_type: t[4], object_type: t[5], chunkKey }));
             this.tiles.push(...newTiles);
           }
           this.activeChunks.add(chunkKey);
           this.loadingChunks.delete(chunkKey);
        });
      }
    });

    const toUnload = [...this.activeChunks].filter(c => !neededChunks.has(c));
    toUnload.forEach(chunkKey => {
      this.activeChunks.delete(chunkKey);
      this.tiles = this.tiles.filter(t => t.chunkKey !== chunkKey);
    });
  }

  update(dt: number) {
    if (this.state !== 'PLAYING' || !this.player || !this.level) return;
    this.updateChunksAsync();
    const levelWidth = this.level.width * this.tileSize; const levelHeight = this.level.height * this.tileSize;
    
    const checkTileCollision = (actor: any, vx: number, vy: number) => {
      const newX = actor.x + vx * dt; 
      const newY = actor.y + vy * dt;
      
      // Hitbox margin for better corner sliding
      const margin = 6; 

      for (const tile of this.tiles) {
        const rules = this.assets[tile.terrain_type || tile.object_type];
        
        if (rules && rules.is_solid) {
          const actorLeft = newX + margin;
          const actorRight = newX + actor.width - margin;
          const actorTop = newY + margin;
          const actorBottom = newY + actor.height - margin;

          const tileLeft = tile.x * this.tileSize;
          const tileRight = tileLeft + this.tileSize;
          const tileTop = tile.y * this.tileSize;
          const tileBottom = tileTop + this.tileSize;

          if (actorLeft < tileRight && 
              actorRight > tileLeft && 
              actorTop < tileBottom && 
              actorBottom > tileTop) {
            return true;
          }
        }
      }
      return false;
    };

    
    // 1. Gather all intended movement and calculate combat (Input velocity + Knockback)
    for (let i = this.actors.length - 1; i >= 0; i--) {
      const actor = this.actors[i];
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
          
          const damage = this.calculateDamage(this.player, actor, this.player.equipment.weapon, actor.equipment?.armor);
          actor.health -= damage;
          
          const kbForce = this.assets['sword']?.knockback_force || this.player.knockback_force || 400;
          actor.pendingVx += this.player.facing.x * kbForce; 
          actor.pendingVy += this.player.facing.y * kbForce;
          if (actor.health <= 0) {
            this.actors.splice(i, 1); this.score += actor.xpReward; this.player.xp += actor.xpReward;
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
             const damage = this.calculateDamage(actor, this.player, actor.equipment?.weapon, this.player.equipment.armor);
             this.player.health -= damage;
             this.player.iFrames = 1.0;
             this.notifyPlayerChange();
             const len = Math.sqrt(Math.pow(this.player.x - actor.x, 2) + Math.pow(this.player.y - actor.y, 2)) || 1;
             const eKbForce = actor.knockback_force || 500;
             this.player.pendingVx = (this.player.pendingVx || 0) + ((this.player.x - actor.x)/len) * eKbForce; 
             this.player.pendingVy = (this.player.pendingVy || 0) + ((this.player.y - actor.y)/len) * eKbForce;
             if (this.player.health <= 0) this.state = 'GAMEOVER';
          }
        }
      }
    }

    // 2. Process independent axis movement to fix Wall-Sliding (checkTileCollision on vectors)
    let speedMult = 1;
    const currentTile = this.tiles.find(t => t.x === Math.floor((this.player.x + this.player.width/2) / this.tileSize) && t.y === Math.floor((this.player.y + this.player.height/2) / this.tileSize));
    const currentTileId = currentTile ? (currentTile.terrain_type || currentTile.object_type) : null;
    speedMult = currentTileId ? (this.assets[currentTileId]?.speed_mult || 1.0) : 1.0;
    const currentSpeed = this.player.speed * speedMult;
    
    let inpX = 0, inpY = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) inpY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inpY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inpX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inpX += 1;
    
    // Normalize input
    if (inpX !== 0 && inpY !== 0) { 
        const length = Math.sqrt(inpX * inpX + inpY * inpY); 
        inpX /= length;
        inpY /= length;
    }

    // Apply impulse (continuous velocity override for input, summed with pending knockback)
    const impulseVx = inpX * currentSpeed;
    const impulseVy = inpY * currentSpeed;
    
    if (inpX !== 0 || inpY !== 0) this.player.facing = { x: inpX === 0 ? 0 : Math.sign(inpX), y: inpY === 0 ? 0 : Math.sign(inpY) };

    const totalVx = impulseVx + (this.player.pendingVx || 0);
    const totalVy = impulseVy + (this.player.pendingVy || 0);
    
    // Independent axis movement
    let canMoveX = !checkTileCollision(this.player, totalVx, 0);
    let canMoveY = !checkTileCollision(this.player, 0, totalVy);

    this.player.vx = canMoveX ? totalVx : 0;
    this.player.vy = canMoveY ? totalVy : 0;
    
    // Dampen pending knockback internally to simulate SwitchPhysics friction
    this.player.pendingVx = (this.player.pendingVx || 0) * 0.9;
    this.player.pendingVy = (this.player.pendingVy || 0) * 0.9;
    if (Math.abs(this.player.pendingVx) < 1) this.player.pendingVx = 0;
    if (Math.abs(this.player.pendingVy) < 1) this.player.pendingVy = 0;
    
    this.player.x = Math.max(0, Math.min(this.player.x + this.player.vx * dt, levelWidth - this.player.width));
    this.player.y = Math.max(0, Math.min(this.player.y + this.player.vy * dt, levelHeight - this.player.height));
    
    // Check for Portals
    const px = Math.floor((this.player.x + this.player.width/2) / this.tileSize);
    const py = Math.floor((this.player.y + this.player.height/2) / this.tileSize);
    const portals = this.mfdb["data/portal.bejson"]?.Values || [];
    const triggeredPortal = portals.find((p: any) => p[1] === this.level.id && p[2] === px && p[3] === py);
    if (triggeredPortal) {
        this.loadLevel(triggeredPortal[4], triggeredPortal[5] * this.tileSize, triggeredPortal[6] * this.tileSize);
        return; // level changed, abort rest of update
    }

    if (this.sword) {
      this.sword.life -= dt;
      this.sword.x = this.player.x + this.player.facing.x * 24; this.sword.y = this.player.y + this.player.facing.y * 24;
      if (this.sword.life <= 0) this.sword = null;
    }
    if (this.player.iFrames > 0) this.player.iFrames -= dt;
    
    // 3. Apply the resulting safe combat velocity to the Enemy coordinates
    for (let i = this.actors.length - 1; i >= 0; i--) {
      const actor = this.actors[i];
      if (actor.type === 'enemy' || actor.type === 'chest') {
        actor.vx = checkTileCollision(actor, actor.pendingVx, 0) ? 0 : actor.pendingVx;
        actor.vy = checkTileCollision(actor, 0, actor.pendingVy) ? 0 : actor.pendingVy;
        actor.x = Math.max(0, Math.min(actor.x + actor.vx * dt, levelWidth - actor.width));
        actor.y = Math.max(0, Math.min(actor.y + actor.vy * dt, levelHeight - actor.height));
      }
    }
    
    if (this.level && this.level.victory_condition !== 'none' && this.actors.length > 0) {
      if (this.level.victory_condition === 'eliminate_all' && !this.actors.some(a => a.type === 'enemy' || a.type === 'enemy_boss')) {
          this.state = 'VICTORY';
      } else if (this.level.victory_condition === 'eliminate_boss' && !this.actors.some(a => this.actorStats[a.type]?.is_victory_target)) {
          this.state = 'VICTORY';
      }
    }

    this.camera.x = Math.max(0, Math.min(this.player.x - this.camera.width / 2 + this.player.width / 2, levelWidth - this.camera.width));
    this.camera.y = Math.max(0, Math.min(this.player.y - this.camera.height / 2 + this.player.height / 2, levelHeight - this.camera.height));
  }
  
  checkCollision(a: any, b: any) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
  
  draw() {
    this.screenHeight = this.canvas.height * 0.6; // Dedicate top 60% as the actual screen
    
    // Fill full background (bottom pad area)
    this.ctx.fillStyle = '#1e293b'; 
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw "Screen" background
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.screenHeight);
    
    if (this.state === 'TITLE' || !this.player || !this.level) return;

    this.ctx.save();
    // Clip drawing region to the top screen only
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.screenHeight);
    this.ctx.clip();

    this.ctx.imageSmoothingEnabled = false; 

    // Adjust camera logic for portrait split
    this.camera.width = 480; 
    this.camera.height = 480;

    const scale = this.canvas.width / this.camera.width; 
    this.ctx.scale(scale, scale); 
    this.ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    this.tiles.forEach(tile => {
      const tx = tile.x * this.tileSize; const ty = tile.y * this.tileSize; const spriteId = tile.terrain_type || tile.object_type;
      if (spriteId) {
        if (this.loadedImages[spriteId] && this.loadedImages[spriteId].complete && this.loadedImages[spriteId].naturalWidth > 0) {
           this.ctx.drawImage(this.loadedImages[spriteId], tx, ty, this.tileSize, this.tileSize);
        } else { 
           this.ctx.fillStyle = this.assets[spriteId]?.fallback_color || '#000000'; 
           this.ctx.fillRect(tx, ty, this.tileSize, this.tileSize); 
        }
      }
    });

    const portals = this.mfdb["data/portal.bejson"]?.Values || [];
    portals.forEach((p: any) => {
       if (p[1] === this.level.id) {
           const px = p[2] * this.tileSize + this.tileSize / 2;
           const py = p[3] * this.tileSize + this.tileSize / 2;
           this.ctx.fillStyle = `rgba(168, 85, 247, ${0.5 + 0.5 * Math.sin(performance.now() / 200)})`;
           this.ctx.beginPath(); this.ctx.arc(px, py, this.tileSize / 3, 0, Math.PI * 2); this.ctx.fill();
       }
    });

    this.actors.forEach(actor => {
      if (actor.type === 'player' && this.player.iFrames > 0 && Math.floor(this.player.iFrames * 10) % 2 === 0) return;
      
      const drawX = Math.round(actor.x);
      const drawY = Math.round(actor.y);

      if (this.loadedImages[actor.type] && this.loadedImages[actor.type].complete && this.loadedImages[actor.type].naturalWidth > 0) {
        this.ctx.drawImage(this.loadedImages[actor.type], drawX, drawY, actor.width, actor.height);
      } else { 
        this.ctx.fillStyle = actor.color; 
        if (actor.type === 'player') { 
          this.ctx.beginPath(); 
          this.ctx.arc(drawX + actor.width/2, drawY + actor.height/2, actor.width/2, 0, Math.PI*2); 
          this.ctx.fill(); 
        } else {
          this.ctx.fillRect(drawX, drawY, actor.width, actor.height); 
        }
      }
      
      if (actor.type === 'enemy' && actor.health < actor.maxHealth) { 
        this.ctx.fillStyle = 'red'; 
        this.ctx.fillRect(drawX, drawY - 6, actor.width, 4); 
        this.ctx.fillStyle = 'green'; 
        this.ctx.fillRect(drawX, drawY - 6, actor.width * (actor.health / Math.max(1, actor.maxHealth)), 4); 
      }
    });

    if (this.sword) {
      const sx = Math.round(this.sword.x);
      const sy = Math.round(this.sword.y);
      if (this.loadedImages['sword'] && this.loadedImages['sword'].complete && this.loadedImages['sword'].naturalWidth > 0) {
        this.ctx.drawImage(this.loadedImages['sword'], sx, sy, this.sword.width, this.sword.height);
      } else { 
        this.ctx.fillStyle = this.assets['sword']?.fallback_color || '#eab308'; 
        this.ctx.fillRect(sx, sy, this.sword.width, this.sword.height); 
      }
    }
    this.ctx.restore();
  }
  
  updateLoop() {
    if (this.state !== 'PLAYING') return;
    this.update(1 / 60);
  }

  loop(time: number) {
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
}

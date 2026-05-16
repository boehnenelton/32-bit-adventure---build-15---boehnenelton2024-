export const generateMFDB = () => {
const encodeSVG = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;
const svgBoundary = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="32" height="32" fill="url(#wall)"/><rect x="2" y="2" width="28" height="12" fill="#4b5563" rx="2" stroke="#1f2937"/><rect x="2" y="18" width="28" height="12" fill="#4b5563" rx="2" stroke="#1f2937"/></svg>`;
const svgPlayer = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><radialGradient id="pSh" cx="50%" cy="80%" r="40%"><stop offset="0%" stop-color="rgba(0,0,0,0.6)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient><linearGradient id="pBd" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#333333"/><stop offset="100%" stop-color="#000000"/></linearGradient></defs><ellipse cx="16" cy="28" rx="12" ry="4" fill="url(#pSh)"/><rect x="8" y="12" width="16" height="16" rx="6" fill="url(#pBd)" stroke="#000000"/><circle cx="16" cy="10" r="8" fill="#fbbf24" stroke="#b45309"/><circle cx="13" cy="9" r="2" fill="#fff"/><circle cx="19" cy="9" r="2" fill="#fff"/><circle cx="13" cy="9" r="1" fill="#000"/><circle cx="19" cy="9" r="1" fill="#000"/><path d="M 5 15 L 14 15 L 14 22 C 14 26 9.5 28 9.5 28 C 9.5 28 5 26 5 22 Z" fill="#111111" stroke="#333333" stroke-width="1"/><polygon points="7,17 12,17 9.5,23" fill="#fbbf24"/></svg>`;
const svgEnemy = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><radialGradient id="eSh" cx="50%" cy="80%" r="40%"><stop offset="0%" stop-color="rgba(0,0,0,0.6)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient><linearGradient id="eBd" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><ellipse cx="16" cy="28" rx="14" ry="4" fill="url(#eSh)"/><path d="M4 28 L8 8 C 8 4, 24 4, 24 8 L28 28 Z" fill="url(#eBd)" stroke="#7f1d1d"/><circle cx="12" cy="14" r="3" fill="#fff"/><circle cx="20" cy="14" r="3" fill="#fff"/><circle cx="12" cy="14" r="1.5" fill="#450a0a"/><circle cx="20" cy="14" r="1.5" fill="#450a0a"/><path d="M 11 10 L 15 12 M 21 10 L 17 12" stroke="#450a0a" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const svgGrass = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#15803d"/><stop offset="100%" stop-color="#14532d"/></linearGradient></defs><rect width="32" height="32" fill="url(#g)"/><path d="M6 24 C8 16, 12 16, 14 24" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><path d="M18 20 C20 12, 24 12, 26 20" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/><path d="M10 12 C12 6, 16 6, 18 12" fill="none" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/></svg>`;
const svgRocky = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="r" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#a8a29e"/><stop offset="100%" stop-color="#44403c"/></linearGradient><radialGradient id="rSh"><stop offset="0%" stop-color="rgba(0,0,0,0.6)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient></defs><ellipse cx="16" cy="27" rx="14" ry="5" fill="url(#rSh)"/><path d="M 5 24 C 2 16, 6 8, 12 5 C 18 2, 26 8, 28 16 C 30 24, 24 28, 16 27 C 10 28, 8 26, 5 24" fill="url(#r)" stroke="#292524"/><path d="M 12 5 L 16 14 L 28 16" fill="none" stroke="#d6d3d1" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/></svg>`;
const svgBush = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#059669"/><stop offset="100%" stop-color="#064e3b"/></linearGradient><radialGradient id="bSh"><stop offset="0%" stop-color="rgba(0,0,0,0.6)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient></defs><ellipse cx="16" cy="27" rx="12" ry="5" fill="url(#bSh)"/><circle cx="16" cy="16" r="11" fill="url(#b)" stroke="#022c22"/><circle cx="10" cy="18" r="6" fill="url(#b)" stroke="#022c22"/><circle cx="22" cy="18" r="6" fill="url(#b)" stroke="#022c22"/><circle cx="13" cy="10" r="5" fill="url(#b)"/><circle cx="19" cy="12" r="5" fill="url(#b)"/><circle cx="11" cy="14" r="1.5" fill="#34d399"/><circle cx="21" cy="15" r="1.5" fill="#34d399"/><circle cx="16" cy="11" r="1.5" fill="#34d399"/></svg>`;
const svgChest = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="cw" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient><linearGradient id="cg" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><ellipse cx="16" cy="27" rx="14" ry="4" fill="rgba(0,0,0,0.6)"/><rect x="3" y="12" width="26" height="15" rx="2" fill="url(#cw)" stroke="#451a03"/><rect x="3" y="12" width="26" height="6" rx="2" fill="url(#cg)" stroke="#78350f"/><rect x="6" y="14" width="20" height="2" fill="#78350f" opacity="0.5"/><rect x="3" y="24" width="26" height="2" fill="url(#cg)"/><rect x="14" y="16" width="4" height="6" rx="1" fill="url(#cg)" stroke="#78350f"/><circle cx="16" cy="19" r="1" fill="#451a03"/></svg>`;
const svgSword = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="bl" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient></defs><path d="M26 6 L28 4 L22 10 L8 24 L6 26 L12 20 Z" fill="url(#bl)" stroke="#475569" stroke-width="0.5"/><path d="M26 6 L28 4 L20 6 L8 20 L6 26 L12 24 Z" fill="#e2e8f0" opacity="0.6"/><circle cx="8" cy="24" r="3" fill="#fbbf24" stroke="#b45309"/><path d="M5 21 L11 27" stroke="#b45309" stroke-width="2" stroke-linecap="round"/><path d="M6 22 L10 26" stroke="#fcd34d" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const svgWoodWall = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ww" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient></defs><rect width="32" height="32" fill="url(#ww)"/><line x1="8" y1="0" x2="8" y2="32" stroke="#451a03" stroke-width="1" opacity="0.5"/><line x1="16" y1="0" x2="16" y2="32" stroke="#451a03" stroke-width="1" opacity="0.5"/><line x1="24" y1="0" x2="24" y2="32" stroke="#451a03" stroke-width="1" opacity="0.5"/><line x1="0" y1="16" x2="32" y2="16" stroke="#451a03" stroke-width="1.5" opacity="0.8"/></svg>`;
const svgRoof = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="rf" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#991b1b"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient></defs><rect width="32" height="32" fill="url(#rf)"/><path d="M0,8 L32,8 M0,16 L32,16 M0,24 L32,24" stroke="#450a0a" stroke-width="1" opacity="0.6"/><path d="M8,0 L8,8 M24,0 L24,8 M16,8 L16,16 M8,16 L8,24 M24,16 L24,24 M16,24 L16,32" stroke="#450a0a" stroke-width="1" opacity="0.6"/></svg>`;
const svgAppleTree = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><radialGradient id="at" cx="50%" cy="40%" r="50%"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#14532d"/></radialGradient></defs><rect x="14" y="20" width="4" height="12" fill="#78350f"/><circle cx="16" cy="12" r="11" fill="url(#at)"/><circle cx="12" cy="10" r="2" fill="#ef4444"/><circle cx="20" cy="14" r="2" fill="#ef4444"/><circle cx="16" cy="6" r="2" fill="#ef4444"/></svg>`;
const svgStonePath = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="#78716c"/><path d="M2,2 L14,2 L14,14 L2,14 Z M16,4 L30,4 L30,12 L16,12 Z M4,16 L14,16 L14,30 L4,30 Z M16,14 L28,14 L28,28 L16,28 Z" fill="#a8a29e" stroke="#57534e" stroke-width="1" rx="2"/></svg>`;
const svgCaveWall = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="cw" x1="0" y1="0" x2="0" y2="32"><stop offset="0%" stop-color="#292524"/><stop offset="100%" stop-color="#0c0a09"/></linearGradient></defs><rect width="32" height="32" fill="url(#cw)"/><path d="M4 4 L28 4 L28 12 L4 12 Z M2 16 L30 16 L30 28 L2 28 Z" fill="#44403c" opacity="0.4" stroke="#1c1917"/></svg>`;
const svgCaveFloor = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="#44403c"/><path d="M8 8 L12 8 L12 12 L8 12 Z M20 20 L24 20 L24 24 L20 24 Z" fill="#292524" opacity="0.3"/></svg>`;
const svgPuppy = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><radialGradient id="puppySh" cx="50%" cy="80%" r="40%"><stop offset="0%" stop-color="rgba(0,0,0,0.6)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient></defs><ellipse cx="16" cy="28" rx="10" ry="3" fill="url(#puppySh)"/><rect x="10" y="14" width="12" height="12" rx="4" fill="#d97706"/><circle cx="16" cy="12" r="6" fill="#f59e0b"/><circle cx="14" cy="11" r="1" fill="#000"/><circle cx="18" cy="11" r="1" fill="#000"/><path d="M12 8 Q10 4 8 8" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round"/><path d="M20 8 Q22 4 24 8" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round"/></svg>`;

const mfdb: Record<string, any> = {
  "104a.mfdb.bejson": {
    Format: "BEJSON", Format_Version: "104a", Format_Creator: "Elton Boehnen", MFDB_Version: "1.31", DB_Name: "SwordSlasherDB", Records_Type: ["mfdb"],
    Fields: [ { name: "entity_name", type: "string" }, { name: "file_path", type: "string" }, { name: "load_order", type: "integer" } ],
    Values: [
      ["Events", "data/events.bejson", 0],
      ["ObjectRules", "data/object_rules.bejson", 0], ["ActorStats", "data/actor_stats.bejson", 0], 
      ["AssetBoundary", "assets/boundary.bejson", 1], ["AssetPlayer", "assets/player.bejson", 1],
      ["AssetEnemy", "assets/enemy.bejson", 1], ["AssetGrass", "assets/grass.bejson", 1], ["AssetRocky", "assets/rocky.bejson", 1],
      ["AssetBush", "assets/bush.bejson", 1], ["AssetChest", "assets/chest.bejson", 1], ["AssetSword", "assets/sword.bejson", 1],
      ["AssetWoodWall", "assets/wood_wall.bejson", 1], ["AssetRoof", "assets/roof.bejson", 1], ["AssetAppleTree", "assets/apple_tree.bejson", 1], ["AssetStonePath", "assets/stone_path.bejson", 1],
      ["AssetCaveWall", "assets/cave_wall.bejson", 1], ["AssetCaveFloor", "assets/cave_floor.bejson", 1], ["AssetPuppy", "assets/puppy.bejson", 1],
      ["Level", "data/level.bejson", 2], ["Actor", "data/actor.bejson", 2], ["Portal", "data/portal.bejson", 2], ["Items", "data/items.bejson", 2]
    ]
  },
  "assets/boundary.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetBoundary"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgBoundary)] ] },
  "assets/player.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetPlayer"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgPlayer)] ] },
  "assets/enemy.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetEnemy"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgEnemy)] ] },
  "assets/grass.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetGrass"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgGrass)] ] },
  "assets/rocky.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetRocky"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgRocky)] ] },
  "assets/bush.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetBush"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgBush)] ] },
  "assets/chest.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetChest"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgChest)] ] },
  "assets/sword.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetSword"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgSword)] ] },
  "assets/wood_wall.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetWoodWall"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgWoodWall)] ] },
  "assets/roof.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetRoof"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgRoof)] ] },
  "assets/apple_tree.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetAppleTree"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgAppleTree)] ] },
  "assets/stone_path.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetStonePath"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgStonePath)] ] },
  "assets/cave_wall.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetCaveWall"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgCaveWall)] ] },
  "assets/cave_floor.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetCaveFloor"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgCaveFloor)] ] },
  "assets/puppy.bejson": { Format: "BEJSON", Format_Version: "104", Parent_Hierarchy: "104a.mfdb.bejson", Format_Creator: "Elton Boehnen", Records_Type: ["AssetPuppy"], Fields: [ { name: "data_uri", type: "string" } ], Values: [ [encodeSVG(svgPuppy)] ] },
  "data/object_rules.bejson": {
    Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson",
    Records_Type: ["ObjectRules"],
    Fields: [ { name: "object_id", type: "string" }, { name: "is_solid", type: "boolean" }, { name: "interactable", type: "boolean" }, { name: "damage", type: "integer" }, { name: "description", type: "string" }, { name: "fallback_color", type: "string" }, { name: "speed_mult", type: "number" }, { name: "knockback_force", type: "integer" }, { name: "hitbox_width", type: "integer" }, { name: "hitbox_height", type: "integer" }, { name: "lifespan", type: "number" }, { name: "biome", type: "string" } ],
    Values: [
      ["boundary", true, false, 0, "Invisible wall", "#1f2937", 1.0, 0, 30, 30, 0, "generic"], 
      ["grass", false, false, 0, "Walkable terrain", "#166534", 1.0, 0, 32, 32, 0, "forest_village"],
      ["rocky", true, false, 0, "Impassable rocks", "#44403c", 1.0, 0, 30, 30, 0, "generic"], 
      ["bush", false, false, 0, "Slows movement", "#064e3b", 0.5, 0, 32, 32, 0, "forest"],
      ["chest", true, true, 0, "Contains loot", "#78350f", 1.0, 0, 30, 30, 0, "generic"], 
      ["sword", false, true, 10, "Weapon", "#b45309", 1.0, 800, 36, 36, 0.3, "generic"],
      ["wood_wall", true, false, 0, "Wooden Wall", "#a16207", 1.0, 0, 30, 30, 0, "forest_village"],
      ["roof", false, false, 0, "Roof Pattern", "#7c2d12", 1.0, 0, 32, 32, 0, "forest_village"],
      ["apple_tree", true, false, 0, "Apple Tree", "#15803d", 1.0, 0, 30, 30, 0, "forest_village"],
      ["stone_path", false, false, 0, "Stone Way", "#a8a29e", 1.3, 0, 32, 32, 0, "forest_village"],
      ["cave_wall", true, false, 0, "Cave Wall", "#1c1917", 1.0, 0, 30, 30, 0, "cave"],
      ["cave_floor", false, false, 0, "Cave Floor", "#44403c", 1.0, 0, 32, 32, 0, "cave"]
    ]
  },
  "data/actor_stats.bejson": {
    Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson", Records_Type: ["ActorStats"],
    Fields: [ { name: "actor_type", type: "string" }, { name: "max_health", type: "integer" }, { name: "atk", type: "integer" }, { name: "def", type: "integer" }, { name: "speed", type: "integer" }, { name: "xp_reward", type: "integer" }, { name: "fallback_color", type: "string" }, { name: "start_potions", type: "integer" }, { name: "level_up_hp", type: "integer" }, { name: "level_up_atk", type: "integer" }, { name: "level_up_def", type: "integer" }, { name: "knockback_force", type: "integer"}, { name: "potion_heal_amount", type: "integer" }, { name: "is_victory_target", type: "boolean" } ],
    Values: [
      ["player", 150, 10, 5, 120, 0, "#111111", 3, 20, 5, 2, 30, 50, false], ["enemy", 30, 5, 2, 60, 20, "#ef4444", 0, 0, 0, 0, 20, 0, false],
      ["enemy_boss", 150, 15, 8, 50, 100, "#b91c1c", 0, 0, 0, 0, 30, 0, true], ["chest", 1, 0, 0, 0, 0, "#92400e", 0, 0, 0, 0, 0, 0, false],
      ["npc", 100, 0, 10, 0, 0, "#10b981", 0, 0, 0, 0, 0, 0, false], ["puppy", 100, 0, 10, 0, 0, "#d97706", 0, 0, 0, 0, 0, 0, false]
    ]
  },
  "data/level.bejson": {
    Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson", Records_Type: ["Level"],
    Fields: [ { name: "level_id", type: "string" }, { name: "width", type: "integer" }, { name: "height", type: "integer" }, { name: "biome", type: "string" }, { name: "victory_condition", type: "string" } ],
    Values: [ ["village", 20, 20, "village", "none"], ["path", 20, 20, "forest", "none"], ["cave", 20, 20, "cave", "eliminate_boss"] ]
  },
  "data/portal.bejson": {
    Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson", Records_Type: ["Portal"],
    Fields: [ { name: "portal_id", type: "string" }, { name: "source_level_id", type: "string" }, { name: "source_x", type: "integer" }, { name: "source_y", type: "integer" }, { name: "target_level_id", type: "string" }, { name: "target_x", type: "integer" }, { name: "target_y", type: "integer" } ],
    Values: [
      ["p1", "village", 10, 19, "path", 10, 1],
      ["p2", "path", 10, 0, "village", 10, 18],
      ["p3", "path", 10, 19, "cave", 10, 1],
      ["p4", "cave", 10, 0, "path", 10, 18]
    ]
  },
  "data/items.bejson": {
    Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson", Records_Type: ["Items"],
    Fields: [ 
        { name: "item_id", type: "string" }, { name: "name", type: "string" }, { name: "type", type: "string" }, 
        { name: "effect_amount", type: "integer" }, { name: "icon_color", type: "string" }, { name: "property_name", type: "string" },
        { name: "equip_slot", type: "string" }, { name: "attack_bonus", type: "integer" }, { name: "defense_bonus", type: "integer" }
    ],
    Values: [
      ["potion", "Health Potion", "heal", 50, "#ef4444", "potions", "none", 0, 0],
      ["atk_boost", "Attack Potion", "boost_atk", 5, "#f59e0b", "atk_potions", "none", 0, 0],
      ["wep_rusty", "Rusty Sword", "equipment", 0, "#9ca3af", "weapon", "weapon", 2, 0],
      ["wep_iron", "Iron Broadsword", "equipment", 0, "#d1d5db", "weapon", "weapon", 6, 0],
      ["wep_steel", "Steel Katana", "equipment", 0, "#f3f4f6", "weapon", "weapon", 12, 0],
      ["wep_mithril", "Mithril Blade", "equipment", 0, "#60a5fa", "weapon", "weapon", 25, 0],
      ["arm_cloth", "Cloth Tunic", "equipment", 0, "#d97706", "armor", "armor", 0, 2],
      ["arm_leather", "Leather Cuirass", "equipment", 0, "#b45309", "armor", "armor", 0, 5],
      ["arm_chain", "Chainmail", "equipment", 0, "#9ca3af", "armor", "armor", 0, 12],
      ["arm_plate", "Iron Plate", "equipment", 0, "#4b5563", "armor", "armor", 0, 20]
    ]
  },
  "data/actor.bejson": {
    Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson", Records_Type: ["Actor"],
    Fields: [ { name: "actor_id", type: "string" }, { name: "level_id_fk", type: "string" }, { name: "type", type: "string" }, { name: "start_x", type: "number" }, { name: "start_y", type: "number" }, { name: "health", type: "integer" }, { name: "atk", type: "integer" }, { name: "def", type: "integer" }, { name: "name", type: "string" } ],
    Values: [
      ["player_1", "village", "player", 10, 12, 150, 10, 5, "boehnenelton2024"], 
      ["npc_1", "village", "npc", 7, 10, 100, 0, 10, "VILLAGER"],
      ["boss_1", "cave", "enemy_boss", 10, 10, 150, 15, 8, "VALERIUS"],
      ["puppy", "cave", "puppy", 10, 5, 100, 0, 10, "PUPPY"],
      ["chest_1", "cave", "chest", 15, 15, 1, 0, 0, "CHEST"],
      ["chest_2", "cave", "chest", 5, 15, 1, 0, 0, "CHEST"]
    ]
  },
  "data/events.bejson": {
    Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "Root/System/Events", Records_Type: ["Events"],
    Fields: [ { name: "id", type: "string" }, { name: "type", type: "string" }, { name: "x", type: "number" }, { name: "y", type: "number" }, { name: "script", type: "array" }, { name: "condition", type: "string" } ],
    Values: [
      ["npc_1_talk", "interaction", 0, 0, [["SET_DIALOG", "Please help! My puppy wandered south through the path into the caves!"]], ""],
      ["puppy_talk", "interaction", 0, 0, [["SET_DIALOG", "Arf! Arf! (You found the puppy!)"]], ""]
    ]
  },
};

  const addChunkEntry = (db: any, levelId: string, cx: number, cy: number) => {
    const chunkName = `data/${levelId}_tile_chunk_${cx}_${cy}.bejson`;
    if (!db[chunkName]) {
      db[chunkName] = {
        Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson", Records_Type: [`Tile_${levelId}_${cx}_${cy}`],
        Fields: [ { name: "tile_id", type: "string" }, { name: "level_id_fk", type: "string" }, { name: "x", type: "integer" }, { name: "y", type: "integer" }, { name: "terrain_type", type: "string" }, { name: "object_type", type: "string" } ],
        Values: [] as any[]
      };
      
      const manifestRow = [`Tile_${levelId}_${cx}_${cy}`, chunkName, 3];
      db["104a.mfdb.bejson"].Values.push(manifestRow);
    }
  };

  const levels = ["village", "path", "cave"];
  
  levels.forEach(lvl => {
     [0, 1].forEach(cx => {
       [0, 1].forEach(cy => {
          addChunkEntry(mfdb, lvl, cx, cy);
       });
     });
  });

  // Generate Village
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      let terrain = "grass";
      if (x === 0 || x === 19 || y === 0 || (y === 19 && x !== 10)) {
        terrain = "boundary";
      } else if (x >= 8 && x <= 12 && y >= 7 && y <= 11) {
        if (x === 8 || x === 12 || y === 7 || y === 11) {
          terrain = (x === 10 && y === 11) ? "stone_path" : "wood_wall";
        } else {
          terrain = "roof";
        }
      } else if (x === 10 && y > 11 && y < 19) {
        terrain = "stone_path";
      } else if ((x > 12 && x < 18 && y > 14) || (x < 6 && y > 2 && y < 8)) {
        terrain = Math.random() > 0.5 ? "apple_tree" : "grass";
      }
      const cx = Math.floor(x / 10); const cy = Math.floor(y / 10);
      mfdb[`data/village_tile_chunk_${cx}_${cy}.bejson`].Values.push([ `t_${x}_${y}`, "village", x, y, terrain, null ]);
    }
  }

  // Generate Path
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      let terrain = "grass";
      if (x === 0 || x === 19 || (y === 0 && x !== 10) || (y === 19 && x !== 10)) {
        terrain = "boundary";
      } else if (x >= 9 && x <= 11) {
        terrain = "stone_path"; // wide path down the middle
      } else {
        terrain = Math.random() > 0.5 ? "bush" : "rocky";
      }
      const cx = Math.floor(x / 10); const cy = Math.floor(y / 10);
      mfdb[`data/path_tile_chunk_${cx}_${cy}.bejson`].Values.push([ `t_${x}_${y}`, "path", x, y, terrain, null ]);
    }
  }

  // Generate Cave
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      let terrain = "cave_floor";
      if (x === 0 || x === 19 || (y === 0 && x !== 10) || y === 19) {
        terrain = "cave_wall";
      } else if (Math.random() > 0.8 && !(x > 8 && x < 12 && y > 8 && y < 12) && !(x === 10 && y < 3)) {
        terrain = "cave_wall"; // some random stalagmites, but clear center and entrance
      }
      if (x === 10 && y === 0) terrain = "cave_floor"; // Entrance
      const cx = Math.floor(x / 10); const cy = Math.floor(y / 10);
      mfdb[`data/cave_tile_chunk_${cx}_${cy}.bejson`].Values.push([ `t_${x}_${y}`, "cave", x, y, terrain, null ]);
    }
  }

  return mfdb;
};

import React, { useState } from 'react';

export function MapEditor({ db, setDb }: { db: any, setDb: (db: any) => void }) {
  const [selectedTerrain, setSelectedTerrain] = useState('grass');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [mode, setMode] = useState<'terrain' | 'portal' | 'actor'>('terrain');
  const [selectedActor, setSelectedActor] = useState('enemy');
  const [editingPortal, setEditingPortal] = useState<{x: number, y: number} | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const levelDb = db["data/level.bejson"];
  const levels = levelDb?.Values || [];
  const currentLevelRow = levels[currentLevelIndex] || levels[0];
  const currentLevelId = currentLevelRow?.[0] || 'level_1';
  const w = currentLevelRow?.[1] || 8; 
  const h = currentLevelRow?.[2] || 8;

  const handleCreateLevel = () => {
    const name = prompt("Enter new level name:", `level_${levels.length + 1}`);
    if (!name) return;
    const newWidth = parseInt(prompt("Width:", "20") || "20");
    const newHeight = parseInt(prompt("Height:", "20") || "20");
    const newId = name.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Add new level
    const newDb = { ...db };
    const newLevelDb = { ...levelDb, Values: [...levels, [newId, newWidth, newHeight]] };
    newDb["data/level.bejson"] = newLevelDb;
    
    // Generate chunks for new level
    const numChunksX = Math.ceil(newWidth / 10);
    const numChunksY = Math.ceil(newHeight / 10);
    
    for (let cx = 0; cx < numChunksX; cx++) {
      for (let cy = 0; cy < numChunksY; cy++) {
          newDb[`data/${newId}_tile_chunk_${cx}_${cy}.bejson`] = {
            Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson", Records_Type: [`Tile_${newId}_${cx}_${cy}`],
            Fields: [ { name: "tile_id", type: "string" }, { name: "level_id_fk", type: "string" }, { name: "x", type: "integer" }, { name: "y", type: "integer" }, { name: "terrain_type", type: "string" }, { name: "object_type", type: "string" } ],
            Values: [] as any[]
          };
      }
    }
    setDb(newDb);
    setCurrentLevelIndex(levels.length);
    setIsMapModalOpen(false);
  };

  const handleEditLevel = (idx: number) => {
      const lvl = levels[idx];
      const newName = prompt("Rename map:", lvl[0]);
      if (!newName) return;
      
      const newWidthStr = prompt("New width:", lvl[1].toString());
      const newHeightStr = prompt("New height:", lvl[2].toString());
      
      const newWidth = newWidthStr ? parseInt(newWidthStr) : lvl[1];
      const newHeight = newHeightStr ? parseInt(newHeightStr) : lvl[2];
      
      const newId = newName.replace(/[^a-zA-Z0-9_]/g, '_');
      
      const newDb = { ...db };
      const newLevels = [...levels];
      newLevels[idx] = [newId, newWidth, newHeight];
      newDb["data/level.bejson"] = { ...levelDb, Values: newLevels };
      
      Object.keys(newDb).forEach(key => {
          if (key.includes(`${lvl[0]}_tile_chunk`)) {
              if (newId !== lvl[0]) {
                  const newKey = key.replace(lvl[0], newId);
                  newDb[newKey] = newDb[key];
                  delete newDb[key];
              }
          }
      });
      setDb(newDb);
  };

  const handleDeleteLevel = (idx: number) => {
      const lvl = levels[idx];
      if (!confirm(`Delete map: ${lvl[0]}?`)) return;
      
      const newDb = { ...db };
      const newLevels = levels.filter((_, i) => i !== idx);
      newDb["data/level.bejson"] = { ...levelDb, Values: newLevels };
      
      Object.keys(newDb).forEach(key => {
          if (key.includes(`${lvl[0]}_tile_chunk`)) delete newDb[key];
      });
      setDb(newDb);
      
      if (currentLevelIndex === idx) setCurrentLevelIndex(0);
      else if (currentLevelIndex > idx) setCurrentLevelIndex(currentLevelIndex - 1);
  };

  const getTileDbFor = (x: number, y: number) => {
    const cx = Math.floor(x / 10); const cy = Math.floor(y / 10);
    return db[`data/${currentLevelId}_tile_chunk_${cx}_${cy}.bejson`] || db[`data/tile_chunk_${cx}_${cy}.bejson`]; // fallback for legacy
  }

  const handleTileClick = (x: number, y: number) => {
    if (mode === 'portal') {
       const existingPortal = (db["data/portal.bejson"]?.Values || []).find((p: any) => p[1] === currentLevelId && p[2] === x && p[3] === y);
       if (existingPortal) {
           if (confirm("Delete portal?")) {
               const newDb = { ...db };
               const newPortalDb = { ...newDb["data/portal.bejson"] };
               newPortalDb.Values = newPortalDb.Values.filter((p: any) => p[0] !== existingPortal[0]);
               newDb["data/portal.bejson"] = newPortalDb;
               setDb(newDb);
           }
       } else {
           const targetLevel = prompt("Target Level ID:", levels[0]?.[0]);
           if (!targetLevel) return;
           const targetX = parseInt(prompt("Target X:", "0") || "0");
           const targetY = parseInt(prompt("Target Y:", "0") || "0");
           
           const newDb = { ...db };
           const newPortalDb = { ...newDb["data/portal.bejson"] };
           if (!newPortalDb.Values) newPortalDb.Values = [];
           const pid = `portal_${Date.now()}`;
           newPortalDb.Values = [...newPortalDb.Values, [pid, currentLevelId, x, y, targetLevel, targetX, targetY]];
           newDb["data/portal.bejson"] = newPortalDb;
           setDb(newDb);
       }
       return;
    }

    if (mode === 'actor') {
       const existingActor = (db["data/actor.bejson"]?.Values || []).find((a: any) => a[1] === currentLevelId && Math.round(a[3]) === x && Math.round(a[4]) === y);
       const newDb = { ...db };
       const newActorDb = { ...newDb["data/actor.bejson"] };
       if (!newActorDb.Values) newActorDb.Values = [];

       if (existingActor) {
           newActorDb.Values = newActorDb.Values.filter((a: any) => a[0] !== existingActor[0]);
       } else {
           const actorStats = db["data/actor_stats.bejson"]?.Values?.find((s: any) => s[0] === selectedActor) || [selectedActor, 10, 1, 1];
           const aId = `${selectedActor}_${Date.now()}`;
           newActorDb.Values = [...newActorDb.Values, [aId, currentLevelId, selectedActor, x, y, actorStats[1], actorStats[2], actorStats[3]]];
       }
       newDb["data/actor.bejson"] = newActorDb;
       setDb(newDb);
       return;
    }

    const cx = Math.floor(x / 10); const cy = Math.floor(y / 10);
    const chunkName1 = `data/${currentLevelId}_tile_chunk_${cx}_${cy}.bejson`;
    const chunkName2 = `data/tile_chunk_${cx}_${cy}.bejson`;
    let chunkName = db[chunkName1] ? chunkName1 : chunkName2;
    
    // If chunk doesn't exist, create it (legacy might lack it, or bad sizing)
    if (!db[chunkName]) {
        chunkName = chunkName1;
        db[chunkName] = {
            Format: "BEJSON", Format_Version: "104", Format_Creator: "Elton Boehnen", Parent_Hierarchy: "104a.mfdb.bejson", Records_Type: [`Tile_${currentLevelId}_${cx}_${cy}`],
            Fields: [ { name: "tile_id", type: "string" }, { name: "level_id_fk", type: "string" }, { name: "x", type: "integer" }, { name: "y", type: "integer" }, { name: "terrain_type", type: "string" }, { name: "object_type", type: "string" } ],
            Values: [] as any[]
        };
    }

    const tileDb = db[chunkName];
    if (!tileDb) return;
    const newDb = { ...db }; const newTileDb = { ...tileDb, Values: [...(tileDb.Values||[])] };
    const tileIndex = newTileDb.Values.findIndex((r: any) => r[2] === x && r[3] === y);
    if (tileIndex !== -1) {
      const newRow = [...newTileDb.Values[tileIndex]]; newRow[4] = selectedTerrain;
      newTileDb.Values[tileIndex] = newRow; newDb[chunkName] = newTileDb; setDb(newDb);
    } else {
      const newRow = [`tile_${x}_${y}`, currentLevelId, x, y, selectedTerrain, ""];
      newTileDb.Values.push(newRow); newDb[chunkName] = newTileDb; setDb(newDb);
    }
  };

  const getTerrainAt = (x: number, y: number) => {
    const tileDb = getTileDbFor(x, y);
    const tileRow = tileDb?.Values?.find((r: any) => r[2] === x && r[3] === y);
    return tileRow?.[4] || 'grass';
  };

  const getTileColor = (x: number, y: number) => {
    return getTileColorConfig(getTerrainAt(x, y));
  };
  
  const getTileBackgroundImage = (terrain: string) => {
    const assetKey = `assets/${terrain}.bejson`;
    if (db[assetKey] && db[assetKey].Values?.[0]?.[0]) return `url(${db[assetKey].Values[0][0]})`;
    return undefined;
  };

  const getActorColorConfig = (type: string) => {
    const stats = db["data/actor_stats.bejson"]?.Values || [];
    const stat = stats.find((r: any) => r[0] === type);
    if (stat && stat[6]) return stat[6]; return '#f00';
  }

  const getActorBackgroundImage = (type: string) => {
    const assetKey = `assets/${type}.bejson`;
    if (db[assetKey] && db[assetKey].Values?.[0]?.[0]) return `url(${db[assetKey].Values[0][0]})`;
    return undefined;
  };

  const getTileColorConfig = (terrain: string) => {
    const objectRules = db["data/object_rules.bejson"]?.Values || [];
    const rule = objectRules.find((r: any) => r[0] === terrain);
    if (rule && rule[5]) return rule[5]; return '#000';
  };

  const terrains = db["data/object_rules.bejson"]?.Values?.map((row: any) => row[0]) || ['grass', 'boundary', 'rocky', 'bush'];
  const availableActors = db["data/actor_stats.bejson"]?.Values?.map((row: any) => row[0]) || ['player', 'enemy', 'chest', 'npc'];

  const portals = db["data/portal.bejson"]?.Values || [];
  const actorsOnLevel = db["data/actor.bejson"]?.Values?.filter((a: any) => a[1] === currentLevelId) || [];

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* 2-row toolbar container */}
      <div className="flex flex-col shrink-0 ui-panel rounded-none border-x-0 border-t-0 border-b border-white/10 z-20">
        {/* Row 1: Map title and selector */}
        <div className="flex items-center gap-4 px-4 h-10 md:h-10 overflow-x-auto border-b border-white/5">
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider border-r border-white/10 text-blue-300 pr-4">Map Editor</div>
          
          <button 
            onClick={() => setIsMapModalOpen(true)} 
            className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-3 py-1.5 rounded border border-white/20 font-bold tracking-widest flex items-center gap-2 transition-all shadow-inner active:scale-95"
          >
            <span className="opacity-70 text-[12px]">🗺️</span>
            MAP: {currentLevelId} 
             <span className="text-gray-400 ml-1">▾</span>
          </button>
          
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 px-3 text-[10px] opacity-40 font-mono text-gray-400 hidden sm:flex"><span>Grid: {w}x{h}</span></div>
        </div>

        {/* Row 2: Mode selector */}
        <div className="flex items-center gap-4 px-4 h-10 md:h-10 bg-black/20">
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value as any)} 
            className="bg-black/60 text-[10px] uppercase font-bold tracking-widest text-blue-300 border border-blue-500/30 rounded px-2 py-1 outline-none cursor-pointer hover:border-blue-400 transition-colors shadow-inner"
          >
             <option value="terrain">Layer: Terrain</option>
             <option value="portal">Layer: Portals</option>
             <option value="actor">Layer: Actors / Objects</option>
          </select>
        </div>
      </div>

      {isMapModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="ui-panel w-full max-w-md rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                 <h2 className="text-xs font-bold text-blue-300 uppercase tracking-widest">Map Manager</h2>
                 <button onClick={() => setIsMapModalOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
              </div>
              <div className="p-3 flex-1 overflow-y-auto max-h-[50vh] space-y-2 bg-[#0a0f1a]">
                 {levels.map((lvl: any, i: number) => (
                    <div key={lvl[0]} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${currentLevelIndex === i ? 'bg-blue-900/30 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-black/40 border-white/5 hover:bg-white/10'}`}>
                       <button onClick={() => { setCurrentLevelIndex(i); setIsMapModalOpen(false); }} className="font-mono text-sm text-left flex-1 text-white hover:text-blue-300 transition-colors">
                          {lvl[0]} <span className="text-[10px] text-gray-500 ml-2">({lvl[1]}x{lvl[2]})</span>
                       </button>
                       <div className="flex gap-2">
                          <button onClick={() => handleEditLevel(i)} className="text-[10px] uppercase font-bold text-gray-400 hover:text-blue-400 px-2 py-1 bg-black/40 rounded border border-white/10 hover:border-blue-500/50 transition-colors">Edit</button>
                          <button onClick={() => handleDeleteLevel(i)} className="text-[10px] uppercase font-bold text-gray-400 hover:text-red-400 px-2 py-1 bg-black/40 rounded border border-white/10 hover:border-red-500/50 transition-colors disabled:opacity-50 disabled:pointer-events-none" disabled={levels.length <= 1}>Del</button>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-4 border-t border-white/10 bg-black/40">
                 <button onClick={handleCreateLevel} className="w-full py-3 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">Create New Map</button>
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
         <div className="w-full md:w-48 ui-panel rounded-none border-y-0 border-l-0 p-3 space-y-2 shrink-0 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-2 md:gap-0 z-10">
            {mode === 'terrain' && (
              <>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-white/10 pb-2 mb-2 hidden md:block border-b">Tile Palette</div>
                <div className="flex md:grid md:grid-cols-2 gap-2 flex-1 md:flex-none h-12 md:h-auto">
                  {terrains.map((t: string) => (
                    <button key={t} onClick={() => setSelectedTerrain(t)} className={`flex-1 md:aspect-square md:w-auto h-full cursor-pointer rounded-xl border text-[10px] flex md:flex-col items-center justify-center gap-1.5 transition-all ${selectedTerrain === t ? 'bg-blue-900/30 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.3)]' : 'bg-black/30 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                      <div className="w-4 h-4 md:w-6 md:h-6 rounded-md border border-white/20 shrink-0 shadow-sm" style={{ backgroundColor: getTileColorConfig(t), backgroundImage: getTileBackgroundImage(t), backgroundSize: 'cover', imageRendering: 'pixelated' }}></div>
                      <span className="capitalize font-bold">{t}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {mode === 'portal' && (
               <div className="text-xs text-gray-400 font-mono">
                  Click any tile to add or remove a portal connecting to another map level.
               </div>
            )}
            {mode === 'actor' && (
              <>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-white/10 pb-2 mb-2 hidden md:block border-b">Actors & Objects</div>
                <div className="flex md:grid md:grid-cols-2 gap-2 flex-1 md:flex-none h-12 md:h-auto">
                  {availableActors.map((t: string) => (
                    <button key={t} onClick={() => setSelectedActor(t)} className={`flex-1 md:aspect-square md:w-auto h-full cursor-pointer rounded-xl border text-[10px] flex md:flex-col items-center justify-center gap-1.5 transition-all ${selectedActor === t ? 'bg-red-900/30 border-red-400 text-red-300 shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'bg-black/30 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                      <div className="w-4 h-4 md:w-6 md:h-6 rounded-md border border-white/20 shrink-0 shadow-sm" style={{ backgroundColor: getActorColorConfig(t), backgroundImage: getActorBackgroundImage(t), backgroundSize: 'cover', imageRendering: 'pixelated' }}></div>
                      <span className="capitalize font-bold">{t}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
         </div>
         <div className="flex-1 game-viewport relative overflow-auto p-4 flex flex-col items-center justify-center md:block">
            <div className="pixel-grid hidden md:block"></div>
            <div className="atmosphere-glow z-0"></div>
            <div className="w-full md:w-auto overflow-auto flex justify-center md:inline-flex md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 min-w-min z-10">
              <div className="grid gap-px ui-panel p-2 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] relative mx-auto select-none" style={{ gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))` }}>
                {Array.from({ length: h }).map((_, y) => 
                  Array.from({ length: w }).map((_, x) => {
                    const hasPortal = portals.find((p: any) => p[1] === currentLevelId && p[2] === x && p[3] === y);
                    const actorsAtTile = actorsOnLevel.filter((a: any) => Math.round(a[3]) === x && Math.round(a[4]) === y);
                    return (
                      <button key={`${x}-${y}`} onMouseDown={() => handleTileClick(x, y)} onMouseEnter={(e) => { if (e.buttons === 1 && (mode === 'terrain' || mode === 'actor')) handleTileClick(x, y); }} className="w-8 h-8 sm:w-12 sm:h-12 border border-black/20 hover:scale-110 hover:z-20 hover:shadow-[0_0_10px_rgba(255,255,255,0.8)] hover:border-white transition-all transform origin-center rounded-sm relative" style={{ backgroundColor: getTileColor(x, y), backgroundImage: getTileBackgroundImage(getTerrainAt(x, y)), backgroundSize: 'cover', imageRendering: 'pixelated' }} title={`(${x}, ${y})`}>
                          {hasPortal && (
                             <div className="absolute inset-0 m-1 bg-purple-500/80 rounded flex items-center justify-center border border-purple-300">
                                 <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                             </div>
                          )}
                          {actorsAtTile.map((actor: any, idx: number) => (
                              <div key={actor[0]} className="absolute select-none pointer-events-none drop-shadow-md z-10" style={{ 
                                  inset: `${idx * 2}px`, 
                                  backgroundImage: getActorBackgroundImage(actor[2]), 
                                  backgroundSize: 'cover',
                                  backgroundColor: getActorBackgroundImage(actor[2]) ? 'transparent' : getActorColorConfig(actor[2]),
                                  borderRadius: '50%',
                                  imageRendering: 'pixelated'
                              }}></div>
                          ))}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}

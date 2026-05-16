import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/Engine';
import { VanillaGameEngine } from '../game/VanillaGameEngine';
import { validateDatabase } from '../game/bejson/mfdb_validators';

export function GameCanvas({ db, setDb }: { db: any, setDb: (db: any) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | VanillaGameEngine | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [engineMode, setEngineMode] = useState<'TS' | 'JS'>('TS');
  const [loadError, setLoadError] = useState<string | null>(null);

  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickOrigin, setJoystickOrigin] = useState({ x: 0, y: 0 });
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  const activeKeysRef = useRef<Set<string>>(new Set());

  const [engineState, setEngineState] = useState<{ state: string; score: number; player: any; dialogText: string | null; }>({ state: 'TITLE', score: 0, player: null, dialogText: null });

  const handleSave = () => { 

    if (engineRef.current) { 
      const saveJson = engineRef.current.serialize();
      const saveBejson = {
        Format: "BEJSON", Format_Version: "104", Format_Creator: "GameClient",
        Records_Type: ["SaveData"],
        Fields: [{name: "data", type: "string"}],
        Values: [[saveJson]]
      };
      setDb({ ...db, "save.104a.bejson": saveBejson });
      alert('Game Saved to MFDB!');
    } 
  };
  
  const handleLoad = () => { 
    if (engineRef.current) { 
      const saveFile = db["save.104a.bejson"];
      if (saveFile && saveFile.Values && saveFile.Values.length > 0) {
        engineRef.current.deserialize(saveFile.Values[0][0]); 
      } else {
        alert('No save game found in MFDB!'); 
      }
    } 
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const manifestKey = Object.keys(db).find(key => key.endsWith('.mfdb.bejson') && db[key].Format_Version === '104a');
      const manifest = manifestKey ? db[manifestKey] : null;

      if (manifest) {
        const entityDocs = new Map<string, any>();
        Object.keys(db).forEach(k => {
            if (k !== manifestKey && db[k].Format === 'BEJSON') entityDocs.set(k, db[k]);
        });
        
        const result = validateDatabase(manifest as any, entityDocs as any, { resolvedPaths: new Set(Object.keys(db)) });
        if (result && !result.valid) {
            throw new Error(`Database validation failed: ${result.errors.map((e: any) => e.message).join(", ")}`);
        }
      } else {
         throw new Error("Missing MFDB Manifest.");
      }
      setLoadError(null);
    } catch (e: any) {
      setLoadError(e.message || "Database validation failed. Invalid assets or config.");
      return;
    }

    canvasRef.current.width = 480;
    canvasRef.current.height = 800;
    
    if (engineMode === 'TS') {
      if (engineRef.current) engineRef.current.destroy();
      engineRef.current = new GameEngine(canvasRef.current, db);
    } else {
      if (engineRef.current) engineRef.current.destroy();
      engineRef.current = new VanillaGameEngine(canvasRef.current, db);
    }
    
    const updateUI = () => {
      if (engineRef.current) {
        const eng = engineRef.current;
        setEngineState({ state: eng.state, score: eng.score, player: eng.player ? { ...eng.player } : null, dialogText: eng.dialogText });
      }
    };
    engineRef.current.on('UIUpdate', updateUI);
    updateUI();

    return () => { if (engineRef.current) engineRef.current.destroy(); };
  }, [db, engineMode]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId); const rect = e.currentTarget.getBoundingClientRect();
    setJoystickActive(true); setJoystickOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top }); setJoystickOffset({ x: 0, y: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystickActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let dx = (e.clientX - rect.left) - joystickOrigin.x; let dy = (e.clientY - rect.top) - joystickOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 40) { dx = (dx / dist) * 40; dy = (dy / dist) * 40; }
    setJoystickOffset({ x: dx, y: dy });

    const newKeys = new Set<string>();
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
       if (dy < -20) newKeys.add('ArrowUp'); if (dy > 20) newKeys.add('ArrowDown');
       if (dx < -20) newKeys.add('ArrowLeft'); if (dx > 20) newKeys.add('ArrowRight');
    }
    if (engineRef.current) {
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(k => {
         if (newKeys.has(k) && !activeKeysRef.current.has(k)) engineRef.current!.handleInput(k, true);
         else if (!newKeys.has(k) && activeKeysRef.current.has(k)) engineRef.current!.handleInput(k, false);
      });
    }
    activeKeysRef.current = newKeys;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId); setJoystickActive(false); setJoystickOffset({ x: 0, y: 0 });
    if (engineRef.current) { ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(k => { if (activeKeysRef.current.has(k)) engineRef.current!.handleInput(k, false); }); }
    activeKeysRef.current.clear();
  };

  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  const inventoryItems = (db["data/items.bejson"]?.Values || []).filter((item: any) => {
     const type = item[2];
     const propName = item[5];
     if (type === 'equipment') return true; // Show all equipment for now
     return engineState.player && engineState.player[propName] > 0;
  });

  const handleButton = (code: string, isDown: boolean, e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    if (e.cancelable) e.preventDefault();
    
    // Inventory Usage logic
    if (code === 'KeyC' && isDown && engineState.state === 'PLAYING') {
       if (inventoryItems.length > 0) {
           const selectedItem = inventoryItems[selectedItemIndex % inventoryItems.length];
           useItem(selectedItem);
           return;
       }
    }
    
    // Menu navigation override for ITEM_MENU
    if (engineState.state === 'ITEM_MENU' && isDown) {
       if (code === 'ArrowRight' && inventoryItems.length > 0) {
           setSelectedItemIndex(prev => (prev + 1) % inventoryItems.length);
           return;
       }
       if (code === 'ArrowLeft' && inventoryItems.length > 0) {
           setSelectedItemIndex(prev => (prev - 1 + inventoryItems.length) % inventoryItems.length);
           return;
       }
       if (code === 'KeyC' && inventoryItems.length > 0) {
           useItem(inventoryItems[selectedItemIndex % inventoryItems.length]);
           return;
       }
    }
    
    if (engineRef.current) engineRef.current.handleInput(code, isDown);
  };

  const useItem = (itemConfig: any) => {
      if (!engineRef.current || !engineRef.current.player) return;
      const player = engineRef.current.player;
      
      const type = itemConfig[2];
      const amount = itemConfig[3];
      const propName = itemConfig[5];
      
      if (type === 'equipment') {
          const slot = itemConfig[6];
          const bonusAtk = itemConfig[7];
          const bonusDef = itemConfig[8];
          
          if (!player.equipment) player.equipment = { weapon: null, armor: null };
          
          if (slot === 'weapon') {
              player.equipment.weapon = { item_id: itemConfig[0], name: itemConfig[1], type: itemConfig[2], attack_bonus: bonusAtk, defense_bonus: bonusDef };
          } else if (slot === 'armor') {
              player.equipment.armor = { item_id: itemConfig[0], name: itemConfig[1], type: itemConfig[2], attack_bonus: bonusAtk, defense_bonus: bonusDef };
          }
          engineRef.current.notifyPlayerChange();
          return;
      }

      if (player[propName] > 0) {
          if (type === 'heal' && player.health < player.maxHealth) {
             player[propName]--;
             player.health = Math.min(player.maxHealth, player.health + amount);
             engineRef.current.notifyPlayerChange();
          } else if (type === 'boost_atk') {
             player[propName]--;
             player.atk += amount;
             engineRef.current.notifyPlayerChange();
          }
      }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex ui-panel rounded-none border-x-0 border-t-0 border-b border-white/10 h-10 md:h-8 shrink-0">
        <div className="px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider border-r border-white/10 text-blue-300 flex items-center">Live Preview</div>
        <div className="flex-1"></div>
        <div className="flex items-center px-4 gap-4 relative z-[60]">
          <div className="flex bg-[#111] rounded-sm p-0.5 border border-white/10 hidden sm:flex">
             <button onClick={() => setEngineMode('TS')} className={`px-3 py-1 text-[10px] font-mono font-bold transition-colors rounded-sm ${engineMode === 'TS' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>TS</button>
             <button onClick={() => setEngineMode('JS')} className={`px-3 py-1 text-[10px] font-mono font-bold transition-colors rounded-sm ${engineMode === 'JS' ? 'bg-yellow-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>VANILLA</button>
          </div>
          <button onClick={() => setShowControls(!showControls)} className={`px-2 py-1 flex items-center gap-1.5 rounded-sm border text-[9px] font-mono transition-colors ${showControls ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' : 'bg-[#2A2A2A] border-[#333] text-gray-400 hover:text-white'}`}>🎮 <span className="hidden sm:inline">VIRTUAL CONTROLS</span> {showControls ? 'ON' : 'OFF'}</button>
        </div>
      </div>

      <div className="flex-1 relative game-viewport flex items-center justify-center overflow-hidden">
        <div className="pixel-grid hidden md:block"></div>
        <div className="atmosphere-glow"></div>
        
        {loadError ? (
            <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center bg-black/80 w-full h-full text-white">
                <h2 className="text-3xl font-mono text-red-500 mb-4 tracking-wider">INITIALIZATION FAILURE</h2>
                <div className="bg-red-950/50 border-2 border-red-500/50 p-6 rounded max-w-2xl text-left overflow-auto font-mono text-sm text-red-200">
                    {loadError}
                </div>
                <p className="mt-8 text-gray-400 font-mono">The engine refused to start because the provided database/assets failed strict validation.</p>
            </div>
        ) : (
          <>
            <div className="relative ui-panel z-10 flex w-[480px] h-[800px] items-center justify-center isolate overflow-hidden rounded-xl bg-[#1e293b]">
              <canvas ref={canvasRef} className="block w-full h-full" style={{ imageRendering: 'pixelated', objectFit: 'contain' }} tabIndex={0} />
              
              {engineState.state === 'TITLE' && (
                 <div className="absolute top-0 left-0 right-0 h-[60%] z-30 bg-black/80 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm border-b border-white/10">
                    <h1 className="text-3xl font-mono text-blue-500 font-bold mb-4 drop-shadow-[0_0_20px_rgba(59,130,246,1)] tracking-widest text-center" style={{textShadow: "2px 2px 0 #1e3a8a, -2px -2px 0 #1e3a8a, 2px -2px 0 #1e3a8a, -2px 2px 0 #1e3a8a, 0 4px 10px rgba(0,0,0,0.8)"}}>
                      32-BIT ADVENTURE
                    </h1>
                    <div className="text-[10px] font-mono text-cyan-400 mb-8 border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 rounded shadow-sm opacity-80 backdrop-blur-sm tracking-wider">
                       Engine v1.116.0 <span className="mx-2 text-cyan-700">|</span> ID: sword_slasher/116
                    </div>
                    <div className="flex flex-col gap-3 w-56">
                       <button onClick={() => engineRef.current && (engineRef.current.state = 'PLAYING')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm font-bold uppercase rounded border-2 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all active:scale-95">New Game</button>
                       <button onClick={handleLoad} className="px-6 py-2 bg-[#2A2A2A] hover:bg-[#333] text-gray-300 font-mono text-sm font-bold uppercase rounded border-2 border-gray-600 transition-all active:scale-95">Load Game</button>
                    </div>
                 </div>
              )}

          {engineState.state === 'GAMEOVER' && (
             <div className="absolute top-0 left-0 right-0 h-[60%] z-30 bg-black/90 flex flex-col items-center justify-center pointer-events-auto backdrop-blur border-b border-white/10">
                <h1 className="text-4xl font-mono text-red-500 font-bold mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] tracking-widest">GAME OVER</h1>
                <p className="text-red-400 font-mono mb-6 text-sm">You have fallen in battle.</p>
                <div className="flex flex-col gap-3 w-56">
                   <button onClick={handleLoad} className="px-6 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 font-mono text-sm font-bold uppercase rounded border-2 border-red-500/50 transition-all active:scale-95">Load Last Save</button>
                   <button onClick={() => { if (engineRef.current) { engineRef.current.init(); engineRef.current.state = 'PLAYING'; } }} className="px-6 py-2 bg-[#2A2A2A] hover:bg-[#333] text-gray-300 font-mono text-sm font-bold uppercase rounded border-2 border-gray-600 transition-all active:scale-95">Restart</button>
                </div>
             </div>
          )}

          {engineState.state === 'VICTORY' && (
             <div className="absolute top-0 left-0 right-0 h-[60%] z-30 bg-black/90 flex flex-col items-center justify-center pointer-events-auto backdrop-blur border-b border-white/10">
                <h1 className="text-4xl font-mono text-yellow-400 font-bold mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] tracking-widest">VICTORY</h1>
                <p className="text-yellow-200 font-mono mb-4 text-sm">The realm is safe... for now.</p>
                <p className="font-mono text-white mb-6 text-xs">Final Score: {engineState.score}</p>
                <div className="flex flex-col gap-3 w-56">
                   <button onClick={() => { if (engineRef.current) { engineRef.current.init(); engineRef.current.state = 'PLAYING'; } }} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-mono text-sm font-bold uppercase rounded border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all active:scale-95">Play Again</button>
                </div>
             </div>
          )}

          {engineState.state === 'MENU' && (
             <div className="absolute top-0 left-0 right-0 h-[60%] z-30 bg-black/80 flex flex-col items-center justify-center pointer-events-auto backdrop-blur py-4 overflow-y-auto border-b border-white/10">
                <h1 className="text-xl font-bold text-blue-400 mb-4 tracking-widest uppercase shadow-[0_0_10px_rgba(96,165,250,0.5)]">Pause Menu</h1>
                <div className="flex flex-col gap-4 w-full px-6">
                   <div className="flex flex-col gap-3">
                      <div className="ui-panel rounded-lg p-3">
                         <h2 className="text-blue-300 text-[10px] font-bold mb-2 uppercase tracking-widest border-b border-white/10 pb-1">STATUS</h2>
                         <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                            <div className="text-gray-400">LEVEL</div><div className="text-white text-right">{engineState.player?.level}</div>
                            <div className="text-gray-400">HEALTH</div><div className="text-white text-right">{Math.floor(engineState.player?.health || 0)} / {engineState.player?.maxHealth}</div>
                            <div className="text-cyan-400 font-bold border-t border-white/10 pt-1">TOTAL ATK</div><div className="text-cyan-400 font-bold text-right border-t border-white/10 pt-1">{ (engineState.player?.atk || 0) + (engineState.player?.equipment?.weapon?.attack_bonus || 0) }</div>
                            <div className="text-cyan-400 font-bold">TOTAL DEF</div><div className="text-cyan-400 font-bold text-right">{ (engineState.player?.def || 0) + (engineState.player?.equipment?.armor?.defense_bonus || 0) }</div>
                         </div>
                      </div>
                      
                      <div className="ui-panel rounded-lg p-3">
                         <h2 className="text-blue-300 text-[10px] font-bold mb-2 uppercase tracking-widest border-b border-white/10 pb-1">INVENTORY</h2>
                         <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                            { (db["data/items.bejson"]?.Values || []).map((item: any) => {
                               const isEquipped = engineState.player?.equipment?.weapon?.item_id === item[0] || engineState.player?.equipment?.armor?.item_id === item[0];
                               const isConsumable = item[2] !== 'equipment';
                               const count = isConsumable ? (engineState.player?.[item[5]] || 0) : 1;
                               if (isConsumable && count <= 0) return null;
                               return (
                                <div key={item[0]} className={`flex justify-between text-[10px] items-center p-1 rounded ${isEquipped ? 'bg-blue-900/40 border border-blue-500/30' : ''}`}>
                                   <span className="text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: item[4] }}></div> {item[1]}</span>
                                   <button 
                                     onClick={() => useItem(item)}
                                     className="text-[8px] bg-blue-600 hover:bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase font-bold"
                                   >
                                     {item[2] === 'equipment' ? (isEquipped ? 'EQUIPPED' : 'EQUIP') : (count > 0 ? `USE (${count})` : 'USE')}
                                   </button>
                                </div>
                               );
                            })}
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSave} className="flex-1 py-2 bg-blue-900/40 hover:bg-blue-600/60 text-blue-300 text-[10px] font-bold uppercase rounded-lg border border-blue-500/50 shadow-[0_0_10px_rgba(96,165,250,0.2)]">Save</button>
                        <button onClick={() => engineRef.current && (engineRef.current.state = 'PLAYING')} className="flex-1 py-2 bg-white hover:bg-gray-200 text-black text-[10px] font-bold uppercase rounded-lg">Resume</button>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {['PLAYING', 'MENU'].includes(engineState.state) && engineState.player && (
             <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none z-20 flex flex-col gap-2">
                <div className="ui-panel p-3 rounded-lg flex justify-between items-center bg-black/40 backdrop-blur-sm">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-900/60 border border-blue-400/50 overflow-hidden shrink-0">
                         <div className="w-full h-full bg-gradient-to-t from-blue-700 to-blue-400 animate-pulse"></div>
                      </div>
                      <div>
                         <div className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                           {engineState.player.name} <span className="bg-blue-500 text-white px-1 rounded-sm text-[8px]">LV.{engineState.player.level}</span>
                         </div>
                         <div className="w-32">
                            <div className="stat-bar h-1.5">
                               <div className="stat-fill-hp" style={{ width: `${Math.max(0, Math.min(100, (engineState.player.health / engineState.player.maxHealth) * 100))}%` }}></div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <button onClick={() => { if (engineRef.current) engineRef.current.state = 'MENU'; }} className="pointer-events-auto bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-tighter transition-colors border border-white/10">Pause</button>
                      <div className="text-[10px] font-mono text-yellow-500 font-mono">{engineState.score.toString().padStart(6, '0')}</div>
                   </div>
                </div>
             </div>
          )}

          {engineState.state === 'ITEM_MENU' && engineState.player && (
             <div className="absolute inset-x-0 top-0 bottom-[40%] z-30 bg-gray-900/95 flex flex-col p-6 pointer-events-auto backdrop-blur-md overflow-hidden border-b border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-blue-400 font-bold text-2xl tracking-tighter uppercase">Inventory</h2>
                  <span className="text-[10px] font-mono text-gray-500">SELECT ITEMS TO USE</span>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                   <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-green-500" style={{ width: `${Math.max(0, Math.min(100, (engineState.player.health / engineState.player.maxHealth) * 100))}%` }}></div>
                   </div>
                   <span className="text-green-400 font-mono text-xs font-bold">
                      {Math.floor(engineState.player.health)}/{engineState.player.maxHealth} HP
                   </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                   {inventoryItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 opacity-20">
                         <div className="w-12 h-12 rounded-full border-4 border-dashed border-white mb-2"></div>
                         <p className="text-white font-bold text-sm">EMPTY BAG</p>
                      </div>
                   ) : (
                      inventoryItems.map((item: any, idx: number) => {
                         const isEquipped = item[2] === 'equipment' && (engineState.player?.equipment?.weapon?.item_id === item[0] || engineState.player?.equipment?.armor?.item_id === item[0]);
                         const count = item[2] !== 'equipment' ? (engineState.player?.[item[5]] || 0) : 1;
                         const isSelected = inventoryItems.length > 0 && idx === (selectedItemIndex % inventoryItems.length);
                         
                         return (
                            <button 
                               key={item[0] + idx}
                               onClick={() => { setSelectedItemIndex(idx); useItem(item); }}
                               className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all border-2 active:scale-95 ${isSelected ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-gray-800/50 border-white/5 hover:bg-gray-800'}`}
                            >
                               <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner relative" style={{ backgroundColor: item[4] }}>
                                  {isEquipped && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-gray-900 flex items-center justify-center text-[8px] font-bold text-black">E</div>}
                               </div>
                               <div className="flex-1">
                                  <div className="text-white font-bold text-sm tracking-tight">{item[1]}</div>
                                  <div className="text-[10px] text-white/50 uppercase tracking-widest">{item[2]}</div>
                               </div>
                               <div className="bg-black/30 px-3 py-1 rounded-full text-xs font-mono text-white font-bold">
                                  {item[2] === 'equipment' ? (isEquipped ? 'ON' : 'OFF') : `x${count}`}
                               </div>
                            </button>
                         );
                      })
                   )}
                </div>

                <div className="mt-6 flex gap-3">
                   <button 
                     onClick={() => { if (engineRef.current) engineRef.current.state = 'PLAYING'; }}
                     className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest text-sm"
                   >
                     Close Bag
                   </button>
                </div>
             </div>
          )}

          {engineState.state === 'DIALOG' && (
             <div className="absolute inset-x-0 top-[40%] z-50 flex flex-col items-center justify-center pointer-events-auto px-4">
                <div className="ui-panel w-full max-w-sm border-l-4 border-l-blue-400 rounded-lg p-3 relative animate-in fade-in slide-in-from-bottom-2 bg-black/90">
                   <div className="absolute -top-2 left-4 bg-blue-900 border border-blue-400 px-2 py-0.5 rounded text-[8px] font-bold text-blue-300 uppercase tracking-widest shadow-[0_0_8px_rgba(96,165,250,0.4)]">NPC</div>
                   <p className="font-sans text-white text-xs leading-normal h-12 overflow-y-auto mt-2">{engineState.dialogText || "..."}</p>
                   <div className="flex justify-end mt-1">
                     <span className="font-sans text-[7px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">Press A <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce shadow-[0_0_5px_#60a5fa]"></div></span>
                   </div>
                </div>
             </div>
          )}

          <div className="absolute inset-x-0 bottom-0 top-[60%] z-40 bg-[#1e293b] flex flex-col items-center justify-center p-4 border-t border-black/40">
            <div className="w-full h-full relative flex flex-col items-center justify-between py-4">
              
              <div className="flex w-full justify-between items-center px-4 mb-2">
                 <div className="flex flex-col gap-1 items-center">
                    <div className="text-[10px] text-blue-400 font-bold uppercase opacity-50 tracking-tighter">Status Panel</div>
                    <div className="flex gap-4 items-center">
                        <div className="flex flex-col items-center">
                           <div className="text-[8px] text-gray-500 uppercase">ATK</div>
                           <div className="text-sm font-mono text-white font-bold">{(engineState.player?.atk || 0) + (engineState.player?.equipment?.weapon?.attack_bonus || 0)}</div>
                        </div>
                        <div className="flex flex-col items-center">
                           <div className="text-[8px] text-gray-500 uppercase">DEF</div>
                           <div className="text-sm font-mono text-white font-bold">{(engineState.player?.def || 0) + (engineState.player?.equipment?.armor?.defense_bonus || 0)}</div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-1 items-center">
                    <div className="text-[10px] text-blue-400 font-bold uppercase opacity-50 tracking-tighter">Active Gear</div>
                    <div className="flex gap-2">
                       <div className="w-8 h-8 rounded border border-white/5 bg-black/20 flex items-center justify-center" title="Weapon">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: db["data/items.bejson"]?.Values?.find((i:any) => i[0] === engineState.player?.equipment?.weapon?.item_id)?.[4] || '#333' }}></div>
                       </div>
                       <div className="w-8 h-8 rounded border border-white/5 bg-black/20 flex items-center justify-center" title="Armor">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: db["data/items.bejson"]?.Values?.find((i:any) => i[0] === engineState.player?.equipment?.armor?.item_id)?.[4] || '#333' }}></div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 w-full flex items-center justify-between px-6">
                <div 
                  className="w-32 h-32 rounded-full border-8 border-black/40 bg-gray-900/50 backdrop-blur pointer-events-auto relative touch-none shadow-inner"
                  onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 border-2 border-white/20 absolute shadow-lg transition-transform duration-75 flex items-center justify-center" style={{ top: '50%', left: '50%', transform: `translate(calc(-50% + ${joystickOffset.x}px), calc(-50% + ${joystickOffset.y}px))` }}>
                    <div className="w-3 h-3 rounded-full bg-gray-600/20"></div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-gray-600/30 font-bold text-[8px]">▲</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-gray-600/30 font-bold text-[8px]">▼</div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-gray-600/30 font-bold text-[8px]">◀</div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-gray-600/30 font-bold text-[8px]">▶</div>
                </div>

                <div className="flex flex-col gap-4 items-center">
                  <div className="flex gap-2 relative">
                    <button className="w-12 h-12 rounded-full bg-blue-600 border-4 border-blue-800/50 text-white font-bold shadow-xl active:bg-blue-500 active:scale-90 transition-all flex items-center justify-center pointer-events-auto touch-none translate-y-6" onPointerDown={(e) => handleButton('KeyC', true, e)} onPointerUp={(e) => handleButton('KeyC', false, e)} onPointerCancel={(e) => handleButton('KeyC', false, e)}>
                       <span className="text-lg drop-shadow-md">C</span>
                    </button>
                    <button className="w-14 h-14 rounded-full bg-yellow-600 border-4 border-yellow-800/50 text-white font-bold shadow-xl active:bg-yellow-500 active:scale-90 transition-all flex items-center justify-center pointer-events-auto touch-none translate-y-2" onPointerDown={(e) => handleButton('KeyB', true, e)} onPointerUp={(e) => handleButton('KeyB', false, e)} onPointerCancel={(e) => handleButton('KeyB', false, e)}>
                       <span className="text-xl drop-shadow-md">B</span>
                    </button>
                    <button className="w-14 h-14 rounded-full bg-red-600 border-4 border-red-800/50 text-white font-bold shadow-xl active:bg-red-500 active:scale-90 transition-all flex items-center justify-center pointer-events-auto touch-none" onPointerDown={(e) => handleButton('Space', true, e)} onPointerUp={(e) => handleButton('Space', false, e)} onPointerCancel={(e) => handleButton('Space', false, e)}>
                       <span className="text-xl drop-shadow-md">A</span>
                    </button>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                     <div className="flex flex-col items-center gap-1">
                        <button className="w-12 h-4 bg-gray-800 rounded-full border border-black/40 active:bg-gray-700 pointer-events-auto touch-none shadow-inner" onPointerDown={(e) => handleButton('Select', true, e)} onPointerUp={(e) => handleButton('Select', false, e)}></button>
                        <span className="text-[7px] text-gray-500 font-bold uppercase tracking-tighter">Select</span>
                     </div>
                     <div className="flex flex-col items-center gap-1">
                        <button className="w-12 h-4 bg-gray-800 rounded-full border border-black/40 active:bg-gray-700 pointer-events-auto touch-none shadow-inner" onPointerDown={(e) => handleButton('Start', true, e)} onPointerUp={(e) => handleButton('Start', false, e)}></button>
                        <span className="text-[7px] text-gray-500 font-bold uppercase tracking-tighter">Start</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="text-[8px] text-gray-600 font-mono mt-2 tracking-widest opacity-40">DOT MATRIX LANDSCAPE • NINTENDO COMPATIBLE</div>
            </div>
            </div>
          </div>
        </>
      )}
        <div className="absolute left-2 bottom-2 md:left-4 md:bottom-4 text-[10px] text-gray-500 font-mono z-10 bg-black/60 px-2 py-1 rounded backdrop-blur max-w-[80vw] truncate">Click canvas to focus &bull; WASD/Arrows: Move &bull; SPACE: Attack &bull; R: Heal</div>
      </div>
    </div>
  );
}

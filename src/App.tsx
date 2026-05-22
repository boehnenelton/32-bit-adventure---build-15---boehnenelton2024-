import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { GameCanvas } from './components/GameCanvas';
import { MapEditor } from './components/MapEditor';
import { CharacterEditor } from './components/CharacterEditor';
import { AssetManager } from './components/AssetManager';
import { generateMFDB } from './data/initialData';

import { Changelog } from './components/Changelog';

const engineFiles = (import.meta as any).glob('/src/game/vanilla/**/*.js', { as: 'raw', eager: true });

export default function App() {
  const [activeTab, setActiveTab] = useState<'play' | 'map' | 'character' | 'assets' | 'changelog'>('play');
  const [db, setDb] = useState(() => generateMFDB());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleExportZip = async () => {
    const zip = new JSZip();
    
    // Create MFDB Data
    zip.file("data/mfdb.json", JSON.stringify(db, null, 2));

    // Create Vanilla JS Engine Files
    for (const [path, content] of Object.entries(engineFiles)) {
        const relativePath = path.replace('/src/game/vanilla/', '');
        // Add .js extension to relative imports for standalone browser usage
        let code = content as string;
        
        // Handle relative paths (e.g. './file', '../file')
        code = code.replace(/(from\s+['"])(\.[^'"]+)(['"])/g, (match, p1, p2, p3) => {
            const ext = p2.endsWith('.js') ? '' : '.js';
            return `${p1}${p2}${ext}${p3}`;
        });
        code = code.replace(/(import\s+['"])(\.[^'"]+)(['"])/g, (match, p1, p2, p3) => {
            const ext = p2.endsWith('.js') ? '' : '.js';
            return `${p1}${p2}${ext}${p3}`;
        });
        
        zip.file(`js/engine/${relativePath}`, code);
    }
    
    // Create Entry index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sword Slasher Engine</title>
    <style>
        body { margin: 0; background: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
        canvas { border: 2px solid #333; image-rendering: pixelated; }
        #log { margin-top: 10px; font-family: monospace; color: #888; }
    </style>
</head>
<body>
    <h2>Slasher Engine (Vanilla JS)</h2>
    <canvas id="vanilla-canvas" width="640" height="480"></canvas>
    <div id="log">Loading game...</div>
    <script type="module">
        import { VanillaGame } from './js/engine/bejson_game.js';
        
        async function boot() {
            try {
                const response = await fetch('./data/mfdb.json');
                const mfdb = await response.json();
                
                document.getElementById('log').innerText = 'Game loaded! Use W/A/S/D to move, Space to attack.';
                
                const engine = new VanillaGame('vanilla-canvas', mfdb);
            } catch (err) {
                document.getElementById('log').innerText = 'Error loading MFDB: ' + err.message + ' (Make sure you use a local web server, not file:// protocol!)';
                console.error(err);
            }
        }
        boot();
    </script>
</body>
</html>`;
    
    zip.file("index.html", indexHtml);
    
    zip.file("README.md", "Slasher Engine - Vanilla JS Build\n\nRun this folder in a local web server (e.g. \`npx serve\` or \`python -m http.server\`) to see the game in action! The data folder contains the MFDB.\n\n");
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "sword slasher standalone 131.zip");
  };

  const handleExportFullBundle = async () => {
    const keySuffix = "131"; // Project Key Suffix
    const zip = new JSZip();
    const rootFolder = zip.folder(`SwordSlasher_Build_${keySuffix}`);
    if (!rootFolder) return;
    
    // 1. Data Layer: Individual files for the Asset Manager / Editor
    const assetsFolder = rootFolder.folder("assets");
    if (assetsFolder) {
        Object.entries(db).forEach(([path, content]) => {
            assetsFolder.file(path, JSON.stringify(content, null, 2));
        });
    }

    // 2. Engine Layer: Standalone Player
    const engineJSFolder = rootFolder.folder("js/engine");
    if (engineJSFolder) {
        for (const [path, content] of Object.entries(engineFiles)) {
            const relativePath = path.replace('/src/game/vanilla/', '').replace(/\.ts$/, '.js');
            let code = content as string;
            
            code = code.replace(/(from\s+['"])(\.[^'"]+)(['"])/g, (match, p1, p2, p3) => {
                const ext = p2.endsWith('.js') ? '' : '.js';
                return `${p1}${p2}${ext}${p3}`;
            });
            code = code.replace(/(import\s+['"])(\.[^'"]+)(['"])/g, (match, p1, p2, p3) => {
                const ext = p2.endsWith('.js') ? '' : '.js';
                return `${p1}${p2}${ext}${p3}`;
            });
            
            engineJSFolder.file(relativePath, code);
        }
    }

    // Single MFDB for the player
    rootFolder.file("data/mfdb.json", JSON.stringify(db, null, 2));

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>32-Bit Adventure - Build ${keySuffix}</title>
    <style>
        body { margin: 0; background: #020617; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Courier New', Courier, monospace; overflow: hidden; }
        canvas { border: 4px solid #1e293b; image-rendering: pixelated; box-shadow: 0 20px 50px rgba(0,0,0,0.5); background: #000; max-width: 95vw; max-height: 80vh; }
        #ui { margin-top: 20px; text-align: center; }
        .badge { background: #1e293b; padding: 4px 12px; rounded: 4px; color: #4ade80; border: 1px solid #334155; font-size: 12px; letter-spacing: 1px; }
        #error { color: #f87171; margin-top: 10px; font-size: 11px; display: none; max-width: 400px; }
    </style>
</head>
<body>
    <canvas id="game-canvas" width="640" height="480"></canvas>
    <div id="ui">
        <div class="badge">ORIGIN: SWORD-SLASHER-131</div>
        <div id="error"></div>
    </div>

    <script type="module">
        import { VanillaGame } from './js/engine/bejson_game.js';
        
        async function start() {
            try {
                const response = await fetch('./data/mfdb.json');
                if (!response.ok) throw new Error('Failed to load data. Make sure you are running via a web server (http://).');
                const mfdb = await response.json();
                window.game = new VanillaGame('game-canvas', mfdb);
                console.log("Game Engine Initialized.");
            } catch (err) {
                console.error(err);
                const errEl = document.getElementById('error');
                errEl.style.display = 'block';
                errEl.innerHTML = "<b>CRITICAL ERROR:</b> " + err.message + "<br><br>Browser security restricts loading local files directly via file://. Please use a local server like 'npx serve' or similar.";
            }
        }
        start();
    </script>
</body>
</html>`;
    
    rootFolder.file("index.html", indexHtml);
    rootFolder.file("project_manifest.txt", `Project: 32-Bit Adventure\nOrigin Key: SWORD-SLASHER-ORIGIN-${keySuffix}\nExport Date: ${new Date().toLocaleString()}\nStructure: Unified Standard v3`);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `SWORD_SLASHER_BUNDLE_${keySuffix}.zip`);
  };

  const navButtons = [
    { id: 'play', title: 'Play Game', icon: '▶', color: 'text-green-500', activeBorder: 'border-green-500' },
    { id: 'map', title: 'Map Editor', icon: '🗺️', color: 'text-blue-400', activeBorder: 'border-blue-500' },
    { id: 'character', title: 'Character Editor', icon: '👤', color: 'text-red-500', activeBorder: 'border-red-500' },
    { id: 'assets', title: 'Asset Manager', icon: '📁', color: 'text-yellow-500', activeBorder: 'border-yellow-500' },
    { id: 'changelog', title: 'About & Logs', icon: '📝', color: 'text-purple-500', activeBorder: 'border-purple-500' }
  ] as const;

  return (
    <div className="flex h-screen bg-transparent font-sans text-gray-300 overflow-hidden select-none">
      <div className="w-full h-12 ui-panel sm:hidden flex items-center justify-between px-4 fixed top-0 left-0 z-50 rounded-none border-x-0 border-t-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/50">32</div>
          <span className="font-bold text-sm tracking-tight text-white drop-shadow">SWORD SLASHER</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 sm:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <div className={`fixed sm:relative top-12 sm:top-0 left-0 h-[calc(100vh-3rem)] sm:h-full w-60 ui-panel rounded-none border-y-0 border-l-0 flex flex-col shrink-0 z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
        <div className="p-4 border-b border-white/10 hidden sm:block">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-blue-700 to-blue-400 border border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)] rounded flex items-center justify-center font-black text-white text-xs">32</div>
            <span className="font-bold text-[15px] tracking-tight text-white drop-shadow-md">SWORD SLASHER</span>
          </div>
          <p className="text-[10px] text-blue-300 mt-2 font-mono uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">MFDB v1.31 Architecture</p>
        </div>

        <nav className="flex-1 p-2 flex flex-col gap-1 text-xs overflow-y-auto">
          <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/10 mb-2 mt-2">Workspaces</div>
          {navButtons.map(({ id, title, icon, color, activeBorder }) => (
            <button
              key={id} 
              onClick={() => { setActiveTab(id as any); setIsSidebarOpen(false); }}
              className={`p-2 text-left rounded cursor-pointer flex items-center gap-3 font-bold transition-all ${activeTab === id ? `bg-blue-900/30 text-blue-300 border-l-4 border-blue-400 rounded-l-none shadow-[0_0_15px_rgba(96,165,250,0.1)]` : 'text-gray-400 hover:bg-white/5'}`}
            >
              <span className={`${color} text-sm`}>{icon}</span> {title}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 flex flex-col gap-2">
          <button 
            onClick={handleExportFullBundle}
            className="w-full h-8 bg-green-600 hover:bg-green-500 flex items-center justify-center rounded text-[11px] font-bold text-white cursor-pointer transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] gap-2 border border-green-400 active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-bounce"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            EXPORT FULL BUNDLE
          </button>
          <button 
            onClick={handleExportZip}
            className="w-full h-8 bg-blue-600 hover:bg-blue-500 flex items-center justify-center rounded text-[11px] font-bold text-white cursor-pointer transition-all shadow-[0_0_10px_rgba(96,165,250,0.5)] gap-2 border border-blue-400 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            EXPORT STANDALONE
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-transparent flex flex-col pt-12 sm:pt-0">
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'play' && <GameCanvas db={db} setDb={setDb} />}
          {activeTab === 'map' && <MapEditor db={db} setDb={setDb} />}
          {activeTab === 'character' && <CharacterEditor db={db} setDb={setDb} />}
          {activeTab === 'assets' && <AssetManager db={db} setDb={setDb} />}
          {activeTab === 'changelog' && <Changelog />}
        </div>
        
        <footer className="h-8 ui-panel rounded-none border-x-0 border-b-0 hidden sm:flex items-center justify-between px-3 text-[10px] font-mono text-gray-400 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span><span className="text-gray-300">MFDB v1.31 Linked</span></div>
            <div className="text-blue-400 cursor-pointer">Live Preview Synced</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">UTF-8</span>
            <span className="text-blue-400 font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">32-BIT MODE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

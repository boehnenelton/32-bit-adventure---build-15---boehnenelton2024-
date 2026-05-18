import React from 'react';

export function Changelog() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0a0c]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="border-b border-white/10 pb-6">
          <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <span className="text-purple-500 text-3xl">📝</span>
            About & Changelog
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-mono">System Information & Version History</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="ui-panel p-4 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Game Engine Version</span>
            <span className="text-lg font-mono text-green-400 font-bold drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]">v1.126.0</span>
          </div>
          <div className="ui-panel p-4 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Editors Version</span>
            <span className="text-lg font-mono text-blue-400 font-bold drop-shadow-[0_0_5px_rgba(96,165,250,0.3)]">v1.126.0</span>
          </div>
          <div className="ui-panel p-4 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">MFDB Specification</span>
            <span className="text-lg font-mono text-yellow-400 font-bold drop-shadow-[0_0_5px_rgba(250,204,21,0.3)]">v1.5.1</span>
          </div>
          <div className="ui-panel p-4 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">BEJSON Library</span>
            <span className="text-lg font-mono text-pink-400 font-bold drop-shadow-[0_0_5px_rgba(244,114,182,0.3)]">v1.3.3</span>
          </div>
          <div className="ui-panel p-4 flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Relational Identity String</span>
            <span className="text-sm font-mono text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">ID: sword_slasher/126 (System Branding & Sync)</span>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider border-l-4 border-purple-500 pl-3">Recent Changes</h2>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 2.2.0 (Build 126 Branding & Export Sync)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Branding Alignment:</b> Unified "Sword Slasher" naming across <code>metadata.json</code>, <code>package.json</code>, and UI.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Meta Description:</b> Updated project metadata with detailed engine capability summary for export.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Build 126:</b> Global version bump to v1.126.0 for production readiness.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 2.1.0 (Build 125 Expanded Tabs & Filtering)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Category-Specific Tabs:</b> Expanded inventory to include dedicated Armor, Consumable, and Quest tabs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Horizontal Scrolling:</b> Implemented touch-safe horizontal scrolling for the menu navigation bar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">●</span>
                <span><b>Context-Aware Filtering:</b> Selection bounds and navigation now strictly respect the active category tab.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Build 125:</b> Evolutionary bump to v1.125.0.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 2.0.0 (Build 124 Dual-Slot Gear & Tabs)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Dual Action Slots:</b> Separated Gear into Sword (A) and Tool (C) slots for ALttP-style combat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Tabbed Inventory:</b> Redesigned Item Menu with dedicated tabs for Swords and Utilities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">●</span>
                <span><b>HUD Refresh:</b> Status bar now displays both equipped slots with primary/secondary labels.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Build 124:</b> Milestone bump to v1.124.0.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.9.5 (Build 123 Telegraph AI & Visuals)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Zelda-Style State Machine:</b> Implemented Idle → Windup → Charge → Cooldown cycles for all enemies.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Visual Telegraphing:</b> Added a high-contrast flashing effect during the 'Windup' phase to signal imminent attacks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">●</span>
                <span><b>Blind Charging:</b> Enemies now lock into a trajectory at the end of windup, allowing players to sidestep attacks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Build 123:</b> Evolutionary bump to v1.123.0 for advanced combat mechanics.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.9.0 (Build 122 AI & Silhouettes)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Prefix-Based AI:</b> Engine now uses <code>startsWith('npc')</code> and <code>startsWith('enemy')</code> for flexible actor classification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Shadow Silhouettes:</b> Integrated gray placeholder silhouettes using the engine's <code>fallback_color</code> system.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Build 122:</b> Evolutionary bump to v1.122.0.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.8.5 (Build 121 Physics & Depth)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Actor Collision:</b> Implemented <code>checkActorCollision</code> to prevent characters from walking through each other.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Y-Sorting (2.5D Depth):</b> Actors are now sorted by Y-axis before drawing, ensuring correct visual overlap perspective.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Build 121:</b> Full system bump to v1.121.0 for enhanced game physics.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.8.0 (Build 120 PNG Integration)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Manual Sprite Injection:</b> Successfully integrated user-provided PNG Base64 strings for 'npc_generic_1' (Front/Back).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Asset Manifest Sync:</b> Registered npc_generic_1 in MFDB and ActorStats for immediate use in the Map Editor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Build 120:</b> Version bumped across all systems to 1.120.0.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.7.0 (Build 118 PNG Sprites)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>PNG Sprite System:</b> Integrated 2 high-fidelity base sprites from the user, expanded into 10 unique templates via SVG palette-swapping (Hue shift).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Palette Swapping Engine:</b> Real-time generation of distinctive NPCs through dynamic SVG color transformation filters.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Build 118:</b> Bumped version to 1.118.0 across all manifests and engines.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.6.9 (Build 117 Foundation)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Build 116 Transition:</b> Formally migrated all project keys, relational identity strings, and export manifests to the logic series of Build 116.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Standalone Packaging:</b> Verified standalone ZIP and Pro Bundle exports align with the 116 naming conventions for multi-state compatibility.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.6.8 (BEJSON Utility Integration)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Multi-Version Matrix:</b> Integrated BEJSON Utility v1.3.1 into the Asset Manager, enabling "Project Snapshots" within a single multi-record BEJSON document.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Bulk Package Recovery:</b> Added support for importing and exporting <code>.bejson</code> project matrices, allowing for instant rollback and multi-state testing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Snapshot Metadata:</b> Snapshots now track version labels, timestamps, and change notes internally using the relational BEJSON schema.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.6.6 (Identity & BEJSON Sync)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Decoupled Hero Identity:</b> Sourced "boehnenelton2024" and other actor names directly from <code>data/actor.bejson</code> instead of hardcoding.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Dynamic Schema Lookup:</b> Implemented field-index discovery in the engine bootstrap, enabling reactive HUD updates based on the current MFDB state.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.6.5 (Corrected C-B-A Layout)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Far-Left C Button:</b> Relocated the C button to the far left of the action pad, ensuring it no longer interferes with the central B button or the right-side A button.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Nintendo Standard Alignment:</b> Locked in the classic hand-held arrangement: C (Left), B (Center), A (Right), respecting the ergonomic and functional intent of 90s era controllers.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.6.4 (Nintendo Standard Controls)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Classic A/B Position Swapping:</b> Reconfigured the virtual control pad to follow the Nintendo standard: A is on the right, B is on the left. This provides more intuitive muscle memory for platform and adventure gameplay.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Ergonomic Button Slant:</b> Adjusted the vertical offsets of the A and B buttons to match the slight diagonal alignment characteristic of vintage handheld consoles.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.6.2 (Hitbox & Collision)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Hitbox Margin:</b> Implemented a 6-pixel forgiveness margin on the player hitbox. This allows for smoother movement around corners and easier access through narrow one-tile passages (like the portal entrance).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Collision Refinement:</b> Improved the <code>checkTileCollision</code> math to use shrunken bounds, enabling a subtle 2.5D depth illusion where the character can slightly overlap the base of wall tiles.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.6.1 (Spawn & Stability)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Spawn Safety:</b> Relocated the initial player spawn in the village to a guaranteed clear stone path. This eliminates the 50% chance of spawning inside an apple tree.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Project Ascension 006:</b> Updated relational identifiers and build keys to Build 006.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.6.0 (GameBoy Portrait)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Vertical Split Layout:</b> Redesigned the entire game UI to follow a classic handheld portrait orientation. The top 60% of the screen is dedicated to the game viewport and menus, while the bottom 40% houses a tactile control pad.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Engine Aspect Ratio Support:</b> Upgraded <code>Engine.ts</code> to support a dynamic "Screen Height" clipping region. The camera now centers correctly within the top playable area, preventing the HUD from overlapping the game world.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Optimized Touch Controls:</b> Repositioned virtual joystick and action buttons (A, B, C) into a natural "Control Pad" area at the bottom of the screen, optimized for mobile handheld play.</span>
              </li>
            </ul>
          </div>
          
          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.5.0 (Combat & Equipment)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Tiered Combat Formula:</b> Implemented a sophisticated damage calculation that accounts for weapon tiers, armor mitigation (60%), critical hits (10% chance), and level advantage bonuses.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Relational Assets:</b> Updated the <code>items.bejson</code> schema to support 4 tiers of swords and armor, fully integrated into the combat loop and equipment UI.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Project Ascension 004:</b> Successfully updated all metadata and project keys to the 004 series.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.3.4 (Editors)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Unified Bundle Export:</b> Restructured the Pro Bundle export to use a single unified project folder within the ZIP. This places the <code>index.html</code> at the root of the project, making it much easier to boot and play.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Runtime Safety:</b> Added explicit error messaging to the exported bundles to guide users on browser security constraints (CORS/file protocol) when running locally.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.3.3 (Editors)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Project Ascension:</b> Officially migrated the project core to <b>Build 116</b>. All export manifests and runtime identity strings now reflect the new 116 versioning scheme.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.3.2 (Editors)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span><b>Unified Project Bundle:</b> Restructured "Full Export" to be editor-native. You can now drop a project ZIP back into the Asset Manager and it will automatically map files to their correct folders (assets/data/events).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Auto-Rehydration:</b> Import logic now intelligently strips folder prefixes (like engine_116/) to prevent path corruption.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.3.1 (Editors)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Pro Bundle Export:</b> Added a high-fidelity export option that packages the engine and assets into specialized folders (e.g., <code>assets_116</code> and <code>engine_116</code>) within a single ZIP.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span>The ZIP is dynamically named (e.g., <code>sword_slasher/116.zip</code>) based on the project key suffix for easier version management.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.3.0 (Editors)</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Asset Portability:</b> Added specialized Export and Import functions to the Asset Manager.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span>Supports exporting assets as a ZIP bundle or importing via ZIP/JSON, enabling easy transfer of character sprites and tiles between projects.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.4.2</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span><b>Data-Driven Victory:</b> Removed hardcoded Victory conditions. Rules are now defined entirely in level assets (MFDB).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span><b>Critical Sprite Bridge:</b> Fixed an asset registry mismatch where `Asset*` type records weren't recognized by the engine bootstrap, leading to invisible maps.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">●</span>
                <span>Fixed victory state triggering in safe village levels by adding `victory_condition` support.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.4.0</h3>
              <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span>Added relational identification strings for version tracking and future fork compatibility.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span>Added biome system to object schemas and level metadata.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">●</span>
                <span>Enhanced map editor to support object/actor placement.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">●</span>
                <span>Added inventory menu and item usage logic.</span>
              </li>
            </ul>
          </div>

          <div className="ui-panel p-5 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">Update 1.3.1</h3>
              <span className="text-xs font-mono text-gray-500">2026-05-10</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">●</span>
                <span>Created Changelog / About section for better version tracking.</span>
              </li>
               <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                <span>Decoupled BEJSON library into modular files.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">●</span>
                <span>Configured build system to output standalone switch_*.js files.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">●</span>
                <span>Implemented basic ChunkManager for streaming tile chunks.</span>
              </li>
            </ul>
          </div>

        </section>
      </div>
    </div>
  );
}

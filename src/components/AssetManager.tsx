import React, { useState, useMemo, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  bejson_utility_init_project_db, 
  bejson_utility_snapshot_project, 
  bejson_utility_restore_version,
  BEJSONDocument 
} from '../utils/bejson_utility';

type TreeNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: Record<string, TreeNode>;
};

export function AssetManager({ db, setDb }: { db: any, setDb: (db: any) => void }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'data': true, 'assets': true, 'events': true });
  const [bejsonMatrix, setBejsonMatrix] = useState<BEJSONDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const matrixInputRef = useRef<HTMLInputElement>(null);

  const handleExportAssets = async () => {
    const zip = new JSZip();
    const assetsOnly: Record<string, any> = {};
    let count = 0;
    
    Object.keys(db).forEach(key => {
      if (key.startsWith('assets/')) {
        assetsOnly[key] = db[key];
        zip.file(key, JSON.stringify(db[key], null, 2));
        count++;
      }
    });

    if (count === 0) {
      alert("No files found in 'assets/' folder.");
      return;
    }

    zip.file("assets_bundle.json", JSON.stringify(assetsOnly, null, 2));
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'game_assets_export.zip');
  };

  const handleImportAssets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') return;

        try {
          const imported = JSON.parse(content);
          if (typeof imported === 'object' && imported !== null) {
             setDb({ ...db, ...imported });
             alert('Assets imported successfully from JSON!');
             return;
          }
        } catch (err) {
          if (file.name.endsWith('.zip')) {
              const zip = await JSZip.loadAsync(file);
              const newAssets: Record<string, any> = {};
              let importCount = 0;

              const bundleFile = zip.file("assets_bundle.json");
              if (bundleFile) {
                  const bundleContent = await bundleFile.async("string");
                  const bundleJson = JSON.parse(bundleContent);
                  setDb({ ...db, ...bundleJson });
                  alert('Assets imported from ZIP bundle!');
                  return;
              }

              const files = Object.keys(zip.files);
              for (const path of files) {
                  const entry = zip.files[path];
                  if (!entry.dir && (path.endsWith('.bejson') || path.endsWith('.json'))) {
                      let targetKey = path;
                      const markers = ['assets/', 'data/', 'events/'];
                      for (const marker of markers) {
                          const index = path.indexOf(marker);
                          if (index !== -1) {
                              targetKey = path.substring(index);
                              break;
                          }
                      }

                      const fileContent = await entry.async("string");
                      try {
                          newAssets[targetKey] = JSON.parse(fileContent);
                          importCount++;
                      } catch (e) {
                          console.error(`Failed to parse ${path}:`, e);
                      }
                  }
              }

              if (importCount > 0) {
                  setDb({ ...db, ...newAssets });
                  alert(`Imported ${importCount} files from ZIP!`);
              } else {
                  alert('No compatible files found in ZIP.');
              }
          } else {
            alert('Cloud not parse file. Use .json or .zip export.');
          }
        }
      } catch (err) {
        console.error(err);
        alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  const handleCreateSnapshot = () => {
    const versionLabel = prompt("Enter version label (e.g. 1.0.1):", "1.116.0");
    if (!versionLabel) return;
    const notes = prompt("Enter version notes:", "Standard backup");
    const changes = prompt("Enter changes summary:", "Synced from Editor");

    let matrix = bejsonMatrix;
    if (!matrix) {
        matrix = bejson_utility_init_project_db("SwordSlasher");
    }

    const updatedMatrix = bejson_utility_snapshot_project({...matrix}, db, versionLabel, notes || "", changes || "");
    setBejsonMatrix(updatedMatrix);
    alert(`Snapshot '${versionLabel}' created in matrix!`);
  };

  const handleDownloadMatrix = () => {
    if (!bejsonMatrix) {
        alert("No matrix created yet. Take a snapshot first!");
        return;
    }
    const blob = new Blob([JSON.stringify(bejsonMatrix, null, 2)], { type: 'application/json' });
    saveAs(blob, 'project_matrix_backup.bejson');
  };

  const handleImportMatrix = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const content = event.target?.result as string;
            const matrix = JSON.parse(content);
            if (matrix.Format === "BEJSON" && matrix.Records_Type.includes("Snapshot")) {
                setBejsonMatrix(matrix);
                alert("BEJSON Matrix imported successfully!");
            } else {
                alert("Invalid BEJSON Matrix format.");
            }
        } catch (err) {
            alert("Failed to parse matrix file.");
        }
    };
    reader.readAsText(file);
  };

  const snapshots = useMemo(() => {
    if (!bejsonMatrix) return [];
    const fields = bejsonMatrix.Fields.map(f => f.name);
    const labelIdx = fields.indexOf("version_label");
    const timestampIdx = fields.indexOf("timestamp");
    const notesIdx = fields.indexOf("version_notes");
    
    return bejsonMatrix.Values
        .filter(row => row[0] === "Snapshot")
        .map(row => ({
            label: row[labelIdx],
            timestamp: row[timestampIdx],
            notes: row[notesIdx]
        }));
  }, [bejsonMatrix]);

  const handleRestoreVersion = (label: string) => {
    if (!bejsonMatrix) return;
    if (confirm(`Restore project to version ${label}? All current unsaved changes will be lost.`)) {
        try {
            const restored = bejson_utility_restore_version(bejsonMatrix, label);
            setDb(restored);
            alert(`Project restored to version ${label}!`);
        } catch (err) {
            alert("Restore failed: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    }
  };

  const tree = useMemo(() => {
    const root: TreeNode = { name: 'root', path: '', type: 'folder', children: {} };
    Object.keys(db).forEach(filename => {
      const parts = filename.split('/');
      let current = root;
      parts.forEach((part, i) => {
        if (!current.children) current.children = {};
        if (i === parts.length - 1) {
          current.children[part] = { name: part, path: filename, type: 'file' };
        } else {
          if (!current.children[part]) {
            current.children[part] = { name: part, path: parts.slice(0, i + 1).join('/'), type: 'folder', children: {} };
          }
          current = current.children[part];
        }
      });
    });
    return root;
  }, [db]);

  const handleSelectFile = (filename: string) => {
    setSelectedFile(filename); setFileContent(JSON.stringify(db[filename], null, 2));
  };
  const handleSave = () => { try { setDb({ ...db, [selectedFile!]: JSON.parse(fileContent) }); } catch (e) { alert('Invalid JSON!'); } };
  const handleDelete = () => { if (confirm(`Delete ${selectedFile}?`)) { const newDb = { ...db }; delete newDb[selectedFile!]; setDb(newDb); setSelectedFile(null); } };
  
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (node: TreeNode, depth = 0) => {
    if (node.type === 'file') {
      if (searchQuery && !node.path.toLowerCase().includes(searchQuery.toLowerCase())) return null;
      return (
        <button key={node.path} onClick={() => handleSelectFile(node.path)} className={`w-full text-left px-3 py-1.5 text-xs font-mono rounded-md transition-all flex items-center gap-2 ${selectedFile === node.path ? 'bg-blue-900/40 text-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.2)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`} style={{ paddingLeft: `${depth * 12 + 12}px` }}>
          <span className="text-gray-500">📄</span> <span className="truncate">{node.name}</span>
        </button>
      );
    } else {
      const isExpanded = expandedFolders[node.path];
      const childrenNodes = Object.values(node.children || {}).map(c => renderTree(c, depth + 1)).filter(Boolean);
      if (searchQuery && childrenNodes.length === 0) return null;
      if (node.name === 'root') return childrenNodes;
      return (
        <div key={node.path} className="flex flex-col w-full">
          <button onClick={() => toggleFolder(node.path)} className="w-full text-left px-3 py-1.5 text-xs font-mono rounded-md transition-all text-gray-300 hover:bg-white/5 flex items-center gap-2" style={{ paddingLeft: `${depth * 12 + 12}px` }}>
             <span>{isExpanded ? '📂' : '📁'}</span>
             <span className="font-bold">{node.name}</span>
          </button>
          {isExpanded && childrenNodes}
        </div>
      );
    }
  };

  return (
    <div className="flex relative h-full bg-transparent p-2 sm:p-4 gap-4 overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleImportAssets} className="hidden" accept=".json,.zip" />
      <input type="file" ref={matrixInputRef} onChange={handleImportMatrix} className="hidden" accept=".bejson,.json" />
      
      {/* File Browser Sidebar */}
      <div className={`absolute sm:relative inset-0 sm:inset-auto z-10 sm:z-0 w-full sm:w-64 ui-panel sm:rounded-xl flex flex-col shrink-0 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-transform duration-300 ${selectedFile ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'}`}>
        <div className="p-3 text-[10px] uppercase font-bold text-blue-300 border-b border-white/10 tracking-widest bg-black/20 flex items-center justify-between">
            <span>Asset Browser</span>
            <div className="flex gap-2">
                <button onClick={handleExportAssets} className="hover:text-white transition-colors" title="Export Assets">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="hover:text-white transition-colors" title="Import Assets">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </button>
            </div>
        </div>
        <div className="p-3 border-b border-white/10"><input type="text" placeholder="Search files..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded px-3 py-1.5 outline-none text-xs focus:border-blue-400 transition-colors shadow-inner" /></div>
        <div className="flex-1 overflow-y-auto p-2 pb-16 sm:pb-2">
          {renderTree(tree)}
        </div>
      </div>

      {/* Editor View / Matrix Manager */}
      <div className={`absolute sm:relative inset-0 sm:inset-auto z-10 sm:z-0 flex-1 flex flex-col ui-panel sm:rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-transform duration-300 ${selectedFile || snapshots.length > 0 ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}`}>
        {selectedFile ? (
           <>
             <div className="flex bg-black/20 h-12 px-2 sm:px-4 items-center justify-between border-b border-white/10 relative">
                <div className="flex items-center gap-2 max-w-[50%] sm:max-w-none">
                    <button onClick={() => setSelectedFile(null)} className="sm:hidden p-2 text-gray-400 hover:text-white" aria-label="Back to files">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <span className="text-xs sm:text-sm font-mono text-white text-blue-100 truncate">{selectedFile.split('/').pop()}</span>
                    <span className="text-[10px] text-gray-500 hidden md:inline ml-2 truncate">({selectedFile})</span>
                </div>
                <div className="flex gap-2 sm:gap-3 shrink-0">
                   <button onClick={handleSave} className="px-2 sm:px-4 py-1.5 bg-green-500/20 text-green-400 rounded-md text-[10px] uppercase font-bold border border-green-500/30 hover:bg-green-500/30 transition-all hover:shadow-[0_0_10px_rgba(74,222,128,0.3)]">Save</button>
                   <button onClick={handleDelete} className="px-2 sm:px-4 py-1.5 bg-red-500/20 text-red-400 rounded-md text-[10px] uppercase font-bold border border-red-500/30 hover:bg-red-500/30 transition-all hover:shadow-[0_0_10px_rgba(248,113,113,0.3)]">Delete</button>
                </div>
             </div>
             <textarea value={fileContent} onChange={e => setFileContent(e.target.value)} className="flex-1 w-full bg-black/40 p-2 sm:p-4 font-mono text-xs sm:text-sm text-green-400 outline-none resize-none shadow-inner" spellCheck={false} />
           </>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">📦</span> BEJSON Matrix (Project Snapshots)
                </h3>
                <div className="flex gap-2">
                    <button onClick={handleCreateSnapshot} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)]">Take Snapshot</button>
                    <button onClick={handleDownloadMatrix} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-[10px] font-bold transition-all shadow-[0_0_10px_rgba(22,163,74,0.3)]">Export Matrix</button>
                    <button onClick={() => matrixInputRef.current?.click()} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold transition-all shadow-[0_0_10px_rgba(147,51,234,0.3)]">Import Matrix</button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {snapshots.length > 0 ? (
                    snapshots.map((snap, i) => (
                        <div key={i} className="ui-panel p-3 rounded-lg border-white/5 bg-white/2 hover:border-blue-500/30 transition-all group flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-mono font-bold border border-blue-500/30">v{snap.label}</span>
                                    <span className="text-xs font-bold text-gray-200">{snap.notes || "No notes"}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono">Captured: {new Date(snap.timestamp).toLocaleString()}</div>
                            </div>
                            <button 
                                onClick={() => handleRestoreVersion(snap.label)}
                                className="px-4 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded text-[10px] font-bold uppercase tracking-widest border border-blue-500/30 transition-all"
                            >
                                Restore
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="m-auto text-center flex flex-col items-center gap-4 text-gray-500 max-w-xs">
                        <div className="text-4xl opacity-20">🗄️</div>
                        <p className="text-xs font-mono">The BEJSON Utility allows you to pack entire project versions into a single multi-record JSON matrix. Ideal for bulk asset backups and rollback safety.</p>
                        <button onClick={handleCreateSnapshot} className="px-6 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold tracking-widest transition-all">CREATE YOUR FIRST SNAPSHOT</button>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

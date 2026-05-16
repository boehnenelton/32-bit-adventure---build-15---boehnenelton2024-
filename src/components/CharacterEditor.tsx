import React from 'react';

export function CharacterEditor({ db, setDb }: { db: any, setDb: (db: any) => void }) {
  const actorDb = db["data/actor.bejson"];
  const actors = actorDb?.Values || [];

  const updateActor = (indexInDb: number, fieldIndex: number, value: number | string) => {
    const newDb = { ...db };
    const newActorDb = { ...actorDb, Values: [...actorDb.Values] };
    const newRow = [...newActorDb.Values[indexInDb]];
    newRow[fieldIndex] = value;
    newActorDb.Values[indexInDb] = newRow;
    newDb["data/actor.bejson"] = newActorDb;
    setDb(newDb);
  };

  const updateStats = (actorType: string, fieldIndex: number, value: number) => {
    const newDb = { ...db };
    const statsDb = { ...db["data/actor_stats.bejson"], Values: [...db["data/actor_stats.bejson"].Values] };
    const rowIndex = statsDb.Values.findIndex((r: any) => r[0] === actorType);
    if(rowIndex !== -1) {
       const newRow = [...statsDb.Values[rowIndex]];
       newRow[fieldIndex] = value;
       statsDb.Values[rowIndex] = newRow;
       newDb["data/actor_stats.bejson"] = statsDb;
       setDb(newDb);
    }
  };

  const getStats = (actorType: string) => {
    return db["data/actor_stats.bejson"]?.Values?.find((r: any) => r[0] === actorType);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex ui-panel rounded-none border-x-0 border-t-0 border-b border-white/10 h-10 md:h-8 shrink-0">
        <div className="px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider border-r border-white/10 text-blue-300 flex items-center">Entity Configuration</div>
      </div>
      <div className="flex-1 game-viewport relative overflow-y-auto p-4 md:p-8">
        <div className="pixel-grid hidden md:block z-0"></div>
        <div className="atmosphere-glow z-0"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {actors.map((actor: any, dbIndex: number) => {
            const id = actor[0]; const type = actor[2];
            const statsDb = db["data/actor_stats.bejson"]?.Values || [];
            const typeStats = getStats(type);
            const maxHp = typeStats ? typeStats[1] : 0;
            const atk = typeStats ? typeStats[2] : 0;
            const def = typeStats ? typeStats[3] : 0;

            return (
              <div key={id} className="ui-panel border border-white/10 flex flex-col shrink-0 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-blue-300 border-b border-white/10 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-2 text-white">ID: {id}</div>
                  <select value={type} onChange={(e) => updateActor(dbIndex, 2, e.target.value)} className="bg-black/50 text-white border border-white/20 rounded px-2 outline-none text-xs h-6 hover:border-blue-400 transition-colors cursor-pointer">
                    {statsDb.map((stat: any) => <option key={stat[0]} value={stat[0]}>{stat[0]}</option>)}
                  </select>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Class Max Health</label>
                     <input type="number" value={maxHp} onChange={(e) => updateStats(type, 1, parseInt(e.target.value) || 0)} className="w-full bg-black/40 border border-white/10 text-green-400 font-mono rounded px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors shadow-inner" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Class Base Attack</label>
                     <input type="number" value={atk} onChange={(e) => updateStats(type, 2, parseInt(e.target.value) || 0)} className="w-full bg-black/40 border border-white/10 text-red-500 font-mono rounded px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors shadow-inner" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Class Base Defense</label>
                     <input type="number" value={def} onChange={(e) => updateStats(type, 3, parseInt(e.target.value) || 0)} className="w-full bg-black/40 border border-white/10 text-blue-400 font-mono rounded px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors shadow-inner" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

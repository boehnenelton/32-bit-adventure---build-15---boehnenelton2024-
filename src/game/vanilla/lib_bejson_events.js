/**
 * Library:      lib_bejson_events.js
 * Family:       Gaming
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Event-driven architecture for BEJSON entity interaction.
 */

'use strict';

class BEJSONEvents {
    constructor(game) {
        this.game = game;
    }

    async run(eventId) {
        if (!this.game.mfdb) return;
        const eventsDb = this.game.mfdb["data/events.bejson"]?.Values || [];
        const eventRecord = eventsDb.find(e => e[0] === eventId);
        
        if (eventRecord) {
            const scriptRaw = eventRecord[1];
            try {
                const script = typeof scriptRaw === 'string' ? JSON.parse(scriptRaw) : scriptRaw;
                if (!Array.isArray(script)) return;
                
                for (const cmd of script) {
                    const [action, ...args] = cmd;
                    switch (action) {
                        case 'DIALOG':
                            this.game.dialogText = args[0];
                            this.game.stateStatus = 'DIALOG';
                            break;
                        case 'SET_FLAG':
                            this.game.flags[args[0]] = args[1];
                            break;
                        case 'ADD_SCORE':
                            this.game.scoreValue += (args[0] || 0);
                            break;
                        case 'TELEPORT':
                            this.game.loadLevel(args[0], args[1] * this.game.tileSize, args[2] * this.game.tileSize);
                            break;
                    }
                }
            } catch (e) {
                console.error("Error executing script for event: " + eventId, e);
            }
        }
    }
}

export default BEJSONEvents;

if (typeof window !== 'undefined') {
    window.BEJSON_Events = BEJSONEvents;
}

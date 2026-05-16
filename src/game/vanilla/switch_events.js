/**
 * switch_events.js
 * game1 aka the BEJSON Game Engine (#1)
 * Author: Elton Boehnen: MFDB 1.3 Level 2 Event System (v1.0)
 * Date: 2026-05-03
 */

window.Switch = window.Switch || {};

class SwitchEvents {
    constructor(stateManager) {
        this.state = stateManager;
        if (stateManager.mfdb && stateManager.mfdb["data/events.bejson"]) {
            this.events = stateManager.mfdb["data/events.bejson"];
        } else {
            this.events = Switch.BEJSON.create104("Events", [
                { name: "id", type: "string" },
                { name: "type", type: "string" },
                { name: "x", type: "number" },
                { name: "y", type: "number" },
                { name: "script", type: "array" },
                { name: "condition", type: "string" }
            ], []);
            this.events.Parent_Hierarchy = "Root/System/Events";
        }
    }

    async run(eventId) {
        const ev = this.events.Values.find(v => v[0] === eventId);
        if (!ev) return;
        if (ev[5] && !this._checkCondition(ev[5])) return;
        for (const cmd of ev[4]) await this._execute(cmd);
    }

    _checkCondition(c) {
        if (c.startsWith("flag:")) return this.state.flags[c.split(":")[1]] === true;
        return true;
    }

    async _execute(cmd) {
        const [action, ...args] = cmd;
        if (action === "SET_FLAG") this.state.flags[args[0]] = args[1];
        if (action === "DIALOG" || action === "SET_DIALOG") {
            this.state.dialogText = args[0];
            this.state.stateStatus = 'DIALOG';
        }
    }
}

Switch.Events = SwitchEvents;
export default SwitchEvents;

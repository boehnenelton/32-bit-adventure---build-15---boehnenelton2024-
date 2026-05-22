import { VanillaGame } from './vanilla/bejson_game';

export class VanillaGameEngine {
    public canvas: HTMLCanvasElement;
    public mfdb: Record<string, any>;
    public engine: VanillaGame;
    
    constructor(canvas: HTMLCanvasElement, mfdb: Record<string, any>) {
        this.canvas = canvas;
        this.mfdb = mfdb;
        
        if (!canvas.id) canvas.id = 'vanilla-canvas';
        
        this.engine = new VanillaGame(canvas.id, mfdb);
    }

    get score() { return this.engine.scoreValue; }
    set score(v) { this.engine.scoreValue = v; }
    get state() { return this.engine.stateStatus; }
    set state(v) { this.engine.stateStatus = v; }
    get dialogText() { return this.engine.dialogText; }
    set dialogText(v) { this.engine.dialogText = v; }
    get player() { return this.engine.player; }
    get loadedImages() { return this.engine.loadedImages; }

    notifyPlayerChange() {
        this.engine.notifyPlayerChange();
    }

    handleInput(code: string, isDown: boolean) {
        // Fallback for passing React events directly into BejsonInput keys state
        // Map common e.code to e.key for BejsonInput bindings
        let key = code;
        if (code === 'KeyW') key = 'w';
        if (code === 'KeyA') key = 'a';
        if (code === 'KeyS') key = 's';
        if (code === 'KeyD') key = 'd';
        if (code === 'KeyC') key = 'c';
        if (code === 'KeyR') key = 'r';
        if (code === 'Space') key = ' ';
        this.engine.input._onKey({ key }, isDown);
        
        // Also feed raw code if any manual checks look for it
        this.engine.input.keys[code] = isDown;
    }

    serialize() { return this.engine.serialize(); }
    deserialize(data: string) { this.engine.deserialize(data); }

    destroy() {
        this.engine.destroy();
    }

    on(event: string, callback: Function) {
        this.engine.on(event, callback);
    }
}

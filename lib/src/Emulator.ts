export type WriteListener = (line: string) => void;
export type ExitListener = (code: number) => void;
export class Emulator {
    writeListeners: WriteListener[] = [];
    exitListeners: ExitListener[] = [];

    addWriteSystemCallListener(listener: WriteListener): void {
        this.writeListeners.push(listener);
    }

    addExitSystemCallListener(listener: ExitListener): void {
        this.exitListeners.push(listener);
    }

    onWrite(line: string): void {
        for (const listener of this.writeListeners) {
            listener(line);
        }
    }

    onExit(code: number): void {
        for (const listener of this.exitListeners) {
            listener(code);
        }
    }

    constructor() {
    }
}

export class ProcessEvent {
    protected constructor() {
    }

}

export class ProcessWriteEvent extends ProcessEvent {
    private _line: string;

    get line(): string {
        return this._line;
    }

    constructor(line: string) {
        super();
        this._line = line;
    }
}

export class ProcessExitEvent extends ProcessEvent {
    private _exitCode: number;
    get exitCode(): number {
        return this._exitCode;
    }

    constructor(exitCode: number) {
        super();
        this._exitCode = exitCode;
    }
}

export type ProcessEventListener = (event: ProcessEvent) => void;

export function doNothingProcessEventListener(event: ProcessEvent) {
}

import {ELF64} from './elf64';
import {Cpu} from './Cpu';
import {
  ProcessEvent,
  ProcessEventListener,
  ProcessExitEvent,
} from './ProcessEventListener';

export enum InstructionLineType {
  label,
  assembly,
}

export type InstructionLine = {
  type: InstructionLineType;
  virtualAddress: string;
  bytes: string | null;
  assembly: string | null;
};

export class Process {
  cpu: Cpu;

  private _executable: ELF64;
  private running = true;
  name: string;

  constructor(name: string, elfExecutable: ELF64) {
    this.name = name;
    this._executable = elfExecutable;
    this.cpu = new Cpu();

    let codeStart = 0;
    let codeLength = 0;
    for (const section of this._executable.sectionHeaders) {
      if (section.name === '.text') {
        codeStart = Number(section.offset);
        codeLength = Number(section.size);
      }
    }

    const addrOffset = this._executable.programHeaders[0].virtualAddress;
    this.cpu.loadMachineCode(
      this._executable.bytes,
      codeStart,
      codeLength,
      this._executable.header.entry,
      addrOffset
    );
  }

  run(args: string[], processEventsListener: ProcessEventListener): void {
    const insideProcessEventsListener: ProcessEventListener = (
      event: ProcessEvent
    ) => {
      if (event instanceof ProcessExitEvent) {
        this.running = false;
      }
      processEventsListener(event);
    };
    this.cpu.setupStack(args, insideProcessEventsListener);

    this.running = true;
    // TODO: this freezes until done!
    while (this.running) {
      this.cpu.executeNextInstruction();
    }
    console.log('Process exited.');
  }

  stop(): void {
    this.running = false;
  }

  get executable(): ELF64 {
    return this._executable;
  }
}

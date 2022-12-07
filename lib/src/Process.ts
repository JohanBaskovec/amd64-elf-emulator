import {ELF64} from "./elf64";
import {Instruction} from "./Instruction";
import {InstructionParser} from "./InstructionParser";
import {Cpu} from "./Cpu";
import {Emulator} from "./Emulator";

export class Process {
    private cpu: Cpu;

    private executable: ELF64;
    private dv: DataView;
    private running: boolean = true;
    private emulator: Emulator;

    constructor(elfExecutable: ELF64, emulator: Emulator) {
        this.executable = elfExecutable;
        this.emulator = emulator;
        this.dv = new DataView(this.executable.bytes);
        const addrOffset = this.executable.programHeaders[0].vaddr;
        const rip = this.executable.header.entry - addrOffset;
        this.cpu = new Cpu(rip, addrOffset, this.emulator);
    }

    getNextInstruction(): Instruction {
        const instructionParser = new InstructionParser(this.dv, this.cpu.getRip());
        return instructionParser.parse();
    }

    run(): void {
        // avoid infinite loop for now
        while (this.running) {
            const instruction = this.getNextInstruction();
            this.cpu.execute(this.dv, instruction);
        }
    }

    stop(): void {
        this.running = false;
    }
}



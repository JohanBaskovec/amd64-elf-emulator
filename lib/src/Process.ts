import {ELF64} from "./elf64";
import {Instruction, InstructionByAddress, instructionFormat} from "./Instruction";
import {InstructionParser} from "./InstructionParser";
import {Cpu} from "./Cpu";
import {Emulator} from "./Emulator";


export class Process {
    private cpu: Cpu;

    private executable: ELF64;
    private dv: DataView;
    private running: boolean = true;
    private emulator: Emulator;
    private addrOffset: number;
    private codeStartAddr: number;

    constructor(elfExecutable: ELF64, emulator: Emulator) {
        this.executable = elfExecutable;
        this.emulator = emulator;
        this.dv = new DataView(this.executable.bytes);
        this.addrOffset = this.executable.programHeaders[0].virtualAddress;
        const rip = this.executable.header.entry - this.addrOffset;
        this.cpu = new Cpu(rip, this.addrOffset, this.emulator);
        this.codeStartAddr = this.executable.programHeaders[1].virtualAddress - this.addrOffset;
    }

    getNextInstruction(): Instruction {
        const instructionParser = new InstructionParser(this.dv, this.cpu.getRip(), this.cpu.addrOffset);
        return instructionParser.parse();
    }

    parseInstructions(): InstructionByAddress {
        let codeStart = 0;
        let codeLength = 0;
        const instructions: InstructionByAddress = {};
        for (const section of this.executable.sectionHeaders) {
            if (section.name === '.text') {
                codeStart = Number(section.offset);
                codeLength = Number(section.size);
            }
        }
        let i = codeStart;
        while (i < codeStart + codeLength) {
            const instructionParser = new InstructionParser(this.dv, i, this.cpu.addrOffset);
            const instruction = instructionParser.parse();
            if (instruction.virtualAddress === undefined) {
                throw new Error('Instruction has no address.');
            }
            if (instruction.length === undefined) {
                throw new Error('Instruction has no length.');
            }
            i += instruction.length;
            instructions[instruction.virtualAddress - this.addrOffset] = instruction;
        }
        return instructions;
    }

    run(): void {
        const instructions = this.parseInstructions();
        while (this.running) {
            this.cpu.execute(this.dv, instructions[this.cpu.getRip()]);
        }
    }

    stop(): void {
        this.running = false;
    }
}



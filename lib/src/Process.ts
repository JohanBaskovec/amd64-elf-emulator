import {ELF64} from "./elf64";
import {arrayBufferToString, Instruction, InstructionByAddress, InstructionType} from "./Instruction";
import {InstructionParser} from "./InstructionParser";
import {Cpu} from "./Cpu";
import {Emulator} from "./Emulator";
import {Register} from "./amd64-architecture";

export enum InstructionLineType {
    label,
    assembly,
}

export type InstructionLine = {
    type: InstructionLineType;
    virtualAddress: string;
    bytes: string | null;
    assembly: string | null;
}

export class Process {
    private cpu: Cpu;

    private _executable: ELF64;
    private dv: DataView;
    private running: boolean = true;
    private emulator: Emulator;
    private addrOffset: number;
    private codeStartAddr: number;
    private _instructions: InstructionByAddress = {};

    constructor(elfExecutable: ELF64, emulator: Emulator) {
        this._executable = elfExecutable;
        this.emulator = emulator;
        this.dv = new DataView(this._executable.bytes);
        this.addrOffset = this._executable.programHeaders[0].virtualAddress;
        const rip = this._executable.header.entry - this.addrOffset;
        this.cpu = new Cpu(rip, this.addrOffset, this.emulator);
        this.codeStartAddr = this._executable.programHeaders[1].virtualAddress - this.addrOffset;
        this._instructions = this.parseInstructions();
    }

    getNextInstruction(): Instruction {
        const instructionParser = new InstructionParser(this.dv, this.cpu.getRip(), this.cpu.addrOffset);
        return instructionParser.parse();
    }

    disassemble(): InstructionLine[] {
        const instructionLines: InstructionLine[] = [];
        for (const address in this.instructions) {
            if (this.executable.labels[address] !== undefined) {
                const label = this.executable.labels[address];
                instructionLines.push({
                    type: InstructionLineType.label,
                    virtualAddress: `${label.virtualAddress.toString(16)} <${label.name}>:`,
                    bytes: null,
                    assembly: null
                });
            }
            const instruction = this.instructions[address];
            if (instruction.virtualAddress === undefined) {
                throw new Error("Instruction has no virtual address.");
            }
            const virtualAddress = instruction.virtualAddress;
            let bytes = "";
            if (instruction.raw !== undefined) {
                bytes = arrayBufferToString(instruction.raw.bytes);
            }
            let assembly = InstructionType[instruction.type] + " ";
            for (let i = 0; i < instruction.operands.length; i++) {
                const operand = instruction.operands[i];
                if (operand.register !== undefined) {
                    assembly += Register[operand.register];
                } else if (operand.effectiveAddr !== undefined) {
                    const ea = operand.effectiveAddr;
                    assembly += "[";
                    if (ea.base) {
                        assembly += Register[ea.base];
                    }
                    if (ea.index) {
                        assembly += "+" + Register[ea.index];
                    }
                    if (ea.scaleFactor) {
                        assembly += "*" + ea.scaleFactor;
                    }
                    if (ea.displacement) {
                        assembly += "+" + ea.displacement;
                    }
                    assembly += "]";
                } else if (operand.immediate !== undefined) {
                    assembly += operand.immediate.valueSigned;
                } else if (operand.relativeOffset !== undefined) {
                    assembly += operand.relativeOffset.valueSigned;
                }
                if (i !== instruction.operands.length - 1) {
                    assembly += ",";
                }
            }
            instructionLines.push({
                type: InstructionLineType.assembly,
                virtualAddress: virtualAddress.toString(16),
                bytes,
                assembly
            });
        }
        return instructionLines;
    }

    parseInstructions(): InstructionByAddress {
        let codeStart = 0;
        let codeLength = 0;
        const instructions: InstructionByAddress = {};
        for (const section of this._executable.sectionHeaders) {
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
        while (this.running) {
            this.cpu.execute(this.dv, this._instructions[this.cpu.getRip()]);
        }
    }

    stop(): void {
        this.running = false;
    }

    get executable(): ELF64 {
        return this._executable;
    }

    get instructions(): InstructionByAddress {
        return this._instructions;
    }
}



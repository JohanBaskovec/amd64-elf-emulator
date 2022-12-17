import {ELF64} from "./elf64";
import {arrayBufferToString, InstructionType} from "./Instruction";
import {Register} from "./amd64-architecture";
import {InstructionLine, InstructionLineType} from "./Process";
import {InstructionsParser} from "./InstructionsParser";

export class Disassembler {
    private instructionsParser = new InstructionsParser();

    disassembleElf64Executable(executable: ELF64): InstructionLine[] {
        let codeStart = 0;
        let codeLength = 0;
        for (const section of executable.sectionHeaders) {
            if (section.name === '.text') {
                codeStart = Number(section.offset);
                codeLength = Number(section.size);
            }
        }

        const addrOffset = executable.programHeaders[0].virtualAddress;

        const instructions = this.instructionsParser.parse(new DataView(executable.bytes), codeStart, codeLength, addrOffset);
        const instructionLines: InstructionLine[] = [];
        for (const address in instructions) {
            if (executable.labels[address] !== undefined) {
                const label = executable.labels[address];
                instructionLines.push({
                    type: InstructionLineType.label,
                    virtualAddress: `${label.virtualAddress.toString(16)} <${label.name}>:`,
                    bytes: null,
                    assembly: null
                });
            }
            const instruction = instructions[address];
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
}

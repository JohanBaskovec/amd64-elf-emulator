import {Register} from "./amd64-architecture";

export enum OperandModRMOrder {
    regFirstRmSecond,
    rmFirstRegSecond,
}

export enum InstructionType {
    none, ADD, MOV, XOR,
    SYSCALL,
}

export type REXPrefix = {
    w: number;
    r: number;
    x: number;
    b: number;
}

export type ModRM = {
    mod: number;
    reg: number;
    rm: number;
}

export type SIB = {
    scale: number;
    index: number;
    base: number;
}

export type EffectiveAddress = {
    base: Register | null,
    index: Register | null,
    displacement: number
    scaleFactor: number,
    dataSize: OperationSize,
}

export class Operand {
    address?: number;
    register?: Register;
    effectiveAddr?: EffectiveAddress;
    bigInt?: bigint;
    int?: number;
}

export enum OperationSize {
    byte, word, dword, qword,
}


export type InstructionRaw = {
    type: InstructionType;
    operandSizeOverride: boolean;
    is8BitsInstruction: boolean;
    opCode: number;
    operands: Operand[];
    length: number;
    rex?: REXPrefix;
    modRM?: ModRM;
    sib?: SIB;
}

export type Instruction = {
    type: InstructionType;
    operands: Operand[];
    length: number;
}

export function instructionFormat(instruction: Instruction): object {
    const r = {
        type: InstructionType[instruction.type],
        operands: instruction.operands.map(operand => {
            let effectiveAddress = undefined;
            if (operand.effectiveAddr !== undefined) {
                effectiveAddress = {
                    base: operand.effectiveAddr.base ? Register[operand.effectiveAddr.base] : null,
                    index: operand.effectiveAddr.index ? Register[operand.effectiveAddr.index] : null,
                    displacement: operand.effectiveAddr.displacement,
                    scaleFactor: operand.effectiveAddr.scaleFactor,
                }
            }
            return {
                address: operand.address ? operand.address.toString(16): undefined,
                register: operand.register ? Register[operand.register] : undefined,
                effectiveAddress: effectiveAddress,
                bigInt: operand.bigInt ? operand.bigInt : undefined,
                int: operand.int ? operand.int:  undefined,
            }
        }),
        length: instruction.length,
    };
    return r;
}

import {Register} from "./amd64-architecture";

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

export class Operand {
    address?: number;
    register?: Register;
    effectiveAddrInRegister?: Register;
    bigInt?: bigint;
    int?: number;
}

export type InstructionRaw = {
    type: InstructionType;
    operandSizeOverride: boolean;
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
            return {
                address: operand.address ? operand.address.toString(16): undefined,
                register: operand.register ? Register[operand.register] : undefined,
                effectiveAddrInRegister: operand.effectiveAddrInRegister ? Register[operand.effectiveAddrInRegister] : undefined,
                bigInt: operand.bigInt ? operand.bigInt : undefined,
                int: operand.int ? operand.int:  undefined,
            }
        }),
        length: instruction.length,
    };
    return r;
}

export function instructionRawFormat(instruction: InstructionRaw): object {
    const r = {
        type: InstructionType[instruction.type],
        operandSizeOverride: instruction.operandSizeOverride,
        opCode: instruction.opCode.toString(16),
        operands: instruction.operands.map(operand => {
            return {
                address: operand.address ? operand.address.toString(16): undefined,
                register: operand.register ? Register[operand.register] : undefined,
                effectiveAddrInRegister: operand.effectiveAddrInRegister ? Register[operand.effectiveAddrInRegister] : undefined,
                bigInt: operand.bigInt ? operand.bigInt : undefined,
                int: operand.int ? operand.int:  undefined,
            }
        }),
        length: instruction.length,
        rex: instruction.rex,
        modRM: instruction.modRM,
        sib: instruction.sib,
    };
    return r;
}

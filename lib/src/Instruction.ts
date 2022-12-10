import {OperationSize, Register} from "./amd64-architecture";

export enum OperandModRMOrder {
    regFirstRmSecond,
    rmFirstRegSecond,
}

export enum InstructionType {
    none, ADD, IDIV, IMUL, MOV, MOVZX, CMP, JGE, XOR, SUB,
    PUSH, POP,
    SYSCALL,
    CALL, RET,
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

export type Immediate = {
    value: bigint,
    width: OperationSize,
}

export type RelativeOffset = {
    value: bigint,
    width: OperationSize,
}

export class Operand {
    address?: number;
    register?: Register;
    effectiveAddr?: EffectiveAddress;
    immediate?: Immediate;
    relativeOffset?: RelativeOffset;
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
    address?: number;
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
                immediate: operand.immediate ? operand.immediate : undefined,
            }
        }),
        length: instruction.length,
    };
    return r;
}

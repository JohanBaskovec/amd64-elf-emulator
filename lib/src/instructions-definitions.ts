// copy-pasted from AMD64 Architecture Programmer's Manual, volume 3

import {InstructionType, OperandModRMOrder, OperationSize} from "./Instruction";

//0 32 44
export const rawInstructionDefinitions: string = `
MOV reg/mem8, reg8              88 /r       Move the contents of an 8-bit register to an 8-bit destination register or memory operand.
MOV reg/mem16, reg16            89 /r       Move the contents of a 16-bit register to a 16-bit destination register or memory operand.
MOV reg/mem32, reg32            89 /r       Move the contents of a 32-bit register to a 32-bit destination register or memory operand.
MOV reg/mem64, reg64            89 /r       Move the contents of a 64-bit register to a 64-bit destination register or memory operand.
MOV reg8, reg/mem8              8A /r       Move the contents of an 8-bit register or memory operand to an 8-bit destination register.
MOV reg16, reg/mem16            8B /r       Move the contents of a 16-bit register or memory operand to a 16-bit destination register.
MOV reg32, reg/mem32            8B /r       Move the contents of a 32-bit register or memory operand to a 32-bit destination register.
MOV reg64, reg/mem64            8B /r       Move the contents of a 64-bit register or memory operand to a 64-bit destination register.
MOV reg16/32/64/mem16, segReg   8C /r       Move the contents of a segment register to a 16-bit, 32- bit, or 64-bit destination register or to a 16-bit memory operand.
MOV segReg, reg/mem16           8E /r       Move the contents of a 16-bit register or memory operand to a segment register.
MOV AL, moffset8                A0          Move 8-bit data at a specified memory offset to the AL register.
MOV AX, moffset16               A1          Move 16-bit data at a specified memory offset to the AX register.
MOV EAX, moffset32              A1          Move 32-bit data at a specified memory offset to the EAX register.
MOV RAX, moffset64              A1          Move 64-bit data at a specified memory offset to the RAX register.
MOV moffset8, AL                A2          Move the contents of the AL register to an 8-bit memory offset.
MOV moffset16, AX               A3          Move the contents of the AX register to a 16-bit memory offset.
MOV moffset32, EAX              A3          Move the contents of the EAX register to a 32-bit memory offset.
MOV moffset64, RAX              A3          Move the contents of the RAX register to a 64-bit memory offset.
MOV reg8, imm8                  B0 +rb ib   Move an 8-bit immediate value into an 8-bit register.
MOV reg16, imm16                B8 +rw iw   Move a 16-bit immediate value into a 16-bit register.
MOV reg32, imm32                B8 +rd id   Move an 32-bit immediate value into a 32-bit register.
MOV reg64, imm64                B8 +rq iq   Move an 64-bit immediate value into a 64-bit register.
MOV reg/mem8, imm8              C6 /0 ib    Move an 8-bit immediate value to an 8-bit register or memory operand.
MOV reg/mem16, imm16            C7 /0 iw    Move a 16-bit immediate value to a 16-bit register or memory operand.
MOV reg/mem32, imm32            C7 /0 id    Move a 32-bit immediate value to a 32-bit register or memory operand.
MOV reg/mem64, imm32            C7 /0 id    Move a 32-bit signed immediate value to a 64-bit register or memory operand.

ADD AL, imm8                    04 ib       Add imm8 to AL.
ADD AX, imm16                   05 iw       Add imm16 to AX.
ADD EAX, imm32                  05 id       Add imm32 to EAX.
ADD RAX, imm32                  05 id       Add sign-extended imm32 to RAX.
ADD reg/mem8, imm8              80 /0 ib    Add imm8 to reg/mem8.
ADD reg/mem16, imm16            81 /0 iw    Add imm16 to reg/mem16
ADD reg/mem32, imm32            81 /0 id    Add imm32 to reg/mem32.
ADD reg/mem64, imm32            81 /0 id    Add sign-extended imm32 to reg/mem64.
ADD reg/mem16, imm8             83 /0 ib    Add sign-extended imm8 to reg/mem16
ADD reg/mem32, imm8             83 /0 ib    Add sign-extended imm8 to reg/mem32.
ADD reg/mem64, imm8             83 /0 ib    Add sign-extended imm8 to reg/mem64.
ADD reg/mem8, reg8              00 /r       Add reg8 to reg/mem8.
ADD reg/mem16, reg16            01 /r       Add reg16 to reg/mem16.
ADD reg/mem32, reg32            01 /r       Add reg32 to reg/mem32.
ADD reg/mem64, reg64            01 /r       Add reg64 to reg/mem64.
ADD reg8, reg/mem8              02 /r       Add reg/mem8 to reg8.
ADD reg16, reg/mem16            03 /r       Add reg/mem16 to reg16.
ADD reg32, reg/mem32            03 /r       Add reg/mem32 to reg32.
ADD reg64, reg/mem64            03 /r       Add reg/mem64 to reg64.

XOR AL, imm8                    34 ib       xor the contents of AL with an immediate 8-bit operand and store the result in AL.
XOR AX, imm16                   35 iw       xor the contents of AX with an immediate 16-bit operand and store the result in AX.
XOR EAX, imm32                  35 id       xor the contents of EAX with an immediate 32-bit operand and store the result in EAX.
XOR RAX, imm32                  35 id       xor the contents of RAX with a sign-extended immediate 32-bit operand and store the result in RAX.
XOR reg/mem8, imm8              80 /6 ib    xor the contents of an 8-bit destination register or memory operand with an 8-bit immediate value and store the result in the destination.
XOR reg/mem16, imm16            81 /6 iw    xor the contents of a 16-bit destination register or memory operand with a 16-bit immediate value and store the result in the destination.
XOR reg/mem32, imm32            81 /6 id    xor the contents of a 32-bit destination register or memory operand with a 32-bit immediate value and store the result in the destination.
XOR reg/mem64, imm32            81 /6 id    xor the contents of a 64-bit destination register or memory operand with a sign-extended 32-bit immediate value and store the result in the destination.
XOR reg/mem16, imm8             83 /6 ib    xor the contents of a 16-bit destination register or memory operand with a sign-extended 8-bit immediate value and store the result in the destination.
XOR reg/mem32, imm8             83 /6 ib    xor the contents of a 32-bit destination register or memory operand with a sign-extended 8-bit immediate value and store the result in the destination.
XOR reg/mem64, imm8             83 /6 ib    xor the contents of a 64-bit destination register or memory operand with a sign-extended 8-bit immediate value and store the result in the destination.
XOR reg/mem8, reg8              30 /r       xor the contents of an 8-bit destination register or memory operand with the contents of an 8-bit register and store the result in the destination.
XOR reg/mem16, reg16            31 /r       xor the contents of a 16-bit destination register or memory operand with the contents of a 16-bit register and store the result in the destination.
XOR reg/mem32, reg32            31 /r       xor the contents of a 32-bit destination register or memory operand with the contents of a 32-bit register and store the result in the destination.
XOR reg/mem64, reg64            31 /r       xor the contents of a 64-bit destination register or memory operand with the contents of a 64-bit register and store the result in the destination.
XOR reg8, reg/mem8              32 /r       xor the contents of an 8-bit destination register with the contents of an 8-bit register or memory operand and store the results in the destination.
XOR reg16, reg/mem16            33 /r       xor the contents of a 16-bit destination register with the contents of a 16-bit register or memory operand and store the results in the destination.
XOR reg32, reg/mem32            33 /r       xor the contents of a 32-bit destination register with the contents of a 32-bit register or memory operand and store the results in the destination.
XOR reg64, reg/mem64            33 /r       xor the contents of a 64-bit destination register with the contents of a 64-bit register or memory operand and store the results in the destination.

SYSCALL                         0F 05       Call operating system.
`

export enum OperandType {
    reg8, reg16, reg32, reg64,
    regOrMem8, regOrMem16, regOrMem32, regOrMem64,
    imm8, imm16, imm32, imm64,
    AL, AX, EAX, RAX,
    moffset8, moffset16, moffset32, moffset64,
    segReg,
    reg16OrReg32OrReg64OrMem16
}

export const operandTypeToWidth: {[key in OperandType]?: OperationSize} = {
    [OperandType.reg8]: OperationSize.byte,
    [OperandType.reg16]: OperationSize.word,
    [OperandType.reg32]: OperationSize.dword,
    [OperandType.reg64]: OperationSize.qword,
    [OperandType.regOrMem8]: OperationSize.byte,
    [OperandType.regOrMem16]: OperationSize.word,
    [OperandType.regOrMem32]: OperationSize.dword,
    [OperandType.regOrMem64]: OperationSize.qword,
    [OperandType.imm8]: OperationSize.byte,
    [OperandType.imm16]: OperationSize.word,
    [OperandType.imm32]: OperationSize.dword,
    [OperandType.imm64]: OperationSize.qword,
    [OperandType.AL]: OperationSize.byte,
    [OperandType.AX]: OperationSize.word,
    [OperandType.EAX]: OperationSize.dword,
    [OperandType.RAX]: OperationSize.qword,
    [OperandType.moffset8]: OperationSize.byte,
    [OperandType.moffset16]: OperationSize.word,
    [OperandType.moffset32]: OperationSize.dword,
    [OperandType.moffset64]: OperationSize.qword,
    [OperandType.reg16OrReg32OrReg64OrMem16]: OperationSize.qword,
}

export type InstructionDefinition = {
    description: string,
    operandModRMOrder: OperandModRMOrder,
    is8BitsInstruction: boolean,
    mnemonic: {
        str: string,
        instructionType: InstructionType,
        operands: OperandType[],
    },
    opCode: {
        str: string,
        uniq: string,
        bytes: number[],
        modRM: boolean,
        immediateSize?: OperationSize,
        modRMExtension?: number,
        registerCode?: OperationSize,
    },
}

const operandStrToOperandType: {[operandTypeStr: string]: OperandType} = {
    'reg/mem8': OperandType.regOrMem8,
    'reg/mem16': OperandType.regOrMem16,
    'reg/mem32': OperandType.regOrMem32,
    'reg/mem64': OperandType.regOrMem64,
    'AL': OperandType.AL,
    'AX': OperandType.AX,
    'EAX': OperandType.EAX,
    'RAX': OperandType.RAX,
    'imm8': OperandType.imm8,
    'imm16': OperandType.imm16,
    'imm32': OperandType.imm32,
    'imm64': OperandType.imm64,
    'reg8': OperandType.reg8,
    'reg16': OperandType.reg16,
    'reg32': OperandType.reg32,
    'reg64': OperandType.reg64,
    'moffset8': OperandType.moffset8,
    'moffset16': OperandType.moffset16,
    'moffset32': OperandType.moffset32,
    'moffset64': OperandType.moffset64,
    'segReg': OperandType.segReg,
    'reg16/32/64/mem16': OperandType.reg16OrReg32OrReg64OrMem16
}

export const instructionDefinitionsByOpCode = new Map<string, InstructionDefinition[]>;

function parseInstructionDefinitions() {
    const lines = rawInstructionDefinitions.split("\n");
    const instructionDefinitions: InstructionDefinition[] = [];

    for (let i = 0 ; i < lines.length ; i++) {
        const line = lines[i];
        if (line.length === 0) {
            continue;
        }
        const mnemonicStr = line.substring(0, 31).trim();
        const indexFirstSpace = mnemonicStr.indexOf(' ');
        const mnemonicInstructionStr: string = indexFirstSpace === -1 ? mnemonicStr : mnemonicStr.substring(0, indexFirstSpace);
        const instructionType: InstructionType = InstructionType[mnemonicInstructionStr as keyof typeof InstructionType];
        if (instructionType === undefined) {
            throw new Error(`Undefined mnemonic: ${mnemonicInstructionStr} on line ${line}.`);
        }

        const operands: OperandType[] = [];
        if (indexFirstSpace !== -1) {
            const mnemOperands = mnemonicStr.substring(indexFirstSpace + 1);
            const operandsStr = mnemOperands.split(',').map(op => op.trim());

            for (const operandStr of operandsStr) {
                const operandType: OperandType | undefined = operandStrToOperandType[operandStr];
                if (operandType === undefined) {
                    throw new Error(`Undefined operand: ${operandStr} on line ${line}.`);
                }
                operands.push(operandType)
            }
        }

        const opcodeStr = line.substring(32, 43).trim();
        const opCodeParts = opcodeStr.split(' ');
        let opcodeImmediate: OperationSize | undefined;
        let modRMExtension: number | undefined;
        let modRM = false;
        let registerCode: OperationSize | undefined;
        const opcodeBytes: number[] = [];
        let uniq = "";
        for (const opcodePart of opCodeParts) {
            switch (opcodePart) {
                case '/r':
                    modRM = true;
                    break;
                case 'ib':
                    opcodeImmediate = OperationSize.byte;
                    break;
                case 'iw':
                    opcodeImmediate = OperationSize.word;
                    break;
                case 'id':
                    opcodeImmediate = OperationSize.dword;
                    break;
                case 'iq':
                    opcodeImmediate = OperationSize.qword;
                    break;
                case '/0':
                    modRMExtension = 0;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/1':
                    modRMExtension = 1;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/2':
                    modRMExtension = 2;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/3':
                    modRMExtension = 3;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/4':
                    modRMExtension = 4;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/5':
                    modRMExtension = 5;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/6':
                    modRMExtension = 6;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/7':
                    modRMExtension = 7;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '+rb':
                    registerCode = OperationSize.word;
                    break;
                case '+rw':
                    registerCode = OperationSize.word;
                    break;
                case '+rd':
                    registerCode = OperationSize.dword;
                    break;
                case '+rq':
                    registerCode = OperationSize.qword;
                    break;
                default:
                    try {
                        const num = Number.parseInt(opcodePart, 16);
                        opcodeBytes.push(num);
                        uniq += opcodePart;
                    } catch {
                        throw new Error(`Could not parse opcode byte ${opcodePart}.`);
                    }

            }
        }

        const description = line.substring(44);

        if (modRMExtension && opcodeBytes.length !== 1) {
            throw new Error(`There can't be a register code with an opcode that's more than 1 byte long! On line ${i}`);
        }
        let operandModRMOrder = OperandModRMOrder.regFirstRmSecond;
        let is8BitsInstruction = false;
        if (operands.length > 0) {
            if (operands[0] === OperandType.regOrMem8 ||
                operands[0] === OperandType.regOrMem16 ||
                operands[0] === OperandType.regOrMem32 ||
                operands[0] === OperandType.regOrMem64
            ) {
                operandModRMOrder = OperandModRMOrder.rmFirstRegSecond;
            }
        }
        if (operands.length >= 2) {
            const op0Width = operandTypeToWidth[operands[0]];
            const op1Width = operandTypeToWidth[operands[1]];
            // I'm not sure if this is always true
            if (op0Width === OperationSize.byte && op1Width === OperationSize.byte) {
                is8BitsInstruction = true;
            }
        }

        const id: InstructionDefinition = {
            operandModRMOrder,
            is8BitsInstruction,
            mnemonic: {
                str: mnemonicStr,
                instructionType,
                operands: operands,
            },
            opCode: {
                uniq,
                str: opcodeStr,
                immediateSize: opcodeImmediate,
                bytes: opcodeBytes,
                modRMExtension,
                modRM,
                registerCode,
            },
            description,
        };
        const idArray = instructionDefinitionsByOpCode.get(uniq);
        if (idArray !== undefined) {
            idArray.push(id);
        } else {
            instructionDefinitionsByOpCode.set(uniq, [id]);
        }
        instructionDefinitions.push(id);
    }
    return instructionDefinitions;
}

export let instructionDefinitions: InstructionDefinition[] = [];
let initialized = false;
export function initInstructionDefinitions() {
    if (!initialized) {
        instructionDefinitions = parseInstructionDefinitions();
    }
}


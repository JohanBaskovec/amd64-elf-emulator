import {
    Instruction,
    InstructionRaw,
    InstructionType,
    ModRM,
    Operand,
    OperandModRMOrder,
    OperationSize
} from "./Instruction";
import {Register, RegisterFamily} from "./amd64-architecture";
import {
    initInstructionDefinitions,
    InstructionDefinition,
    instructionDefinitions,
    instructionDefinitionsByOpCode,
    OperandType,
    operandTypeToWidth
} from "./instructions-definitions";

// table "ModRM.reg and .r/m Field Encodings" in AMD64 Architecture Programmer's Manual, Volume 3
// columns "ModRM.reg" and "ModRM.r/m (mod = 11b)" (they are identical)
enum ModRMReg {
    rax_MMX0_XMM0_YMM0,
    rCX_MMX1_XMM1_YMM1,
    rDX_MMX2_XMM2_YMM2,
    rBX_MMX3_XMM3_YMM3,
    AH_rSP_MMX4_XMM4_YMM4,
    CH_rBP_MMX5_XMM5_YMM5,
    DH_rSI_MMX6_XMM6_YMM6,
    BH_rDI_MMX7_XMM7_YMM7,
    // r/m can be extended to 4 bits when REX.B is set
    // I can't find this in the doc, so I reverse-engineered the machine code output by NASM
    r8_MMX8_XMM8_YMM8,
    r9_MMX9_XMM9_YMM9,
    r10_MMX10_XMM10_YMM10,
    r11_MMX11_XMM11_YMM11,
    r12_MMX12_XMM12_YMM12,
    r13_MMX13_XMM13_YMM13,
    r14_MMX14_XMM14_YMM14,
    r15_MMX15_XMM15_YMM15,
}

function canAddressHighByte(modrmreg: ModRMReg): boolean {
    return modrmreg === ModRMReg.BH_rDI_MMX7_XMM7_YMM7 ||
        modrmreg === ModRMReg.AH_rSP_MMX4_XMM4_YMM4 ||
        modrmreg === ModRMReg.CH_rBP_MMX5_XMM5_YMM5 ||
        modrmreg === ModRMReg.DH_rSI_MMX6_XMM6_YMM6;
}

enum ModRMrmMobNot11b {
    rAX, rCX, rDX, rBX, SIB, rBP, rSI, rDI,
    r8, r9, r10, r11, SIB2, r13, r14, r15
}

const modRMrmMobNot11bToRegisterMap: { [key in ModRMrmMobNot11b]?: RegisterFamily } = {
    [ModRMrmMobNot11b.rAX]: RegisterFamily.rAX,
    [ModRMrmMobNot11b.rCX]: RegisterFamily.rCX,
    [ModRMrmMobNot11b.rDX]: RegisterFamily.rDX,
    [ModRMrmMobNot11b.rBX]: RegisterFamily.rBX,
    [ModRMrmMobNot11b.rBP]: RegisterFamily.rBP,
    [ModRMrmMobNot11b.rSI]: RegisterFamily.rSI,
    [ModRMrmMobNot11b.rDI]: RegisterFamily.rDI,
    [ModRMrmMobNot11b.SIB]: undefined,
    [ModRMrmMobNot11b.r8]: RegisterFamily.r8,
    [ModRMrmMobNot11b.r9]: RegisterFamily.r9,
    [ModRMrmMobNot11b.r10]: RegisterFamily.r10,
    [ModRMrmMobNot11b.r11]: RegisterFamily.r11,
    [ModRMrmMobNot11b.SIB2]: undefined,
    [ModRMrmMobNot11b.r13]: RegisterFamily.r13,
    [ModRMrmMobNot11b.r14]: RegisterFamily.r14,
    [ModRMrmMobNot11b.r15]: RegisterFamily.r15,
}

const sibScaleFactorMap: { [scale: number]: number } = {
    0x00: 1,
    0x01: 2,
    0x02: 4,
    0x03: 8,
}

enum SubRegisterWidth {
    qword, dword, word, highByte, lowByte
}

const subRegisterWidthToWidth: { [key in SubRegisterWidth]: OperationSize } = {
    [SubRegisterWidth.lowByte]: OperationSize.byte,
    [SubRegisterWidth.highByte]: OperationSize.byte,
    [SubRegisterWidth.word]: OperationSize.word,
    [SubRegisterWidth.dword]: OperationSize.dword,
    [SubRegisterWidth.qword]: OperationSize.qword,
}

type RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register,
    [SubRegisterWidth.dword]: Register,
    [SubRegisterWidth.word]: Register,
    [SubRegisterWidth.highByte]?: Register,
    [SubRegisterWidth.lowByte]: Register,
};

const raxWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RAX,
    [SubRegisterWidth.dword]: Register.EAX,
    [SubRegisterWidth.word]: Register.AX,
    [SubRegisterWidth.highByte]: Register.AH,
    [SubRegisterWidth.lowByte]: Register.AL,
}

const rbxWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RBX,
    [SubRegisterWidth.dword]: Register.EBX,
    [SubRegisterWidth.word]: Register.BX,
    [SubRegisterWidth.highByte]: Register.BH,
    [SubRegisterWidth.lowByte]: Register.BL,
}
const rcxWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RCX,
    [SubRegisterWidth.dword]: Register.ECX,
    [SubRegisterWidth.word]: Register.CX,
    [SubRegisterWidth.highByte]: Register.CH,
    [SubRegisterWidth.lowByte]: Register.CL,
}
const rdxWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RDX,
    [SubRegisterWidth.dword]: Register.EDX,
    [SubRegisterWidth.word]: Register.DX,
    [SubRegisterWidth.highByte]: Register.DH,
    [SubRegisterWidth.lowByte]: Register.DL,
}
const rsiWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RSI,
    [SubRegisterWidth.dword]: Register.ESI,
    [SubRegisterWidth.word]: Register.SI,
    [SubRegisterWidth.lowByte]: Register.SIL,
}
const rbpWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RBP,
    [SubRegisterWidth.dword]: Register.EBP,
    [SubRegisterWidth.word]: Register.BP,
    [SubRegisterWidth.lowByte]: Register.BPL,
}
const rspWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RSP,
    [SubRegisterWidth.dword]: Register.ESP,
    [SubRegisterWidth.word]: Register.SP,
    [SubRegisterWidth.lowByte]: Register.SPL,
}
const rdiWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RDI,
    [SubRegisterWidth.dword]: Register.EDI,
    [SubRegisterWidth.word]: Register.DI,
    [SubRegisterWidth.lowByte]: Register.DIL,
}
const r8WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R8,
    [SubRegisterWidth.dword]: Register.R8D,
    [SubRegisterWidth.word]: Register.R8W,
    [SubRegisterWidth.lowByte]: Register.R8B,
}
const r9WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R9,
    [SubRegisterWidth.dword]: Register.R9D,
    [SubRegisterWidth.word]: Register.R9W,
    [SubRegisterWidth.lowByte]: Register.R9B,
}
const r10WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R10,
    [SubRegisterWidth.dword]: Register.R10D,
    [SubRegisterWidth.word]: Register.R10W,
    [SubRegisterWidth.lowByte]: Register.R10B,
}
const r11WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R11,
    [SubRegisterWidth.dword]: Register.R11D,
    [SubRegisterWidth.word]: Register.R11W,
    [SubRegisterWidth.lowByte]: Register.R11B,
}
const r12WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R12,
    [SubRegisterWidth.dword]: Register.R12D,
    [SubRegisterWidth.word]: Register.R12W,
    [SubRegisterWidth.lowByte]: Register.R12B,
}
const r13WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R13,
    [SubRegisterWidth.dword]: Register.R13D,
    [SubRegisterWidth.word]: Register.R13W,
    [SubRegisterWidth.lowByte]: Register.R13B,
}
const r14WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R14,
    [SubRegisterWidth.dword]: Register.R14D,
    [SubRegisterWidth.word]: Register.R14W,
    [SubRegisterWidth.lowByte]: Register.R14B,
}
const r15WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R15,
    [SubRegisterWidth.dword]: Register.R15D,
    [SubRegisterWidth.word]: Register.R15W,
    [SubRegisterWidth.lowByte]: Register.R15B,
}

const registerFamilyWidthMapping: { [key in RegisterFamily]: RegisterWidthMap } = {
    [RegisterFamily.rAX]: raxWidthMap,
    [RegisterFamily.rBX]: rbxWidthMap,
    [RegisterFamily.rCX]: rcxWidthMap,
    [RegisterFamily.rDX]: rdxWidthMap,
    [RegisterFamily.rSP]: rspWidthMap,
    [RegisterFamily.rBP]: rbpWidthMap,
    [RegisterFamily.rDI]: rdiWidthMap,
    [RegisterFamily.rSI]: rsiWidthMap,
    [RegisterFamily.r8]: r8WidthMap,
    [RegisterFamily.r9]: r9WidthMap,
    [RegisterFamily.r10]: r10WidthMap,
    [RegisterFamily.r11]: r11WidthMap,
    [RegisterFamily.r12]: r12WidthMap,
    [RegisterFamily.r13]: r13WidthMap,
    [RegisterFamily.r14]: r14WidthMap,
    [RegisterFamily.r15]: r15WidthMap,
}


enum RegisterType {
    integer,
}

type ModRmRegRegisterWidthMap = { [modRmReg in ModRMReg]: RegisterWidthMap };
const opCodeToModRmRegRegisterMap8: { [type in RegisterType]: ModRmRegRegisterWidthMap } = {
    [RegisterType.integer]: {
        [ModRMReg.rax_MMX0_XMM0_YMM0]: raxWidthMap,
        [ModRMReg.rCX_MMX1_XMM1_YMM1]: rcxWidthMap,
        [ModRMReg.rDX_MMX2_XMM2_YMM2]: rdxWidthMap,
        [ModRMReg.rBX_MMX3_XMM3_YMM3]: rbxWidthMap,
        [ModRMReg.AH_rSP_MMX4_XMM4_YMM4]: raxWidthMap,
        [ModRMReg.CH_rBP_MMX5_XMM5_YMM5]: rcxWidthMap,
        [ModRMReg.DH_rSI_MMX6_XMM6_YMM6]: rdxWidthMap,
        [ModRMReg.BH_rDI_MMX7_XMM7_YMM7]: rbxWidthMap,
        [ModRMReg.r8_MMX8_XMM8_YMM8]: r8WidthMap,
        [ModRMReg.r9_MMX9_XMM9_YMM9]: r9WidthMap,
        [ModRMReg.r10_MMX10_XMM10_YMM10]: r10WidthMap,
        [ModRMReg.r11_MMX11_XMM11_YMM11]: r11WidthMap,
        [ModRMReg.r12_MMX12_XMM12_YMM12]: r12WidthMap,
        [ModRMReg.r13_MMX13_XMM13_YMM13]: r13WidthMap,
        [ModRMReg.r14_MMX14_XMM14_YMM14]: r14WidthMap,
        [ModRMReg.r15_MMX15_XMM15_YMM15]: r15WidthMap,
    }
};
const opCodeToModRmRegRegisterMap: { [type in RegisterType]: ModRmRegRegisterWidthMap } = {
    [RegisterType.integer]: {
        [ModRMReg.rax_MMX0_XMM0_YMM0]: raxWidthMap,
        [ModRMReg.rCX_MMX1_XMM1_YMM1]: rcxWidthMap,
        [ModRMReg.rDX_MMX2_XMM2_YMM2]: rdxWidthMap,
        [ModRMReg.rBX_MMX3_XMM3_YMM3]: rbxWidthMap,
        [ModRMReg.AH_rSP_MMX4_XMM4_YMM4]: rspWidthMap,
        [ModRMReg.CH_rBP_MMX5_XMM5_YMM5]: rbpWidthMap,
        [ModRMReg.DH_rSI_MMX6_XMM6_YMM6]: rsiWidthMap,
        [ModRMReg.BH_rDI_MMX7_XMM7_YMM7]: rdiWidthMap,
        [ModRMReg.r8_MMX8_XMM8_YMM8]: r8WidthMap,
        [ModRMReg.r9_MMX9_XMM9_YMM9]: r9WidthMap,
        [ModRMReg.r10_MMX10_XMM10_YMM10]: r10WidthMap,
        [ModRMReg.r11_MMX11_XMM11_YMM11]: r11WidthMap,
        [ModRMReg.r12_MMX12_XMM12_YMM12]: r12WidthMap,
        [ModRMReg.r13_MMX13_XMM13_YMM13]: r13WidthMap,
        [ModRMReg.r14_MMX14_XMM14_YMM14]: r14WidthMap,
        [ModRMReg.r15_MMX15_XMM15_YMM15]: r15WidthMap,
    }
};

const rexMask = 0x40;
const rexMaskW = 0x08;
const rexMaskR = 0x04;
const rexMaskX = 0x02;
const rexMaskB = 0x01;

const SIBscaleMask = 0xc0;
const SIBindexMask = 0x38;
const SIBbaseMask = 0x07;

const sibIndexRegs: { [n: number]: RegisterFamily | null } = {
    0x00: RegisterFamily.rAX,
    0x01: RegisterFamily.rCX,
    0x02: RegisterFamily.rDX,
    0x03: RegisterFamily.rBX,
    0x04: null,
    0x05: RegisterFamily.rBP,
    0x06: RegisterFamily.rSI,
    0x07: RegisterFamily.rDI,
    0x08: RegisterFamily.r8,
    0x09: RegisterFamily.r9,
    0x0a: RegisterFamily.r10,
    0x0b: RegisterFamily.r11,
    0x0c: RegisterFamily.r12,
    0x0d: RegisterFamily.r13,
    0x0e: RegisterFamily.r14,
    0x0f: RegisterFamily.r15,
}

function getSibIndexRegister(index: number, width: SubRegisterWidth): Register | null {
    const regFamily = sibIndexRegs[index];
    if (regFamily === null) {
        return null;
    }
    const register = registerFamilyWidthMapping[regFamily][width];
    if (register === undefined) {
        throw new Error('Could not find a register');
    }
    return register;
}

function getSibBaseRegister(base: number, width: SubRegisterWidth, mod: number): Register | null {
    if (mod === 0x05) {
        return null;
    }
    const regFamily = sibBaseRegs[base];
    if (regFamily === RegisterFamily.rBP && mod === 0) {
        return null;
    }
    const register = registerFamilyWidthMapping[regFamily][width];
    if (register === undefined) {
        throw new Error('Could not find a register');
    }
    return register;
}

const sibBaseRegs: { [n: number]: RegisterFamily } = {
    0x00: RegisterFamily.rAX,
    0x01: RegisterFamily.rCX,
    0x02: RegisterFamily.rDX,
    0x03: RegisterFamily.rBX,
    0x04: RegisterFamily.rSP,
    0x05: RegisterFamily.rBP,
    0x06: RegisterFamily.rSI,
    0x07: RegisterFamily.rDI,
    0x08: RegisterFamily.r8,
    0x09: RegisterFamily.r9,
    0x0a: RegisterFamily.r10,
    0x0b: RegisterFamily.r11,
    0x0c: RegisterFamily.r12,
    0x0d: RegisterFamily.r13,
    0x0e: RegisterFamily.r14,
    0x0f: RegisterFamily.r15,
}

export class InstructionParser {

    dv: DataView;
    bytei: number;

    instruction: InstructionRaw = {
        type: InstructionType.none,
        is8BitsInstruction: false,
        operandSizeOverride: false,
        opCode: 0,
        length: 0,
        operands: [],
    };
    instructionDefinition: InstructionDefinition | undefined = undefined;

    constructor(content: DataView, bytei: number) {
        this.dv = content;
        this.bytei = bytei;
        initInstructionDefinitions();
    }

    notImplemented() {
        throw new Error('Instruction not implemented: ' + this.instruction.opCode.toString(16));
    }

    getModRmRegister(modrmreg: ModRMReg, instruction: InstructionRaw): Register {
        let registerType: RegisterType = RegisterType.integer;
        if (this.instructionDefinition === undefined) {
            throw new Error('instructionDefinition is undefined');
        }

        let width: SubRegisterWidth;
        let m = opCodeToModRmRegRegisterMap;
        if (instruction.is8BitsInstruction) {
            if (canAddressHighByte(modrmreg) && instruction.rex === undefined) {
                m = opCodeToModRmRegRegisterMap8;
                width = SubRegisterWidth.highByte;
            } else {
                width = SubRegisterWidth.lowByte;
            }
        } else {
            let operandWidth = this.getOperandSize(this.instructionDefinition, this.instruction.operands.length);
            switch (operandWidth) {
                case OperationSize.byte:
                    width = SubRegisterWidth.lowByte;
                    break;
                case OperationSize.word:
                    width = SubRegisterWidth.word;
                    break;
                case OperationSize.dword:
                    width = SubRegisterWidth.dword;
                    break;
                case OperationSize.qword:
                    width = SubRegisterWidth.qword;
                    break;
            }
        }
        const register: Register | undefined = m[registerType][modrmreg][width];
        if (register === undefined) {
            throw new Error(`Register doesn't exist`);
        }
        return register;
    }

    parseRegBits() {
        if (this.instruction.modRM === undefined) {
            throw new Error('this.instruction.modRM is undefined');
        }

        let regEReg: ModRMReg = this.instruction.modRM.reg;
        if (this.instruction.rex && this.instruction.rex.r) {
            // extend ModRM.reg with the R bit
            regEReg = regEReg | (this.instruction.rex.r << 3);
        }
        if (!ModRMReg[regEReg]) {
            throw new Error("Impossible value for modRM's reg");
        }

        this.instruction.operands.push({register: this.getModRmRegister(regEReg, this.instruction)});
    }

    parseDisplacement(mod: number, base: number | null): number {
        switch (mod) {
            case 0:
                if (base === 5) {
                    return this.getNextImmediate32();
                } else {
                    return 0;
                }
            case 1:
                return this.getNextImmediate8();
            case 2:
                return this.getNextImmediate32();
            default:
                throw new Error('Invalid modRM mod value ' + mod);
        }
    }

    getOperandSize(instructionDefinition: InstructionDefinition, operandIndex: number): OperationSize {
        const uniq = instructionDefinition.opCode.uniq;
        const allOps: InstructionDefinition[] | undefined = instructionDefinitionsByOpCode.get(uniq);
        if (allOps === undefined) {
            throw new Error(`Can't find instruction definitions with identifier ${uniq}`);
        }
        let maxWidth = OperationSize.byte;
        for (const op of allOps) {
            const operandType = op.mnemonic.operands[operandIndex];
            const width = operandTypeToWidth[operandType];
            if (width === undefined) {
                throw new Error('No width for operand type ' + operandType);
            }
            if (width > maxWidth) {
                maxWidth = width;
            }
        }
        switch (maxWidth) {
            case OperationSize.byte:
            case OperationSize.word:
                return maxWidth;
            case OperationSize.dword:
                if (this.instruction.operandSizeOverride) {
                    return OperationSize.word;
                } else {
                    return OperationSize.dword;
                }
            case OperationSize.qword:
                if (this.instruction.operandSizeOverride) {
                    return OperationSize.word;
                } else if (this.instruction.rex !== undefined && this.instruction.rex.w) {
                    return OperationSize.qword;
                } else {
                    return OperationSize.dword;
                }
        }
    }

    parseRmBits(instructionDefinition: InstructionDefinition) {
        if (this.instruction.modRM === undefined) {
            throw new Error('this.instruction.modRM is undefined');
        }

        let rmExtended = this.instruction.modRM.rm;
        if (this.instruction.rex && this.instruction.rex.b) {
            // extend ModRM.r/m with the B bit
            rmExtended = rmExtended | (this.instruction.rex.b << 3);
        }

        const dataSize = this.getOperandSize(instructionDefinition, this.instruction.operands.length);
        let regERm: ModRMReg | undefined;
        if (this.instruction.modRM.mod === 0x03) {
            regERm = rmExtended;
            if (!ModRMReg[regERm]) {
                throw new Error("Impossible value for modRM's rm");
            }
            this.instruction.operands.push({register: this.getModRmRegister(regERm, this.instruction)});

        } else {
            const rmModNot11b: ModRMrmMobNot11b | undefined = rmExtended;
            if (ModRMrmMobNot11b[rmModNot11b] === undefined) {
                throw new Error("Impossible value for modRM's r/m");
            }
            let width: SubRegisterWidth = SubRegisterWidth.dword;
            if (this.instruction.rex && this.instruction.rex.w) {
                width = SubRegisterWidth.qword;
            } else if (this.instruction.operandSizeOverride) {
                width = SubRegisterWidth.word;
            }

            if (rmModNot11b === ModRMrmMobNot11b.SIB || rmModNot11b === ModRMrmMobNot11b.SIB2) {
                const sibByte: number = this.dv.getUint8(this.bytei)
                this.bytei++;
                this.instruction.sib = {
                    scale: (sibByte & SIBscaleMask) >> 6,
                    index: (sibByte & SIBindexMask) >> 3,
                    base: sibByte & SIBbaseMask,
                }
                let indexExtended = this.instruction.sib.index;
                let baseExtended = this.instruction.sib.base;
                if (this.instruction.rex) {
                    if (this.instruction.rex.x) {
                        // extend SIB.scale with the X bit
                        indexExtended = indexExtended | (this.instruction.rex.x << 3);
                    }
                    if (this.instruction.rex.b) {
                        // extend SIB.scale with the B bit
                        baseExtended = baseExtended | (this.instruction.rex.b << 3);
                    }
                }

                const baseReg: Register | null = getSibBaseRegister(baseExtended, width, this.instruction.modRM.mod);
                const indexReg: Register | null = getSibIndexRegister(indexExtended, width);
                const scaleFactor = sibScaleFactorMap[this.instruction.sib.scale];
                const operand: Operand = {
                    effectiveAddr: {
                        base: baseReg,
                        index: indexReg,
                        scaleFactor,
                        displacement: this.parseDisplacement(this.instruction.modRM.mod, this.instruction.sib.base),
                        dataSize
                    }
                };
                this.instruction.operands.push(operand);

            } else {
                const registerFamily = modRMrmMobNot11bToRegisterMap[rmModNot11b];
                if (registerFamily === undefined) {
                    throw new Error('registerFamily is undefined, should never happen');
                }
                const register = registerFamilyWidthMapping[registerFamily][width];
                if (register == null) {
                    throw new Error('register is undefined, should never happen');
                }
                const operand: Operand = {
                    effectiveAddr: {
                        base: register,
                        index: null,
                        scaleFactor: 1,
                        displacement: this.parseDisplacement(this.instruction.modRM.mod, null),
                        dataSize,
                    }
                };
                this.instruction.operands.push(operand);
            }
        }
    }

    readModRMByte(operandModRMOrder: OperandModRMOrder): ModRM {
        const byte: number = this.dv.getUint8(this.bytei);
        this.bytei++;
        return {
            mod: (byte & 0xc0) >> 6,
            reg: (byte & 0x38) >> 3,
            rm: byte & 0x07,
        };
    }

    readOperandSizeOverridePrefix() {
        const byte = this.dv.getUint8(this.bytei);
        if (byte === 0x66) {
            this.instruction.operandSizeOverride = true;
            this.bytei++;
        }
    }

    readRex() {
        let byte = this.dv.getUint8(this.bytei);
        if (byte >= 0x40 && byte <= 0x4f) {
            this.instruction.rex = {
                w: (byte & rexMaskW) >> 3,
                r: (byte & rexMaskR) >> 2,
                x: (byte & rexMaskX) >> 1,
                b: byte & rexMaskB,
            };
            this.bytei++;
        }
    }

    getNextImmediate32(): number {
        const imm = this.dv.getUint32(this.bytei, true);
        this.bytei += 4;
        return imm;
    }

    parseImmediate1632Or64AsOperand(maxImmediateSize: OperationSize): void {
        if (this.instruction.operandSizeOverride) {
            this.instruction.operands.push({int: this.dv.getUint16(this.bytei, true)});
            this.bytei += 2;
        } else if (this.instruction.rex && this.instruction.rex.w) {
            if (maxImmediateSize === OperationSize.dword) {
                this.instruction.operands.push({int: this.dv.getUint32(this.bytei, true)});
                this.bytei += 4;
            } else if (maxImmediateSize === OperationSize.word) {
                this.instruction.operands.push({int: this.dv.getUint16(this.bytei, true)});
                this.bytei += 2;
            } else {
                this.instruction.operands.push({bigInt: this.dv.getBigUint64(this.bytei, true)});
                this.bytei += 8;
            }
        } else {
            this.instruction.operands.push({int: this.dv.getUint32(this.bytei, true)});
            this.bytei += 4;
        }
    }

    getNextImmediate8(): number {
        const byte = this.dv.getUint8(this.bytei);
        this.bytei += 1;
        return byte;
    }

    parseImmediate8AsOperand(): void {
        this.instruction.operands.push({int: this.getNextImmediate8()});
    }

    getRegisterInOpCode8(mask: number): Register {
        const regValue = this.instruction.opCode ^ mask;
        if (this.instruction.rex) {
            if (this.instruction.rex.b) {
                switch (regValue) {
                    case 0:
                        return Register.R8B;
                    case 1:
                        return Register.R9B;
                    case 2:
                        return Register.R10B;
                    case 3:
                        return Register.R11B;
                    case 4:
                        return Register.R12B;
                    case 5:
                        return Register.R13B;
                    case 6:
                        return Register.R14B;
                    case 7:
                        return Register.R15B;
                }
            } else {
                switch (regValue) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        throw new Error('Impossible opcode value');
                    case 4:
                        return Register.SPL;
                    case 5:
                        return Register.BPL;
                    case 6:
                        return Register.SIL;
                    case 7:
                        return Register.DIL;
                }
            }
        } else {
            switch (regValue) {
                case 0:
                    return Register.AL;
                case 1:
                    return Register.CL;
                case 2:
                    return Register.DL;
                case 3:
                    return Register.BL;
                case 4:
                    return Register.AH;
                case 5:
                    return Register.CH;
                case 6:
                    return Register.DH;
                case 7:
                    return Register.BH;
            }
        }
        throw new Error('Impossible opcode value');
    }

    getRegisterInOpCode1632or64(mask: number): Register {
        const regValue = this.instruction.opCode ^ mask;
        if (this.instruction.operandSizeOverride) {
            if (this.instruction.rex && this.instruction.rex.b) {
                switch (regValue) {
                    case 0:
                        return Register.R8W;
                    case 1:
                        return Register.R9W;
                    case 2:
                        return Register.R10W;
                    case 3:
                        return Register.R11W;
                    case 4:
                        return Register.R12W;
                    case 5:
                        return Register.R13W;
                    case 6:
                        return Register.R14W;
                    case 7:
                        return Register.R15W;
                }
            } else {
                switch (regValue) {
                    case 0:
                        return Register.AX;
                    case 1:
                        return Register.CX;
                    case 2:
                        return Register.DX;
                    case 3:
                        return Register.BX;
                    case 4:
                        return Register.SP;
                    case 5:
                        return Register.BP;
                    case 6:
                        return Register.SI;
                    case 7:
                        return Register.DI;
                }
            }
        }
        if (this.instruction.rex) {
            if (this.instruction.rex.w) {
                if (this.instruction.rex.b) {
                    switch (regValue) {
                        case 0:
                            return Register.R8;
                        case 1:
                            return Register.R9;
                        case 2:
                            return Register.R10;
                        case 3:
                            return Register.R11;
                        case 4:
                            return Register.R12;
                        case 5:
                            return Register.R13;
                        case 6:
                            return Register.R14;
                        case 7:
                            return Register.R15;
                    }
                } else {
                    switch (regValue) {
                        case 0:
                            return Register.RAX;
                        case 1:
                            return Register.RCX;
                        case 2:
                            return Register.RDX;
                        case 3:
                            return Register.RBX;
                        case 4:
                            return Register.RSP;
                        case 5:
                            return Register.RBP;
                        case 6:
                            return Register.RSI;
                        case 7:
                            return Register.RDI;
                    }
                }
            } else {
                if (this.instruction.rex.b) {
                    switch (regValue) {
                        case 0:
                            return Register.R8D;
                        case 1:
                            return Register.R9D;
                        case 2:
                            return Register.R10D;
                        case 3:
                            return Register.R11D;
                        case 4:
                            return Register.R12D;
                        case 5:
                            return Register.R13D;
                        case 6:
                            return Register.R14D;
                        case 7:
                            return Register.R15D;
                    }
                }
            }
        } else {
            switch (regValue) {
                case 0:
                    return Register.EAX;
                case 1:
                    return Register.ECX;
                case 2:
                    return Register.EDX;
                case 3:
                    return Register.EBX;
                case 4:
                    return Register.ESP;
                case 5:
                    return Register.EBP;
                case 6:
                    return Register.ESI;
                case 7:
                    return Register.EDI;
            }
        }
        throw new Error(`The opcode ${this.instruction.opCode.toString(16)} doesn't contain a register value!`);
    }

    extratROperand1632or64(mask: number) {
        this.instruction.operands.push({register: this.getRegisterInOpCode1632or64(mask)});
    }

    extratROperand8(mask: number) {
        this.instruction.operands.push({register: this.getRegisterInOpCode8(mask)});
    }

    parse(): Instruction {
        const start = this.bytei;

        this.readOperandSizeOverridePrefix();
        this.readRex();
        let instructionBeginI = this.bytei;
        for (const id of instructionDefinitions) {
            let isTheInstruction = false;
            if (id.opCode.registerCode !== undefined) {
                let byte = this.dv.getUint8(this.bytei);
                this.bytei++;
                // if the instruction has a register code then it's always at most 1 byte long
                if (byte >= id.opCode.bytes[0] && byte <= id.opCode.bytes[0] + 7) {
                    this.instruction.type = id.mnemonic.instructionType;
                    this.instruction.opCode = byte;
                    isTheInstruction = true;
                    if (id.opCode.registerCode === OperationSize.byte) {
                        this.extratROperand8(id.opCode.bytes[0]);
                    } else {
                        this.extratROperand1632or64(id.opCode.bytes[0]);
                    }
                }
            } else {
                let opcode: number = 0;
                let opcodeLength = 0;

                for (let i = 0; i < id.opCode.bytes.length; i++) {
                    let byte = this.dv.getUint8(this.bytei);
                    this.bytei++;
                    if (byte !== id.opCode.bytes[i]) {
                        break;
                    } else {
                        opcode |= (byte << opcodeLength);
                        opcodeLength++;
                        if (i === id.opCode.bytes.length - 1) {
                            this.instruction.type = id.mnemonic.instructionType;
                            isTheInstruction = true;
                            this.instruction.opCode = opcode;
                        }
                    }
                }
            }
            if (isTheInstruction) {
                if (id.opCode.modRM) {
                    const modRM = this.readModRMByte(id.operandModRMOrder);
                    if (id.opCode.modRMExtension !== undefined) {
                        if (modRM.reg !== id.opCode.modRMExtension) {
                            this.bytei = instructionBeginI;
                            continue;
                        }
                    }
                    this.instruction.modRM = modRM;

                }
                this.instructionDefinition = id;
                switch (id.mnemonic.operands[0]) {
                    case OperandType.AL:
                        this.instruction.operands.push({register: Register.AL});
                        break;
                    case OperandType.AX:
                    case OperandType.EAX:
                    case OperandType.RAX:
                        const allOps: InstructionDefinition[] | undefined = instructionDefinitionsByOpCode.get(id.opCode.uniq);
                        if (allOps === undefined) {
                            switch (id.mnemonic.operands[0]) {
                                case OperandType.AX:
                                    this.instruction.operands.push({register: Register.AX});
                                    break;
                                case OperandType.EAX:
                                    this.instruction.operands.push({register: Register.EAX});
                                    break;
                                case OperandType.RAX:
                                    this.instruction.operands.push({register: Register.RAX});
                                    break;
                            }
                            break;
                        }
                        let maxOperand: OperandType = OperandType.AX;
                        for (let op of allOps) {
                            if (op.mnemonic.operands[0] > maxOperand) {
                                maxOperand = op.mnemonic.operands[0];
                            }
                        }
                        if (maxOperand === OperandType.RAX) {
                            if (this.instruction.rex !== undefined && this.instruction.rex.w) {
                                this.instruction.operands.push({register: Register.RAX});
                            } else if (this.instruction.operandSizeOverride) {
                                this.instruction.operands.push({register: Register.AX});
                            } else {
                                this.instruction.operands.push({register: Register.EAX});
                            }
                        } else if (maxOperand === OperandType.EAX) {
                            if (this.instruction.operandSizeOverride) {
                                this.instruction.operands.push({register: Register.AX});
                            } else {
                                this.instruction.operands.push({register: Register.EAX});
                            }
                        } else if (maxOperand === OperandType.AX) {
                            this.instruction.operands.push({register: Register.AX});
                        }
                        break
                }
                this.instruction.is8BitsInstruction = id.is8BitsInstruction;
                if (id.opCode.modRM) {
                    if (id.operandModRMOrder === OperandModRMOrder.regFirstRmSecond) {
                        if (id.opCode.modRMExtension === undefined) {
                            this.parseRegBits();
                        }
                        this.parseRmBits(id);
                    } else {
                        this.parseRmBits(id)
                        if (id.opCode.modRMExtension === undefined) {
                            this.parseRegBits();
                        }
                    }
                }
                const allOps: InstructionDefinition[] | undefined = instructionDefinitionsByOpCode.get(id.opCode.uniq);
                if (allOps === undefined) {
                    throw new Error(`Can't find InstructionDefinition array for identifier ${id.opCode.uniq}.`);
                }
                if (id.opCode.immediateSize !== undefined) {
                    let maxImmediateSize = OperationSize.byte;
                    for (let op of allOps) {
                        if (op.opCode.immediateSize !== undefined && op.opCode.immediateSize > maxImmediateSize) {
                            maxImmediateSize = op.opCode.immediateSize;
                        }
                    }
                    if (id.opCode.immediateSize === OperationSize.byte) {
                        this.parseImmediate8AsOperand();
                    } else {
                        this.parseImmediate1632Or64AsOperand(maxImmediateSize);
                    }
                }
                break;
            } else {
                this.bytei = instructionBeginI;
            }
        }

        this.instruction.length = this.bytei - start;
        return {
            type: this.instruction.type,
            length: this.instruction.length,
            operands: this.instruction.operands,
        };
    }
}

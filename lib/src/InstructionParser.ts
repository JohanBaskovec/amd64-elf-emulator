import {Instruction, InstructionRaw, InstructionType} from "./Instruction";
import {Register, RegisterFamily} from "./amd64-architecture";

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

enum OperandModRMOrder {
    regFirstRmSecond,
    rmFirstRegSecond,
}

const operandModRMOrderMap: { [opcode: number]: OperandModRMOrder } = {
    0x89: OperandModRMOrder.rmFirstRegSecond,
    0x88: OperandModRMOrder.rmFirstRegSecond,
};

function getOperandModRMOrder(opcode: number): OperandModRMOrder {
    // Some operations encode their 2 operands in the ModRM byte,
    // but the order depends on the opcode. For example, MOV opcode 0x89
    // encodes its first operand in ModRM.r/m and its second one in ModRM.reg,
    // but MOV opcdoe 0xB8 encodes its second operand in ModRM.r/m.
    const order = operandModRMOrderMap[opcode];
    if (order) {
        return order;
    }
    return OperandModRMOrder.regFirstRmSecond;
}

export class InstructionParser {

    dv: DataView;
    bytei: number;
    lastInstr: number = 0;

    instruction: InstructionRaw = {
        type: InstructionType.none,
        operandSizeOverride: false,
        opCode: 0,
        length: 0,
        operands: [],
    };

    constructor(content: DataView, bytei: number) {
        this.dv = content;
        this.bytei = bytei;
    }

    notImplemented() {
        throw new Error('Instruction not implemented: ' + this.instruction.opCode.toString(16));
    }

    getModRmRegister(modrmreg: ModRMReg, instruction: InstructionRaw): Register {
        let registerType: RegisterType = RegisterType.integer;
        let width: SubRegisterWidth = SubRegisterWidth.dword;
        if (instruction.rex && instruction.rex.w) {
            width = SubRegisterWidth.qword;
        } else if (instruction.operandSizeOverride) {
            width = SubRegisterWidth.word;
        }
        let m = opCodeToModRmRegRegisterMap;
        switch (instruction.opCode) {
            // TODO: this probably doesn't work with all byte-addressing operations?
            case 0x88:
                if (canAddressHighByte(modrmreg) && instruction.rex === undefined) {
                    m = opCodeToModRmRegRegisterMap8;
                    width = SubRegisterWidth.highByte;
                } else {
                    width = SubRegisterWidth.lowByte;
                }
                break;
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

    parseRmBits() {
        if (this.instruction.modRM === undefined) {
            throw new Error('this.instruction.modRM is undefined');
        }

        let rmExtended = this.instruction.modRM.rm;
        if (this.instruction.rex && this.instruction.rex.b) {
            // extend ModRM.r/m with the B bit
            rmExtended = rmExtended | (this.instruction.rex.b << 3);
        }

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

            if (rmModNot11b === ModRMrmMobNot11b.SIB) {
                const sibByte: number = this.dv.getUint8(this.bytei)
                this.bytei++;
                this.instruction.sib = {
                    scale: (sibByte & SIBscaleMask) >> 6,
                    index: (sibByte & SIBindexMask) >> 3,
                    base: sibByte & SIBbaseMask,
                }
                let scaleExtended = this.instruction.sib.scale;
                let baseExtended = this.instruction.sib.scale;
                if (this.instruction.rex) {
                    if (this.instruction.rex.x) {
                        // extend SIB.scale with the X bit
                        scaleExtended = scaleExtended | (this.instruction.rex.b << 3);
                    }
                    if (this.instruction.rex.b) {
                        // extend SIB.scale with the B bit
                        baseExtended = baseExtended | (this.instruction.rex.b << 3);
                    }
                }

                const scaleFactor = sibScaleFactorMap[this.instruction.sib.scale];

            } else {
                const registerFamily = modRMrmMobNot11bToRegisterMap[rmModNot11b];
                throw new Error('mod != 11 not implemented!');
                /*
                        let width = 32;

                        if (this.instruction.rex && this.instruction.rex.w) {
                          width = 64;
                        }
                        const register = registerFamilyWidthMapping[registerFamily][width];
                        this.instruction.operands.push({effectiveAddrInRegister: register});
                */
            }
        }
    }

    parseModRM() {
        const byte: number = this.dv.getUint8(this.bytei);
        this.bytei++;
        this.instruction.modRM = {
            mod: (byte & 0xc0) >> 6,
            reg: (byte & 0x38) >> 3,
            rm: byte & 0x07,
        };

        const order = getOperandModRMOrder(this.instruction.opCode);
        if (order === OperandModRMOrder.regFirstRmSecond) {
            this.parseRegBits();
            this.parseRmBits()
        } else {
            this.parseRmBits()
            this.parseRegBits();
        }
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

    parseImmediate1632Or64() {
        if (this.instruction.operandSizeOverride) {
            this.instruction.operands.push({int: this.dv.getUint16(this.bytei, true)});
            this.bytei += 2;
        } else if (this.instruction.rex && this.instruction.rex.w) {
            this.instruction.operands.push({bigInt: this.dv.getBigUint64(this.bytei, true)});
            this.bytei += 8;
        } else {
            this.instruction.operands.push({int: this.dv.getUint32(this.bytei, true)});
            this.bytei += 4;
        }
    }

    parseImmediate8() {
        this.instruction.operands.push({int: this.dv.getUint8(this.bytei)});
        this.bytei += 1;
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

    readOpCode() {
        const bytes = new DataView(new ArrayBuffer(2));
        const byte0 = this.dv.getUint8(this.bytei);
        bytes.setUint8(0, byte0);
        this.bytei++;
        switch (byte0) {
            // SYSCALL
            case 0x0f:
                bytes.setUint8(1, this.dv.getUint8(this.bytei));
                this.bytei++;
                this.instruction.opCode = bytes.getUint16(0, true);
                break;
            default:
                this.instruction.opCode = byte0;
        }

        //console.log('Found opcode ' + this.instruction.opCode.toString(16));
    }

    parse(): Instruction {
        const start = this.bytei;

        this.readOperandSizeOverridePrefix();
        this.readRex();
        this.readOpCode();

        // MOV reg16, imm16
        // MOV reg32, imm32
        // MOV reg64, imm64
        if ((this.instruction.opCode & 0xB8) === 0xB8) {
            this.instruction.type = InstructionType.MOV;
            this.extratROperand1632or64(0xB8)
            this.parseImmediate1632Or64();

        } else if ((this.instruction.opCode & 0xB0) === 0xB0) {
            this.instruction.type = InstructionType.MOV;
            this.extratROperand8(0xB0)
            this.parseImmediate8();
        } else {
            switch (this.instruction.opCode) {
                /* SYSCALL */
                case 0x050f:
                    //console.log('system call!');
                    this.instruction.type = InstructionType.SYSCALL;
                    break;
                /* XOR */
                case 0x34:
                case 0x35:
                case 0x80:
                case 0x81:
                case 0x83:
                case 0x30:
                    this.notImplemented();
                    break;
                // XOR reg/mem16, reg16
                // XOR reg/mem32, reg32
                // XOR reg/mem64, reg64
                case 0x31:
                    this.instruction.type = InstructionType.XOR;
                    this.parseModRM();

                    break;
                case 0x32:
                case 0x33:
                /* MOV */
                case 0x88:
                    this.instruction.type = InstructionType.MOV;
                    this.parseModRM();
                    break;
                // MOV reg/mem16, reg16
                // MOV reg/mem32, reg32
                // MOV reg/mem32, reg64
                case 0x89:
                    this.instruction.type = InstructionType.MOV;
                    this.parseModRM();
                    break;
                case 0x8A:
                case 0x8B:
                case 0x8C:
                case 0x8E:
                case 0xA0:
                case 0xA1:
                case 0xA2:
                case 0xA3:
                // case B8, B8: the register's code is added to it!
                case 0xB0:
                case 0xC6:
                case 0xC7:
                    this.notImplemented();
                    break;

                default:
                    this.notImplemented();
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

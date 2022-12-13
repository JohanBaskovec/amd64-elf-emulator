import {Instruction, InstructionRaw, InstructionType, ModRM, Operand, OperandModRMOrder,} from "./Instruction";
import {
    canAddressHighByte,
    ModRMReg,
    ModRMrmMobNot11b,
    modRMrmMobNot11bToRegisterMap,
    opCodeToModRmRegRegisterMap,
    opCodeToModRmRegRegisterMap8,
    OperationSize,
    Register,
    RegisterFamily,
    registerFamilyWidthMapping,
    RegisterType,
    sibScaleFactorMap,
    SubRegisterWidth
} from "./amd64-architecture";
import {
    initInstructionDefinitions,
    InstructionDefinition,
    instructionDefinitions,
    instructionDefinitionsByOpCode,
    OperandType,
    operandTypeToWidth
} from "./instructions-definitions";


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
        bytes: new ArrayBuffer(0),
    };
    instructionDefinition: InstructionDefinition | undefined = undefined;
    private addrOffset: number;

    constructor(content: DataView, bytei: number, addrOffset: number) {
        this.dv = content;
        this.bytei = bytei;
        this.addrOffset = addrOffset;
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
                return this.getNextImmediate8().unsigned;
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
            if (this.default64MemoryOffset[this.instruction.type] || (this.instruction.rex && this.instruction.rex.w)) {
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

    parseRelativeOffsetAsOperand(maxSize: OperationSize): void {
        let valueUnsigned: bigint = 0n;
        let valueSigned: bigint = 0n;
        let width = OperationSize.dword;
        switch (maxSize) {
            case OperationSize.byte:
            case OperationSize.word:
                width = maxSize;
                break;
            case OperationSize.dword:
                if (this.instruction.operandSizeOverride) {
                    width = OperationSize.word;
                } else {
                    width = OperationSize.dword;
                }
                break;
            case OperationSize.qword:
                throw new Error('relative offset cannot be 64 bits!');
        }
        switch (width) {
            case OperationSize.byte:
                valueUnsigned = BigInt(this.dv.getUint8(this.bytei));
                valueSigned = BigInt(this.dv.getInt8(this.bytei));
                this.bytei += 1;
                break;
            case OperationSize.word:
                valueUnsigned = BigInt(this.dv.getUint16(this.bytei, true));
                valueSigned = BigInt(this.dv.getInt16(this.bytei, true));
                this.bytei += 2;
                break;
            case OperationSize.dword:
                valueUnsigned = BigInt(this.dv.getUint32(this.bytei, true));
                valueSigned = BigInt(this.dv.getInt32(this.bytei, true));
                this.bytei += 4;
                break;
        }

        this.instruction.operands.push({relativeOffset: {valueUnsigned, valueSigned, width}});
    }

    parseImmediate1632Or64AsOperand(maxImmediateSize: OperationSize): void {
        let valueUnsigned: bigint = 0n;
        let valueSigned: bigint = 0n;
        let width = OperationSize.dword;
        if (this.instruction.operandSizeOverride) {
            valueUnsigned = BigInt(this.dv.getUint16(this.bytei, true));
            valueSigned = BigInt(this.dv.getInt16(this.bytei, true));
            width = OperationSize.word;
            this.bytei += 2;
        } else if (this.instruction.rex && this.instruction.rex.w) {
            if (maxImmediateSize === OperationSize.dword) {
                valueUnsigned = BigInt(this.dv.getUint32(this.bytei, true));
                valueSigned = BigInt(this.dv.getInt32(this.bytei, true));
                this.bytei += 4;
            } else if (maxImmediateSize === OperationSize.word) {
                valueUnsigned = BigInt(this.dv.getUint16(this.bytei, true));
                valueSigned = BigInt(this.dv.getInt16(this.bytei, true));
                width = OperationSize.word;
                this.bytei += 2;
            } else {
                valueUnsigned = this.dv.getBigUint64(this.bytei, true);
                valueSigned = BigInt(this.dv.getBigInt64(this.bytei, true));
                width = OperationSize.qword;
                this.bytei += 8;
            }
        } else {
            valueUnsigned = BigInt(this.dv.getUint32(this.bytei, true));
            valueSigned = BigInt(this.dv.getInt32(this.bytei, true));
            this.bytei += 4;
        }

        this.instruction.operands.push({immediate: {valueUnsigned, valueSigned, width}});
    }

    getNextImmediate8(): { signed: number, unsigned: number } {
        const unsigned = this.dv.getUint8(this.bytei);
        const signed = this.dv.getInt8(this.bytei);
        this.bytei += 1;
        return {unsigned, signed};
    }

    parseImmediate8AsOperand(): void {
        const {signed, unsigned} = this.getNextImmediate8();
        this.instruction.operands.push({
            immediate: {
                valueUnsigned: BigInt(unsigned),
                valueSigned: BigInt(signed),
                width: OperationSize.byte
            }
        });
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

    default64OperandSize: { [key in InstructionType]?: boolean } = {
        [InstructionType.PUSH]: true,
        [InstructionType.POP]: true,
        [InstructionType.RET]: true,
        [InstructionType.CALL]: true,
    }

    default64MemoryOffset: { [key in InstructionType]?: boolean } = {
        [InstructionType.MOV]: true,
    }

    getRegisterInOpCode1632or64(mask: number): Register {
        let defaultTo64 = !!this.default64OperandSize[this.instruction.type];
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
            if (this.instruction.rex.w || defaultTo64) {
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
        } else if (defaultTo64) {
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
                if (this.isUnsupportedInstruction(id)) {
                    throw new Error('Instruction unsupported: ' + id.opCode.uniq);
                }
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
                if (id.opCode.codeOffsetSize !== undefined) {
                    let maxCodeOffsetSize = OperationSize.byte;
                    for (let op of allOps) {
                        if (op.opCode.codeOffsetSize !== undefined && op.opCode.codeOffsetSize > maxCodeOffsetSize) {
                            maxCodeOffsetSize = op.opCode.codeOffsetSize;
                        }
                    }
                    if (id.opCode.codeOffsetSize === OperationSize.byte) {
                        this.parseRelativeOffsetAsOperand(maxCodeOffsetSize);
                    } else {
                        this.parseRelativeOffsetAsOperand(maxCodeOffsetSize);
                    }
                }
                break;
            } else {
                this.bytei = instructionBeginI;
            }
        }

        if (this.instruction.type === InstructionType.none) {
            throw new Error('Instruction unsupported.');
        }

        this.instruction.length = this.bytei - start;
        this.instruction.bytes = this.dv.buffer.slice(start, this.bytei);
        return {
            type: this.instruction.type,
            length: this.instruction.length,
            operands: this.instruction.operands,
            raw: this.instruction,
            virtualAddress: start + this.addrOffset,
        };
    }

    private isOperandUnsupported(operand: OperandType): boolean {
        switch (operand) {
            case OperandType.moffset8:
            case OperandType.moffset16:
            case OperandType.moffset32:
            case OperandType.moffset64:
            case OperandType.reg16OrReg32OrReg64OrMem16:
            case OperandType.segReg:
                return true;
            default:
                return false;
        }
    }

    private isUnsupportedInstruction(id: InstructionDefinition) {
        const operands = id.mnemonic.operands;
        for (const operand of operands) {
            if (this.isOperandUnsupported(operand)) {
                return true;
            }
        }
        return false;
    }
}

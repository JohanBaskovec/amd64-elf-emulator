import {
    defaultRegisterWidthToSubRegisterWidth,
    OperationSize,
    operationSizeToBitsMap,
    operationSizeToBytesMap,
    raxWidthMap,
    rdxWidthMap,
    Register,
    Register64,
    register64WidthMapping,
    registerOffset,
    registerReverseMap,
    registerWidthMap,
    SubRegisterWidth
} from "./amd64-architecture";
import {EffectiveAddress, Instruction, InstructionType, Operand} from "./Instruction";
import {Emulator} from "./Emulator";

type ValueWithWidth = {
    value: bigint;
    valueWidth: OperationSize;
}

const stackMaxSize = 2000000;


export class Cpu {
    private registers: { [key in Register64]: DataView } = {
        [Register64.RAX]: new DataView(new ArrayBuffer(8)),
        [Register64.RBX]: new DataView(new ArrayBuffer(8)),
        [Register64.RCX]: new DataView(new ArrayBuffer(8)),
        [Register64.RDX]: new DataView(new ArrayBuffer(8)),
        [Register64.RSI]: new DataView(new ArrayBuffer(8)),
        [Register64.RDI]: new DataView(new ArrayBuffer(8)),
        [Register64.RSP]: new DataView(new ArrayBuffer(8)),
        [Register64.RBP]: new DataView(new ArrayBuffer(8)),
        [Register64.R8]: new DataView(new ArrayBuffer(8)),
        [Register64.R9]: new DataView(new ArrayBuffer(8)),
        [Register64.R10]: new DataView(new ArrayBuffer(8)),
        [Register64.R11]: new DataView(new ArrayBuffer(8)),
        [Register64.R12]: new DataView(new ArrayBuffer(8)),
        [Register64.R13]: new DataView(new ArrayBuffer(8)),
        [Register64.R14]: new DataView(new ArrayBuffer(8)),
        [Register64.R15]: new DataView(new ArrayBuffer(8)),
    }

    // 2mo stack
    stack = new DataView(new ArrayBuffer(stackMaxSize));

    private rip: number = 0;

    // RFLAGS
    addrOffset: number = 0;
    private emulator: Emulator;
    private zeroFlag: boolean = false;
    private overflowFlag: boolean = false;
    private carryFlag: boolean = false;
    private parityFlag: boolean = false;
    private signFlag: boolean = false;

    constructor(rip: number, addrOffset: number, emulator: Emulator) {
        this.rip = rip;
        this.addrOffset = addrOffset;
        this.emulator = emulator;
        this.setRegisterValue(Register.RSP, BigInt(stackMaxSize - 16), true);
    }

    printRegister(register: Register): void {
        const reg64: Register64 = registerReverseMap[register];
        const dataView = this.registers[reg64];
        const name: string = Register64[reg64];
        const val64 = dataView.getBigUint64(0, true);
        const val32 = dataView.getUint32(0, true);
        const val16 = dataView.getUint16(0, true);
        const val8 = dataView.getUint8(0);
        let str = `Value of ${name}:
u64: decimal = ${val64}, hex = ${val64.toString(16)}
u32: decimal = ${val32}, hex = ${val32.toString(16)}
u16: decimal = ${val16}, hex = ${val16.toString(16)}
u8: decimal = ${val8}, hex = ${val8.toString(16)}
Data in the DataView (big endian!):
`;
        let hexStr = '';
        let binaryStr = '';
        let bits = 0;
        for (let i = 0; i < 8; i++) {
            const byte = dataView.getUint8(i);
            let hex = byte.toString(16);
            if (hex.length === 1) {
                hex = '0' + hex;
            }
            hexStr += hex + ' ';
            for (let k = 128; k >= 1; k = k / 2) {
                if (byte & k) {
                    binaryStr += '1';
                } else {
                    binaryStr += '0';
                }
                bits++;
                if (bits === 4) {
                    binaryStr += ' ';
                    bits = 0;
                }
            }
        }
        console.log(str + hexStr + "\n" + binaryStr);

    }

    getRegistersBytes(register: Register): Uint8Array {
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width: OperationSize = registerWidthMap[register];
        const widthBytes = operationSizeToBytesMap[width];

        return new Uint8Array(regDataView.buffer, off, widthBytes);
    }

    readUnsignedValueRegister(register: Register): bigint {
        return this.readValueRegister(register, false);
    }

    readSignedValueRegister(register: Register): bigint {
        return this.readValueRegister(register, true);
    }

    readValueRegister(register: Register, signed: boolean): bigint {
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width = registerWidthMap[register];
        if (signed) {
            switch (width) {
                case OperationSize.qword:
                    return regDataView.getBigInt64(off, true);
                case OperationSize.dword:
                    return BigInt(regDataView.getInt32(off, true));
                case OperationSize.word:
                    return BigInt(regDataView.getInt16(off, true));
                case OperationSize.byte:
                    return BigInt(regDataView.getInt8(off));
                default:
                    throw new Error('Unknown width!');
            }
        } else {
            switch (width) {
                case OperationSize.qword:
                    return regDataView.getBigUint64(off, true);
                case OperationSize.dword:
                    return BigInt(regDataView.getUint32(off, true));
                case OperationSize.word:
                    return BigInt(regDataView.getUint16(off, true));
                case OperationSize.byte:
                    return BigInt(regDataView.getUint8(off));
                default:
                    throw new Error('Unknown width!');
            }
        }
    }

    setUnsignedRegisterValue(register: Register, value: bigint) {
        this.setRegisterValue(register, value, false);
    }

    setSignedRegisterValue(register: Register, value: bigint) {
        this.setRegisterValue(register, value, true);
    }

    setRegisterValue(register: Register, value: bigint, signed: boolean) {
        //console.log('Before:');
        //this.printRegister(register);
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width = registerWidthMap[register];
        if (signed) {
            switch (width) {
                case OperationSize.qword:
                    regDataView.setBigInt64(off, value, true);
                    break;
                case OperationSize.dword:
                    // Writing 32 bits overwrite the entire register
                    regDataView.setBigInt64(0, value, true);
                    break;
                case OperationSize.word:
                    // Writing 16 bits keeps the top 48 bits of register
                    regDataView.setInt16(off, Number(value), true);
                    break;
                case OperationSize.byte:
                    regDataView.setInt8(off, Number(value));
                    break;
                default:
                    throw new Error('Unknown width!');
            }
        } else {
            switch (width) {
                case OperationSize.qword:
                    regDataView.setBigUint64(off, value, true);
                    break;
                case OperationSize.dword:
                    // Writing 32 bits overwrite the entire register
                    regDataView.setBigUint64(0, value, true);
                    break;
                case OperationSize.word:
                    // Writing 16 bits keeps the top 48 bits of register
                    regDataView.setUint16(off, Number(value), true);
                    break;
                case OperationSize.byte:
                    regDataView.setUint8(off, Number(value));
                    break;
                default:
                    throw new Error('Unknown width!');

            }
        }

        //console.log('After:');
        //this.printRegister(register);
    }

    readFromDataView(dataView: DataView, addr: number, width: OperationSize, signed: boolean): bigint {
        if (signed) {
            switch (width) {
                case OperationSize.byte:
                    return BigInt(dataView.getInt8(addr));
                case OperationSize.word:
                    return BigInt(dataView.getInt16(addr, true));
                case OperationSize.dword:
                    return BigInt(dataView.getInt32(addr, true));
                case OperationSize.qword:
                    return dataView.getBigInt64(addr, true);
            }
        } else {
            switch (width) {
                case OperationSize.byte:
                    return BigInt(dataView.getUint8(addr));
                case OperationSize.word:
                    return BigInt(dataView.getUint16(addr, true));
                case OperationSize.dword:
                    return BigInt(dataView.getUint32(addr, true));
                case OperationSize.qword:
                    return dataView.getBigUint64(addr, true);
            }
        }
    }

    readSignedDataAtAddr(dataView: DataView, addr: number, width: OperationSize): bigint {
        addr = addr - this.addrOffset;
        return this.readFromDataView(dataView, addr, width, true);
    }

    readUnsignedDataAtAddr(dataView: DataView, addr: number, width: OperationSize): bigint {
        addr = addr - this.addrOffset;
        return this.readFromDataView(dataView, addr, width, false);
    }

    private writeDataAtAddress(dataView: DataView, addr: number, value: bigint, operationSize: OperationSize, signed: boolean): void {
        if (signed) {
            switch (operationSize) {
                case OperationSize.byte:
                    return dataView.setInt8(addr, Number(value));
                case OperationSize.word:
                    return dataView.setInt16(addr, Number(value), true);
                case OperationSize.dword:
                    return dataView.setInt32(addr, Number(value), true);
                case OperationSize.qword:
                    return dataView.setBigInt64(addr, value, true);
            }
        } else {
            switch (operationSize) {
                case OperationSize.byte:
                    return dataView.setUint8(addr, Number(value));
                case OperationSize.word:
                    return dataView.setUint16(addr, Number(value), true);
                case OperationSize.dword:
                    return dataView.setUint32(addr, Number(value), true);
                case OperationSize.qword:
                    return dataView.setBigUint64(addr, value, true);
            }
        }
    }

    readUnsignedValueFromOperand(dataView: DataView, operand: Operand): bigint {
        return this.readValueFromOperand(dataView, operand, false);
    }

    readSignedValueFromOperand(dataView: DataView, operand: Operand): bigint {
        return this.readValueFromOperand(dataView, operand, true);
    }

    getOperandWidth(operand: Operand): OperationSize {
        if (operand.register !== undefined) {
            return registerWidthMap[operand.register];
        } else if (operand.immediate !== undefined) {
            return operand.immediate.width;
        } else if (operand.effectiveAddr !== undefined) {
            return operand.effectiveAddr.dataSize
        } else {
            throw new Error('Empty operand');
        }
    }

    readValueFromOperandWithWidth(dataView: DataView, operand: Operand, signed: boolean): ValueWithWidth {
        const value = this.readValueFromOperand(dataView, operand, signed);
        let width = this.getOperandWidth(operand);
        return {value, valueWidth: width};
    }

    readValueFromOperand(dataView: DataView, operand: Operand, signed: boolean): bigint {
        if (operand.register !== undefined) {
            return this.readValueRegister(operand.register, signed);
        } else if (operand.immediate !== undefined) {
            if (signed) {
                return operand.immediate.valueSigned;
            } else {
                return operand.immediate.valueUnsigned;
            }
        } else if (operand.relativeOffset !== undefined) {
            if (signed) {
                return operand.relativeOffset.valueSigned;
            } else {
                return operand.relativeOffset.valueUnsigned;
            }
        } else if (operand.effectiveAddr !== undefined) {
            const ea: EffectiveAddress = operand.effectiveAddr;
            const addr = this.calculateAddress(ea) - this.addrOffset;
            return this.readFromDataView(dataView, addr, operand.effectiveAddr.dataSize, signed);
        } else {
            throw new Error('Empty operand');
        }
    }

    writeValueInOperand(dataView: DataView, operand: Operand, value: bigint, signed: boolean): void {
        if (operand.register !== undefined) {
            this.setRegisterValue(operand.register, value, signed);
        } else if (operand.effectiveAddr !== undefined) {
            const ea = operand.effectiveAddr;
            const addr = this.calculateAddress(ea) - this.addrOffset;
            this.writeDataAtAddress(dataView, addr, value, ea.dataSize, signed);
        }
    }

    doAdd(dataView: DataView, instruction: Instruction) {
        let value0: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[0]);
        let value1: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[1]);

        this.writeValueInOperand(dataView, instruction.operands[0], value0 + value1, false);
    }

    doSUB(dataView: DataView, instruction: Instruction) {
        let value0: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[0]);
        let value1: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[1]);

        this.writeValueInOperand(dataView, instruction.operands[0], value0 - value1, false);
    }

    private readValueRegisters(registers: Register[], signed: boolean): bigint {
        const byteArrays: Uint8Array[] = registers.map(r => this.getRegistersBytes(r));
        let widthBytes = 0;
        let num: bigint = 0n;
        let mul: bigint = 0x1n;
        for (const byteArray of byteArrays) {
            widthBytes += byteArray.length;
            for (let i = 0; i < byteArray.length; i++) {
                const byte = byteArray[i];
                num += BigInt(BigInt(byte) * mul);
                mul *= 0x100n;
            }
        }
        if (signed) {
            if (num & (mul / 2n)) {
                return num - (mul);
            } else {
                return num;
            }
        } else {
            return num;
        }
    }

    readUnsignedValueRegisters(registers: Register[]): bigint {
        return this.readValueRegisters(registers, false);
    }

    readSignedValueRegisters(registers: Register[]): bigint {
        return this.readValueRegisters(registers, true);
    }

    writeValueRegisters(registers: Register[], value: bigint, signed: boolean): void {
        let totalWidthBytes: number = 0;
        let widthsBytes: number[] = [];
        const bytes: number[][] = [];
        let registerWidth = OperationSize.dword;
        for (const register of registers) {
            registerWidth = registerWidthMap[register]
            const registerWidthBytes = operationSizeToBytesMap[registerWidth]
            totalWidthBytes += registerWidthBytes;
            for (const otherWidth of widthsBytes) {
                if (otherWidth !== registerWidthBytes) {
                    throw new Error(`Can't write 1 value to registers of different sizes!`);
                }
            }
            widthsBytes.push(registerWidthBytes);
            bytes.push([]);
        }

        const widthPerRegister = widthsBytes[0];

        let valueCopy = value;
        // we use bigint here to be able to shift right more than 32
        for (let i = 0; i < totalWidthBytes; i++) {
            const registerIndex = Math.floor(i / widthPerRegister);
            const byte = valueCopy & 0xffn;
            bytes[registerIndex].push(Number(byte));
            valueCopy = valueCopy >> 8n;
        }
        for (let i = 0; i < registers.length; i++) {
            const dataView = new DataView(new Uint8Array(bytes[i]).buffer)
            const value: bigint = this.readFromDataView(dataView, 0, registerWidth, signed);
            this.setRegisterValue(registers[i], value, signed);
        }
    }

    private doIDIV(dataView: DataView, instruction: Instruction) {
        const operand: Operand = instruction.operands[0];
        const divisor: bigint = this.readSignedValueFromOperand(dataView, operand);
        let width = OperationSize.dword;
        if (operand.register !== undefined) {
            width = registerWidthMap[operand.register];
        } else if (operand.effectiveAddr !== undefined) {
            width = operand.effectiveAddr.dataSize;
        } else {
            throw new Error('Invalid operand for IDIV.');
        }
        const widthBits: bigint = BigInt(operationSizeToBitsMap[width]);
        const registerWidth: SubRegisterWidth = defaultRegisterWidthToSubRegisterWidth[width];
        let highBytesRegister: Register | undefined = rdxWidthMap[registerWidth];
        if (highBytesRegister === undefined) {
            throw new Error('Could not find register.');
        }
        let lowBytesRegister: Register | undefined = raxWidthMap[registerWidth];
        if (lowBytesRegister === undefined) {
            throw new Error('Could not find register.');
        }
        const dividend = this.readSignedValueRegisters([highBytesRegister, lowBytesRegister]);

        const remainder = dividend % divisor;
        const quotient = dividend / divisor;

        this.setRegisterValue(highBytesRegister, remainder, true);
        this.setRegisterValue(lowBytesRegister, quotient, true);
    }

    private doIMUL(dataView: DataView, instruction: Instruction) {
        // TODO: overflow
        if (instruction.operands.length === 1) {
            const operand: Operand = instruction.operands[0];
            const multiplier: bigint = this.readSignedValueFromOperand(dataView, operand);
            let width = OperationSize.dword;
            if (operand.register !== undefined) {
                width = registerWidthMap[operand.register];
            } else if (operand.effectiveAddr !== undefined) {
                width = operand.effectiveAddr.dataSize;
            } else {
                throw new Error('Invalid operand for IDIV.');
            }
            const widthBits: bigint = BigInt(operationSizeToBitsMap[width]);
            const registerWidth: SubRegisterWidth = defaultRegisterWidthToSubRegisterWidth[width];
            let highBytesRegister: Register | undefined = rdxWidthMap[registerWidth];
            if (highBytesRegister === undefined) {
                throw new Error('Could not find register.');
            }
            let lowBytesRegister: Register | undefined = raxWidthMap[registerWidth];
            if (lowBytesRegister === undefined) {
                throw new Error('Could not find register.');
            }
            const multiplicand: bigint = this.readValueRegister(lowBytesRegister, true);
            const product: bigint = multiplicand * multiplier;
            this.writeValueRegisters([highBytesRegister, lowBytesRegister], product, true);

        } else if (instruction.operands.length === 2) {
            const operand0: Operand = instruction.operands[0];
            const multiplicand: bigint = this.readSignedValueFromOperand(dataView, operand0);
            const operand1: Operand = instruction.operands[1];
            const multiplier: bigint = this.readSignedValueFromOperand(dataView, operand1);
            const product: bigint = multiplicand * multiplier;
            this.writeValueInOperand(dataView, operand0, product, true);

        } else {
            const multiplicand: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[1]);
            const multiplier: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[2]);
            const product: bigint = multiplicand * multiplier;
            this.writeValueInOperand(dataView, instruction.operands[0], product, true);
        }
    }

    readCurrentStackTop(width: OperationSize, signed: boolean): bigint {
        const rsp = this.readValueRegister(Register.RSP, false);
        return this.readFromDataView(this.stack, Number(rsp), width, signed);
    }

    private pushOnStack(value: bigint, width: OperationSize): void {
        const widthBytes: number = operationSizeToBytesMap[width];
        const rsp: bigint = this.readUnsignedValueRegister(Register.RSP);
        const newRsp = rsp - BigInt(widthBytes);
        if (newRsp < 0) {
            throw new Error('Stack overflow.');
        }
        this.writeDataAtAddress(this.stack, Number(newRsp), value, width, true);
        this.setUnsignedRegisterValue(Register.RSP, newRsp);
    }

    private doPUSH(dataView: DataView, instruction: Instruction): void {
        const {value, valueWidth} = this.readValueFromOperandWithWidth(dataView, instruction.operands[0], false);
        this.pushOnStack(value, valueWidth);
    }

    private doPOP(dataView: DataView, instruction: Instruction): void {
        const width = this.getOperandWidth(instruction.operands[0]);
        const value = this.readCurrentStackTop(width, true);
        this.writeValueInOperand(dataView, instruction.operands[0], value, true);
        const rsp: bigint = this.readUnsignedValueRegister(Register.RSP);
        const widthBytes: number = operationSizeToBytesMap[width];
        const newRsp = rsp + BigInt(widthBytes);
        if (newRsp > stackMaxSize) {
            throw new Error('Stack underflow.');
        }
        this.setUnsignedRegisterValue(Register.RSP, newRsp);

    }

    private doCMP(dataView: DataView, instruction: Instruction): void {
        // it doesn't matter if we interpret as signed or unsigned, the comparison gives the same result
        const value0 = this.readSignedValueFromOperand(dataView, instruction.operands[0]);
        const value1 = this.readSignedValueFromOperand(dataView, instruction.operands[1]);
        const res: bigint = value0 - value1;
        // example:
        // 9 >= 4, res = 5, SF = 0, OF = 0, CF = 0
        // 4 >= 9, res = -5, SF = 1, OF = 0, CF = 1
        this.zeroFlag = res === 0n;
        this.signFlag = res < 0;
        if (res > 0) {
            this.overflowFlag = this.signFlag;
        } else if (res < 0) {
            this.overflowFlag = !this.signFlag;
        } else {
            this.overflowFlag = false;
        }
        this.carryFlag = res < 0;
    }


    private doXOR(dataView: DataView, instruction: Instruction): void {
        if (instruction.operands[1].register === undefined) {
            throw new Error(`opcode 0x31 (XOR) but operand 2 isn't a register!`);
        }
        let val1: bigint = this.readValueRegister(instruction.operands[1].register, false);
        let val2: bigint = BigInt(0);

        if (instruction.operands[0].register !== undefined) {
            val2 = this.readValueRegister(instruction.operands[0].register, false);
            //console.log(`0x31: ${val1}^${val2}`);
            const res: bigint = val1 ^ val2;
            this.setRegisterValue(instruction.operands[0].register, res, false);
        } else if (instruction.operands[0].address !== undefined) {
            throw new Error('not impl address');
        } else if (instruction.operands[0].effectiveAddr) {
            throw new Error('not impl effective addr');
        }
    }

    private doMOV(dataView: DataView, instruction: Instruction): void {
        let value: bigint = this.readValueFromOperand(dataView, instruction.operands[1], false);

        if (instruction.operands[0].register !== undefined) {
            this.setRegisterValue(instruction.operands[0].register, value, false);
        } else if (instruction.operands[0].effectiveAddr !== undefined) {
            const value = this.readValueFromOperand(dataView, instruction.operands[1], true);
            const ea = instruction.operands[0].effectiveAddr;
            const addr = this.calculateAddress(ea) - this.addrOffset;
            this.writeDataAtAddress(dataView, addr, value, ea.dataSize, false);
        }
    }

    private doMOVZX(dataView: DataView, instruction: Instruction): void {
        const {value, valueWidth} = this.readValueFromOperandWithWidth(dataView, instruction.operands[1], true);
        if (instruction.operands[0].register === undefined) {
            throw new Error(`Target of MOVZX isn't a register.`);
        }
        const targetRegister: Register = instruction.operands[0].register;
        const targetRegisterWidth: OperationSize = registerWidthMap[targetRegister];

        const targetRegister64: Register64 = registerReverseMap[instruction.operands[0].register];
        const regDataView: DataView = this.registers[targetRegister64];

        const subRegisterWidth = defaultRegisterWidthToSubRegisterWidth[valueWidth];
        const targetSubRegister: Register | undefined = register64WidthMapping[targetRegister64][subRegisterWidth]
        if (targetSubRegister === undefined) {
            throw new Error('Register not found');
        }

        switch (targetRegisterWidth) {
            case OperationSize.qword:
                regDataView.setBigInt64(0, 0n, true);
                break;
            case OperationSize.dword:
                regDataView.setBigInt64(0, 0n, true);
                break;
            case OperationSize.word:
                regDataView.setUint16(0, 0, true);
                break;
            case OperationSize.byte:
                break;
        }
        switch (valueWidth) {
            case OperationSize.byte:
                regDataView.setUint8(0, Number(value));
                break;
            case OperationSize.word:
                regDataView.setUint16(0, Number(value), true);
                break;
            case OperationSize.dword:
                regDataView.setUint32(0, Number(value), true);
                break;
            case OperationSize.qword:
                regDataView.setBigUint64(0, value, true);
                break;
        }
    }

    private doJGE(dataView: DataView, instruction: Instruction): void {
        if (this.overflowFlag === this.signFlag) {
            const offset: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[0]);
            this.rip = this.rip + Number(offset)
        }
    }

    private doCALL(dataView: DataView, instruction: Instruction): void {
        this.pushOnStack(BigInt(this.rip), OperationSize.qword);
        const offset: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[0]);
        this.rip = this.rip + Number(offset)
    }

    private doRET(dataView: DataView, instruction: Instruction): void {
        // top of the stack MUST be RIP
        const value = this.readCurrentStackTop(OperationSize.qword, true);
        this.rip = Number(value);
        const rsp: bigint = this.readUnsignedValueRegister(Register.RSP);
        const newRsp = rsp + BigInt(8);
        if (newRsp > stackMaxSize) {
            throw new Error('Stack underflow.');
        }
        this.setUnsignedRegisterValue(Register.RSP, newRsp);
    }

    private doSYSCALL(dataView: DataView, instruction: Instruction): void {
        const code = this.readValueRegister(Register.RAX, false);
        //console.log(`System call code ${code}`);
        switch (code) {
            case 1n:
                // TODO: will clamp to 32 bits without warning!
                const strAddr = Number(this.readValueRegister(Register.RSI, false)) - this.addrOffset;
                const strLength = Number(this.readValueRegister(Register.RDX, false));
                const td = new TextDecoder("utf-8");
                const dvs = dataView.buffer.slice(strAddr, strAddr + strLength);
                const str = td.decode(dvs);
                console.log('Write: ' + str);
                this.emulator.onWrite(str);
                break;
            case 60n:
                const exitCode = Number(this.readValueRegister(Register.RDI, false));
                console.log(`Process finished with code ${exitCode}`);
                this.emulator.onExit(exitCode);
                break;
            default:
                throw new Error(`System call ${code} not implemented.`);
        }
    }


    execute(dataView: DataView, instruction: Instruction) {
        if (instruction.length !== undefined) {
            this.rip += instruction.length;
        }
        //console.log(instructionFormat(instruction));
        switch (instruction.type) {
            case InstructionType.XOR:
                this.doXOR(dataView, instruction);
                break;

            case InstructionType.ADD:
                this.doAdd(dataView, instruction);
                break;
            case InstructionType.IDIV:
                this.doIDIV(dataView, instruction);
                break;
            case InstructionType.IMUL:
                this.doIMUL(dataView, instruction);
                break;
            case InstructionType.SUB:
                this.doSUB(dataView, instruction);
                break;
            case InstructionType.PUSH:
                this.doPUSH(dataView, instruction);
                break;
            case InstructionType.POP:
                this.doPOP(dataView, instruction);
                break;

            case InstructionType.MOV:
                this.doMOV(dataView, instruction);
                break;
            case InstructionType.MOVZX:
                this.doMOVZX(dataView, instruction);
                break;
            case InstructionType.JGE:
                this.doJGE(dataView, instruction);
                break;
            case InstructionType.CMP:
                this.doCMP(dataView, instruction);
                break;
            case InstructionType.CALL:
                this.doCALL(dataView, instruction);
                break;

            case InstructionType.SYSCALL:
                this.doSYSCALL(dataView, instruction);
                break;
            case InstructionType.RET:
                this.doRET(dataView, instruction);
                break;

            default:
                throw new Error('Unsupported instruction type: ' + instruction.type);
        }
    }

    private calculateAddress(ea: EffectiveAddress) {
        let base = 0;
        let index = 0;
        let scaleFactor = ea.scaleFactor;
        let displacement = ea.displacement;
        if (ea.base !== null) {
            // TODO: large address not supported
            base = Number(this.readValueRegister(ea.base, false));
        }
        if (ea.index !== null) {
            index = Number(this.readValueRegister(ea.index, false));
        }
        const addr = base + index * scaleFactor + displacement;
        return addr;
    }

    getRip() {
        return this.rip;
    }
}

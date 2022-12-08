import {
    defaultRegisterWidthToSubRegisterWidth,
    OperationSize,
    operationSizeToBitsMap,
    operationSizeToBytesMap,
    raxWidthMap,
    rdxWidthMap,
    Register,
    Register64,
    registerOffset,
    registerReverseMap,
    registerWidthMap,
    SubRegisterWidth
} from "./amd64-architecture";
import {EffectiveAddress, Instruction, InstructionType, Operand} from "./Instruction";
import {Emulator} from "./Emulator";

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

    private rip: number = 0;

    // RFLAGS
    private overflow: boolean = false;
    private carry: boolean = false;
    private addrOffset: number = 0;
    private emulator: Emulator;

    constructor(rip: number, addrOffset: number, emulator: Emulator) {
        this.rip = rip;
        this.addrOffset = addrOffset;
        this.emulator = emulator;
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

    readUnsignedValueRegister(register: Register): bigint {
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width = registerWidthMap[register];
        // once we know the width of operand 2, we know width of operand 1
        if (width === OperationSize.qword) {
            return regDataView.getBigUint64(off, true);
        } else {
            switch (width) {
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

    getRegistersBytes(register: Register): Uint8Array {
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width: OperationSize = registerWidthMap[register];
        const widthBytes = operationSizeToBytesMap[width];

        return new Uint8Array(regDataView.buffer, off, widthBytes);
    }

    readSignedValueRegister(register: Register): bigint {
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width = registerWidthMap[register];
        if (width === OperationSize.qword) {
            return regDataView.getBigInt64(off, true);
        } else {
            switch (width) {
                case OperationSize.dword:
                    return BigInt(regDataView.getInt32(off, true));
                case OperationSize.word:
                    return BigInt(regDataView.getInt16(off, true));
                case OperationSize.byte:
                    return BigInt(regDataView.getInt8(off));
                default:
                    throw new Error('Unknown width!');

            }
        }
    }

    setSignedRegisterValue(register: Register, value: bigint) {
        //console.log('Before:');
        //this.printRegister(register);
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width = registerWidthMap[register];
        if (width === OperationSize.qword) {
            regDataView.setBigInt64(off, value, true);
        } else {
            switch (width) {
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
        }

        //console.log('After:');
        //this.printRegister(register);
    }

    setUnsignedRegisterValue(register: Register, value: bigint) {
        //console.log('Before:');
        //this.printRegister(register);
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width = registerWidthMap[register];
        //console.log(`MOVing ${value} into ${Register[register]}`);
        if (width === OperationSize.qword) {
            regDataView.setBigUint64(off, value, true);
        } else {
            switch (width) {
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

    private writeUnsignedDataAtAddress(dataView: DataView, addr: number, value: bigint, operationSize: OperationSize) {
        addr = addr - this.addrOffset;
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

    private writeSignedDataAtAddress(dataView: DataView, addr: number, value: bigint, operationSize: OperationSize) {
        addr = addr - this.addrOffset;
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

    }

    readUnsignedValueFromOperand(dataView: DataView, operand: Operand): bigint {
        let val = 0n;
        if (operand.register !== undefined) {
            val = this.readUnsignedValueRegister(operand.register);
        } else if (operand.bigInt !== undefined) {
            val = operand.bigInt;
        } else if (operand.int !== undefined) {
            val = BigInt(operand.int);
        } else if (operand.effectiveAddr !== undefined) {
            const ea: EffectiveAddress = operand.effectiveAddr;
            const addr = this.calculateAddress(ea);
            val = this.readUnsignedDataAtAddr(dataView, addr, operand.effectiveAddr.dataSize);
        }
        return val;
    }

    readSignedValueFromOperand(dataView: DataView, operand: Operand): bigint {
        let val = 0n;
        if (operand.register !== undefined) {
            val = this.readSignedValueRegister(operand.register);
        } else if (operand.bigInt !== undefined) {
            val = operand.bigInt;
        } else if (operand.int !== undefined) {
            val = BigInt(operand.int);
        } else if (operand.effectiveAddr !== undefined) {
            const ea: EffectiveAddress = operand.effectiveAddr;
            const addr = this.calculateAddress(ea);
            val = this.readSignedDataAtAddr(dataView, addr, operand.effectiveAddr.dataSize);
        }
        return val;
    }

    writeUnsignedValueInOperand(dataView: DataView, operand: Operand, value: bigint): void {
        if (operand.register !== undefined) {
            this.setUnsignedRegisterValue(operand.register, value);
        } else if (operand.effectiveAddr !== undefined) {
            const ea = operand.effectiveAddr;
            const addr = this.calculateAddress(ea);
            this.writeUnsignedDataAtAddress(dataView, addr, value, ea.dataSize);
        }
    }

    writeSignedValueInOperand(dataView: DataView, operand: Operand, value: bigint): void {
        if (operand.register !== undefined) {
            this.setSignedRegisterValue(operand.register, value);
        } else if (operand.effectiveAddr !== undefined) {
            const ea = operand.effectiveAddr;
            const addr = this.calculateAddress(ea);
            this.writeUnsignedDataAtAddress(dataView, addr, value, ea.dataSize);
        }
    }

    doAdd(dataView: DataView, instruction: Instruction) {
        let value0: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[0]);
        let value1: bigint = this.readSignedValueFromOperand(dataView, instruction.operands[1]);

        this.writeUnsignedValueInOperand(dataView, instruction.operands[0], value0 + value1);
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
        for (let i = 0 ; i < totalWidthBytes ; i++) {
            const registerIndex = Math.floor(i / widthPerRegister);
            const byte = valueCopy & 0xffn;
            bytes[registerIndex].push(Number(byte));
            valueCopy = valueCopy >> 8n;
        }
        for (let i = 0 ; i < registers.length ; i++) {
            const dataView = new DataView(new Uint8Array(bytes[i]).buffer)
            const value: bigint = this.readFromDataView(dataView, 0, registerWidth, signed);
            if (signed) {
                this.setSignedRegisterValue(registers[i], value);
            } else {
                this.setUnsignedRegisterValue(registers[i], value);
            }
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

        this.setSignedRegisterValue(highBytesRegister, remainder);
        this.setSignedRegisterValue(lowBytesRegister, quotient);
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
            const multiplicand: bigint = this.readSignedValueRegister(lowBytesRegister);
            const product: bigint = multiplicand * multiplier;
            this.writeValueRegisters([highBytesRegister, lowBytesRegister], product, true);

        } else if (instruction.operands.length === 2) {

        } else {

        }
    }

    execute(dataView: DataView, instruction: Instruction) {
        this.rip += instruction.length;
        //console.log(instructionFormat(instruction));
        switch (instruction.type) {
            case InstructionType.XOR:
                if (instruction.operands[1].register === undefined) {
                    throw new Error(`opcode 0x31 (XOR) but operand 2 isn't a register!`);
                }
                let val1: bigint = this.readUnsignedValueRegister(instruction.operands[1].register);
                let val2: bigint = BigInt(0);

                if (instruction.operands[0].register !== undefined) {
                    val2 = this.readUnsignedValueRegister(instruction.operands[0].register);
                    //console.log(`0x31: ${val1}^${val2}`);
                    const res: bigint = val1 ^ val2;
                    this.setUnsignedRegisterValue(instruction.operands[0].register, res);
                } else if (instruction.operands[0].address !== undefined) {
                    throw new Error('not impl address');
                } else if (instruction.operands[0].effectiveAddr) {
                    throw new Error('not impl effective addr');
                }

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

            case InstructionType.MOV:
                let value: bigint = 0n;
                if (instruction.operands[1].register !== undefined) {
                    value = this.readUnsignedValueRegister(instruction.operands[1].register);
                } else if (instruction.operands[1].bigInt !== undefined) {
                    value = instruction.operands[1].bigInt;
                } else if (instruction.operands[1].int !== undefined) {
                    value = BigInt(instruction.operands[1].int);
                } else if (instruction.operands[1].effectiveAddr !== undefined) {
                    const ea: EffectiveAddress = instruction.operands[1].effectiveAddr;
                    const reg: Register | undefined = instruction.operands[0].register;

                    if (reg === undefined) {
                        throw new Error(`Second operand is an effective address, but the first operand isn't a register, that's impossible.`);
                    }
                    const addr = this.calculateAddress(ea);
                    value = this.readUnsignedDataAtAddr(dataView, addr, instruction.operands[1].effectiveAddr.dataSize);
                }
                if (instruction.operands[0].register !== undefined) {
                    this.setUnsignedRegisterValue(instruction.operands[0].register, value);
                } else if (instruction.operands[0].effectiveAddr !== undefined) {
                    const reg = instruction.operands[1].register;
                    if (reg === undefined) {
                        throw new Error(`First operand is an effective address, but the second operand isn't a register, that's impossible.`);
                    }
                    const ea = instruction.operands[0].effectiveAddr;
                    const addr = this.calculateAddress(ea);
                    this.writeUnsignedDataAtAddress(dataView, addr, value, ea.dataSize);
                }
                break;
            case InstructionType.SYSCALL:
                const code = this.readUnsignedValueRegister(Register.RAX);
                //console.log(`System call code ${code}`);
                switch (code) {
                    case 1n:
                        // TODO: will clamp to 32 bits without warning!
                        const strAddr = Number(this.readUnsignedValueRegister(Register.RSI)) - this.addrOffset;
                        const strLength = Number(this.readUnsignedValueRegister(Register.RDX));
                        const td = new TextDecoder("utf-8");
                        const dvs = dataView.buffer.slice(strAddr, strAddr + strLength);
                        const str = td.decode(dvs);
                        console.log('Write: ' + str);
                        this.emulator.onWrite(str);
                        break;
                    case 60n:
                        const exitCode = Number(this.readUnsignedValueRegister(Register.RDI));
                        console.log(`Process finished with code ${exitCode}`);
                        this.emulator.onExit(exitCode);
                        break;
                    default:
                        throw new Error(`System call ${code} not implemented.`);
                }
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
            base = Number(this.readUnsignedValueRegister(ea.base));
        }
        if (ea.index !== null) {
            index = Number(this.readUnsignedValueRegister(ea.index));
        }
        const addr = base + index * scaleFactor + displacement;
        return addr;
    }

    getRip() {
        return this.rip;
    }
}

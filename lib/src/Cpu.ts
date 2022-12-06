import {Register, Register64, registerOffset, registerReverseMap, registerWidth} from "./amd64-architecture";
import {EffectiveAddress, Instruction, instructionFormat, InstructionType, OperationSize} from "./Instruction";
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

    readValueRegister(register: Register): bigint {
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width = registerWidth[register];
        // once we know the width of operand 2, we know width of operand 1
        if (width === 8) {
            return regDataView.getBigUint64(off, true);
        } else {
            switch (width) {
                case 4:
                    return BigInt(regDataView.getUint32(off, true));
                case 2:
                    return BigInt(regDataView.getUint16(off, true));
                case 1:
                    return BigInt(regDataView.getUint8(off));
                default:
                    throw new Error('Unknown width!');

            }
        }
    }

    setRegisterValue(register: Register, value: bigint) {
        //console.log('Before:');
        //this.printRegister(register);
        const reg64: Register64 = registerReverseMap[register];
        const regDataView: DataView = this.registers[reg64];
        const off: number = registerOffset[register];
        const width = registerWidth[register];
        //console.log(`MOVing ${value} into ${Register[register]}`);
        // once we know the width of operand 2, we know width of operand 1
        if (width === 8) {
            regDataView.setBigUint64(off, value, true);
        } else {
            switch (width) {
                case 4:
                    // Writing 32 bits overwrite the entire register
                    regDataView.setBigUint64(0, value, true);
                    break;
                case 2:
                    // Writing 16 bits keeps the top 48 bits of register
                    regDataView.setUint16(off, Number(value), true);
                    break;
                case 1:
                    regDataView.setUint8(off, Number(value));
                    break;
                default:
                    throw new Error('Unknown width!');

            }
        }

        //console.log('After:');
        //this.printRegister(register);
    }

    readUnsignedDataAtAddr(dataView: DataView, addr: number, width: OperationSize): bigint {
        addr = addr - this.addrOffset;
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

    execute(dataView: DataView, instruction: Instruction) {
        this.rip += instruction.length;
        //console.log(instructionFormat(instruction));
        switch (instruction.type) {
            case InstructionType.XOR:
                if (instruction.operands[1].register === undefined) {
                    throw new Error(`opcode 0x31 (XOR) but operand 2 isn't a register!`);
                }
                let val1: bigint = this.readValueRegister(instruction.operands[1].register);
                let val2: bigint = BigInt(0);

                if (instruction.operands[0].register !== undefined) {
                    val2 = this.readValueRegister(instruction.operands[0].register);
                    //console.log(`0x31: ${val1}^${val2}`);
                    const res: bigint = val1 ^ val2;
                    this.setRegisterValue(instruction.operands[0].register, res);
                } else if (instruction.operands[0].address !== undefined) {
                    throw new Error('not impl address');
                } else if (instruction.operands[0].effectiveAddr) {
                    throw new Error('not impl effective addr');
                }

                break;

            case InstructionType.MOV:
                let value: bigint = 0n;
                if (instruction.operands[1].register !== undefined) {
                    value = this.readValueRegister(instruction.operands[1].register);
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
                    this.setRegisterValue(instruction.operands[0].register, value);
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
                const code = this.readValueRegister(Register.RAX);
                //console.log(`System call code ${code}`);
                switch (code) {
                    case 1n:
                        // TODO: will clamp to 32 bits without warning!
                        const strAddr = Number(this.readValueRegister(Register.RSI)) - this.addrOffset;
                        const strLength = Number(this.readValueRegister(Register.RDX));
                        const td = new TextDecoder("utf-8");
                        const dvs = dataView.buffer.slice(strAddr, strAddr + strLength);
                        const str = td.decode(dvs);
                        console.log('Write: ' + str);
                        this.emulator.onWrite(str);
                        break;
                    case 60n:
                        const exitCode = Number(this.readValueRegister(Register.RDI));
                        console.log(`Process finished with code ${exitCode}`);
                        this.emulator.onExit(exitCode);
                        break;
                    default:
                        throw new Error(`System call ${code} not implemented.`);
                }
                break;
            case InstructionType.ADD:
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
            base = Number(this.readValueRegister(ea.base));
        }
        if (ea.index !== null) {
            index = Number(this.readValueRegister(ea.index));
        }
        const addr = base + index * scaleFactor + displacement;
        return addr;
    }

    getRip() {
        return this.rip;
    }
}

import {Register, Register64, registerOffset, registerReverseMap, registerWidth} from "./amd64-architecture";
import {ELF64} from "./elf64";
import {Instruction, instructionFormat, InstructionType} from "./Instruction";
import {InstructionParser} from "./InstructionParser";

export class Process {
    onWrite: (line: string) => void = () => {};
    onExit: (code: number) => void = () => {};

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

    // executable
    private executable: ELF64;
    private addrOffset = 0;
    private dv: DataView;
    private running: boolean = true;

    constructor(elfExecutable: ELF64) {
        this.executable = elfExecutable;
        this.dv = new DataView(this.executable.bytes);
        this.addrOffset = this.executable.programHeaders[0].vaddr;
        this.rip = this.executable.header.entry - this.addrOffset;
        this.registers[Register64.RSI].setBigUint64(0, 536231n, true);
    }

    getNextInstruction(): Instruction {
        const instructionParser = new InstructionParser(this.dv, this.rip);
        return instructionParser.parse();
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
    }

    execute(instruction: Instruction) {
        this.rip += instruction.length;
        console.log(instructionFormat(instruction));
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
                } else if (instruction.operands[0].effectiveAddrInRegister) {
                    throw new Error('not impl effective addr');
                }

                break;

            case InstructionType.MOV:
                let value: bigint = 0n;
                if (instruction.operands[1].register !== undefined) {
                    value = this.readValueRegister(instruction.operands[1].register);
                } else if (instruction.operands[1].bigInt !== undefined ) {
                    value = instruction.operands[1].bigInt;
                } else if (instruction.operands[1].int !== undefined) {
                    value = BigInt(instruction.operands[1].int);
                }
                if (instruction.operands[0].register === undefined) {
                    throw new Error('MOV not to register not implemented');
                }
                // TODO: if moving a byte or word, we must preserve the lower bits
                this.setRegisterValue(instruction.operands[0].register, value);

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
                        const dvs = this.dv.buffer.slice(strAddr, strAddr + strLength);
                        const str = td.decode(dvs);
                        console.log('Write: ' + str);
                        this.onWrite(str);
                        break;
                    case 60n:
                        const exitCode = Number(this.readValueRegister(Register.RDI));
                        console.log(`Process finished with code ${exitCode}`);
                        this.onExit(exitCode);
                        this.running = false;
                        break;
                    default:
                        throw new Error(`System call ${code} not implemented.`);
                }
                break;
            case InstructionType.ADD:
                break;

            default:
                throw new Error('Unsupported opcode: ' + instruction.opCode.toString(16))
        }
    }

    run(): void {
        // avoid infinite loop for now
        while (this.running) {
            const instruction = this.getNextInstruction();
            this.execute(instruction);
        }
    }
}



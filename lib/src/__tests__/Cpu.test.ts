import {Cpu} from "../Cpu";
import {Emulator} from "../Emulator";
import {InstructionType, OperationSize} from "../Instruction";
import {Register} from "../amd64-architecture";

test('MOV register to register', () => {
    const dv = new DataView(new ArrayBuffer(0));
    const cpu = new Cpu(0, 0, new Emulator());

    // mov qword reg to reg
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {bigInt: 55n}],
        length: 5,
    });
    expect(cpu.readValueRegister(Register.RAX)).toBe(55n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.R15}, {bigInt: 100n}],
        length: 5,
    });
    expect(cpu.readValueRegister(Register.R15)).toBe(100n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {register: Register.R15}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.RAX)).toBe(100n);
    expect(cpu.readValueRegister(Register.R15)).toBe(100n);

    // mov byte reg to reg
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.SPL}, {int: 25}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.SPL)).toBe(25n);

    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.R9B}, {register: Register.SPL}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.SPL)).toBe(25n);
    expect(cpu.readValueRegister(Register.R9B)).toBe(25n);
});

test('MOV immediate to register', () => {
    const dv = new DataView(new ArrayBuffer(0));
    const cpu = new Cpu(0, 0, new Emulator());

    // mov qword reg to reg
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {bigInt: 55n}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.RAX)).toBe(55n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.R15}, {bigInt: 100n}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.R15)).toBe(100n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {register: Register.R15}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.RAX)).toBe(100n);
    expect(cpu.readValueRegister(Register.R15)).toBe(100n);

    // mov byte reg to reg
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.SPL}, {int: 25}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.SPL)).toBe(25n);

    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.R9B}, {register: Register.SPL}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.SPL)).toBe(25n);
    expect(cpu.readValueRegister(Register.R9B)).toBe(25n);
});

test('MOV memory to register', () => {
    const dv = new DataView(new ArrayBuffer(32));
    dv.setBigUint64(4, 54321n, true);
    const cpu = new Cpu(0, 0, new Emulator());

    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {
            effectiveAddr: {
                scaleFactor: 1,
                displacement: 4,
                index: null,
                base: null,
                dataSize: OperationSize.dword
            }
        }],
        length: 5
    });

    // Set all bits of RAX to 1
    const maxUint64: bigint = 0xffffffffffffffffn;
    dv.setBigUint64(12, maxUint64, true);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {
            effectiveAddr: {
                scaleFactor: 1,
                displacement: 12,
                index: null,
                base: null,
                dataSize: OperationSize.qword
            }
        }],
        length: 5
    });

    expect(cpu.readValueRegister(Register.RAX)).toBe(BigInt(maxUint64));

    // set top 32 bits and bottom 16 bits to 0, and the 16 bits in-between to 1
    dv.setUint32(20, 0xffff0000, true);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {
            effectiveAddr: {
                scaleFactor: 1,
                displacement: 20,
                index: null,
                base: null,
                dataSize: OperationSize.dword
            }
        }],
        length: 5
    });

    expect(cpu.readValueRegister(Register.RAX)).toBe(0x00000000ffff0000n);

    // Set all bits To 1 again
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {
            effectiveAddr: {
                scaleFactor: 1,
                displacement: 12,
                index: null,
                base: null,
                dataSize: OperationSize.qword
            }
        }],
        length: 5
    });


    dv.setUint16(0, 0x0000, true);
    // Set bottom 16 bits to 0
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.AX}, {
            effectiveAddr: {
                scaleFactor: 1,
                displacement: 0,
                index: null,
                base: null,
                dataSize: OperationSize.word
            }
        }],
        length: 5
    });
    expect(cpu.readValueRegister(Register.RAX)).toBe(0x00_00_ff_ff_ff_ff_ff_ffn);

    cpu.setRegisterValue(Register.RSP, 2n);
    cpu.setRegisterValue(Register.R13, 3n);
    cpu.setRegisterValue(Register.R9, 42567n);
    // mov [rsp + 2 * r13 + 4], r9
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{
            effectiveAddr: {
                scaleFactor: 2,
                displacement: 4,
                index: Register.R13,
                base: Register.RSP,
                dataSize: OperationSize.qword
            }
        }, {register: Register.R9}],
        length: 5
    });
    expect(cpu.readUnsignedDataAtAddr(dv, 12, OperationSize.qword)).toBe(42567n);
});

test('MOV register to memory', () => {
    const dv = new DataView(new ArrayBuffer(32));
    const cpu = new Cpu(0, 0, new Emulator());

    cpu.setRegisterValue(Register.RAX, 1000n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{
            effectiveAddr: {
                scaleFactor: 1,
                displacement: 0,
                index: null,
                base: null,
                dataSize: OperationSize.qword
            }
        }, {register: Register.RAX}],
        length: 5
    });
    expect(cpu.readUnsignedDataAtAddr(dv, 0, OperationSize.qword)).toBe(1000n);
});


test('ADD', () => {
    const dv = new DataView(new ArrayBuffer(32));
    const cpu = new Cpu(0, 0, new Emulator());
    dv.setBigUint64(0, 100n, true);

    cpu.setRegisterValue(Register.RAX, 1000n);
    cpu.setRegisterValue(Register.R9, 44n);
    cpu.execute(dv, {
        type: InstructionType.ADD,
        operands: [{register: Register.R9}, {register: Register.RAX}],
        length: 5
    });
    expect(cpu.readValueRegister(Register.R9)).toBe(1044n);
    cpu.execute(dv, {
        type: InstructionType.ADD,
        operands: [{
            effectiveAddr: {
                scaleFactor: 1,
                displacement: 0,
                index: null,
                base: null,
                dataSize: OperationSize.qword
            }
        }, {register: Register.R9}],
        length: 5
    });
    expect(cpu.readUnsignedDataAtAddr(dv, 0, OperationSize.qword)).toBe(1144n);
});

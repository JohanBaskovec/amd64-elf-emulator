import {Cpu} from "../Cpu";
import {Emulator} from "../Emulator";
import {InstructionType} from "../Instruction";
import {OperationSize, Register} from "../amd64-architecture";

test('MOV register to register', () => {
    const dv = new DataView(new ArrayBuffer(0));
    const cpu = new Cpu(0, 0, new Emulator());

    // mov qword reg to reg
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {bigInt: 55n}],
        length: 5,
    });
    expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(55n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.R15}, {bigInt: 100n}],
        length: 5,
    });
    expect(cpu.readUnsignedValueRegister(Register.R15)).toBe(100n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {register: Register.R15}],
        length: 5
    });
    expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(100n);
    expect(cpu.readUnsignedValueRegister(Register.R15)).toBe(100n);

    // mov byte reg to reg
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.SPL}, {int: 25}],
        length: 5
    });
    expect(cpu.readUnsignedValueRegister(Register.SPL)).toBe(25n);

    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.R9B}, {register: Register.SPL}],
        length: 5
    });
    expect(cpu.readUnsignedValueRegister(Register.SPL)).toBe(25n);
    expect(cpu.readUnsignedValueRegister(Register.R9B)).toBe(25n);
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
    expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(55n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.R15}, {bigInt: 100n}],
        length: 5
    });
    expect(cpu.readUnsignedValueRegister(Register.R15)).toBe(100n);
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.RAX}, {register: Register.R15}],
        length: 5
    });
    expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(100n);
    expect(cpu.readUnsignedValueRegister(Register.R15)).toBe(100n);

    // mov byte reg to reg
    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.SPL}, {int: 25}],
        length: 5
    });
    expect(cpu.readUnsignedValueRegister(Register.SPL)).toBe(25n);

    cpu.execute(dv, {
        type: InstructionType.MOV,
        operands: [{register: Register.R9B}, {register: Register.SPL}],
        length: 5
    });
    expect(cpu.readUnsignedValueRegister(Register.SPL)).toBe(25n);
    expect(cpu.readUnsignedValueRegister(Register.R9B)).toBe(25n);
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

    expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(BigInt(maxUint64));

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

    expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(0x00000000ffff0000n);

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
    expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(0x00_00_ff_ff_ff_ff_ff_ffn);

    cpu.setUnsignedRegisterValue(Register.RSP, 2n);
    cpu.setUnsignedRegisterValue(Register.R13, 3n);
    cpu.setUnsignedRegisterValue(Register.R9, 42567n);
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

    cpu.setUnsignedRegisterValue(Register.RAX, 1000n);
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

    cpu.setUnsignedRegisterValue(Register.RAX, 1000n);
    cpu.setUnsignedRegisterValue(Register.R9, 44n);
    cpu.execute(dv, {
        type: InstructionType.ADD,
        operands: [{register: Register.R9}, {register: Register.RAX}],
        length: 5
    });
    expect(cpu.readUnsignedValueRegister(Register.R9)).toBe(1044n);
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

test('readSignedValueRegisters', () => {
    const cpu = new Cpu(0, 0, new Emulator());
    cpu.setSignedRegisterValue(Register.RAX, 0xff_ff_ff_ff_ff_ff_ff_ffn);
    cpu.setSignedRegisterValue(Register.RBX, 0xff_ff_ff_ff_ff_ff_ff_ffn);
    {
        const valU: bigint = cpu.readUnsignedValueRegisters([Register.RBX, Register.RAX]);
        expect(valU).toBe(340282366920938463463374607431768211455n);
        const valI: bigint = cpu.readSignedValueRegisters([Register.RBX, Register.RAX]);
        expect(valI).toBe(-1n);
    }

    //RBX:RAX = 00 00 00 00 00 00 00 10 00 00 00 10 00 00 00 00
    cpu.setSignedRegisterValue(Register.RAX, 0x00_00_00_00_10_00_00_00n);
    cpu.setSignedRegisterValue(Register.RBX, 0x10_00_00_00_00_00_00_00n);
    {
        const valU: bigint = cpu.readUnsignedValueRegisters([Register.RBX, Register.RAX]);
        expect(valU).toBe(4951760158294442604203343872n);
        const valI: bigint = cpu.readSignedValueRegisters([Register.RBX, Register.RAX]);
        expect(valI).toBe(4951760158294442604203343872n);
    }

    //RBX:RAX = 00 00 00 00 00 00 00 80 00 00 00 10 00 00 00 80
    cpu.setSignedRegisterValue(Register.RAX, 0x80_00_00_00_10_00_00_00n);
    cpu.setSignedRegisterValue(Register.RBX, 0x80_00_00_00_00_00_00_00n);
    {
        const valU: bigint = cpu.readUnsignedValueRegisters([Register.RBX, Register.RAX]);
        expect(valU).toBe(170141183465420991898052196852335378432n);
        const valI: bigint = cpu.readSignedValueRegisters([Register.RBX, Register.RAX]);
        expect(valI).toBe(-170141183455517471565322410579432833024n);
    }
});

test('IMUL and IDIV', () => {
    const dv = new DataView(new ArrayBuffer(32));
    const cpu = new Cpu(0, 0, new Emulator());
    cpu.setSignedRegisterValue(Register.RAX, 9223372036854775111n);
    cpu.setSignedRegisterValue(Register.RBX, 94n);

    cpu.execute(dv, {operands: [{register: Register.RBX}], length: 5, type: InstructionType.IMUL});
    let rdx = cpu.readSignedValueRegister(Register.RDX);
    let rax = cpu.readSignedValueRegister(Register.RAX);

    cpu.setSignedRegisterValue(Register.RBX, 8669969714643488604n);
    cpu.execute(dv, {operands: [{register: Register.RBX}], length: 5, type: InstructionType.IDIV});
    rdx = cpu.readSignedValueRegister(Register.RDX);
    rax = cpu.readSignedValueRegister(Register.RAX);
    expect(rdx).toBe(34n);
    expect(rax).toBe(100n);
});

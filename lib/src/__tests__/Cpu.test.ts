import {Cpu} from "../Cpu";
import {Emulator} from "../Emulator";
import {Instruction, InstructionType} from "../Instruction";
import {Register} from "../amd64-architecture";

test('MOV register to register', () => {
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

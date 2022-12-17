import {Cpu, uint8ArrayCopyStringsAtAddr} from '../Cpu';
import {immediateFromJsBigIntAndWidth, InstructionType} from '../Instruction';
import {OperationSize, Register} from '../amd64-architecture';
import * as fs from 'fs';
import {ElfParser} from '../ElfParser';
import {Process} from '../Process';

test('uint8ArrayCopyStringsAtAddr', () => {
  const arr = new Uint8Array(100);
  const strs = ['hello', 'world'];
  uint8ArrayCopyStringsAtAddr(arr, 8, strs);
  const expectation = '\0\0\0\0\0\0\0\0hello\0world\0';
  for (let i = 0; i < expectation.length; i++) {
    expect(arr[i]).toBe(expectation.charCodeAt(i));
  }
});

test('setupStack', () => {
  const executableContent = fs.readFileSync('src/__tests__/atoi');
  const elf = new ElfParser().parseExecutableFromBytes(
    executableContent.buffer
  );
  const process = new Process('test', elf);
  const args = ['program', '43', '999'];
  const cpu = process.cpu;
  cpu.setupStack(args);

  expect(Object.keys(cpu.instructions)).toHaveLength(24);
  expect(cpu.readCurrentStackTop(OperationSize.qword, true)).toBe(3n);
  for (let argi = 0; argi < args.length; argi++) {
    const argPtr = cpu.readUnsignedValueFromOperand({
      effectiveAddr: {
        base: Register.RSP,
        dataSize: OperationSize.qword,
        index: null,
        scaleFactor: 1,
        displacement: 8 + 8 * argi,
      },
    });
    const argBytes: number[] = [];
    let i = 0;
    let c = Number(
      cpu.readUnsignedDataAtAddr(Number(argPtr) + i, OperationSize.byte)
    );
    while (c !== 0) {
      argBytes.push(c);
      i++;
      c = Number(
        cpu.readUnsignedDataAtAddr(Number(argPtr) + i, OperationSize.byte)
      );
    }
    expect(String.fromCharCode(...argBytes)).toBe(args[argi]);
  }
});
test('set and read registers', () => {
  const cpu = new Cpu();
  cpu.setRegisterValue(Register.RAX, 1n, true);
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(1n);
  expect(cpu.readSignedValueRegister(Register.AL)).toBe(1n);
  cpu.setRegisterValue(Register.RAX, 1844674407374654813n, false);
  // 0001 1001 1001 1001 1001 1001 1001 1001 1001 1001 1101 0010 0000 1101 0101 1101 BE
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(1844674407374654813n);
  // 1001 1001 1101 0010 0000 1101 0101 1101 BE
  expect(cpu.readSignedValueRegister(Register.EAX)).toBe(-1714287267n);
  // 0000 1101 0101 1101
  expect(cpu.readSignedValueRegister(Register.AX)).toBe(3421n);
  // 0000 1101
  expect(cpu.readSignedValueRegister(Register.AH)).toBe(13n);
  // 0101 1101
  expect(cpu.readSignedValueRegister(Register.AL)).toBe(93n);
});
test('MOV register to register', () => {
  const cpu = new Cpu();

  // mov qword reg to reg
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.RAX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: 55n,
          width: OperationSize.qword,
        }),
      },
    ],
  });
  expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(55n);
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.R15},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: 100n,
          width: OperationSize.qword,
        }),
      },
    ],
  });
  expect(cpu.readUnsignedValueRegister(Register.R15)).toBe(100n);
  cpu.execute({
    type: InstructionType.MOV,
    operands: [{register: Register.RAX}, {register: Register.R15}],
  });
  expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(100n);
  expect(cpu.readUnsignedValueRegister(Register.R15)).toBe(100n);

  // mov byte reg to reg
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.SPL},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: 25n,
          width: OperationSize.byte,
        }),
      },
    ],
  });
  expect(cpu.readUnsignedValueRegister(Register.SPL)).toBe(25n);

  cpu.execute({
    type: InstructionType.MOV,
    operands: [{register: Register.R9B}, {register: Register.SPL}],
  });
  expect(cpu.readUnsignedValueRegister(Register.SPL)).toBe(25n);
  expect(cpu.readUnsignedValueRegister(Register.R9B)).toBe(25n);
});

test('MOV immediate to register', () => {
  const cpu = new Cpu();

  // mov qword reg to reg
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.RAX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: 55n,
          width: OperationSize.qword,
        }),
      },
    ],
  });
  expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(55n);
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.R15},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: 100n,
          width: OperationSize.qword,
        }),
      },
    ],
  });
  expect(cpu.readUnsignedValueRegister(Register.R15)).toBe(100n);
  cpu.execute({
    type: InstructionType.MOV,
    operands: [{register: Register.RAX}, {register: Register.R15}],
  });
  expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(100n);
  expect(cpu.readUnsignedValueRegister(Register.R15)).toBe(100n);

  // mov byte reg to reg
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.SPL},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: 25n,
          width: OperationSize.byte,
        }),
      },
    ],
  });
  expect(cpu.readUnsignedValueRegister(Register.SPL)).toBe(25n);

  cpu.execute({
    type: InstructionType.MOV,
    operands: [{register: Register.R9B}, {register: Register.SPL}],
  });
  expect(cpu.readUnsignedValueRegister(Register.SPL)).toBe(25n);
  expect(cpu.readUnsignedValueRegister(Register.R9B)).toBe(25n);
});

test('MOV memory to register', () => {
  const cpu = new Cpu();
  cpu.writeDataAtAddress(4, 54321n, OperationSize.qword, true);

  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.RAX},
      {
        effectiveAddr: {
          scaleFactor: 1,
          displacement: 4,
          index: null,
          base: null,
          dataSize: OperationSize.dword,
        },
      },
    ],
  });

  // Set all bits of RAX to 1
  const maxUint64 = 0xffffffffffffffffn;
  cpu.writeDataAtAddress(12, maxUint64, OperationSize.qword, true);
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.RAX},
      {
        effectiveAddr: {
          scaleFactor: 1,
          displacement: 12,
          index: null,
          base: null,
          dataSize: OperationSize.qword,
        },
      },
    ],
  });

  expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(BigInt(maxUint64));

  // set top 32 bits and bottom 16 bits to 0, and the 16 bits in-between to 1
  cpu.writeDataAtAddress(20, 0xffff0000n, OperationSize.dword, true);
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.RAX},
      {
        effectiveAddr: {
          scaleFactor: 1,
          displacement: 20,
          index: null,
          base: null,
          dataSize: OperationSize.dword,
        },
      },
    ],
  });

  expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(0x00000000ffff0000n);

  // Set all bits To 1 again
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.RAX},
      {
        effectiveAddr: {
          scaleFactor: 1,
          displacement: 12,
          index: null,
          base: null,
          dataSize: OperationSize.qword,
        },
      },
    ],
  });

  cpu.writeDataAtAddress(0, 0x0000n, OperationSize.word, true);
  // Set bottom 16 bits to 0
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {register: Register.AX},
      {
        effectiveAddr: {
          scaleFactor: 1,
          displacement: 0,
          index: null,
          base: null,
          dataSize: OperationSize.word,
        },
      },
    ],
  });
  expect(cpu.readUnsignedValueRegister(Register.RAX)).toBe(
    0xff_ff_ff_ff_ff_ff_00_00n
  );

  cpu.setUnsignedRegisterValue(Register.RSP, 2n);
  cpu.setUnsignedRegisterValue(Register.R13, 3n);
  cpu.setUnsignedRegisterValue(Register.R9, 42567n);
  // mov [rsp + 2 * r13 + 4], r9
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {
        effectiveAddr: {
          scaleFactor: 2,
          displacement: 4,
          index: Register.R13,
          base: Register.RSP,
          dataSize: OperationSize.qword,
        },
      },
      {register: Register.R9},
    ],
  });
  expect(cpu.readUnsignedDataAtAddr(12, OperationSize.qword)).toBe(42567n);
});

test('MOV register to memory', () => {
  const cpu = new Cpu();

  cpu.setUnsignedRegisterValue(Register.RAX, 1000n);
  cpu.execute({
    type: InstructionType.MOV,
    operands: [
      {
        effectiveAddr: {
          scaleFactor: 1,
          displacement: 0,
          index: null,
          base: null,
          dataSize: OperationSize.qword,
        },
      },
      {register: Register.RAX},
    ],
  });
  expect(cpu.readUnsignedDataAtAddr(0, OperationSize.qword)).toBe(1000n);
});

test('ADD', () => {
  const cpu = new Cpu();
  cpu.writeDataAtAddress(0, 100n, OperationSize.qword, true);

  cpu.setUnsignedRegisterValue(Register.RAX, 1000n);
  cpu.setUnsignedRegisterValue(Register.R9, 44n);
  cpu.execute({
    type: InstructionType.ADD,
    operands: [{register: Register.R9}, {register: Register.RAX}],
  });
  expect(cpu.readUnsignedValueRegister(Register.R9)).toBe(1044n);
  cpu.execute({
    type: InstructionType.ADD,
    operands: [
      {
        effectiveAddr: {
          scaleFactor: 1,
          displacement: 0,
          index: null,
          base: null,
          dataSize: OperationSize.qword,
        },
      },
      {register: Register.R9},
    ],
  });
  expect(cpu.readUnsignedDataAtAddr(0, OperationSize.qword)).toBe(1144n);
});

test('readSignedValueRegisters', () => {
  const cpu = new Cpu();
  cpu.setSignedRegisterValue(Register.RAX, 0xff_ff_ff_ff_ff_ff_ff_ffn);
  cpu.setSignedRegisterValue(Register.RBX, 0xff_ff_ff_ff_ff_ff_ff_ffn);
  {
    const valU: bigint = cpu.readUnsignedValueRegisters([
      Register.RBX,
      Register.RAX,
    ]);
    expect(valU).toBe(340282366920938463463374607431768211455n);
    const valI: bigint = cpu.readSignedValueRegisters([
      Register.RBX,
      Register.RAX,
    ]);
    expect(valI).toBe(-1n);
  }

  //RBX:RAX = 00 00 00 00 00 00 00 10 00 00 00 10 00 00 00 00
  cpu.setSignedRegisterValue(Register.RAX, 0x00_00_00_00_10_00_00_00n);
  cpu.setSignedRegisterValue(Register.RBX, 0x10_00_00_00_00_00_00_00n);
  {
    const valU: bigint = cpu.readUnsignedValueRegisters([
      Register.RBX,
      Register.RAX,
    ]);
    expect(valU).toBe(4951760158294442604203343872n);
    const valI: bigint = cpu.readSignedValueRegisters([
      Register.RBX,
      Register.RAX,
    ]);
    expect(valI).toBe(4951760158294442604203343872n);
  }

  //RBX:RAX = 00 00 00 00 00 00 00 80 00 00 00 10 00 00 00 80
  cpu.setSignedRegisterValue(Register.RAX, 0x80_00_00_00_10_00_00_00n);
  cpu.setSignedRegisterValue(Register.RBX, 0x80_00_00_00_00_00_00_00n);
  {
    const valU: bigint = cpu.readUnsignedValueRegisters([
      Register.RBX,
      Register.RAX,
    ]);
    expect(valU).toBe(170141183465420991898052196852335378432n);
    const valI: bigint = cpu.readSignedValueRegisters([
      Register.RBX,
      Register.RAX,
    ]);
    expect(valI).toBe(-170141183455517471565322410579432833024n);
  }
});

test('IMUL and IDIV', () => {
  const cpu = new Cpu();
  cpu.setSignedRegisterValue(Register.RAX, 9223372036854775111n);
  cpu.setSignedRegisterValue(Register.RBX, 94n);

  cpu.execute({
    operands: [{register: Register.RBX}],
    type: InstructionType.IMUL,
  });
  let rdx = cpu.readSignedValueRegister(Register.RDX);
  let rax = cpu.readSignedValueRegister(Register.RAX);

  cpu.setSignedRegisterValue(Register.RBX, 8669969714643488604n);
  cpu.execute({
    operands: [{register: Register.RBX}],
    type: InstructionType.IDIV,
  });
  rdx = cpu.readSignedValueRegister(Register.RDX);
  rax = cpu.readSignedValueRegister(Register.RAX);
  expect(rdx).toBe(34n);
  expect(rax).toBe(100n);
});

test('PUSH & POP', () => {
  const cpu = new Cpu();
  cpu.execute({
    operands: [
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: 4376n,
          width: OperationSize.qword,
        }),
      },
    ],

    type: InstructionType.PUSH,
  });
  expect(cpu.readCurrentStackTop(OperationSize.qword, true)).toBe(4376n);

  cpu.setSignedRegisterValue(Register.R8W, -423n);
  cpu.execute({
    operands: [{register: Register.R8W}],
    type: InstructionType.PUSH,
  });
  expect(cpu.readCurrentStackTop(OperationSize.word, true)).toBe(-423n);

  cpu.execute({
    operands: [{register: Register.R9W}],
    type: InstructionType.POP,
  });
  expect(cpu.readSignedValueRegister(Register.R9W)).toBe(-423n);
  expect(cpu.readCurrentStackTop(OperationSize.qword, true)).toBe(4376n);
});

test('MOVZX', () => {
  const cpu = new Cpu();

  cpu.setSignedRegisterValue(Register.RAX, 0n);
  cpu.execute({
    operands: [
      {register: Register.RAX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: -1n,
          width: OperationSize.byte,
        }),
      },
    ],

    type: InstructionType.MOVZX,
  });
  expect(cpu.readSignedValueRegister(Register.AL)).toBe(-1n);
  expect(cpu.readSignedValueRegister(Register.AX)).toBe(255n);
  expect(cpu.readSignedValueRegister(Register.EAX)).toBe(255n);
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(255n);

  cpu.setSignedRegisterValue(Register.RAX, -1n);
  cpu.execute({
    operands: [
      {register: Register.AX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: 34n,
          width: OperationSize.byte,
        }),
      },
    ],

    type: InstructionType.MOVZX,
  });
  expect(cpu.readSignedValueRegister(Register.AX)).toBe(34n);
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(-65502n);

  cpu.setSignedRegisterValue(Register.RAX, -1n);
  cpu.execute({
    operands: [
      {register: Register.AX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: -34n,
          width: OperationSize.byte,
        }),
      },
    ],

    type: InstructionType.MOVZX,
  });
  expect(cpu.readSignedValueRegister(Register.AX)).toBe(222n);
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(-65314n);

  cpu.setSignedRegisterValue(Register.RAX, -1n);
  cpu.execute({
    operands: [
      {register: Register.EAX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: -34n,
          width: OperationSize.byte,
        }),
      },
    ],

    type: InstructionType.MOVZX,
  });
  expect(cpu.readSignedValueRegister(Register.EAX)).toBe(222n);
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(222n);

  cpu.setSignedRegisterValue(Register.RAX, -1n);
  cpu.execute({
    operands: [
      {register: Register.EAX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: -284n,
          width: OperationSize.word,
        }),
      },
    ],

    type: InstructionType.MOVZX,
  });
  expect(cpu.readSignedValueRegister(Register.EAX)).toBe(65252n);
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(65252n);

  cpu.setSignedRegisterValue(Register.RAX, -1n);
  cpu.execute({
    operands: [
      {register: Register.RAX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: -284n,
          width: OperationSize.word,
        }),
      },
    ],

    type: InstructionType.MOVZX,
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(65252n);

  cpu.setSignedRegisterValue(Register.RAX, -1n);
  cpu.execute({
    operands: [
      {register: Register.RAX},
      {
        immediate: immediateFromJsBigIntAndWidth({
          value: -34n,
          width: OperationSize.byte,
        }),
      },
    ],

    type: InstructionType.MOVZX,
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(222n);
});

test('JGE', () => {
  const cpu = new Cpu();
  cpu.setSignedRegisterValue(Register.RAX, 5n);
  cpu.setSignedRegisterValue(Register.RBX, 5n);
  cpu.execute({
    operands: [{register: Register.RAX}, {register: Register.RBX}],
    type: InstructionType.CMP,
    length: 5,
  });
  cpu.execute({
    operands: [
      {
        relativeOffset: immediateFromJsBigIntAndWidth({
          value: -10n,
          width: OperationSize.byte,
        }),
      },
    ],
    type: InstructionType.JGE,
    length: 5,
  });
  expect(cpu.getRip()).toBe(0);

  cpu.setSignedRegisterValue(Register.RBX, 4n);
  cpu.execute({
    operands: [{register: Register.RAX}, {register: Register.RBX}],
    type: InstructionType.CMP,
    length: 5,
  });
  cpu.execute({
    operands: [
      {
        relativeOffset: immediateFromJsBigIntAndWidth({
          value: -8n,
          width: OperationSize.byte,
        }),
      },
    ],
    length: 5,
    type: InstructionType.JGE,
  });
  expect(cpu.getRip()).toBe(2);

  cpu.setSignedRegisterValue(Register.RBX, 8n);
  cpu.execute({
    operands: [{register: Register.RAX}, {register: Register.RBX}],
    type: InstructionType.CMP,
    length: 5,
  });
  cpu.execute({
    operands: [
      {
        relativeOffset: immediateFromJsBigIntAndWidth({
          value: -8n,
          width: OperationSize.byte,
        }),
      },
    ],
    length: 5,
    type: InstructionType.JGE,
  });
  expect(cpu.getRip()).toBe(12);
});

test('INC & DEC', () => {
  const cpu = new Cpu();
  cpu.execute({
    type: InstructionType.INC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(1n);
  cpu.execute({
    type: InstructionType.INC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(2n);
  cpu.execute({
    type: InstructionType.INC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(3n);
  cpu.execute({
    type: InstructionType.DEC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(2n);
  cpu.execute({
    type: InstructionType.DEC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(1n);
  cpu.execute({
    type: InstructionType.DEC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(0n);
  cpu.execute({
    type: InstructionType.DEC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(-1n);
  cpu.execute({
    type: InstructionType.DEC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(-2n);
  cpu.execute({
    type: InstructionType.INC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(-1n);
  cpu.execute({
    type: InstructionType.INC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(0n);
  cpu.execute({
    type: InstructionType.INC,
    operands: [{register: Register.RAX}],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(1n);
});

test('JMP', () => {
  const cpu = new Cpu();
  cpu.execute({
    operands: [
      {
        relativeOffset: immediateFromJsBigIntAndWidth({
          value: 10n,
          width: OperationSize.byte,
        }),
      },
    ],
    type: InstructionType.JMP,
  });
  expect(cpu.getRip()).toBe(10);

  cpu.execute({
    operands: [
      {
        relativeOffset: immediateFromJsBigIntAndWidth({
          value: -8n,
          width: OperationSize.byte,
        }),
      },
    ],
    type: InstructionType.JMP,
  });
  expect(cpu.getRip()).toBe(2);

  cpu.setSignedRegisterValue(Register.RAX, 5n);
  cpu.execute({
    operands: [{register: Register.RAX}],
    type: InstructionType.JGE,
  });
  expect(cpu.getRip()).toBe(7);
});

test('LEA', () => {
  const cpu = new Cpu();
  cpu.setRegisterValue(Register.R10, 10n, false);
  cpu.setRegisterValue(Register.R8W, 8n, false);
  cpu.execute({
    type: InstructionType.LEA,
    operands: [
      {register: Register.RAX},
      {
        effectiveAddr: {
          base: Register.R10,
          dataSize: OperationSize.qword,
          index: Register.R8W,
          displacement: 0,
          scaleFactor: 8,
        },
      },
    ],
  });
  expect(cpu.readSignedValueRegister(Register.RAX)).toBe(74n);
});

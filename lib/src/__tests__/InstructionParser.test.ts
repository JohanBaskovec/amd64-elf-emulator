import {InstructionParser} from "../InstructionParser";
import {Instruction, InstructionType, Operand, OperationSize} from "../Instruction";
import {Register} from "../amd64-architecture";

function parseAndAssertMOV(bytes: number[] | string, operands: Operand[]) {
    if (typeof bytes === "string") {
        bytes = strToByteArray(bytes);
    }

    // mov    eax,0x1
    const uint8Array = Uint8Array.from(bytes)
    const dataView = new DataView(uint8Array.buffer);

    const parser = new InstructionParser(dataView, 0);
    const instruction: Instruction = parser.parse();
    expect(instruction.type).toBe(InstructionType.MOV);
    expect(instruction.length).toBe(bytes.length);
    expect(instruction.operands).toEqual(operands);
}

function strToByteArray(str: string): number[] {
    return str.split(' ').map(n => Number.parseInt(n, 16));
}

test('parse MOV', () => {
    // MOV qword to register
    parseAndAssertMOV("48 b8 c7 11 62 b3 02 01 00 00", [{register: Register.RAX}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 bb c7 11 62 b3 02 01 00 00", [{register: Register.RBX}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 b9 c7 11 62 b3 02 01 00 00", [{register: Register.RCX}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 ba c7 11 62 b3 02 01 00 00", [{register: Register.RDX}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 be c7 11 62 b3 02 01 00 00", [{register: Register.RSI}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 bf c7 11 62 b3 02 01 00 00", [{register: Register.RDI}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 bd c7 11 62 b3 02 01 00 00", [{register: Register.RBP}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 bc c7 11 62 b3 02 01 00 00", [{register: Register.RSP}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 b8 c7 11 62 b3 02 01 00 00", [{register: Register.R8}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 b9 c7 11 62 b3 02 01 00 00", [{register: Register.R9}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 ba c7 11 62 b3 02 01 00 00", [{register: Register.R10}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 bb c7 11 62 b3 02 01 00 00", [{register: Register.R11}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 bc c7 11 62 b3 02 01 00 00", [{register: Register.R12}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 bd c7 11 62 b3 02 01 00 00", [{register: Register.R13}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 be c7 11 62 b3 02 01 00 00", [{register: Register.R14}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 bf c7 11 62 b3 02 01 00 00", [{register: Register.R15}, {bigInt: 1111111111111n}]);

    // MOV dword to register
    parseAndAssertMOV("b8 01 00 00 00", [{register: Register.EAX}, {int: 1}]);
    parseAndAssertMOV("bb 01 00 00 00", [{register: Register.EBX}, {int: 1}]);
    parseAndAssertMOV("b9 01 00 00 00", [{register: Register.ECX}, {int: 1}]);
    parseAndAssertMOV("ba 01 00 00 00", [{register: Register.EDX}, {int: 1}]);
    parseAndAssertMOV("be 01 00 00 00", [{register: Register.ESI}, {int: 1}]);
    parseAndAssertMOV("bf 01 00 00 00", [{register: Register.EDI}, {int: 1}]);
    parseAndAssertMOV("bd 01 00 00 00", [{register: Register.EBP}, {int: 1}]);
    parseAndAssertMOV("bc 01 00 00 00", [{register: Register.ESP}, {int: 1}]);
    parseAndAssertMOV("41 b8 01 00 00 00", [{register: Register.R8D}, {int: 1}]);
    parseAndAssertMOV("41 b9 01 00 00 00", [{register: Register.R9D}, {int: 1}]);
    parseAndAssertMOV("41 ba 01 00 00 00", [{register: Register.R10D}, {int: 1}]);
    parseAndAssertMOV("41 bb 01 00 00 00", [{register: Register.R11D}, {int: 1}]);
    parseAndAssertMOV("41 bc 01 00 00 00", [{register: Register.R12D}, {int: 1}]);
    parseAndAssertMOV("41 bd 01 00 00 00", [{register: Register.R13D}, {int: 1}]);
    parseAndAssertMOV("41 be 01 00 00 00", [{register: Register.R14D}, {int: 1}]);
    parseAndAssertMOV("41 bf 01 00 00 00", [{register: Register.R15D}, {int: 1}]);

    // MOV word to register
    parseAndAssertMOV("66 b8 04 00", [{register: Register.AX}, {int: 4}]);
    parseAndAssertMOV("66 bb 04 00", [{register: Register.BX}, {int: 4}]);
    parseAndAssertMOV("66 b9 04 00", [{register: Register.CX}, {int: 4}]);
    parseAndAssertMOV("66 ba 04 00", [{register: Register.DX}, {int: 4}]);
    parseAndAssertMOV("66 be 04 00", [{register: Register.SI}, {int: 4}]);
    parseAndAssertMOV("66 bf 04 00", [{register: Register.DI}, {int: 4}]);
    parseAndAssertMOV("66 41 b8 04 00", [{register: Register.R8W}, {int: 4}]);
    parseAndAssertMOV("66 41 b9 04 00", [{register: Register.R9W}, {int: 4}]);
    parseAndAssertMOV("66 41 bf 04 00", [{register: Register.R15W}, {int: 4}]);

    // MOV qword register to register
    parseAndAssertMOV("48 89 c0", [{register: Register.RAX}, {register: Register.RAX}]);
    parseAndAssertMOV("48 89 dc", [{register: Register.RSP}, {register: Register.RBX}]);
    parseAndAssertMOV("49 89 c8", [{register: Register.R8}, {register: Register.RCX}]);
    parseAndAssertMOV("49 89 d7", [{register: Register.R15}, {register: Register.RDX}]);
    parseAndAssertMOV("48 89 c3", [{register: Register.RBX}, {register: Register.RAX}]);
    parseAndAssertMOV("48 89 e1", [{register: Register.RCX}, {register: Register.RSP}]);
    parseAndAssertMOV("4c 89 c2", [{register: Register.RDX}, {register: Register.R8}]);
    parseAndAssertMOV("4c 89 fe", [{register: Register.RSI}, {register: Register.R15}]);

    // MOV dword register to register
    parseAndAssertMOV("89 c0", [{register: Register.EAX}, {register: Register.EAX}]);
    parseAndAssertMOV("89 dc", [{register: Register.ESP}, {register: Register.EBX}]);
    parseAndAssertMOV("41 89 c8", [{register: Register.R8D}, {register: Register.ECX}]);
    parseAndAssertMOV("41 89 d7", [{register: Register.R15D}, {register: Register.EDX}]);
    parseAndAssertMOV("89 c3", [{register: Register.EBX}, {register: Register.EAX}]);
    parseAndAssertMOV("89 e1", [{register: Register.ECX}, {register: Register.ESP}]);
    parseAndAssertMOV("44 89 c2", [{register: Register.EDX}, {register: Register.R8D}]);
    parseAndAssertMOV("44 89 fe", [{register: Register.ESI}, {register: Register.R15D}]);

    // MOV word register to register
    parseAndAssertMOV("66 89 c0", [{register: Register.AX}, {register: Register.AX}]);
    parseAndAssertMOV("66 89 dc", [{register: Register.SP}, {register: Register.BX}]);
    parseAndAssertMOV("66 41 89 c8", [{register: Register.R8W}, {register: Register.CX}]);
    parseAndAssertMOV("66 41 89 d7", [{register: Register.R15W}, {register: Register.DX}]);
    parseAndAssertMOV("66 89 c3", [{register: Register.BX}, {register: Register.AX}]);
    parseAndAssertMOV("66 89 e1", [{register: Register.CX}, {register: Register.SP}]);
    parseAndAssertMOV("66 44 89 c2", [{register: Register.DX}, {register: Register.R8W}]);
    parseAndAssertMOV("66 44 89 fe", [{register: Register.SI}, {register: Register.R15W}]);

    // MOV byte register to register
    parseAndAssertMOV("88 e4", [{register: Register.AH}, {register: Register.AH}]);
    parseAndAssertMOV("88 f8", [{register: Register.AL}, {register: Register.BH}]);
    parseAndAssertMOV("40 88 dc", [{register: Register.SPL}, {register: Register.BL}]);
    parseAndAssertMOV("41 88 c0", [{register: Register.R8B}, {register: Register.AL}]);
    parseAndAssertMOV("88 e9", [{register: Register.CL}, {register: Register.CH}]);
    parseAndAssertMOV("88 cf", [{register: Register.BH}, {register: Register.CL}]);
    parseAndAssertMOV("88 f3", [{register: Register.BL}, {register: Register.DH}]);
    parseAndAssertMOV("88 d5", [{register: Register.CH}, {register: Register.DL}]);
    parseAndAssertMOV("44 88 c1", [{register: Register.CL}, {register: Register.R8B}]);
    parseAndAssertMOV("88 e6", [{register: Register.DH}, {register: Register.AH}]);
    parseAndAssertMOV("40 88 e2", [{register: Register.DL}, {register: Register.SPL}]);
    parseAndAssertMOV("41 88 e8", [{register: Register.R8B}, {register: Register.BPL}]);
    parseAndAssertMOV("41 88 f7", [{register: Register.R15B}, {register: Register.SIL}]);

    // mov rbx, [rsp]
    parseAndAssertMOV("48 8b 1c 24", [
        {
            register: Register.RBX
        }, {
            effectiveAddr: {
                base: Register.RSP,
                displacement: 0,
                index: null,
                scaleFactor: 1,
                dataSize: OperationSize.qword,
            }
        }
    ]);

    // mov rax, [rsi]
    parseAndAssertMOV("48 8b 06", [
        {
            register: Register.RAX
        }, {
            effectiveAddr: {
                base: Register.RSI,
                displacement: 0,
                index: null,
                scaleFactor: 1,
                dataSize: OperationSize.qword,
            }
        }
    ]);

    parseAndAssertMOV("48 8b 4c 24 02", [
        {
            register: Register.RCX
        }, {
            effectiveAddr: {
                base: Register.RSP,
                displacement: 2,
                index: null,
                scaleFactor: 1,
                dataSize: OperationSize.qword,
            }
        }
    ]);
    parseAndAssertMOV("48 8b 54 5c 08", [
        {
            register: Register.RDX
        },
        {
            effectiveAddr: {
                base: Register.RSP,
                displacement: 8,
                index: Register.RBX,
                scaleFactor: 2,
                dataSize: OperationSize.qword,
            }
        }
    ]);

    parseAndAssertMOV("4b 8b 14 fb", [
        {
            register: Register.RDX
        },
        {
            effectiveAddr: {
                base: Register.R11,
                index: Register.R15,
                scaleFactor: 8,
                displacement: 0,
                dataSize: OperationSize.qword,
            }
        }
    ]);

    parseAndAssertMOV("49 8b 55 00", [
        {
            register: Register.RDX
        },
        {
            effectiveAddr: {
                base: Register.R13,
                index: null,
                scaleFactor: 1,
                displacement: 0,
                dataSize: OperationSize.qword,
            }
        }
    ]);

    parseAndAssertMOV("49 8b 16", [
        {
            register: Register.RDX
        },
        {
            effectiveAddr: {
                base: Register.R14,
                index: null,
                scaleFactor: 1,
                displacement: 0,
                dataSize: OperationSize.qword,
            }
        }
    ]);

    parseAndAssertMOV("4c 8b 46 14", [
        {
            register: Register.R8
        },
        {
            effectiveAddr: {
                base: Register.RSI,
                index: null,
                scaleFactor: 1,
                displacement: 20,
                dataSize: OperationSize.qword,
            }
        }
    ]);
    parseAndAssertMOV("4c 8b a4 24 00 c2 eb 0b", [
        {
            register: Register.R12
        },
        {
            effectiveAddr: {
                base: Register.RSP,
                index: null,
                scaleFactor: 1,
                displacement: 200000000,
                dataSize: OperationSize.qword,
            }
        }
    ]);

    parseAndAssertMOV("4f 8b 3c e6", [
        {
            register: Register.R15
        },
        {
            effectiveAddr: {
                base: Register.R14,
                index: Register.R12,
                scaleFactor: 8,
                displacement: 0,
                dataSize: OperationSize.qword,
            }
        }
    ]);

    //  mov [rsp + 200000000], r12
    parseAndAssertMOV("4c 89 a4 24 00 c2 eb 0b", [
        {
            effectiveAddr: {
                base: Register.RSP,
                index: null,
                scaleFactor: 1,
                displacement: 200000000,
                dataSize: OperationSize.qword,
            }
        },
        {
            register: Register.R12
        },
    ]);

    parseAndAssertMOV("49 89 0c b0", [
        {
            effectiveAddr: {
                base: Register.R8,
                index: Register.RSI,
                scaleFactor: 4,
                displacement: 0,
                dataSize: OperationSize.qword,
            }
        },
        {
            register: Register.RCX
        },
    ]);

    parseAndAssertMOV("4e 89 3c 3f", [
        {
            effectiveAddr: {
                base: Register.RDI,
                index: Register.R15,
                scaleFactor: 1,
                displacement: 0,
                dataSize: OperationSize.qword,
            }
        },
        {
            register: Register.R15
        },
    ]);
});










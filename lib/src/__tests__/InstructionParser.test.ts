import {InstructionParser} from "../InstructionParser";
import {Instruction, InstructionType, Operand} from "../Instruction";
import {OperationSize, Register} from "../amd64-architecture";

function parseAndAssert(bytes: number[] | string, operands: Operand[], type: InstructionType) {
    if (typeof bytes === "string") {
        bytes = strToByteArray(bytes);
    }

    // mov    eax,0x1
    const uint8Array = Uint8Array.from(bytes)
    const dataView = new DataView(uint8Array.buffer);

    const parser = new InstructionParser(dataView, 0);
    const instruction: Instruction = parser.parse();
    expect(instruction.type).toBe(type);
    expect(instruction.length).toBe(bytes.length);
    expect(instruction.operands).toEqual(operands);
}

function parseAndAssertMOV(bytes: number[] | string, operands: Operand[]) {
    parseAndAssert(bytes, operands, InstructionType.MOV);
}

function strToByteArray(str: string): number[] {
    return str.split(' ').map(n => Number.parseInt(n, 16));
}

test('parse MOV', () => {
    // MOV qword to register
    parseAndAssertMOV("48 b8 c7 11 62 b3 02 01 00 00", [{register: Register.RAX}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("48 bb c7 11 62 b3 02 01 00 00", [{register: Register.RBX}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("48 b9 c7 11 62 b3 02 01 00 00", [{register: Register.RCX}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("48 ba c7 11 62 b3 02 01 00 00", [{register: Register.RDX}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("48 be c7 11 62 b3 02 01 00 00", [{register: Register.RSI}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("48 bf c7 11 62 b3 02 01 00 00", [{register: Register.RDI}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("48 bd c7 11 62 b3 02 01 00 00", [{register: Register.RBP}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("48 bc c7 11 62 b3 02 01 00 00", [{register: Register.RSP}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("49 b8 c7 11 62 b3 02 01 00 00", [{register: Register.R8}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("49 b9 c7 11 62 b3 02 01 00 00", [{register: Register.R9}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("49 ba c7 11 62 b3 02 01 00 00", [{register: Register.R10}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("49 bb c7 11 62 b3 02 01 00 00", [{register: Register.R11}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("49 bc c7 11 62 b3 02 01 00 00", [{register: Register.R12}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("49 bd c7 11 62 b3 02 01 00 00", [{register: Register.R13}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("49 be c7 11 62 b3 02 01 00 00", [{register: Register.R14}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);
    parseAndAssertMOV("49 bf c7 11 62 b3 02 01 00 00", [{register: Register.R15}, {
        immediate: {
            value: 1111111111111n,
            width: OperationSize.qword
        }
    }]);

    // MOV dword to register
    parseAndAssertMOV("b8 01 00 00 00", [{register: Register.EAX}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("bb 01 00 00 00", [{register: Register.EBX}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("b9 01 00 00 00", [{register: Register.ECX}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("ba 01 00 00 00", [{register: Register.EDX}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("be 01 00 00 00", [{register: Register.ESI}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("bf 01 00 00 00", [{register: Register.EDI}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("bd 01 00 00 00", [{register: Register.EBP}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("bc 01 00 00 00", [{register: Register.ESP}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("41 b8 01 00 00 00", [{register: Register.R8D}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("41 b9 01 00 00 00", [{register: Register.R9D}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("41 ba 01 00 00 00", [{register: Register.R10D}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("41 bb 01 00 00 00", [{register: Register.R11D}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("41 bc 01 00 00 00", [{register: Register.R12D}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("41 bd 01 00 00 00", [{register: Register.R13D}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("41 be 01 00 00 00", [{register: Register.R14D}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);
    parseAndAssertMOV("41 bf 01 00 00 00", [{register: Register.R15D}, {
        immediate: {
            value: 1n,
            width: OperationSize.dword
        }
    }]);

    // MOV word to register
    parseAndAssertMOV("66 b8 04 00", [{register: Register.AX}, {immediate: {value: 4n, width: OperationSize.word}}]);
    parseAndAssertMOV("66 bb 04 00", [{register: Register.BX}, {immediate: {value: 4n, width: OperationSize.word}}]);
    parseAndAssertMOV("66 b9 04 00", [{register: Register.CX}, {immediate: {value: 4n, width: OperationSize.word}}]);
    parseAndAssertMOV("66 ba 04 00", [{register: Register.DX}, {immediate: {value: 4n, width: OperationSize.word}}]);
    parseAndAssertMOV("66 be 04 00", [{register: Register.SI}, {immediate: {value: 4n, width: OperationSize.word}}]);
    parseAndAssertMOV("66 bf 04 00", [{register: Register.DI}, {immediate: {value: 4n, width: OperationSize.word}}]);
    parseAndAssertMOV("66 41 b8 04 00", [{register: Register.R8W}, {
        immediate: {
            value: 4n,
            width: OperationSize.word
        }
    }]);
    parseAndAssertMOV("66 41 b9 04 00", [{register: Register.R9W}, {
        immediate: {
            value: 4n,
            width: OperationSize.word
        }
    }]);
    parseAndAssertMOV("66 41 bf 04 00", [{register: Register.R15W}, {
        immediate: {
            value: 4n,
            width: OperationSize.word
        }
    }]);

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

test('parse XOR', () => {
    // xor rdi, 5000
    // XOR reg/mem64, imm32
    parseAndAssert("48 81 f7 88 13 00 00", [

        {
            register: Register.RDI
        },
        {
            immediate: {value: 0x1388n, width: OperationSize.dword}
        },
    ], InstructionType.XOR);

    // xor al, 44
    // XOR AL, imm8
    parseAndAssert("34 2c", [{register: Register.AL}, {
        immediate: {
            value: 44n,
            width: OperationSize.byte
        }
    }], InstructionType.XOR);

    // xor ax, 433
    // XOR AX, imm16
    parseAndAssert("66 35 b1 01", [{register: Register.AX}, {
        immediate: {
            value: 433n,
            width: OperationSize.word
        }
    }], InstructionType.XOR);

    // xor dword eax, 433
    // XOR EAX, imm32
    parseAndAssert("35 b1 01 00 00", [{register: Register.EAX}, {
        immediate: {
            value: 433n,
            width: OperationSize.dword
        }
    }], InstructionType.XOR);

    // xor dword rax, 433
    // XOR RAX, imm32
    parseAndAssert("48 35 b1 01 00 00", [{register: Register.RAX}, {
        immediate: {
            value: 433n,
            width: OperationSize.dword
        }
    }], InstructionType.XOR);

    // xor byte [datab], 4
    // XOR reg/mem8, imm8
    parseAndAssert("80 34 25 00 20 40 00 04", [{
        effectiveAddr: {
            base: null,
            dataSize: OperationSize.byte,
            displacement: 0x402000,
            index: null,
            scaleFactor: 1
        }
    }, {immediate: {value: 4n, width: OperationSize.byte}}], InstructionType.XOR);


    // xor si, 435
    // XOR reg/mem16, imm16
    parseAndAssert("66 81 f6 b3 01", [{
        register: Register.SI
    }, {immediate: {value: 435n, width: OperationSize.word}}], InstructionType.XOR);

    // xor esi, 435
    // XOR reg/mem32, imm32
    parseAndAssert("81 f6 b3 01 00 00", [{
        register: Register.ESI
    }, {immediate: {value: 435n, width: OperationSize.dword}}], InstructionType.XOR);

    // xor rsi, 435
    // XOR reg/mem64, imm32
    parseAndAssert("48 81 f6 b3 01 00 00", [{
        register: Register.RSI
    }, {immediate: {value: 435n, width: OperationSize.dword}}], InstructionType.XOR);

    // xor ax, 44
    // XOR reg/mem16, imm8
    parseAndAssert("66 83 f0 2c", [{register: Register.AX}, {immediate: {value: 44n, width: OperationSize.byte}}], InstructionType.XOR);
    // xor eax, 44
    // XOR reg/mem32, imm8
    parseAndAssert("83 f0 2c", [{register: Register.EAX}, {immediate: {value: 44n, width: OperationSize.byte}}], InstructionType.XOR);
    // xor rax, 44
    // XOR reg/mem64, imm8
    parseAndAssert("48 83 f0 2c", [{register: Register.RAX}, {immediate: {value: 44n, width: OperationSize.byte}}], InstructionType.XOR);


    // xor r8b, r9b
    // XOR reg/mem8, reg8
    parseAndAssert("45 30 c8", [{register: Register.R8B}, {register: Register.R9B}], InstructionType.XOR);

    // xor r10w, r11w
    // XOR reg/mem16, reg16
    parseAndAssert("66 45 31 da", [{register: Register.R10W}, {register: Register.R11W}], InstructionType.XOR);

    // xor r12d, r13d
    // XOR reg/mem32, reg32
    parseAndAssert("45 31 ec", [{register: Register.R12D}, {register: Register.R13D}], InstructionType.XOR);

    // xor r14, r15
    // XOR reg/mem64, reg64
    parseAndAssert("4d 31 fe", [{register: Register.R14}, {register: Register.R15}], InstructionType.XOR);

    // xor r8b, [datab]
    // XOR reg8, reg/mem8
    parseAndAssert("44 32 04 25 00 20 40 00", [{register: Register.R8B}, {
        effectiveAddr: {
            scaleFactor: 1,
            index: null,
            base: null,
            dataSize: OperationSize.byte,
            displacement: 0x402000
        }
    }], InstructionType.XOR);

    // xor sp, [dataw]
    // XOR reg16, reg/mem16
    parseAndAssert("66 33 24 25 01 20 40 00", [{register: Register.SP}, {
        effectiveAddr: {
            scaleFactor: 1,
            index: null,
            base: null,
            dataSize: OperationSize.word,
            displacement: 0x402001
        }
    }], InstructionType.XOR);

    // xor edi, [datad]
    // XOR reg32, reg/mem32
    parseAndAssert("33 3c 25 03 20 40 00", [{register: Register.EDI}, {
        effectiveAddr: {
            scaleFactor: 1,
            index: null,
            base: null,
            dataSize: OperationSize.dword,
            displacement: 0x402003
        }
    }], InstructionType.XOR);

    // xor rcx, [dataq]
    // XOR reg64, reg/mem64
    parseAndAssert("48 33 0c 25 07 20 40 00", [{register: Register.RCX}, {
        effectiveAddr: {
            scaleFactor: 1,
            index: null,
            base: null,
            dataSize: OperationSize.qword,
            displacement: 0x402007
        }
    }], InstructionType.XOR);


});

test('parse ADD', () => {
    // add al, 8
    // ADD AL, imm8
    parseAndAssert("04 08", [{register: Register.AL}, {immediate: {value: 8n, width: OperationSize.byte}}], InstructionType.ADD);

    // add ax, 257
    // ADD AX, imm16
    parseAndAssert("66 05 01 01", [{register: Register.AX}, {immediate: {value: 257n, width: OperationSize.word}}], InstructionType.ADD);

    // add eax, 66000
    // ADD EAX, imm32
    parseAndAssert("05 d0 01 01 00", [{register: Register.EAX}, {immediate: {value: 66000n, width: OperationSize.dword}}], InstructionType.ADD);

    // add rax, 66000
    // ADD RAX, imm32
    parseAndAssert("48 05 d0 01 01 00", [{register: Register.RAX}, {immediate: {value: 66000n, width: OperationSize.dword}}], InstructionType.ADD);

    // add r8b, 3
    // ADD reg/mem8, imm8
    parseAndAssert("41 80 c0 03", [{register: Register.R8B}, {immediate: {value: 3n, width: OperationSize.byte}}], InstructionType.ADD);

    // add cx, 257
    // ADD reg/mem16, imm16
    parseAndAssert("66 81 c1 01 01", [{register: Register.CX}, {immediate: {value: 257n, width: OperationSize.word}}], InstructionType.ADD);

    // add edx, 66000
    // ADD reg/mem32, imm32
    parseAndAssert("81 c2 d0 01 01 00", [{register: Register.EDX}, {immediate: {value: 66000n, width: OperationSize.dword}}], InstructionType.ADD);

    // add r13, 66000
    // ADD reg/mem64, imm32
    parseAndAssert("49 81 c5 d0 01 01 00", [{register: Register.R13}, {immediate: {value: 66000n, width: OperationSize.dword}}], InstructionType.ADD);

    // add r15w, 8
    // ADD reg/mem16, imm8
    parseAndAssert("66 41 83 c7 08", [{register: Register.R15W}, {immediate: {value: 8n, width: OperationSize.byte}}], InstructionType.ADD);

    // add r14d, 8
    // ADD reg/mem32, imm8
    parseAndAssert("41 83 c6 08", [{register: Register.R14D}, {immediate: {value: 8n, width: OperationSize.byte}}], InstructionType.ADD);

    // add r13, 8
    // ADD reg/mem64, imm8
    parseAndAssert("49 83 c5 08", [{register: Register.R13}, {immediate: {value: 8n, width: OperationSize.byte}}], InstructionType.ADD);

    // add al, r8b
    // ADD reg/mem8, reg8
    parseAndAssert("44 00 c0", [{register: Register.AL}, {register: Register.R8B}], InstructionType.ADD);

    // add bx, r10w
    // ADD reg/mem16, reg16
    parseAndAssert("66 44 01 d3", [{register: Register.BX}, {register: Register.R10W}], InstructionType.ADD);

    // add esi, r11d
    // ADD reg/mem32, reg32
    parseAndAssert("44 01 de", [{register: Register.ESI}, {register: Register.R11D}], InstructionType.ADD);

    // add rdi, rax
    // ADD reg/mem64, reg64
    parseAndAssert("48 01 c7", [{register: Register.RDI}, {register: Register.RAX}], InstructionType.ADD);

    // add dl, [datab]
    // ADD reg8, reg/mem8
    parseAndAssert("02 14 25 00 20 40 00", [{register: Register.DL}, {
        effectiveAddr: {
            base: null,
            index: null,
            displacement: 0x402000,
            dataSize: OperationSize.byte,
            scaleFactor: 1,
        }
    }], InstructionType.ADD);

    // add r13w, [dataw]
    // ADD reg16, reg/mem16
    parseAndAssert("66 44 03 2c 25 01 20 40 00", [{register: Register.R13W}, {
        effectiveAddr: {
            base: null,
            index: null,
            displacement: 0x402001,
            dataSize: OperationSize.word,
            scaleFactor: 1,
        }
    }], InstructionType.ADD);

    // add r14d, [datad]
    // ADD reg32, reg/mem32
    parseAndAssert("44 03 34 25 03 20 40 00", [{register: Register.R14D}, {
        effectiveAddr: {
            base: null,
            index: null,
            displacement: 0x402003,
            dataSize: OperationSize.dword,
            scaleFactor: 1,
        }
    }], InstructionType.ADD);

    // add r15, [dataq]
    // ADD reg64, reg/mem64
    parseAndAssert("4c 03 3c 25 07 20 40 00", [{register: Register.R15}, {
        effectiveAddr: {
            base: null,
            index: null,
            displacement: 0x402007,
            dataSize: OperationSize.qword,
            scaleFactor: 1,
        }
    }], InstructionType.ADD);
});

test('parse IMUL', () => {
    // imul sil
    // IMUL reg/mem8
    parseAndAssert("40 f6 ee", [{register: Register.SIL}], InstructionType.IMUL);

    // imul si
    // IMUL reg/mem16
    parseAndAssert("66 f7 ee", [{register: Register.SI}], InstructionType.IMUL);

    // imul esi
    // IMUL reg/mem32
    parseAndAssert("f7 ee", [{register: Register.ESI}], InstructionType.IMUL);

    // imul rsi
    // IMUL reg/mem64
    parseAndAssert("48 f7 ee", [{register: Register.RSI}], InstructionType.IMUL);

    // imul si, r8w
    // IMUL reg16, reg/mem16
    parseAndAssert("66 41 0f af f0", [{register: Register.SI}, {register: Register.R8W}], InstructionType.IMUL);

    // imul esi, r8d
    // IMUL reg32, reg/mem32
    parseAndAssert("41 0f af f0", [{register: Register.ESI}, {register: Register.R8D}], InstructionType.IMUL);

    // imul rsi, r8
    // IMUL reg64, reg/mem64
    parseAndAssert("49 0f af f0", [{register: Register.RSI}, {register: Register.R8}], InstructionType.IMUL);

    // TODO:
    // IMUL reg16, reg/mem16, imm8
    // IMUL reg32, reg/mem32, imm8
    // IMUL reg64, reg/mem64, imm8
    // IMUL reg16, reg/mem16, imm16
    // IMUL reg32, reg/mem32, imm32
    // IMUL reg64, reg/mem64, imm32
});

test('parse JGE', () => {
   parseAndAssert("7d df", [{relativeOffset: {value: 223n, width: OperationSize.byte}}], InstructionType.JGE);
});

test('MOVZX', () => {
    // movzx ax, r8b
    // MOVZX reg16, reg/mem8
    parseAndAssert("66 41 0f b6 c0", [{register: Register.AX}, {register: Register.R8B}], InstructionType.MOVZX);

    // movzx eax, r8b
    // MOVZX reg32, reg/mem8
    parseAndAssert("41 0f b6 c0", [{register: Register.EAX}, {register: Register.R8B}], InstructionType.MOVZX);

    // movzx rax, r8b
    // MOVZX reg64, reg/mem8
    parseAndAssert("49 0f b6 c0", [{register: Register.RAX}, {register: Register.R8B}], InstructionType.MOVZX);

    // movzx eax, r8w
    // MOVZX reg32, reg/mem16
    parseAndAssert("41 0f b7 c0", [{register: Register.EAX}, {register: Register.R8W}], InstructionType.MOVZX);

    // movzx rax, r8w
    // MOVZX reg64, reg/mem16
    parseAndAssert("49 0f b7 c0", [{register: Register.RAX}, {register: Register.R8W}], InstructionType.MOVZX);

});

test('CALL', () => {
   parseAndAssert("e8 af ff ff ff", [{immediate: {value: 0xff_ff_ff_afn, width: OperationSize.dword}}], InstructionType.CALL);
});

test('RET', () => {
    parseAndAssert("c3", [], InstructionType.RET);
});

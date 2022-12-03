import {InstructionParser} from "../InstructionParser";
import {Instruction, InstructionType, Operand} from "../Instruction";
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
    parseAndAssertMOV("48 bb c7 11 62 b3 02 01 00 00",[{register: Register.RBX}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 b9 c7 11 62 b3 02 01 00 00",[{register: Register.RCX}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 ba c7 11 62 b3 02 01 00 00",[{register: Register.RDX}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 be c7 11 62 b3 02 01 00 00",[{register: Register.RSI}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 bf c7 11 62 b3 02 01 00 00",[{register: Register.RDI}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 bd c7 11 62 b3 02 01 00 00",[{register: Register.RBP}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("48 bc c7 11 62 b3 02 01 00 00",[{register: Register.RSP}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 b8 c7 11 62 b3 02 01 00 00",[{register: Register.R8}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 b9 c7 11 62 b3 02 01 00 00",[{register: Register.R9}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 ba c7 11 62 b3 02 01 00 00",[{register: Register.R10}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 bb c7 11 62 b3 02 01 00 00",[{register: Register.R11}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 bc c7 11 62 b3 02 01 00 00",[{register: Register.R12}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 bd c7 11 62 b3 02 01 00 00",[{register: Register.R13}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 be c7 11 62 b3 02 01 00 00",[{register: Register.R14}, {bigInt: 1111111111111n}]);
    parseAndAssertMOV("49 bf c7 11 62 b3 02 01 00 00",[{register: Register.R15}, {bigInt: 1111111111111n}]);

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
})

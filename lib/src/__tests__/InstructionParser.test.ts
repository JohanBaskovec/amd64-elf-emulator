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
    // mov    eax,0x1
    parseAndAssertMOV([0xb8, 0x01, 0x00, 0x00, 0x00], [{register: Register.EAX}, {int: 1}]);

    // mov rax, 1111111111111
    parseAndAssertMOV("48 b8 c7 11 62 b3 02 01 00 00", [{register: Register.RAX}, {bigInt: 1111111111111n}]);

    // mov ax, 4
    parseAndAssertMOV("66 b8 04 00", [{register: Register.AX}, {int: 4}]);
    // mov bx, 4
    parseAndAssertMOV("66 bb 04 00", [{register: Register.BX}, {int: 4}]);
    // mov cx, 4
    parseAndAssertMOV("66 b9 04 00", [{register: Register.CX}, {int: 4}]);
    // mov dx, 4
    parseAndAssertMOV("66 ba 04 00", [{register: Register.DX}, {int: 4}]);
    // mov si, 4
    parseAndAssertMOV("66 be 04 00", [{register: Register.SI}, {int: 4}]);
    // mov di, 4
    parseAndAssertMOV("66 bf 04 00", [{register: Register.DI}, {int: 4}]);
    // mov r8w, 4
    parseAndAssertMOV("66 41 b8 04 00", [{register: Register.R8W}, {int: 4}]);
    // mov r9w, 4
    parseAndAssertMOV("66 41 b9 04 00", [{register: Register.R9W}, {int: 4}]);
    // mov r15w, 4
    parseAndAssertMOV("66 41 bf 04 00", [{register: Register.R15W}, {int: 4}]);

})

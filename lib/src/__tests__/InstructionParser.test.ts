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

})

import {InstructionByAddress} from './Instruction';
import {InstructionParser} from './InstructionParser';

export class InstructionsParser {
  parse(
    machineCode: DataView,
    codeStart: number,
    codeLength: number,
    addrOffset: number
  ): InstructionByAddress {
    const instructions: InstructionByAddress = {};
    let i = codeStart;
    while (i < codeStart + codeLength) {
      const instructionParser = new InstructionParser(
        machineCode,
        i,
        addrOffset
      );
      const instruction = instructionParser.parse();
      if (instruction.virtualAddress === undefined) {
        throw new Error('Instruction has no address.');
      }
      if (instruction.length === undefined) {
        throw new Error('Instruction has no length.');
      }
      i += instruction.length;
      instructions[instruction.virtualAddress] = instruction;
    }
    return instructions;
  }
}

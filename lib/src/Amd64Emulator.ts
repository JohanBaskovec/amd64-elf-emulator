import {Process} from './Process';
import {ELF64} from './elf64';
import {Emulator} from './Emulator';
import {initInstructionDefinitions} from './instructions-definitions';
import {ElfParser} from './ElfParser';
import {
  doNothingProcessEventListener,
  ProcessEventListener,
} from './ProcessEventListener';

export class Amd64Emulator extends Emulator {
  elfParser = new ElfParser();

  constructor() {
    super();
    initInstructionDefinitions();
  }

  loadElf64ExecutableFromBinary(name: string, bytes: ArrayBuffer): Process {
    const elf: ELF64 = this.elfParser.parseExecutableFromBytes(bytes);
    const process = new Process(name, elf);
    return process;
  }

  runElf64ExecutableFromBinary(
    name: string,
    bytes: ArrayBuffer,
    args: string[] = [],
    eventListener: ProcessEventListener = doNothingProcessEventListener
  ): Process {
    const process = this.loadElf64ExecutableFromBinary(name, bytes);
    process.run(args, eventListener);
    return process;
  }
}

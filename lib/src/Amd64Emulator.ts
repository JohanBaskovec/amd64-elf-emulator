import {Process} from "./Process";
import {ELF64} from "./elf64";
import {Emulator} from "./Emulator";
import {initInstructionDefinitions} from "./instructions-definitions";
import {ElfParser} from "./ElfParser";

export class Amd64Emulator extends Emulator {
    process?: Process;
    elfParser = new ElfParser();

    constructor() {
        super();
        initInstructionDefinitions();
    }

    onExit(code: number) {
        super.onExit(code);
        if (this.process) {
            this.process.stop();
        }
        this.process = undefined;
    }

    loadElf64ExecutableFromBinary(bytes: ArrayBuffer): Process {
        const elf: ELF64 = this.elfParser.parseExecutableFromBytes(bytes);
        const process = new Process(elf, this);
        this.process = process;
        return process;
    }

    runElf64ExecutableFromBinary(bytes: ArrayBuffer): Process {
        const process = this.loadElf64ExecutableFromBinary(bytes);
        process.run();
        return process;
    }
}



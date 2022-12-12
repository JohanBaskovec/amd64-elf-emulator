import {Process} from "./Process";
import {ELF64} from "./elf64";
import {Emulator} from "./Emulator";
import {initInstructionDefinitions} from "./instructions-definitions";
import {ElfParser} from "./ElfParser";
import * as fs from "fs";

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

    runElf64ExecutableFromPath(executablePath: string) {
        const executableContent = fs.readFileSync(executablePath);
        this.runElf64ExecutableFromBinary(executableContent.buffer);
    }

    runElf64ExecutableFromBinary(bytes: ArrayBuffer) {
        const elf: ELF64 = this.elfParser.parseExecutableFromBytes(bytes);
        const process = new Process(elf, this);
        this.process = process;
        process.run();
    }
}



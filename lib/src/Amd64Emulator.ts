import {Process} from "./Process";
import {BinaryFileReader} from "./BinaryFileReader";
import {ELF64, ELF64Header, ProgramHeader, Type} from "./elf64";
import {Emulator} from "./Emulator";
import {initInstructionDefinitions} from "./instructions-definitions";

export class Amd64Emulator extends Emulator {
    process?: Process;

    constructor() {
        super();
        initInstructionDefinitions();
    }

    parseExecutable(bytes: ArrayBuffer) {
        const dv = new BinaryFileReader(new DataView(bytes));
        if (dv.getUint8() !== 0x7f) {
            throw new Error('Missing magic number at position 0!');
        }
        if (dv.getUint8() != 0x45 || dv.getUint8() != 0x4c || dv.getUint8() != 0x46) {
            throw new Error('Missing ELF at beginning of the file!');
        }
        const clazz = dv.getUint8();
        const data = dv.getUint8();
        const elfVersion = dv.getUint8();
        const osAbi = dv.getUint8();
        const abiVersion = dv.getUint8();

        dv.index = 16;
        const typeInt = dv.getUint16();
        const type: Type = typeInt;

        const machine = dv.getUint16()
        const version = dv.getUint32()
        const entry = dv.getUint64()
        const phoff = dv.getUint64()
        const shoff = dv.getUint64()
        const flags = dv.getUint32()
        const ehsize = dv.getUint16()
        const phentsize = dv.getUint16()
        const phnum = dv.getUint16()
        const shentsize = dv.getUint16()
        const shnum = dv.getUint16()
        const shstrndx = dv.getUint16()

        if (Number(phoff) == 0) {
            throw new Error('Executable has no program headers.');
        }

        if (!Type[typeInt]) {
            throw new Error('Unrecognized file type ' + typeInt);
        }

        if (type != Type.exec) {
            throw new Error('File provided is not executable!');
        }
        const header: ELF64Header = {
            class: clazz, data, elfVersion, osAbi, abiVersion,
            type, machine, version, entry, phoff, shoff, flags, ehsize, phentsize, phnum, shentsize, shnum, shstrndx
        };
        //console.log(header);
        dv.index = phoff;
        const programHeaders: ProgramHeader[] = [];
        for (let i = 0; i < phnum; i++) {
            programHeaders.push({
                type: dv.getUint32(),
                flags: dv.getUint32(),
                offset: dv.getUint64(),
                vaddr: dv.getUint64(),
                paddr: dv.getUint64(),
                filesz: dv.getUint64(),
                memsz: dv.getUint64(),
                align: dv.getUint64(),
            });
        }

        const elf64: ELF64 = {
            header,
            programHeaders,
            bytes,
        };
        return elf64;
    }

    onExit(code: number) {
        super.onExit(code);
        if (this.process) {
            this.process.stop();
        }
        this.process = undefined;
    }

    runElf64Executable(bytes: ArrayBuffer) {
        const elf: ELF64 = this.parseExecutable(bytes);
        const process = new Process(elf, this);
        this.process = process;
        process.run();
    }
}



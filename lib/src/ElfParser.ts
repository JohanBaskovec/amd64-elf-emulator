import {BinaryFileReader} from "./BinaryFileReader";
import {ELF64, ELF64Header, ProgramHeader, SectionHeader, Type} from "./elf64";
import * as fs from "fs";

export class ElfParser {
    parseExecutableFromPath(path: string): ELF64 {
        const fileContent: Buffer = fs.readFileSync(path);
        return this.parseExecutableFromBytes(fileContent.buffer);
    }

    parseExecutableFromBytes(bytes: ArrayBuffer): ELF64 {
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
            type, machine, version, entry, programHeadersOffset: phoff, sectionHeadersOffset: shoff, flags, elfHeaderSize: ehsize, programHeadersSize: phentsize, programHeadersNumber: phnum, sectionHeadersSize: shentsize, sectionHeadersNumber: shnum, shstrndx
        };
        //console.log(header);
        dv.index = phoff;
        const programHeaders: ProgramHeader[] = [];
        for (let i = 0; i < phnum; i++) {
            programHeaders.push({
                type: dv.getUint32(),
                flags: dv.getUint32(),
                offset: dv.getUint64(),
                virtualAddress: dv.getUint64(),
                physicalAddress: dv.getUint64(),
                filesz: dv.getUint64(),
                memsz: dv.getUint64(),
                align: dv.getUint64(),
            });
        }
        dv.index = shoff;
        const sectionHeaders: SectionHeader[] = [];
        for (let i = 0; i < shnum; i++) {
            sectionHeaders.push({
                nameIndex: dv.getUint32(),
                name: "no_name",
                type: dv.getUint32(),
                flags: dv.getBigUint64(),
                addr: dv.getBigUint64(),
                offset: dv.getBigUint64(),
                size: dv.getBigUint64(),
                link: dv.getUint32(),
                info: dv.getUint32(),
                addressAlignment: dv.getBigUint64(),
                entsize: dv.getBigUint64(),
            });
        }
        const sectionNamesSectionHeader = sectionHeaders[shstrndx];
        const sectionOff = sectionNamesSectionHeader.offset;
        for (let i = 0; i < shnum; i++) {
            dv.index = Number(sectionOff) + sectionHeaders[i].nameIndex;
            let name = "";
            let characters: number[] = [];
            let c = dv.getUint8();
            while (c != 0) {
                characters.push(c);
                c = dv.getUint8();
            }
            sectionHeaders[i].name = String.fromCharCode(...characters);

        }

        const elf64: ELF64 = {
            header,
            programHeaders,
            bytes,
            sectionHeaders,
        };
        return elf64;
    }
}

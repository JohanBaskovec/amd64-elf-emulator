/**
 * Copied from Linux kernel's elf.h
 */

export enum Type {
    none, rel, exec, dyn, core
}

export enum Architecture {
    none, class32, class64,
}

export enum DataEncoding {
    none, data2ldb, data2msb,
}

export enum Version {
    none, current,
}

export interface ELF64Header {
    class: Architecture;
    data: DataEncoding;
    elfVersion: Version,
    osAbi: number;
    abiVersion: number;
    type: Type;
    machine: number;
    version: Version;
    entry: number;
    phoff: number;
    shoff: number;
    flags: number;
    ehsize: number;
    phentsize: number;
    phnum: number;
    shentsize: number;
    shnum: number;
    shstrndx: number;
}

export interface ProgramHeader {
    type: number;
    flags: number;
    offset: number;
    vaddr: number;
    paddr: number;
    filesz: number;
    memsz: number;
    align: number;
}

export interface ELF64 {
    header: ELF64Header;
    programHeaders: ProgramHeader[];
    bytes: ArrayBuffer;
}



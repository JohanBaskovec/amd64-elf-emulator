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
    programHeadersOffset: number;
    sectionHeadersOffset: number;
    flags: number;
    elfHeaderSize: number;
    programHeadersSize: number;
    programHeadersNumber: number;
    sectionHeadersSize: number;
    sectionHeadersNumber: number;
    shstrndx: number;
}

export interface ProgramHeader {
    type: number;
    flags: number;
    offset: number;
    virtualAddress: number;
    physicalAddress: number;
    filesz: number;
    memsz: number;
    align: number;
}

export interface SectionHeader {
    nameIndex: number;
    name: string;
    type: number;
    flags: bigint;
    addr: bigint;
    offset: bigint;
    size: bigint;
    link: number;
    info: number;
    addressAlignment: bigint;
    entsize: bigint;
}

export interface ELF64 {
    header: ELF64Header;
    programHeaders: ProgramHeader[];
    sectionHeaders: SectionHeader[];
    bytes: ArrayBuffer;
}



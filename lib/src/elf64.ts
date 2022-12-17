/**
 * Copied from Linux kernel's elf.h
 */

export enum Type {
  none,
  rel,
  exec,
  dyn,
  core,
}

export enum Architecture {
  none,
  class32,
  class64,
}

export enum DataEncoding {
  none,
  data2ldb,
  data2msb,
}

export enum Version {
  none,
  current,
}

export enum SymbolTableBinding {
  local,
  global,
  weak,
}

export enum SymbolTableType {
  notype,
  object,
  func,
  section,
  file,
  common,
  tls,
}

export enum SectionHeaderType {
  null,
  progbits,
  symtab,
  strtab,
  rela,
  hash,
  dynamic,
  note,
  nobits,
  rel,
  shlib,
  dynsym,
  num,
  loproc = 0x70000000,
  hiproc = 0x7fffffff,
  louser = 0x80000000,
  hiuser = 0xffffffff,
}

export type Label = {
  virtualAddress: number;
  name: string;
};

export type LabelsMap = {[address: number]: Label};

export interface ELF64Header {
  class: Architecture;
  data: DataEncoding;
  elfVersion: Version;
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
  type: SectionHeaderType;
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
  symbolTables: SymbolTable[] | null;
  labels: LabelsMap;
  strings: StringByIndex;
  sectionHeadersStrings: StringByIndex;
}

export type StringByIndex = {[index: number]: string};
export interface SymbolTable {
  nameIndex: number;
  name: string;
  info: number;
  type: SymbolTableType;
  binding: SymbolTableBinding;
  other: number;
  shndx: number;
  value: bigint;
  size: bigint;
}

export function extractSymbolTableType(info: number): SymbolTableType {
  return info & 0xf;
}

export function extractSymbolTableBinding(info: number): SymbolTableBinding {
  return info >> 4;
}

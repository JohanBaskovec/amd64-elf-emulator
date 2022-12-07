# A work-in-progress AMD64 ELF64 emulator

## Why

While studying assembly, I was reading the AMD64 Architecture
Programmer's manual, learning how instructions are encoded and about the 
internal architecture of the CPU and realised I could write
a working emulator in Javascript (well, Typescript)... so I started making one, 
just for fun.

I know emulators already exist, it's just a learning experiment for myself.

## Goals

The goal is to learn more assembly and to:

- implement a *very small subset* of the AMD64 instruction set: arithmetic,
  stack and procedure call instructions.
- implement a few System V system calls (write, exit, maybe memory allocation)
- make it work in Node.js and in the browser

The goal is *not* to have a fully working emulator, it would take years of work,
and I have better things to learn.

## Done

The following instructions are currently implemented:

- MOV
- XOR
- SYSCALL

These system calls are implemented:

- write
- exit


## Build

```
npm i
npx webpack
```

## Working with the library
Go inside the `lib` directory, then:

### Build tests
```
npx tsc -p tsconfig.test.json
```

### Run tests
```
npx jest
```

### Build tests, watch for changes, run tests on change
```
npx tsc-watch -p tsconfig.test.json --onSuccess "jest"
```

### Running the emulator in the terminal
```
node src/x64_vm_cmd.js {path_to_elf_file}
```

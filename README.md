# An AMD64 ELF64 Linux emulator

## What is it?

This is an emulator written in Typescript that aims to run x86-64/AMD64 ELF64
executables in browsers and Node.js, the goal is to be able to compile a program
for Linux and run them as-is. In order to reach this goal, it should be able to
emulate a CPU but also system calls and a terminal. I'm doing this only to learn
how modern assembly and machine code work, therefor it will never be complete (
it would take years of work).

## Building and running

### Compiling example assembly programs

First, you need to install NASM (https://www.nasm.us/).

A few example programs that are guaranteed to run in the emulator are
available in the `examples/asm` folder. In order to build them, go
into `examples/asm` and run `./build.sh <folder_name>`, for example 
`./build.sh add`, it will create an executable (called `executable`) in the
`add` folder, along with the `decompiled` file and content as `hex` (they
are used for developing the emulator).

### Running the emulator in the terminal

Install dependencies and compile to Javascript:
```
cd lib
npm i
npx tsc
cd ..
```

Run the emulator:

```
node lib/src/x64_vm_cmd.js <path_to_elf64_executable> <params>
```

For example:

```
node lib/src/x64_vm_cmd.js examples/asm/add/executable 12 36
```

This will print:
```
Running examples/asm/add/executable
Process finished with code 48
Process exited.
```

### Running in the browser
```
cd web
npm i
npm start
```

A browser window should open.

## Working on the library

Go inside the `lib` directory, then:

### Build and watch
```
npx tsc --watch
```

### Build tests and watch

```
npx tsc -p tsconfig.test.json --watch
```

### Run tests

```
npx jest
```

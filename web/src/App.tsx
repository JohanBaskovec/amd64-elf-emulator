import React, {FormEvent, KeyboardEventHandler, useState} from 'react';
import './App.css';
import {
    Amd64Emulator, Disassembler,
    Process,
    ProcessEvent,
    ProcessEventListener,
    ProcessExitEvent,
    ProcessWriteEvent
} from "amd64-elf64-emulator";
import {InstructionLine, InstructionLineType} from "amd64-elf64-emulator/src/Process";
import {ELF64} from "amd64-elf64-emulator/src/elf64";
import {ElfParser} from "amd64-elf64-emulator/src/ElfParser";

const vm = new Amd64Emulator();

function App() {
    const [consoleLines, setConsoleLines] = useState<string[]>([]);
    const [instructionLines, setInstructionLines] = useState<InstructionLine[]>([]);
    const [programName, setProgramName] = useState<string | null>(null);
    const [elf, setElf] = useState<ELF64 | null>(null);
    const [processParams, setProcessParams] = useState<string>("");

    function writeToConsole(line: string) {
        setConsoleLines(old => [...old, line]);
    }

    async function loadProgram(name: string) {
        writeToConsole(`Downloading ${name}...`);
        const res: Response = await fetch(name);
        if (res.ok) {
            writeToConsole(`Downloaded ${name}.`);
            const objectCode: ArrayBuffer = await res.arrayBuffer();
            const disassembler = new Disassembler();
            const elfParser = new ElfParser();
            const executable: ELF64 = elfParser.parseExecutableFromBytes(objectCode);
            setInstructionLines(disassembler.disassembleElf64Executable(executable));
            setProgramName(name);
            setElf(executable);
        }
    }

    async function runProgram() {
        const processEventListener: ProcessEventListener = (event: ProcessEvent) => {
            if (event instanceof ProcessWriteEvent) {
                writeToConsole(event.line);
            } else if (event instanceof ProcessExitEvent) {
                writeToConsole('Process finished with code ' + event.exitCode);
            }
        };
        if (programName === null) {
            throw new Error("No program name.");
        }
        if (elf === null) {
            throw new Error("No ELF program.");
        }
        writeToConsole(`Running ${programName}.`);
        const args = processParams.split(" ");
        console.log(args);
        const process = new Process(programName, elf);
        process.run([process.name, ...args], processEventListener);
    }


    function onPromptChange(e: FormEvent<HTMLInputElement>) {
        setProcessParams(e.currentTarget.value);
    }

    return (
        <div className="App">
            <button onClick={() => loadProgram("atoi")}>Load atoi</button>
            <button onClick={() => loadProgram("add")}>Load add</button>
            <div className="runner">
                <div className="debugger">
                    {
                        elf && <>
                        <div className="debugger__process_params">
                          <div>Process parameters (separate by space):</div>
                          <input value={processParams} onChange={onPromptChange} />
                        </div>
                        <div className="debugger__buttons">
                          <button onClick={runProgram}>Run</button>
                        </div>
                        <div className="debugger__assembly">
                          <table>
                            <tbody>
                            {instructionLines.map((line) => {
                                return <tr className={line.type === InstructionLineType.label ? "label-row" : ""}>
                                    <td className={line.type === InstructionLineType.assembly ? "assembly-row-first-cell" : ""}
                                        colSpan={line.type === InstructionLineType.label ? 3 : 1}>{line.virtualAddress}</td>
                                    <td>{line.bytes}</td>
                                    <td>{line.assembly}</td>
                                </tr>
                            })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    }
                </div>
                <div className="terminal">
                    {consoleLines.map((line) => {
                        return <div>{line}</div>
                    })}
                </div>
            </div>
        </div>
    );
}

export default App;

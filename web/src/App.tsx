import React, {useEffect, useState} from 'react';
import './App.css';
import {Amd64Emulator, Process} from "amd64-elf64-emulator";
import {InstructionLine, InstructionLineType} from "amd64-elf64-emulator/src/Process";

const vm = new Amd64Emulator();

function App() {
    const [consoleLines, setConsoleLines] = useState<string[]>([]);
    const [instructionLines, setInstructionLines] = useState<InstructionLine[]>([]);
    const [programName, setProgramName] = useState<string | null>(null);
    const [process, setProcess] = useState<Process | null>(null);

    function writeToConsole(line: string) {
        setConsoleLines(old => [...old, line]);
    }

    async function loadProgram(name: string) {
        writeToConsole(`Downloading ${name}...`);
        const res: Response = await fetch(name);
        if (res.ok) {
            writeToConsole(`Downloaded ${name}.`);
            const content: ArrayBuffer = await res.arrayBuffer();
            vm.addWriteSystemCallListener((l: string) => writeToConsole(l));
            vm.addExitSystemCallListener((code: number) => writeToConsole('Process finished with code ' + code));
            const process = vm.loadElf64ExecutableFromBinary(content);
            setProgramName(name);
            setProcess(process);
            setInstructionLines(process.disassemble());
        }
    }

    async function runProgram() {
        if (process === null) {
            throw new Error('No process loaded.');
        }
        writeToConsole(`Running ${programName}.`);
        process.run();
    }

    useEffect(() => {
        loadProgram("atoi");
    }, []);

    return (
        <div className="App">
            <button onClick={() => loadProgram("atoi")}>Load atoi</button>
            <div className="runner">
                <div className="debugger">
                    {
                        process && <>
                        <div className="debugger__buttons">
                          <button onClick={runProgram}>Run</button>
                        </div>
                        <div className="debugger__assembly">
                          <table>
                              {instructionLines.map((line) => {
                                  return <tr className={line.type === InstructionLineType.label ? "label-row" : ""}>
                                      <td className={line.type === InstructionLineType.assembly ? "assembly-row-first-cell" : ""}
                                          colSpan={line.type === InstructionLineType.label ? 3 : 1}>{line.virtualAddress}</td>
                                      <td>{line.bytes}</td>
                                      <td>{line.assembly}</td>
                                  </tr>
                              })}
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

import React, {useState} from 'react';
import './App.css';
import {Amd64Emulator} from "amd64-elf64-emulator";

function App() {
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  function writeToConsole(line: string) {
    setConsoleLines(old => [...old, line]);
  }
  async function loadAndRunProgram(name: string) {
    writeToConsole(`Downloading ${name}...`);
    const res: Response = await fetch(name);
    if (res.ok) {
      writeToConsole(`Downloaded ${name}.`);
      const content: ArrayBuffer = await res.arrayBuffer();
      const vm = new Amd64Emulator();
      writeToConsole(`Running ${name}.`);
      vm.addWriteSystemCallListener((l: string) => writeToConsole(l));
      vm.addExitSystemCallListener((code: number) => writeToConsole('Process finished with code ' + code));
      vm.runElf64ExecutableFromBinary(content);
    }
  }
  return (
    <div className="App">
      <button onClick={() => loadAndRunProgram("atoi")}>Run atoi</button>
      <div id="terminal">
      {consoleLines.map((line) => {
        return <div>{line}</div>
      })}
      </div>
    </div>
  );
}

export default App;

// Bridge between the browser and the emulator.
// It doesn't use a framework to make the example as simple as possible,
// but of course you can use React, Angular etc.

import {Amd64Emulator} from "amd64-elf64-emulator";

function run() {
  const terminalElemMaybe: HTMLElement | null =
    document.getElementById('terminal');
  if (terminalElemMaybe === null) {
    throw new Error('#terminal not found');
  }
  const terminalElem: HTMLElement = terminalElemMaybe;

  const loadAndRunHelloWorldButton: HTMLElement | null =
    document.getElementById('loadAndRunHelloWorldButton');
  if (loadAndRunHelloWorldButton === null) {
    throw new Error('#loadAndRunHelloWorldButton not found');
  }
  loadAndRunHelloWorldButton.addEventListener('click', loadAndRunHelloWorld);

  function writeToConsole(line: string) {
    terminalElem.innerHTML += `<div>${line}</div>`;
  }

  async function loadAndRunHelloWorld() {
    writeToConsole('$ download ./hello_world');
    writeToConsole('downloading ./hello_world...');
    const res: Response = await fetch('hello_world');
    if (res.ok) {
      const content: ArrayBuffer = await res.arrayBuffer();
      const vm = new Amd64Emulator();
      writeToConsole('$ ./hello_world');
      vm.addWriteSystemCallListener((l: string) => writeToConsole(l));
      vm.addExitSystemCallListener((code) => writeToConsole('Process finished with code ' + code));
      vm.runElf64Executable(content);
    }
  }
}
run();

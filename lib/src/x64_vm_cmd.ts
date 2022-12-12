import { argv } from 'node:process';
import {Amd64Emulator} from "./Amd64Emulator";

const executablePath = argv[2];
console.log('Running ' + executablePath);
const vm = new Amd64Emulator();
vm.runElf64ExecutableFromPath(executablePath);

import { argv } from 'node:process';
import * as fs from "fs";
import {Amd64Emulator} from "./Amd64Emulator";

const executablePath = argv[3];
console.log('Running ' + executablePath);
const executableContent = fs.readFileSync(executablePath);
const vm = new Amd64Emulator();
vm.runElf64Executable(executableContent.buffer);

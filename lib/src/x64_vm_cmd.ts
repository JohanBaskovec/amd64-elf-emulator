import { argv } from 'node:process';
import {Amd64Emulator} from "./Amd64Emulator";
import * as fs from "fs";

const executablePath = argv[2];
console.log('Running ' + executablePath);
const vm = new Amd64Emulator();
const executableContent = fs.readFileSync(executablePath);
vm.runElf64ExecutableFromBinary(executablePath, executableContent.buffer, argv.slice(2));

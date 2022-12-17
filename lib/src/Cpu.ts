import {
  defaultRegisterWidthToSubRegisterWidth,
  OperationSize,
  operationSizeToBytesMap,
  raxWidthMap,
  rdxWidthMap,
  Register,
  Register64,
  register64WidthMapping,
  registerOffset,
  registerReverseMap,
  registerWidthMap,
  SubRegisterWidth,
} from './amd64-architecture';
import {
  EffectiveAddress,
  Instruction,
  InstructionByAddress,
  InstructionType,
  Operand,
} from './Instruction';
import {
  doNothingProcessEventListener,
  ProcessEventListener,
  ProcessExitEvent,
  ProcessWriteEvent,
} from './ProcessEventListener';
import {InstructionsParser} from './InstructionsParser';

type ValueWithWidth = {
  value: bigint;
  valueWidth: OperationSize;
};

const stackMaxSize = 2000000;

// Write an array of strings into a Uint8Array, each string separated by 0 (like C strings)
export function uint8ArrayCopyStringsAtAddr(
  arr: Uint8Array,
  addr: number,
  strs: string[]
) {
  let index = 0;
  for (let i = 0; i < strs.length; i++) {
    const bytes: Uint8Array = new TextEncoder().encode(strs[i]);
    arr.set(bytes, addr + index);
    index += bytes.length;
    arr[addr + index] = 0;
    index++;
  }
}

export class Cpu {
  private registers: {[key in Register64]: DataView} = {
    [Register64.RAX]: new DataView(new ArrayBuffer(8)),
    [Register64.RBX]: new DataView(new ArrayBuffer(8)),
    [Register64.RCX]: new DataView(new ArrayBuffer(8)),
    [Register64.RDX]: new DataView(new ArrayBuffer(8)),
    [Register64.RSI]: new DataView(new ArrayBuffer(8)),
    [Register64.RDI]: new DataView(new ArrayBuffer(8)),
    [Register64.RSP]: new DataView(new ArrayBuffer(8)),
    [Register64.RBP]: new DataView(new ArrayBuffer(8)),
    [Register64.R8]: new DataView(new ArrayBuffer(8)),
    [Register64.R9]: new DataView(new ArrayBuffer(8)),
    [Register64.R10]: new DataView(new ArrayBuffer(8)),
    [Register64.R11]: new DataView(new ArrayBuffer(8)),
    [Register64.R12]: new DataView(new ArrayBuffer(8)),
    [Register64.R13]: new DataView(new ArrayBuffer(8)),
    [Register64.R14]: new DataView(new ArrayBuffer(8)),
    [Register64.R15]: new DataView(new ArrayBuffer(8)),
  };

  private rip = 0;
  private eventListener: ProcessEventListener = doNothingProcessEventListener;

  // RFLAGS
  addrOffset = 0;
  private zeroFlag = false;
  private overflowFlag = false;
  private carryFlag = false;
  private parityFlag = false;
  private signFlag = false;

  instructions: InstructionByAddress = {};
  private dataView: DataView;
  private machineCode: ArrayBuffer | null = null;

  constructor() {
    this.dataView = new DataView(new ArrayBuffer(stackMaxSize));
    this.setRegisterValue(Register.RSP, BigInt(stackMaxSize), true);
  }

  convertVirtualAddressToPhysicalAddress(virtualAddress: number): number {
    return virtualAddress - this.addrOffset;
  }

  convertPhysicalAddressToVirtualAddress(physicalAddress: number): number {
    return physicalAddress + this.addrOffset;
  }

  loadMachineCode(
    machineCode: ArrayBuffer,
    codeStart: number,
    codeLength: number,
    entry: number,
    addroffset: number
  ): void {
    this.machineCode = machineCode;
    this.addrOffset = addroffset;
    this.rip = entry;
    this.instructions = this.parseInstructions(
      new DataView(machineCode),
      codeStart,
      codeLength
    );
  }

  setupStack(
    args: string[],
    listener: ProcessEventListener = doNothingProcessEventListener
  ) {
    if (this.machineCode === null) {
      throw new Error('load machine codee first');
    }
    this.eventListener = listener;
    // Setup the memory
    // ---------TOP----------
    // Stack:
    // Process' arguments (array of C strings)
    // ...
    // ...
    // Argument count (uint64) <-- RSP at process start
    // 2MBM Empty stack
    // ...
    // ...
    // -----------------------<-- stack limit (overflow if push here)
    // Machine code
    // ...
    // ...
    // -------BOTTOM (0)------

    // 8 bytes for argc + 8 bytes for each pointer to each argument string
    // + bytes for the argument strings, each followed by a 0.
    let argsSizeBytes = 8 + 8 * args.length;
    for (const str of args) {
      argsSizeBytes += str.length + 1;
    }

    const tmp = new Uint8Array(
      this.machineCode.byteLength + stackMaxSize + argsSizeBytes
    );
    tmp.set(new Uint8Array(this.machineCode), 0);

    const dataView = new DataView(tmp.buffer);
    // [rsp] contains argc
    dataView.setBigUint64(
      this.machineCode.byteLength + stackMaxSize,
      BigInt(args.length),
      true
    );
    // if there are 3 arguments:
    // [rsp + 8] contains address of 1st arg
    // [rsp + 8 * 2] contains address of 2nd arg
    // [rsp + 8 * 3] contains address of 3rd arg
    // [rsp + 8 * 4] contains the first byte of the first arg
    let addrOffsetArg = 0;
    for (let i = 0; i < args.length; i++) {
      const ptr =
        this.machineCode.byteLength +
        stackMaxSize +
        8 +
        8 * args.length +
        addrOffsetArg +
        this.addrOffset;
      const offset = this.machineCode.byteLength + stackMaxSize + 8 + 8 * i;
      dataView.setBigUint64(offset, BigInt(ptr), true);
      addrOffsetArg += args[i].length + 1;
    }
    uint8ArrayCopyStringsAtAddr(
      tmp,
      this.machineCode.byteLength + stackMaxSize + 8 + 8 * args.length,
      args
    );
    this.dataView = new DataView(tmp.buffer);
    this.setRegisterValue(
      Register.RSP,
      BigInt(
        this.convertPhysicalAddressToVirtualAddress(
          this.machineCode.byteLength + stackMaxSize
        )
      ),
      true
    );
  }

  printRegister(register: Register): void {
    const reg64: Register64 = registerReverseMap[register];
    const dataView = this.registers[reg64];
    const name: string = Register64[reg64];
    const val64 = dataView.getBigUint64(0, true);
    const val32 = dataView.getUint32(0, true);
    const val16 = dataView.getUint16(0, true);
    const val8 = dataView.getUint8(0);
    const str = `Value of ${name}:
u64: decimal = ${val64}, hex = ${val64.toString(16)}
u32: decimal = ${val32}, hex = ${val32.toString(16)}
u16: decimal = ${val16}, hex = ${val16.toString(16)}
u8: decimal = ${val8}, hex = ${val8.toString(16)}
Data in the DataView (big endian!):
`;
    let hexStr = '';
    let binaryStr = '';
    let bits = 0;
    for (let i = 0; i < 8; i++) {
      const byte = dataView.getUint8(i);
      let hex = byte.toString(16);
      if (hex.length === 1) {
        hex = '0' + hex;
      }
      hexStr += hex + ' ';
      for (let k = 128; k >= 1; k = k / 2) {
        if (byte & k) {
          binaryStr += '1';
        } else {
          binaryStr += '0';
        }
        bits++;
        if (bits === 4) {
          binaryStr += ' ';
          bits = 0;
        }
      }
    }
    console.log(str + hexStr + '\n' + binaryStr);
  }

  getRegistersBytes(register: Register): Uint8Array {
    const reg64: Register64 = registerReverseMap[register];
    const regDataView: DataView = this.registers[reg64];
    const off: number = registerOffset[register];
    const width: OperationSize = registerWidthMap[register];
    const widthBytes = operationSizeToBytesMap[width];

    return new Uint8Array(regDataView.buffer, off, widthBytes);
  }

  readUnsignedValueRegister(register: Register): bigint {
    return this.readValueRegister(register, false);
  }

  readSignedValueRegister(register: Register): bigint {
    return this.readValueRegister(register, true);
  }

  readValueRegister(register: Register, signed: boolean): bigint {
    const reg64: Register64 = registerReverseMap[register];
    const regDataView: DataView = this.registers[reg64];
    const off: number = registerOffset[register];
    const width = registerWidthMap[register];
    if (signed) {
      switch (width) {
        case OperationSize.qword:
          return regDataView.getBigInt64(off, true);
        case OperationSize.dword:
          return BigInt(regDataView.getInt32(off, true));
        case OperationSize.word:
          return BigInt(regDataView.getInt16(off, true));
        case OperationSize.byte:
          return BigInt(regDataView.getInt8(off));
        default:
          throw new Error('Unknown width!');
      }
    } else {
      switch (width) {
        case OperationSize.qword:
          return regDataView.getBigUint64(off, true);
        case OperationSize.dword:
          return BigInt(regDataView.getUint32(off, true));
        case OperationSize.word:
          return BigInt(regDataView.getUint16(off, true));
        case OperationSize.byte:
          return BigInt(regDataView.getUint8(off));
        default:
          throw new Error('Unknown width!');
      }
    }
  }

  setUnsignedRegisterValue(register: Register, value: bigint) {
    this.setRegisterValue(register, value, false);
  }

  setSignedRegisterValue(register: Register, value: bigint) {
    this.setRegisterValue(register, value, true);
  }

  setRegisterValue(register: Register, value: bigint, signed: boolean) {
    //console.log('Before:');
    //this.printRegister(register);
    const reg64: Register64 = registerReverseMap[register];
    const regDataView: DataView = this.registers[reg64];
    const off: number = registerOffset[register];
    const width = registerWidthMap[register];
    if (signed) {
      switch (width) {
        case OperationSize.qword:
          regDataView.setBigInt64(off, value, true);
          break;
        case OperationSize.dword:
          // Writing 32 bits overwrite the entire register
          regDataView.setBigInt64(0, value, true);
          break;
        case OperationSize.word:
          // Writing 16 bits keeps the top 48 bits of register
          regDataView.setInt16(off, Number(value), true);
          break;
        case OperationSize.byte:
          regDataView.setInt8(off, Number(value));
          break;
        default:
          throw new Error('Unknown width!');
      }
    } else {
      switch (width) {
        case OperationSize.qword:
          regDataView.setBigUint64(off, value, true);
          break;
        case OperationSize.dword:
          // Writing 32 bits overwrite the entire register
          regDataView.setBigUint64(0, value, true);
          break;
        case OperationSize.word:
          // Writing 16 bits keeps the top 48 bits of register
          regDataView.setUint16(off, Number(value), true);
          break;
        case OperationSize.byte:
          regDataView.setUint8(off, Number(value));
          break;
        default:
          throw new Error('Unknown width!');
      }
    }

    //console.log('After:');
    //this.printRegister(register);
  }

  readFromDataView(
    dataView: DataView,
    addr: number,
    width: OperationSize,
    signed: boolean
  ): bigint {
    if (signed) {
      switch (width) {
        case OperationSize.byte:
          return BigInt(dataView.getInt8(addr));
        case OperationSize.word:
          return BigInt(dataView.getInt16(addr, true));
        case OperationSize.dword:
          return BigInt(dataView.getInt32(addr, true));
        case OperationSize.qword:
          return dataView.getBigInt64(addr, true);
      }
    } else {
      switch (width) {
        case OperationSize.byte:
          return BigInt(dataView.getUint8(addr));
        case OperationSize.word:
          return BigInt(dataView.getUint16(addr, true));
        case OperationSize.dword:
          return BigInt(dataView.getUint32(addr, true));
        case OperationSize.qword:
          return dataView.getBigUint64(addr, true);
      }
    }
  }

  readSignedDataAtAddr(addr: number, width: OperationSize): bigint {
    addr = addr - this.addrOffset;
    return this.readFromDataView(this.dataView, addr, width, true);
  }

  readUnsignedDataAtAddr(virtualAddr: number, width: OperationSize): bigint {
    const physicalAddr =
      this.convertVirtualAddressToPhysicalAddress(virtualAddr);
    return this.readFromDataView(this.dataView, physicalAddr, width, false);
  }

  writeDataAtAddress(
    addr: number,
    value: bigint,
    operationSize: OperationSize,
    signed: boolean
  ): void {
    if (signed) {
      switch (operationSize) {
        case OperationSize.byte:
          return this.dataView.setInt8(addr, Number(value));
        case OperationSize.word:
          return this.dataView.setInt16(addr, Number(value), true);
        case OperationSize.dword:
          return this.dataView.setInt32(addr, Number(value), true);
        case OperationSize.qword:
          return this.dataView.setBigInt64(addr, value, true);
      }
    } else {
      switch (operationSize) {
        case OperationSize.byte:
          return this.dataView.setUint8(addr, Number(value));
        case OperationSize.word:
          return this.dataView.setUint16(addr, Number(value), true);
        case OperationSize.dword:
          return this.dataView.setUint32(addr, Number(value), true);
        case OperationSize.qword:
          return this.dataView.setBigUint64(addr, value, true);
      }
    }
  }

  readUnsignedValueFromOperand(operand: Operand): bigint {
    return this.readValueFromOperand(operand, false);
  }

  readSignedValueFromOperand(operand: Operand): bigint {
    return this.readValueFromOperand(operand, true);
  }

  getOperandWidth(operand: Operand): OperationSize {
    if (operand.register !== undefined) {
      return registerWidthMap[operand.register];
    } else if (operand.immediate !== undefined) {
      return operand.immediate.width;
    } else if (operand.effectiveAddr !== undefined) {
      return operand.effectiveAddr.dataSize;
    } else {
      throw new Error('Empty operand');
    }
  }

  readValueFromOperandWithWidth(
    operand: Operand,
    signed: boolean
  ): ValueWithWidth {
    const value = this.readValueFromOperand(operand, signed);
    const width = this.getOperandWidth(operand);
    return {value, valueWidth: width};
  }

  readValueFromOperand(operand: Operand, signed: boolean): bigint {
    if (operand.register !== undefined) {
      return this.readValueRegister(operand.register, signed);
    } else if (operand.immediate !== undefined) {
      if (signed) {
        return operand.immediate.valueSigned;
      } else {
        return operand.immediate.valueUnsigned;
      }
    } else if (operand.relativeOffset !== undefined) {
      if (signed) {
        return operand.relativeOffset.valueSigned;
      } else {
        return operand.relativeOffset.valueUnsigned;
      }
    } else if (operand.effectiveAddr !== undefined) {
      const ea: EffectiveAddress = operand.effectiveAddr;
      const addr = this.calculateAddress(ea) - this.addrOffset;
      try {
        return this.readFromDataView(
          this.dataView,
          addr,
          operand.effectiveAddr.dataSize,
          signed
        );
      } catch (e) {
        console.log(e);
        throw e;
      }
    } else {
      throw new Error('Empty operand');
    }
  }

  writeValueInOperand(operand: Operand, value: bigint, signed: boolean): void {
    if (operand.register !== undefined) {
      this.setRegisterValue(operand.register, value, signed);
    } else if (operand.effectiveAddr !== undefined) {
      const ea = operand.effectiveAddr;
      const addr = this.calculateAddress(ea) - this.addrOffset;
      this.writeDataAtAddress(addr, value, ea.dataSize, signed);
    }
  }

  doADD(instruction: Instruction) {
    const value0: bigint = this.readSignedValueFromOperand(
      instruction.operands[0]
    );
    const value1: bigint = this.readSignedValueFromOperand(
      instruction.operands[1]
    );

    this.writeValueInOperand(instruction.operands[0], value0 + value1, false);
  }

  doSUB(instruction: Instruction) {
    const value0: bigint = this.readSignedValueFromOperand(
      instruction.operands[0]
    );
    const value1: bigint = this.readSignedValueFromOperand(
      instruction.operands[1]
    );

    this.writeValueInOperand(instruction.operands[0], value0 - value1, false);
  }

  doINC(instruction: Instruction) {
    const value: bigint = this.readSignedValueFromOperand(
      instruction.operands[0]
    );

    this.writeValueInOperand(instruction.operands[0], value + 1n, false);
  }

  doDEC(instruction: Instruction) {
    const value: bigint = this.readSignedValueFromOperand(
      instruction.operands[0]
    );

    this.writeValueInOperand(instruction.operands[0], value - 1n, false);
  }

  private readValueRegisters(registers: Register[], signed: boolean): bigint {
    const byteArrays: Uint8Array[] = registers.map(r =>
      this.getRegistersBytes(r)
    );
    let num = 0n;
    let mul = 0x1n;
    for (const byteArray of byteArrays) {
      for (let i = 0; i < byteArray.length; i++) {
        const byte = byteArray[i];
        num += BigInt(BigInt(byte) * mul);
        mul *= 0x100n;
      }
    }
    if (signed) {
      if (num & (mul / 2n)) {
        return num - mul;
      } else {
        return num;
      }
    } else {
      return num;
    }
  }

  readUnsignedValueRegisters(registers: Register[]): bigint {
    return this.readValueRegisters(registers, false);
  }

  readSignedValueRegisters(registers: Register[]): bigint {
    return this.readValueRegisters(registers, true);
  }

  writeValueRegisters(
    registers: Register[],
    value: bigint,
    signed: boolean
  ): void {
    let totalWidthBytes = 0;
    const widthsBytes: number[] = [];
    const bytes: number[][] = [];
    let registerWidth = OperationSize.dword;
    for (const register of registers) {
      registerWidth = registerWidthMap[register];
      const registerWidthBytes = operationSizeToBytesMap[registerWidth];
      totalWidthBytes += registerWidthBytes;
      for (const otherWidth of widthsBytes) {
        if (otherWidth !== registerWidthBytes) {
          throw new Error(
            "Can't write 1 value to registers of different sizes!"
          );
        }
      }
      widthsBytes.push(registerWidthBytes);
      bytes.push([]);
    }

    const widthPerRegister = widthsBytes[0];

    let valueCopy = value;
    // we use bigint here to be able to shift right more than 32
    for (let i = 0; i < totalWidthBytes; i++) {
      const registerIndex = Math.floor(i / widthPerRegister);
      const byte = valueCopy & 0xffn;
      bytes[registerIndex].push(Number(byte));
      valueCopy = valueCopy >> 8n;
    }
    for (let i = 0; i < registers.length; i++) {
      const dataView = new DataView(new Uint8Array(bytes[i]).buffer);
      const value: bigint = this.readFromDataView(
        dataView,
        0,
        registerWidth,
        signed
      );
      this.setRegisterValue(registers[i], value, signed);
    }
  }

  private doIDIV(instruction: Instruction) {
    const operand: Operand = instruction.operands[0];
    const divisor: bigint = this.readSignedValueFromOperand(operand);
    let width = OperationSize.dword;
    if (operand.register !== undefined) {
      width = registerWidthMap[operand.register];
    } else if (operand.effectiveAddr !== undefined) {
      width = operand.effectiveAddr.dataSize;
    } else {
      throw new Error('Invalid operand for IDIV.');
    }
    const registerWidth: SubRegisterWidth =
      defaultRegisterWidthToSubRegisterWidth[width];
    const highBytesRegister: Register | undefined = rdxWidthMap[registerWidth];
    if (highBytesRegister === undefined) {
      throw new Error('Could not find register.');
    }
    const lowBytesRegister: Register | undefined = raxWidthMap[registerWidth];
    if (lowBytesRegister === undefined) {
      throw new Error('Could not find register.');
    }
    const dividend = this.readSignedValueRegisters([
      highBytesRegister,
      lowBytesRegister,
    ]);

    const remainder = dividend % divisor;
    const quotient = dividend / divisor;

    this.setRegisterValue(highBytesRegister, remainder, true);
    this.setRegisterValue(lowBytesRegister, quotient, true);
  }

  private doIMUL(instruction: Instruction) {
    // TODO: overflow
    if (instruction.operands.length === 1) {
      const operand: Operand = instruction.operands[0];
      const multiplier: bigint = this.readSignedValueFromOperand(operand);
      let width = OperationSize.dword;
      if (operand.register !== undefined) {
        width = registerWidthMap[operand.register];
      } else if (operand.effectiveAddr !== undefined) {
        width = operand.effectiveAddr.dataSize;
      } else {
        throw new Error('Invalid operand for IDIV.');
      }
      const registerWidth: SubRegisterWidth =
        defaultRegisterWidthToSubRegisterWidth[width];
      const highBytesRegister: Register | undefined =
        rdxWidthMap[registerWidth];
      if (highBytesRegister === undefined) {
        throw new Error('Could not find register.');
      }
      const lowBytesRegister: Register | undefined = raxWidthMap[registerWidth];
      if (lowBytesRegister === undefined) {
        throw new Error('Could not find register.');
      }
      const multiplicand: bigint = this.readValueRegister(
        lowBytesRegister,
        true
      );
      const product: bigint = multiplicand * multiplier;
      this.writeValueRegisters(
        [highBytesRegister, lowBytesRegister],
        product,
        true
      );
    } else if (instruction.operands.length === 2) {
      const operand0: Operand = instruction.operands[0];
      const multiplicand: bigint = this.readSignedValueFromOperand(operand0);
      const operand1: Operand = instruction.operands[1];
      const multiplier: bigint = this.readSignedValueFromOperand(operand1);
      const product: bigint = multiplicand * multiplier;
      this.writeValueInOperand(operand0, product, true);
    } else {
      const multiplicand: bigint = this.readSignedValueFromOperand(
        instruction.operands[1]
      );
      const multiplier: bigint = this.readSignedValueFromOperand(
        instruction.operands[2]
      );
      const product: bigint = multiplicand * multiplier;
      this.writeValueInOperand(instruction.operands[0], product, true);
    }
  }

  readCurrentStackTop(width: OperationSize, signed: boolean): bigint {
    const rsp =
      this.readValueRegister(Register.RSP, false) - BigInt(this.addrOffset);
    return this.readFromDataView(this.dataView, Number(rsp), width, signed);
  }

  private pushOnStack(value: bigint, width: OperationSize): void {
    const widthBytes: number = operationSizeToBytesMap[width];
    const rsp: bigint = this.readUnsignedValueRegister(Register.RSP);
    const newRsp = rsp - BigInt(widthBytes);
    if (newRsp < 0) {
      throw new Error('Stack overflow.');
    }
    this.writeDataAtAddress(
      this.convertVirtualAddressToPhysicalAddress(Number(newRsp)),
      value,
      width,
      true
    );
    this.setUnsignedRegisterValue(Register.RSP, newRsp);
  }

  private doPUSH(instruction: Instruction): void {
    const {value, valueWidth} = this.readValueFromOperandWithWidth(
      instruction.operands[0],
      false
    );
    this.pushOnStack(value, valueWidth);
  }

  private doPOP(instruction: Instruction): void {
    const width = this.getOperandWidth(instruction.operands[0]);
    const value = this.readCurrentStackTop(width, true);
    this.writeValueInOperand(instruction.operands[0], value, true);
    const widthBytes: number = operationSizeToBytesMap[width];
    this.decreaseStackSize(widthBytes);
  }

  private decreaseStackSize(size: number) {
    const rsp: bigint = this.readUnsignedValueRegister(Register.RSP);
    const newRsp = rsp + BigInt(size);
    const newRspPhysical: number = this.convertVirtualAddressToPhysicalAddress(
      Number(newRsp)
    );
    if (newRspPhysical > this.dataView.byteLength) {
      throw new Error('Stack underflow.');
    }
    this.setUnsignedRegisterValue(Register.RSP, newRsp);
  }

  private doCMP(instruction: Instruction): void {
    // it doesn't matter if we interpret as signed or unsigned, the comparison gives the same result
    const value0 = this.readSignedValueFromOperand(instruction.operands[0]);
    const value1 = this.readSignedValueFromOperand(instruction.operands[1]);
    const res: bigint = value0 - value1;
    // example:
    // 9 >= 4, res = 5, SF = 0, OF = 0, CF = 0
    // 4 >= 9, res = -5, SF = 1, OF = 0, CF = 1
    this.zeroFlag = res === 0n;
    this.signFlag = res < 0;
    if (res > 0) {
      this.overflowFlag = this.signFlag;
    } else if (res < 0) {
      this.overflowFlag = !this.signFlag;
    } else {
      this.overflowFlag = false;
    }
    this.carryFlag = res < 0;
  }

  private doXOR(instruction: Instruction): void {
    if (instruction.operands[1].register === undefined) {
      throw new Error("opcode 0x31 (XOR) but operand 2 isn't a register!");
    }
    const val1: bigint = this.readValueRegister(
      instruction.operands[1].register,
      false
    );
    let val2 = BigInt(0);

    if (instruction.operands[0].register !== undefined) {
      val2 = this.readValueRegister(instruction.operands[0].register, false);
      //console.log(`0x31: ${val1}^${val2}`);
      const res: bigint = val1 ^ val2;
      this.setRegisterValue(instruction.operands[0].register, res, false);
    } else if (instruction.operands[0].address !== undefined) {
      throw new Error('not impl address');
    } else if (instruction.operands[0].effectiveAddr) {
      throw new Error('not impl effective addr');
    }
  }

  private doMOV(instruction: Instruction): void {
    const value: bigint = this.readValueFromOperand(
      instruction.operands[1],
      false
    );

    if (instruction.operands[0].register !== undefined) {
      this.setRegisterValue(instruction.operands[0].register, value, false);
    } else if (instruction.operands[0].effectiveAddr !== undefined) {
      const value = this.readValueFromOperand(instruction.operands[1], true);
      const ea = instruction.operands[0].effectiveAddr;
      const addr = this.calculateAddress(ea) - this.addrOffset;
      this.writeDataAtAddress(addr, value, ea.dataSize, false);
    }
  }

  private doLEA(instruction: Instruction): void {
    const ea: EffectiveAddress | undefined =
      instruction.operands[1].effectiveAddr;
    if (ea === undefined) {
      throw new Error("2nd operand of LEA isn't an effective address.");
    }
    const virtualAddress = this.calculateAddress(ea);
    this.writeValueInOperand(
      instruction.operands[0],
      BigInt(virtualAddress),
      false
    );
  }

  private doMOVZX(instruction: Instruction): void {
    const {value, valueWidth} = this.readValueFromOperandWithWidth(
      instruction.operands[1],
      true
    );
    if (instruction.operands[0].register === undefined) {
      throw new Error("Target of MOVZX isn't a register.");
    }
    const targetRegister: Register = instruction.operands[0].register;
    const targetRegisterWidth: OperationSize = registerWidthMap[targetRegister];

    const targetRegister64: Register64 =
      registerReverseMap[instruction.operands[0].register];
    const regDataView: DataView = this.registers[targetRegister64];

    const subRegisterWidth = defaultRegisterWidthToSubRegisterWidth[valueWidth];
    const targetSubRegister: Register | undefined =
      register64WidthMapping[targetRegister64][subRegisterWidth];
    if (targetSubRegister === undefined) {
      throw new Error('Register not found');
    }

    switch (targetRegisterWidth) {
      case OperationSize.qword:
        regDataView.setBigInt64(0, 0n, true);
        break;
      case OperationSize.dword:
        regDataView.setBigInt64(0, 0n, true);
        break;
      case OperationSize.word:
        regDataView.setUint16(0, 0, true);
        break;
      case OperationSize.byte:
        break;
    }
    switch (valueWidth) {
      case OperationSize.byte:
        regDataView.setUint8(0, Number(value));
        break;
      case OperationSize.word:
        regDataView.setUint16(0, Number(value), true);
        break;
      case OperationSize.dword:
        regDataView.setUint32(0, Number(value), true);
        break;
      case OperationSize.qword:
        regDataView.setBigUint64(0, value, true);
        break;
    }
  }

  private doJGE(instruction: Instruction): void {
    if (this.overflowFlag === this.signFlag) {
      this.doJMP(instruction);
    }
  }

  private doJE(instruction: Instruction): void {
    if (this.zeroFlag) {
      this.doJMP(instruction);
    }
  }

  private doJMP(instruction: Instruction): void {
    const offset: bigint = this.readSignedValueFromOperand(
      instruction.operands[0]
    );
    this.rip = this.rip + Number(offset);
  }

  private doCALL(instruction: Instruction): void {
    this.pushOnStack(BigInt(this.rip), OperationSize.qword);
    const offset: bigint = this.readSignedValueFromOperand(
      instruction.operands[0]
    );
    this.rip = this.rip + Number(offset);
  }

  private doRET(): void {
    // top of the stack MUST be RIP
    const value = this.readCurrentStackTop(OperationSize.qword, true);
    this.rip = Number(value);
    this.decreaseStackSize(8);
  }

  private doSYSCALL(): void {
    const code = this.readValueRegister(Register.RAX, false);
    //console.log(`System call code ${code}`);
    switch (code) {
      case 1n:
        {
          // TODO: will clamp to 32 bits without warning!
          const strAddr =
            Number(this.readValueRegister(Register.RSI, false)) -
            this.addrOffset;
          const strLength = Number(this.readValueRegister(Register.RDX, false));
          const td = new TextDecoder('utf-8');
          const dvs = this.dataView.buffer.slice(strAddr, strAddr + strLength);
          const str = td.decode(dvs);
          console.log('Write: ' + str);
          this.eventListener(new ProcessWriteEvent(str));
        }
        break;
      case 60n:
        {
          const exitCode = Number(this.readValueRegister(Register.RDI, false));
          console.log(`Process finished with code ${exitCode}`);
          this.eventListener(new ProcessExitEvent(exitCode));
        }
        break;
      default:
        throw new Error(`System call ${code} not implemented.`);
    }
  }

  execute(instruction: Instruction) {
    if (instruction.length !== undefined) {
      this.rip += instruction.length;
    }
    const func: (instruction: Instruction) => void | undefined = (this as any)[
      'do' + InstructionType[instruction.type]
    ];
    if (func !== undefined) {
      func.bind(this)(instruction);
    } else {
      throw new Error('Unsupported instruction type: ' + instruction.type);
    }
  }

  private calculateAddress(ea: EffectiveAddress) {
    let base = 0;
    let index = 0;
    const scaleFactor = ea.scaleFactor;
    const displacement = ea.displacement;
    if (ea.base !== null) {
      // TODO: large address not supported
      base = Number(this.readValueRegister(ea.base, false));
    }
    if (ea.index !== null) {
      index = Number(this.readValueRegister(ea.index, false));
    }
    const addr = base + index * scaleFactor + displacement;
    return addr;
  }

  getRip() {
    return this.rip;
  }

  parseInstructions(
    machineCode: DataView,
    codeStart: number,
    codeLength: number
  ): InstructionByAddress {
    const instructionsParser = new InstructionsParser();
    return instructionsParser.parse(
      machineCode,
      codeStart,
      codeLength,
      this.addrOffset
    );
  }

  executeNextInstruction() {
    const instruction: Instruction | undefined =
      this.instructions[this.getRip()];
    if (instruction === undefined) {
      throw new Error(
        `Instruction not found at address ${this.getRip()}, shutting down process.`
      );
    }
    this.execute(instruction);
  }
}

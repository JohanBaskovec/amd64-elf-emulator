import {
  maxes,
  OperationSize,
  Register,
  signBitMask,
} from './amd64-architecture';

export enum OperandModRMOrder {
  regFirstRmSecond,
  rmFirstRegSecond,
}

export enum InstructionType {
  none,
  ADD,
  IDIV,
  IMUL,
  MOV,
  MOVZX,
  CMP,
  XOR,
  SUB,
  INC,
  DEC,
  JO,
  JNO,
  JB,
  JC,
  JNAE,
  JNB,
  JNC,
  JAE,
  JE,
  JNZ,
  JNE,
  JBE,
  JNA,
  JNBE,
  JA,
  JS,
  JNS,
  JP,
  JPE,
  JNP,
  JPO,
  JL,
  JNGE,
  JNL,
  JGE,
  JLE,
  JNG,
  JNLE,
  JG,
  LEA,
  PUSH,
  POP,
  SYSCALL,
  CALL,
  RET,
  JMP,
}

export type REXPrefix = {
  w: number;
  r: number;
  x: number;
  b: number;
};

export type ModRM = {
  mod: number;
  reg: number;
  rm: number;
};

export type SIB = {
  scale: number;
  index: number;
  base: number;
};

export type EffectiveAddress = {
  base: Register | null;
  index: Register | null;
  displacement: number;
  scaleFactor: number;
  dataSize: OperationSize;
};

export type Immediate = {
  valueUnsigned: bigint;
  valueSigned: bigint;
  width: OperationSize;
};

export type JsBigIntAndWidth = {
  value: bigint;
  width: OperationSize;
};

export function immediateFromJsBigIntAndWidth(
  jsValueAndWidth: JsBigIntAndWidth
): Immediate {
  let valueUnsigned: bigint = jsValueAndWidth.value;
  let valueSigned: bigint = jsValueAndWidth.value;
  const width = jsValueAndWidth.width;

  if (jsValueAndWidth.value < 0n) {
    const max = maxes[width];
    valueUnsigned = valueSigned + max;
  } else if (jsValueAndWidth.value & signBitMask[width]) {
    const max = maxes[width];
    valueSigned = jsValueAndWidth.value - max - 1n;
  }
  return {
    valueUnsigned,
    valueSigned,
    width,
  };
}

export type RelativeOffset = {
  valueUnsigned: bigint;
  valueSigned: bigint;
  width: OperationSize;
};

export class Operand {
  address?: number;
  register?: Register;
  effectiveAddr?: EffectiveAddress;
  immediate?: Immediate;
  relativeOffset?: RelativeOffset;
}

export type InstructionRaw = {
  type: InstructionType;
  operandSizeOverride: boolean;
  is8BitsInstruction: boolean;
  opCode: number;
  operands: Operand[];
  length: number;
  rex?: REXPrefix;
  modRM?: ModRM;
  sib?: SIB;
  bytes: ArrayBuffer;
};

export type Instruction = {
  type: InstructionType;
  operands: Operand[];
  length?: number;
  virtualAddress?: number;
  raw?: InstructionRaw;
};

export function arrayBufferToString(buffer: ArrayBuffer) {
  const bytes = new DataView(buffer);
  let bytesStr = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    const byte = bytes.getUint8(i);
    let hex = byte.toString(16);
    if (hex.length === 1) {
      hex = '0' + hex;
    }
    bytesStr += hex;
    if (i !== bytes.byteLength - 1) {
      bytesStr += ' ';
    }
  }
  return bytesStr;
}

export function instructionFormat(instruction: Instruction): object {
  let bytesStr = '';
  if (instruction.raw !== undefined) {
    bytesStr = arrayBufferToString(instruction.raw.bytes);
  }
  const ret: any = {
    type: InstructionType[instruction.type],
    operands: instruction.operands.map(operand => {
      const retOperand: any = {};
      if (operand.effectiveAddr !== undefined) {
        const effectiveAddress: any = {
          base: operand.effectiveAddr.base
            ? Register[operand.effectiveAddr.base]
            : null,
          index: operand.effectiveAddr.index
            ? Register[operand.effectiveAddr.index]
            : null,
          displacement: operand.effectiveAddr.displacement,
          scaleFactor: operand.effectiveAddr.scaleFactor,
        };
        retOperand.effectiveAddr = effectiveAddress;
      }
      if (operand.address !== undefined) {
        retOperand.address = operand.address.toString(16);
      }
      if (operand.register !== undefined) {
        retOperand.register = Register[operand.register];
      }
      if (operand.immediate !== undefined) {
        retOperand.immediate = {
          width: OperationSize[operand.immediate.width],
          valueSigned: operand.immediate.valueSigned,
          valueUnsigned: operand.immediate.valueUnsigned,
        };
      }
      return retOperand;
    }),
    bytes: bytesStr,
  };
  if (instruction.length !== undefined) {
    ret.length = instruction.length;
  }
  if (instruction.virtualAddress !== undefined) {
    ret.virtualAddress = instruction.virtualAddress;
    ret.virtualAddressHex = instruction.virtualAddress.toString(16);
  }
  return ret;
}

export type InstructionByAddress = {[addr: number]: Instruction};

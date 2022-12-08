/**
 * Architecture constants, taken from AMD64 Architecture Programmer's manual
 */

export enum OperationSize {
    byte, word, dword, qword,
}

export const operationSizeToBytesMap = {
    [OperationSize.byte]: 1,
    [OperationSize.word]: 2,
    [OperationSize.dword]: 4,
    [OperationSize.qword]: 8,
}

export const operationSizeToBitsMap = {
    [OperationSize.byte]: 8,
    [OperationSize.word]: 16,
    [OperationSize.dword]: 32,
    [OperationSize.qword]: 64,
}

export enum RegisterFamily {
    rAX, rBX, rCX, rDX, rSI, rDI, rBP, rSP,
    r8, r9, r10, r11, r12, r13, r14, r15,
}

// General purpose 64-bit registers
export enum Register64 {
    RAX, RBX, RCX, RDX, RSI, RDI, RBP, RSP,
    R8, R9, R10, R11, R12, R13, R14, R15,
}

export enum Register {
    RAX, RBX, RCX, RDX, RSI, RDI, RBP, RSP,
    R8, R9, R10, R11, R12, R13, R14, R15,
    EAX, EBX, ECX, EDX, ESI, EDI, EBP, ESP, R8D,
    R9D, R10D, R11D, R12D, R13D, R14D, R15D,
    AX, BX, CX, DX, SI, DI, BP, SP, R8W,
    R9W, R10W, R11W, R12W, R13W, R14W, R15W,
    AH, AL, BH, BL, CH, CL, DH, DL, SIL, DIL,
    BPL, SPL, R8B, R9B, R10B, R11B, R12B, R13B, R14B, R15B,
}

export const registerReverseMap: { [key in Register]: Register64 } = {
    [Register.RAX]: Register64.RAX,
    [Register.RBX]: Register64.RBX,
    [Register.RCX]: Register64.RCX,
    [Register.RDX]: Register64.RDX,
    [Register.RSI]: Register64.RSI,
    [Register.RDI]: Register64.RDI,
    [Register.RBP]: Register64.RBP,
    [Register.RSP]: Register64.RSP,
    [Register.R8]: Register64.R8,
    [Register.R9]: Register64.R9,
    [Register.R10]: Register64.R10,
    [Register.R11]: Register64.R11,
    [Register.R12]: Register64.R12,
    [Register.R13]: Register64.R13,
    [Register.R14]: Register64.R14,
    [Register.R15]: Register64.R15,
    [Register.EAX]: Register64.RAX,
    [Register.EBX]: Register64.RBX,
    [Register.ECX]: Register64.RCX,
    [Register.EDX]: Register64.RDX,
    [Register.ESI]: Register64.RSI,
    [Register.EDI]: Register64.RDI,
    [Register.EBP]: Register64.RBP,
    [Register.ESP]: Register64.RSP,
    [Register.R8D]: Register64.R8,
    [Register.R9D]: Register64.R9,
    [Register.R10D]: Register64.R10,
    [Register.R11D]: Register64.R11,
    [Register.R12D]: Register64.R12,
    [Register.R13D]: Register64.R13,
    [Register.R14D]: Register64.R14,
    [Register.R15D]: Register64.R15,
    [Register.AX]: Register64.RAX,
    [Register.BX]: Register64.RBX,
    [Register.CX]: Register64.RCX,
    [Register.DX]: Register64.RDX,
    [Register.SI]: Register64.RSI,
    [Register.DI]: Register64.RDI,
    [Register.BP]: Register64.RBP,
    [Register.SP]: Register64.RSP,
    [Register.R8W]: Register64.R8,
    [Register.R9W]: Register64.R9,
    [Register.R10W]: Register64.R10,
    [Register.R11W]: Register64.R11,
    [Register.R12W]: Register64.R12,
    [Register.R13W]: Register64.R13,
    [Register.R14W]: Register64.R14,
    [Register.R15W]: Register64.R15,
    [Register.AH]: Register64.RAX,
    [Register.AL]: Register64.RAX,
    [Register.BH]: Register64.RBX,
    [Register.BL]: Register64.RBX,
    [Register.CH]: Register64.RCX,
    [Register.CL]: Register64.RCX,
    [Register.DH]: Register64.RDX,
    [Register.DL]: Register64.RDX,
    [Register.SIL]: Register64.RSI,
    [Register.DIL]: Register64.RDI,
    [Register.BPL]: Register64.RBP,
    [Register.SPL]: Register64.RSP,
    [Register.R8B]: Register64.R8,
    [Register.R9B]: Register64.R9,
    [Register.R10B]: Register64.R10,
    [Register.R11B]: Register64.R11,
    [Register.R12B]: Register64.R12,
    [Register.R13B]: Register64.R13,
    [Register.R14B]: Register64.R14,
    [Register.R15B]: Register64.R15,
}

export const registerOffset: { [key in Register]: number } = {
    [Register.RAX]: 0,
    [Register.RBX]: 0,
    [Register.RCX]: 0,
    [Register.RDX]: 0,
    [Register.RSI]: 0,
    [Register.RDI]: 0,
    [Register.RBP]: 0,
    [Register.RSP]: 0,
    [Register.R8]: 0,
    [Register.R9]: 0,
    [Register.R10]: 0,
    [Register.R11]: 0,
    [Register.R12]: 0,
    [Register.R13]: 0,
    [Register.R14]: 0,
    [Register.R15]: 0,
    [Register.EAX]: 4,
    [Register.EBX]: 4,
    [Register.ECX]: 4,
    [Register.EDX]: 4,
    [Register.ESI]: 4,
    [Register.EDI]: 4,
    [Register.EBP]: 4,
    [Register.ESP]: 4,
    [Register.R8D]: 4,
    [Register.R9D]: 4,
    [Register.R10D]: 4,
    [Register.R11D]: 4,
    [Register.R12D]: 4,
    [Register.R13D]: 4,
    [Register.R14D]: 4,
    [Register.R15D]: 4,
    [Register.AX]: 6,
    [Register.BX]: 6,
    [Register.CX]: 6,
    [Register.DX]: 6,
    [Register.SI]: 6,
    [Register.DI]: 6,
    [Register.BP]: 6,
    [Register.SP]: 6,
    [Register.R8W]: 6,
    [Register.R9W]: 6,
    [Register.R10W]: 6,
    [Register.R11W]: 6,
    [Register.R12W]: 6,
    [Register.R13W]: 6,
    [Register.R14W]: 6,
    [Register.R15W]: 6,
    [Register.AH]: 6,
    [Register.AL]: 7,
    [Register.BH]: 6,
    [Register.BL]: 7,
    [Register.CH]: 6,
    [Register.CL]: 7,
    [Register.DH]: 6,
    [Register.DL]: 7,
    [Register.SIL]: 7,
    [Register.DIL]: 7,
    [Register.BPL]: 7,
    [Register.SPL]: 7,
    [Register.R8B]: 7,
    [Register.R9B]: 7,
    [Register.R10B]: 7,
    [Register.R11B]: 7,
    [Register.R12B]: 7,
    [Register.R13B]: 7,
    [Register.R14B]: 7,
    [Register.R15B]: 7,
}

export const registerWidthMap: { [key in Register]: OperationSize } = {
    [Register.RAX]: OperationSize.qword,
    [Register.RBX]: OperationSize.qword,
    [Register.RCX]: OperationSize.qword,
    [Register.RDX]: OperationSize.qword,
    [Register.RSI]: OperationSize.qword,
    [Register.RDI]: OperationSize.qword,
    [Register.RBP]: OperationSize.qword,
    [Register.RSP]: OperationSize.qword,
    [Register.R8]: OperationSize.qword,
    [Register.R9]: OperationSize.qword,
    [Register.R10]: OperationSize.qword,
    [Register.R11]: OperationSize.qword,
    [Register.R12]: OperationSize.qword,
    [Register.R13]: OperationSize.qword,
    [Register.R14]: OperationSize.qword,
    [Register.R15]: OperationSize.qword,
    [Register.EAX]: OperationSize.dword,
    [Register.EBX]: OperationSize.dword,
    [Register.ECX]: OperationSize.dword,
    [Register.EDX]: OperationSize.dword,
    [Register.ESI]: OperationSize.dword,
    [Register.EDI]: OperationSize.dword,
    [Register.EBP]: OperationSize.dword,
    [Register.ESP]: OperationSize.dword,
    [Register.R8D]: OperationSize.dword,
    [Register.R9D]: OperationSize.dword,
    [Register.R10D]: OperationSize.dword,
    [Register.R11D]: OperationSize.dword,
    [Register.R12D]: OperationSize.dword,
    [Register.R13D]: OperationSize.dword,
    [Register.R14D]: OperationSize.dword,
    [Register.R15D]: OperationSize.dword,
    [Register.AX]: OperationSize.word,
    [Register.BX]: OperationSize.word,
    [Register.CX]: OperationSize.word,
    [Register.DX]: OperationSize.word,
    [Register.SI]: OperationSize.word,
    [Register.DI]: OperationSize.word,
    [Register.BP]: OperationSize.word,
    [Register.SP]: OperationSize.word,
    [Register.R8W]: OperationSize.word,
    [Register.R9W]: OperationSize.word,
    [Register.R10W]: OperationSize.word,
    [Register.R11W]: OperationSize.word,
    [Register.R12W]: OperationSize.word,
    [Register.R13W]: OperationSize.word,
    [Register.R14W]: OperationSize.word,
    [Register.R15W]: OperationSize.word,
    [Register.AH]: OperationSize.byte,
    [Register.AL]: OperationSize.byte,
    [Register.BH]: OperationSize.byte,
    [Register.BL]: OperationSize.byte,
    [Register.CH]: OperationSize.byte,
    [Register.CL]: OperationSize.byte,
    [Register.DH]: OperationSize.byte,
    [Register.DL]: OperationSize.byte,
    [Register.SIL]: OperationSize.byte,
    [Register.DIL]: OperationSize.byte,
    [Register.BPL]: OperationSize.byte,
    [Register.SPL]: OperationSize.byte,
    [Register.R8B]: OperationSize.byte,
    [Register.R9B]: OperationSize.byte,
    [Register.R10B]: OperationSize.byte,
    [Register.R11B]: OperationSize.byte,
    [Register.R12B]: OperationSize.byte,
    [Register.R13B]: OperationSize.byte,
    [Register.R14B]: OperationSize.byte,
    [Register.R15B]: OperationSize.byte,
}

export enum SubRegisterWidth {
    qword, dword, word, highByte, lowByte
}

export const defaultRegisterWidthToSubRegisterWidth: {[key in OperationSize]: SubRegisterWidth} = {
    [OperationSize.byte]: SubRegisterWidth.lowByte,
    [OperationSize.word]: SubRegisterWidth.word,
    [OperationSize.dword]: SubRegisterWidth.dword,
    [OperationSize.qword]: SubRegisterWidth.qword,
}

export type RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register,
    [SubRegisterWidth.dword]: Register,
    [SubRegisterWidth.word]: Register,
    [SubRegisterWidth.highByte]?: Register,
    [SubRegisterWidth.lowByte]: Register,
};

export const raxWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RAX,
    [SubRegisterWidth.dword]: Register.EAX,
    [SubRegisterWidth.word]: Register.AX,
    [SubRegisterWidth.highByte]: Register.AH,
    [SubRegisterWidth.lowByte]: Register.AL,
}

export const rbxWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RBX,
    [SubRegisterWidth.dword]: Register.EBX,
    [SubRegisterWidth.word]: Register.BX,
    [SubRegisterWidth.highByte]: Register.BH,
    [SubRegisterWidth.lowByte]: Register.BL,
}
export const rcxWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RCX,
    [SubRegisterWidth.dword]: Register.ECX,
    [SubRegisterWidth.word]: Register.CX,
    [SubRegisterWidth.highByte]: Register.CH,
    [SubRegisterWidth.lowByte]: Register.CL,
}
export const rdxWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RDX,
    [SubRegisterWidth.dword]: Register.EDX,
    [SubRegisterWidth.word]: Register.DX,
    [SubRegisterWidth.highByte]: Register.DH,
    [SubRegisterWidth.lowByte]: Register.DL,
}
export const rsiWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RSI,
    [SubRegisterWidth.dword]: Register.ESI,
    [SubRegisterWidth.word]: Register.SI,
    [SubRegisterWidth.lowByte]: Register.SIL,
}
export const rbpWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RBP,
    [SubRegisterWidth.dword]: Register.EBP,
    [SubRegisterWidth.word]: Register.BP,
    [SubRegisterWidth.lowByte]: Register.BPL,
}
export const rspWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RSP,
    [SubRegisterWidth.dword]: Register.ESP,
    [SubRegisterWidth.word]: Register.SP,
    [SubRegisterWidth.lowByte]: Register.SPL,
}
export const rdiWidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.RDI,
    [SubRegisterWidth.dword]: Register.EDI,
    [SubRegisterWidth.word]: Register.DI,
    [SubRegisterWidth.lowByte]: Register.DIL,
}
export const r8WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R8,
    [SubRegisterWidth.dword]: Register.R8D,
    [SubRegisterWidth.word]: Register.R8W,
    [SubRegisterWidth.lowByte]: Register.R8B,
}
export const r9WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R9,
    [SubRegisterWidth.dword]: Register.R9D,
    [SubRegisterWidth.word]: Register.R9W,
    [SubRegisterWidth.lowByte]: Register.R9B,
}
export const r10WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R10,
    [SubRegisterWidth.dword]: Register.R10D,
    [SubRegisterWidth.word]: Register.R10W,
    [SubRegisterWidth.lowByte]: Register.R10B,
}
export const r11WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R11,
    [SubRegisterWidth.dword]: Register.R11D,
    [SubRegisterWidth.word]: Register.R11W,
    [SubRegisterWidth.lowByte]: Register.R11B,
}
export const r12WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R12,
    [SubRegisterWidth.dword]: Register.R12D,
    [SubRegisterWidth.word]: Register.R12W,
    [SubRegisterWidth.lowByte]: Register.R12B,
}
export const r13WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R13,
    [SubRegisterWidth.dword]: Register.R13D,
    [SubRegisterWidth.word]: Register.R13W,
    [SubRegisterWidth.lowByte]: Register.R13B,
}
export const r14WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R14,
    [SubRegisterWidth.dword]: Register.R14D,
    [SubRegisterWidth.word]: Register.R14W,
    [SubRegisterWidth.lowByte]: Register.R14B,
}
export const r15WidthMap: RegisterWidthMap = {
    [SubRegisterWidth.qword]: Register.R15,
    [SubRegisterWidth.dword]: Register.R15D,
    [SubRegisterWidth.word]: Register.R15W,
    [SubRegisterWidth.lowByte]: Register.R15B,
}

export const registerFamilyWidthMapping: { [key in RegisterFamily]: RegisterWidthMap } = {
    [RegisterFamily.rAX]: raxWidthMap,
    [RegisterFamily.rBX]: rbxWidthMap,
    [RegisterFamily.rCX]: rcxWidthMap,
    [RegisterFamily.rDX]: rdxWidthMap,
    [RegisterFamily.rSP]: rspWidthMap,
    [RegisterFamily.rBP]: rbpWidthMap,
    [RegisterFamily.rDI]: rdiWidthMap,
    [RegisterFamily.rSI]: rsiWidthMap,
    [RegisterFamily.r8]: r8WidthMap,
    [RegisterFamily.r9]: r9WidthMap,
    [RegisterFamily.r10]: r10WidthMap,
    [RegisterFamily.r11]: r11WidthMap,
    [RegisterFamily.r12]: r12WidthMap,
    [RegisterFamily.r13]: r13WidthMap,
    [RegisterFamily.r14]: r14WidthMap,
    [RegisterFamily.r15]: r15WidthMap,
}

export type ModRmRegRegisterWidthMap = { [modRmReg in ModRMReg]: RegisterWidthMap };
// table "ModRM.reg and .r/m Field Encodings" in AMD64 Architecture Programmer's Manual, Volume 3
// columns "ModRM.reg" and "ModRM.r/m (mod = 11b)" (they are identical)
export enum ModRMReg {
    rax_MMX0_XMM0_YMM0,
    rCX_MMX1_XMM1_YMM1,
    rDX_MMX2_XMM2_YMM2,
    rBX_MMX3_XMM3_YMM3,
    AH_rSP_MMX4_XMM4_YMM4,
    CH_rBP_MMX5_XMM5_YMM5,
    DH_rSI_MMX6_XMM6_YMM6,
    BH_rDI_MMX7_XMM7_YMM7,
    // r/m can be extended to 4 bits when REX.B is set
    // I can't find this in the doc, so I reverse-engineered the machine code output by NASM
    r8_MMX8_XMM8_YMM8,
    r9_MMX9_XMM9_YMM9,
    r10_MMX10_XMM10_YMM10,
    r11_MMX11_XMM11_YMM11,
    r12_MMX12_XMM12_YMM12,
    r13_MMX13_XMM13_YMM13,
    r14_MMX14_XMM14_YMM14,
    r15_MMX15_XMM15_YMM15,
}

export function canAddressHighByte(modrmreg: ModRMReg): boolean {
    return modrmreg === ModRMReg.BH_rDI_MMX7_XMM7_YMM7 ||
        modrmreg === ModRMReg.AH_rSP_MMX4_XMM4_YMM4 ||
        modrmreg === ModRMReg.CH_rBP_MMX5_XMM5_YMM5 ||
        modrmreg === ModRMReg.DH_rSI_MMX6_XMM6_YMM6;
}

export enum ModRMrmMobNot11b {
    rAX, rCX, rDX, rBX, SIB, rBP, rSI, rDI,
    r8, r9, r10, r11, SIB2, r13, r14, r15
}

export const modRMrmMobNot11bToRegisterMap: { [key in ModRMrmMobNot11b]?: RegisterFamily } = {
    [ModRMrmMobNot11b.rAX]: RegisterFamily.rAX,
    [ModRMrmMobNot11b.rCX]: RegisterFamily.rCX,
    [ModRMrmMobNot11b.rDX]: RegisterFamily.rDX,
    [ModRMrmMobNot11b.rBX]: RegisterFamily.rBX,
    [ModRMrmMobNot11b.rBP]: RegisterFamily.rBP,
    [ModRMrmMobNot11b.rSI]: RegisterFamily.rSI,
    [ModRMrmMobNot11b.rDI]: RegisterFamily.rDI,
    [ModRMrmMobNot11b.SIB]: undefined,
    [ModRMrmMobNot11b.r8]: RegisterFamily.r8,
    [ModRMrmMobNot11b.r9]: RegisterFamily.r9,
    [ModRMrmMobNot11b.r10]: RegisterFamily.r10,
    [ModRMrmMobNot11b.r11]: RegisterFamily.r11,
    [ModRMrmMobNot11b.SIB2]: undefined,
    [ModRMrmMobNot11b.r13]: RegisterFamily.r13,
    [ModRMrmMobNot11b.r14]: RegisterFamily.r14,
    [ModRMrmMobNot11b.r15]: RegisterFamily.r15,
}

export const sibScaleFactorMap: { [scale: number]: number } = {
    0x00: 1,
    0x01: 2,
    0x02: 4,
    0x03: 8,
}


export const subRegisterWidthToWidth: { [key in SubRegisterWidth]: OperationSize } = {
    [SubRegisterWidth.lowByte]: OperationSize.byte,
    [SubRegisterWidth.highByte]: OperationSize.byte,
    [SubRegisterWidth.word]: OperationSize.word,
    [SubRegisterWidth.dword]: OperationSize.dword,
    [SubRegisterWidth.qword]: OperationSize.qword,
}
export enum RegisterType {
    integer,
}

export const opCodeToModRmRegRegisterMap8: { [type in RegisterType]: ModRmRegRegisterWidthMap } = {
    [RegisterType.integer]: {
        [ModRMReg.rax_MMX0_XMM0_YMM0]: raxWidthMap,
        [ModRMReg.rCX_MMX1_XMM1_YMM1]: rcxWidthMap,
        [ModRMReg.rDX_MMX2_XMM2_YMM2]: rdxWidthMap,
        [ModRMReg.rBX_MMX3_XMM3_YMM3]: rbxWidthMap,
        [ModRMReg.AH_rSP_MMX4_XMM4_YMM4]: raxWidthMap,
        [ModRMReg.CH_rBP_MMX5_XMM5_YMM5]: rcxWidthMap,
        [ModRMReg.DH_rSI_MMX6_XMM6_YMM6]: rdxWidthMap,
        [ModRMReg.BH_rDI_MMX7_XMM7_YMM7]: rbxWidthMap,
        [ModRMReg.r8_MMX8_XMM8_YMM8]: r8WidthMap,
        [ModRMReg.r9_MMX9_XMM9_YMM9]: r9WidthMap,
        [ModRMReg.r10_MMX10_XMM10_YMM10]: r10WidthMap,
        [ModRMReg.r11_MMX11_XMM11_YMM11]: r11WidthMap,
        [ModRMReg.r12_MMX12_XMM12_YMM12]: r12WidthMap,
        [ModRMReg.r13_MMX13_XMM13_YMM13]: r13WidthMap,
        [ModRMReg.r14_MMX14_XMM14_YMM14]: r14WidthMap,
        [ModRMReg.r15_MMX15_XMM15_YMM15]: r15WidthMap,
    }
};

export const opCodeToModRmRegRegisterMap: { [type in RegisterType]: ModRmRegRegisterWidthMap } = {
    [RegisterType.integer]: {
        [ModRMReg.rax_MMX0_XMM0_YMM0]: raxWidthMap,
        [ModRMReg.rCX_MMX1_XMM1_YMM1]: rcxWidthMap,
        [ModRMReg.rDX_MMX2_XMM2_YMM2]: rdxWidthMap,
        [ModRMReg.rBX_MMX3_XMM3_YMM3]: rbxWidthMap,
        [ModRMReg.AH_rSP_MMX4_XMM4_YMM4]: rspWidthMap,
        [ModRMReg.CH_rBP_MMX5_XMM5_YMM5]: rbpWidthMap,
        [ModRMReg.DH_rSI_MMX6_XMM6_YMM6]: rsiWidthMap,
        [ModRMReg.BH_rDI_MMX7_XMM7_YMM7]: rdiWidthMap,
        [ModRMReg.r8_MMX8_XMM8_YMM8]: r8WidthMap,
        [ModRMReg.r9_MMX9_XMM9_YMM9]: r9WidthMap,
        [ModRMReg.r10_MMX10_XMM10_YMM10]: r10WidthMap,
        [ModRMReg.r11_MMX11_XMM11_YMM11]: r11WidthMap,
        [ModRMReg.r12_MMX12_XMM12_YMM12]: r12WidthMap,
        [ModRMReg.r13_MMX13_XMM13_YMM13]: r13WidthMap,
        [ModRMReg.r14_MMX14_XMM14_YMM14]: r14WidthMap,
        [ModRMReg.r15_MMX15_XMM15_YMM15]: r15WidthMap,
    }
};

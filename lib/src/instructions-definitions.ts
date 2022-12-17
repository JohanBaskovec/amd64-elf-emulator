// copy-pasted from AMD64 Architecture Programmer's Manual, volume 3

import {InstructionType, OperandModRMOrder} from "./Instruction";
import {OperationSize} from "./amd64-architecture";

//0 32 44
export const rawInstructionDefinitions: string = `
ADD AL, imm8                    04 ib       Add imm8 to AL.
ADD AX, imm16                   05 iw       Add imm16 to AX.
ADD EAX, imm32                  05 id       Add imm32 to EAX.
ADD RAX, imm32                  05 id       Add sign-extended imm32 to RAX.
ADD reg/mem8, imm8              80 /0 ib    Add imm8 to reg/mem8.
ADD reg/mem16, imm16            81 /0 iw    Add imm16 to reg/mem16
ADD reg/mem32, imm32            81 /0 id    Add imm32 to reg/mem32.
ADD reg/mem64, imm32            81 /0 id    Add sign-extended imm32 to reg/mem64.
ADD reg/mem16, imm8             83 /0 ib    Add sign-extended imm8 to reg/mem16
ADD reg/mem32, imm8             83 /0 ib    Add sign-extended imm8 to reg/mem32.
ADD reg/mem64, imm8             83 /0 ib    Add sign-extended imm8 to reg/mem64.
ADD reg/mem8, reg8              00 /r       Add reg8 to reg/mem8.
ADD reg/mem16, reg16            01 /r       Add reg16 to reg/mem16.
ADD reg/mem32, reg32            01 /r       Add reg32 to reg/mem32.
ADD reg/mem64, reg64            01 /r       Add reg64 to reg/mem64.
ADD reg8, reg/mem8              02 /r       Add reg/mem8 to reg8.
ADD reg16, reg/mem16            03 /r       Add reg/mem16 to reg16.
ADD reg32, reg/mem32            03 /r       Add reg/mem32 to reg32.
ADD reg64, reg/mem64            03 /r       Add reg/mem64 to reg64.

CALL rel16off                   E8 iw       Near call with the target specified by a 16-bit relative displacement.
CALL rel32off                   E8 id       Near call with the target specified by a 32-bit relative displacement.
//CALL reg/mem16                FF /2       Near call with the target specified by reg/mem16.
//CALL reg/mem32                FF /2       Near call with the target specified by reg/mem32. (There is no prefix for encoding this in 64-bit mode.)
//CALL reg/mem64                FF /2       Near call with the target specified by reg/mem64.

CMP AL, imm8                    3C ib       Compare an 8-bit immediate value with the contents of the AL register.
CMP AX, imm16                   3D iw       Compare a 16-bit immediate value with the contents of the AX register.
CMP EAX, imm32                  3D id       Compare a 32-bit immediate value with the contents of the EAX register.
CMP RAX, imm32                  3D id       Compare a 32-bit immediate value with the contents of the RAX register.
CMP reg/mem8, imm8              80 /7 ib    Compare an 8-bit immediate value with the contents of an 8-bit register or memory operand.
CMP reg/mem16, imm16            81 /7 iw    Compare a 16-bit immediate value with the contents of a 16-bit register or memory operand.
CMP reg/mem32, imm32            81 /7 id    Compare a 32-bit immediate value with the contents of a 32-bit register or memory operand.
CMP reg/mem64, imm32            81 /7 id    Compare a 32-bit signed immediate value with the contents of a 64-bit register or memory operand.
CMP reg/mem16, imm8             83 /7 ib    Compare an 8-bit signed immediate value with the contents of a 16-bit register or memory operand.
CMP reg/mem32, imm8             83 /7 ib    Compare an 8-bit signed immediate value with the contents of a 32-bit register or memory operand.
CMP reg/mem64, imm8             83 /7 ib    Compare an 8-bit signed immediate value with the contents of a 64-bit register or memory operand.
CMP reg/mem8, reg8              38 /r       Compare the contents of an 8-bit register or memory operand with the contents of an 8-bit register.
CMP reg/mem16, reg16            39 /r       Compare the contents of a 16-bit register or memory operand with the contents of a 16-bit register.
CMP reg/mem32, reg32            39 /r       Compare the contents of a 32-bit register or memory operand with the contents of a 32-bit register.
CMP reg/mem64, reg64            39 /r       Compare the contents of a 64-bit register or memory operand with the contents of a 64-bit register.
CMP reg8, reg/mem8              3A /r       Compare the contents of an 8-bit register with the contents of an 8-bit register or memory operand.
CMP reg16, reg/mem16            3B /r       Compare the contents of a 16-bit register with the contents of a 16-bit register or memory operand.
CMP reg32, reg/mem32            3B /r       Compare the contents of a 32-bit register with the contents of a 32-bit register or memory operand.
CMP reg64, reg/mem64            3B /r       Compare the contents of a 64-bit register with the contents of a 64-bit register or memory operand.

DEC reg/mem8                    FE /1       Decrement the contents of an 8-bit register or memory location by 1.
DEC reg/mem16                   FF /1       Decrement the contents of a 16-bit register or memory location by 1.
DEC reg/mem32                   FF /1       Decrement the contents of a 32-bit register or memory location by 1.
DEC reg/mem64                   FF /1       Decrement the contents of a 64-bit register or memory location by 1.
//DEC reg16                     48 +rw      Decrement the contents of a 16-bit register by 1. (See “REX Prefix” on page 14.)
//DEC reg32                     48 +rd      Decrement the contents of a 32-bit register by 1. (See “REX Prefix” on page 14.)

IDIV reg/mem8                   F6 /7       Perform signed division of AX by the contents of an 8-bit register or memory location and store the quotient in AL and the remainder in AH.
IDIV reg/mem16                  F7 /7       Perform signed division of DX:AX by the contents of a 16-bit register or memory location and store the quotient in AX and the remainder in DX.
IDIV reg/mem32                  F7 /7       Perform signed division of EDX:EAX by the contents of a 32-bit register or memory location and store the quotient in EAX and the remainder in EDX.
IDIV reg/mem64                  F7 /7       Perform signed division of RDX:RAX by the contents of a 64-bit register or memory location and store the quotient in RAX and the remainder in RDX.

IMUL reg/mem8                   F6 /5       Multiply the contents of AL by the contents of an 8-bit memory or register operand and put the signed result in AX.
IMUL reg/mem16                  F7 /5       Multiply the contents of AX by the contents of a 16-bit memory or register operand and put the signed result in DX:AX.
IMUL reg/mem32                  F7 /5       Multiply the contents of EAX by the contents of a 32-bit memory or register operand and put the signed result in EDX:EAX.
IMUL reg/mem64                  F7 /5       Multiply the contents of RAX by the contents of a 64-bit memory or register operand and put the signed result in RDX:RAX.
IMUL reg16, reg/mem16           0F AF /r    Multiply the contents of a 16-bit destination register by the contents of a 16-bit register or memory operand and put the signed result in the 16-bit destination register.
IMUL reg32, reg/mem32           0F AF /r    Multiply the contents of a 32-bit destination register by the contents of a 32-bit register or memory operand and put the signed result in the 32-bit destination register.
IMUL reg64, reg/mem64           0F AF /r    Multiply the contents of a 64-bit destination register by the contents of a 64-bit register or memory operand and put the signed result in the 64-bit destination register.
IMUL reg16, reg/mem16, imm8     6B /r ib    Multiply the contents of a 16-bit register or memory operand by a sign-extended immediate byte and put the signed result in the 16-bit destination register.
IMUL reg32, reg/mem32, imm8     6B /r ib    Multiply the contents of a 32-bit register or memory operand by a sign-extended immediate byte and put the signed result in the 32-bit destination register.
IMUL reg64, reg/mem64, imm8     6B /r ib    Multiply the contents of a 64-bit register or memory operand by a sign-extended immediate byte and put the signed result in the 64-bit destination register.
IMUL reg16, reg/mem16, imm16    69 /r iw    Multiply the contents of a 16-bit register or memory operand by a sign-extended immediate word and put the signed result in the 16-bit destination register.
IMUL reg32, reg/mem32, imm32    69 /r id    Multiply the contents of a 32-bit register or memory operand by a sign-extended immediate double and put the signed result in the 32-bit destination register.
IMUL reg64, reg/mem64, imm32    69 /r id    Multiply the contents of a 64-bit register or memory operand by a sign-extended immediate double and put the signed result in the 64-bit destination register.

INC reg/mem8                    FE /0       Increment the contents of an 8-bit register or memory location by 1.
INC reg/mem16                   FF /0       Increment the contents of a 16-bit register or memory location by 1.
INC reg/mem32                   FF /0       Increment the contents of a 32-bit register or memory location by 1.
INC reg/mem64                   FF /0       Increment the contents of a 64-bit register or memory location by 1.
//INC reg16                     40 +rw      Increment the contents of a 16-bit register by 1. (These opcodes are used as REX prefixes in 64-bit mode. See “REX Prefix” on page 14.)
//INC reg32                     40 +rd      Increment the contents of a 32-bit register by 1. (These opcodes are used as REX prefixes in 64-bit mode. See “REX Prefix” on page 14.)

JO rel8off                      70 cb       Jump if overflow (OF = 1).
JO rel16off                     0F 80 cw    Jump if overflow (OF = 1).
JO rel32off                     0F 80 cd    Jump if overflow (OF = 1).

JNO rel8off                     71 cb       Jump if not overflow (OF = 0).
JNO rel16off                    0F 81 cw    Jump if not overflow (OF = 0).
JNO rel32off                    0F 81 cd    Jump if not overflow (OF = 0).

JB rel8off                      72 cb       Jump if below (CF = 1).
JB rel16off                     0F 82 cw    Jump if below (CF = 1).
JB rel32off                     0F 82 cd    Jump if below (CF = 1).

JC rel8off                      72 cb       Jump if carry (CF = 1).
JC rel16off                     0F 82 cw    Jump if carry (CF = 1).
JC rel32off                     0F 82 cd    Jump if carry (CF = 1).

JNAE rel8off                    72 cb       Jump if not above or equal (CF = 1).
JNAE rel16off                   0F 82 cw    Jump if not above or equal (CF = 1).
JNAE rel32off                   0F 82 cd    Jump if not above or equal (CF = 1).

JNB rel8off                     73 cb       Jump if not below (CF = 0).
JNB rel16off                    0F 83 cw    Jump if not below (CF = 0).
JNB rel32off                    0F 83 cd    Jump if not below (CF = 0).

JNC rel8off                     73 cb       Jump if not carry (CF = 0).
JNC rel16off                    0F 83 cw    Jump if not carry (CF = 0).
JNC rel32off                    0F 83 cd    Jump if not carry (CF = 0).

JAE rel8off                     73 cb       Jump if above or equal (CF = 0).
JAE rel16off                    0F 83 cw    Jump if above or equal (CF = 0).
JAE rel32off                    0F 83 cd    Jump if above or equal (CF = 0).

// identical to JE, so we ignore it
//JZ rel8off                      74 cb       Jump if zero (ZF = 1).
//JZ rel16off                     0F 84 cw    Jump if zero (ZF = 1).
//JZ rel32off                     0F 84 cd    Jump if zero (ZF = 1).

JE rel8off                      74 cb       Jump if equal (ZF = 1).
JE rel16off                     0F 84 cw    Jump if equal (ZF = 1).
JE rel32off                     0F 84 cd    Jump if equal (ZF = 1).

JNZ rel8off                     75 cb       Jump if not zero (ZF = 0).
JNZ rel16off                    0F 85 cw    Jump if not zero (ZF = 0).
JNZ rel32off                    0F 85 cd    Jump if not zero (ZF = 0).

JNE rel8off                     75 cb       Jump if not equal (ZF = 0).
JNE rel16off                    0F 85 cw    Jump if not equal (ZF = 0).
JNE rel32off                    0F 85 cd    Jump if not equal (ZF = 0).

JBE rel8off                     76 cb       Jump if below or equal (CF = 1 or ZF = 1).
JBE rel16off                    0F 86 cw    Jump if below or equal (CF = 1 or ZF = 1).
JBE rel32off                    0F 86 cd    Jump if below or equal (CF = 1 or ZF = 1).

JNA rel8off                     76 cb       Jump if not above (CF = 1 or ZF = 1).
JNA rel16off                    0F 86 cw    Jump if not above (CF = 1 or ZF = 1).
JNA rel32off                    0F 86 cd    Jump if not above (CF = 1 or ZF = 1).

JNBE rel8off                    77 cb       Jump if not below or equal (CF = 0 and ZF = 0).
JNBE rel16off                   0F 87 cw    Jump if not below or equal (CF = 0 and ZF = 0).
JNBE rel32off                   0F 87 cd    Jump if not below or equal (CF = 0 and ZF = 0).

JA rel8off                      77 cb       Jump if above (CF = 0 and ZF = 0).
JA rel16off                     0F 87 cw    Jump if above (CF = 0 and ZF = 0).
JA rel32off                     0F 87 cd    Jump if above (CF = 0 and ZF = 0).

JS rel8off                      78 cb       Jump if sign (SF = 1).
JS rel16off                     0F 88 cw    Jump if sign (SF = 1).
JS rel32off                     0F 88 cd    Jump if sign (SF = 1).

JNS rel8off                     79 cb       Jump if not sign (SF = 0).
JNS rel16off                    0F 89 cw    Jump if not sign (SF = 0).
JNS rel32off                    0F 89 cd    Jump if not sign (SF = 0).

JP rel8off                      7A cb       Jump if parity (PF = 1).
JP rel16off                     0F 8A cw    Jump if parity (PF = 1).
JP rel32off                     0F 8A cd    Jump if parity (PF = 1).

JPE rel8off                     7A cb       Jump if parity even (PF = 1).
JPE rel16off                    0F 8A cw    Jump if parity even (PF = 1).
JPE rel32off                    0F 8A cd    Jump if parity even (PF = 1).

JNP rel8off                     7B cb       Jump if not parity (PF = 0).
JNP rel16off                    0F 8B cw    Jump if not parity (PF = 0).
JNP rel32off                    0F 8B cd    Jump if not parity (PF = 0).

JPO rel8off                     7B cb       Jump if parity odd (PF = 0).
JPO rel16off                    0F 8B cw    Jump if parity odd (PF = 0).
JPO rel32off                    0F 8B cd    Jump if parity odd (PF = 0).

JL rel8off                      7C cb       Jump if less (SF <> OF).
JL rel16off                     0F 8C cw    Jump if less (SF <> OF).
JL rel32off                     0F 8C cd    Jump if less (SF <> OF).

JNGE rel8off                    7C cb       Jump if not greater or equal (SF <> OF).
JNGE rel16off                   0F 8C cw    Jump if not greater or equal (SF <> OF).
JNGE rel32off                   0F 8C cd    Jump if not greater or equal (SF <> OF).

//JNL rel8off                     7D cb       Jump if not less (SF = OF).
//JNL rel16off                    0F 8D cw    Jump if not less (SF = OF).
//JNL rel32off                    0F 8D cd    Jump if not less (SF = OF).

JGE rel8off                     7D cb       Jump if greater or equal (SF = OF).
JGE rel16off                    0F 8D cw    Jump if greater or equal (SF = OF).
JGE rel32off                    0F 8D cd    Jump if greater or equal (SF = OF).

//JLE rel8off                     7E cb       Jump if less or equal (ZF = 1 or SF <> OF).
//JLE rel16off                    0F 8E cw    Jump if less or equal (ZF = 1 or SF <> OF).
//JLE rel32off                    0F 8E cd    Jump if less or equal (ZF = 1 or SF <> OF).

JNG rel8off                     7E cb       Jump if not greater (ZF = 1 or SF <> OF).
JNG rel16off                    0F 8E cw    Jump if not greater (ZF = 1 or SF <> OF).
JNG rel32off                    0F 8E cd    Jump if not greater (ZF = 1 or SF <> OF).

//JNLE rel8off                    7F cb       Jump if not less or equal (ZF = 0 and SF = OF).
//JNLE rel16off                   0F 8F cw    Jump if not less or equal (ZF = 0 and SF = OF).
//JNLE rel32off                   0F 8F cd    Jump if not less or equal (ZF = 0 and SF = OF).

JG rel8off                      7F cb       Jump if greater (ZF = 0 and SF = OF).
JG rel16off                     0F 8F cw    Jump if greater (ZF = 0 and SF = OF).
JG rel32off                     0F 8F cd    Jump if greater (ZF = 0 and SF = OF).

JMP rel8off                     EB cb       Short jump with the target specified by an 8-bit signed displacement.
JMP rel16off                    E9 cw       Near jump with the target specified by a 16-bit signed displacement.
JMP rel32off                    E9 cd       Near jump with the target specified by a 32-bit signed displacement.
JMP reg/mem16                   FF /4       Near jump with the target specified reg/mem16.
JMP reg/mem32                   FF /4       Near jump with the target specified reg/mem32. (No prefix for encoding in 64-bit mode.)
JMP reg/mem64                   FF /4       Near jump with the target specified reg/mem64.

LEA reg16, mem                  8D /r       Store effective address in a 16-bit register.
LEA reg32, mem                  8D /r       Store effective address in a 32-bit register.
LEA reg64, mem                  8D /r       Store effective address in a 64-bit register.

MOV reg/mem8, reg8              88 /r       Move the contents of an 8-bit register to an 8-bit destination register or memory operand.
MOV reg/mem16, reg16            89 /r       Move the contents of a 16-bit register to a 16-bit destination register or memory operand.
MOV reg/mem32, reg32            89 /r       Move the contents of a 32-bit register to a 32-bit destination register or memory operand.
MOV reg/mem64, reg64            89 /r       Move the contents of a 64-bit register to a 64-bit destination register or memory operand.
MOV reg8, reg/mem8              8A /r       Move the contents of an 8-bit register or memory operand to an 8-bit destination register.
MOV reg16, reg/mem16            8B /r       Move the contents of a 16-bit register or memory operand to a 16-bit destination register.
MOV reg32, reg/mem32            8B /r       Move the contents of a 32-bit register or memory operand to a 32-bit destination register.
MOV reg64, reg/mem64            8B /r       Move the contents of a 64-bit register or memory operand to a 64-bit destination register.
MOV reg16/32/64/mem16, segReg   8C /r       Move the contents of a segment register to a 16-bit, 32- bit, or 64-bit destination register or to a 16-bit memory operand.
MOV segReg, reg/mem16           8E /r       Move the contents of a 16-bit register or memory operand to a segment register.
MOV AL, moffset8                A0          Move 8-bit data at a specified memory offset to the AL register.
MOV AX, moffset16               A1          Move 16-bit data at a specified memory offset to the AX register.
MOV EAX, moffset32              A1          Move 32-bit data at a specified memory offset to the EAX register.
MOV RAX, moffset64              A1          Move 64-bit data at a specified memory offset to the RAX register.
MOV moffset8, AL                A2          Move the contents of the AL register to an 8-bit memory offset.
MOV moffset16, AX               A3          Move the contents of the AX register to a 16-bit memory offset.
MOV moffset32, EAX              A3          Move the contents of the EAX register to a 32-bit memory offset.
MOV moffset64, RAX              A3          Move the contents of the RAX register to a 64-bit memory offset.
MOV reg8, imm8                  B0 +rb ib   Move an 8-bit immediate value into an 8-bit register.
MOV reg16, imm16                B8 +rw iw   Move a 16-bit immediate value into a 16-bit register.
MOV reg32, imm32                B8 +rd id   Move an 32-bit immediate value into a 32-bit register.
MOV reg64, imm64                B8 +rq iq   Move an 64-bit immediate value into a 64-bit register.
MOV reg/mem8, imm8              C6 /0 ib    Move an 8-bit immediate value to an 8-bit register or memory operand.
MOV reg/mem16, imm16            C7 /0 iw    Move a 16-bit immediate value to a 16-bit register or memory operand.
MOV reg/mem32, imm32            C7 /0 id    Move a 32-bit immediate value to a 32-bit register or memory operand.
MOV reg/mem64, imm32            C7 /0 id    Move a 32-bit signed immediate value to a 64-bit register or memory operand.

MOVZX reg16, reg/mem8           0F B6 /r    Move the contents of an 8-bit register or memory operand to a 16-bit register with zero-extension.
MOVZX reg32, reg/mem8           0F B6 /r    Move the contents of an 8-bit register or memory operand to a 32-bit register with zero-extension.
MOVZX reg64, reg/mem8           0F B6 /r    Move the contents of an 8-bit register or memory operand to a 64-bit register with zero-extension.
MOVZX reg32, reg/mem16          0F B7 /r    Move the contents of a 16-bit register or memory operand to a 32-bit register with zero-extension.
MOVZX reg64, reg/mem16          0F B7 /r    Move the contents of a 16-bit register or memory operand to a 64-bit register with zero-extension.

POP reg/mem16                   8F /0       Pop the top of the stack into a 16-bit register or memory location.
POP reg/mem32                   8F /0       Pop the top of the stack into a 32-bit register or memory location. (No prefix for encoding this in 64-bit mode.)
POP reg/mem64                   8F /0       Pop the top of the stack into a 64-bit register or memory location.
POP reg16                       58 +rw      Pop the top of the stack into a 16-bit register.
POP reg32                       58 +rd      Pop the top of the stack into a 32-bit register. (No prefix for encoding this in 64-bit mode.)
POP reg64                       58 +rq      Pop the top of the stack into a 64-bit register.

PUSH reg/mem16                  FF /6       Push the contents of a 16-bit register or memory operand onto the stack.
PUSH reg/mem32                  FF /6       Push the contents of a 32-bit register or memory operand onto the stack. (No prefix for encoding this in 64-bit mode.)
PUSH reg/mem64                  FF /6       Push the contents of a 64-bit register or memory operand onto the stack.
PUSH reg16                      50 +rw      Push the contents of a 16-bit register onto the stack. PUSH reg32 50 +rd Push the contents of a 32-bit register onto the stack. (No prefix for encoding this in 64-bit mode.)
//PUSH reg32                    50 +rd      Push the contents of a 32-bit register onto the stack. (No prefix for encoding this in 64-bit mode.)
PUSH reg64                      50 +rq      Push the contents of a 64-bit register onto the stack.
PUSH imm8                       6A ib       Push an 8-bit immediate value (sign-extended to 16, 32, or 64 bits) onto the stack.
PUSH imm16                      68 iw       Push a 16-bit immediate value onto the stack.
PUSH imm32                      68 id       Push a 32-bit immediate value onto the stack. (No prefix for encoding this in 64-bit mode.)
PUSH imm64                      68 id       Push a sign-extended 32-bit immediate value onto the stack.

RET                             C3          Near return to the calling procedure.
//RET imm16                     C2 iw       Near return to the calling procedure then pop the specified number of bytes from the stack.

SUB AL, imm8                    2C ib       Subtract an immediate 8-bit value from the AL register and store the result in AL.
SUB AX, imm16                   2D iw       Subtract an immediate 16-bit value from the AX register and store the result in AX.
SUB EAX, imm32                  2D id       Subtract an immediate 32-bit value from the EAX register and store the result in EAX.
SUB RAX, imm32                  2D id       Subtract a sign-extended immediate 32-bit value from the RAX register and store the result in RAX.
SUB reg/mem8, imm8              80 /5 ib    Subtract an immediate 8-bit value from an 8-bit destination register or memory location.
SUB reg/mem16, imm16            81 /5 iw    Subtract an immediate 16-bit value from a 16-bit destination register or memory location.
SUB reg/mem32, imm32            81 /5 id    Subtract an immediate 32-bit value from a 32-bit destination register or memory location.
SUB reg/mem64, imm32            81 /5 id    Subtract a sign-extended immediate 32-bit value from a 64-bit destination register or memory location.
SUB reg/mem16, imm8             83 /5 ib    Subtract a sign-extended immediate 8-bit value from a 16-bit register or memory location.
SUB reg/mem32, imm8             83 /5 ib    Subtract a sign-extended immediate 8-bit value from a 32-bit register or memory location.
SUB reg/mem64, imm8             83 /5 ib    Subtract a sign-extended immediate 8-bit value from a 64-bit register or memory location.
SUB reg/mem8, reg8              28 /r       Subtract the contents of an 8-bit register from an 8-bit destination register or memory location.
SUB reg/mem16, reg16            29 /r       Subtract the contents of a 16-bit register from a 16-bit destination register or memory location.
SUB reg/mem32, reg32            29 /r       Subtract the contents of a 32-bit register from a 32-bit destination register or memory location.
SUB reg/mem64, reg64            29 /r       Subtract the contents of a 64-bit register from a 64-bit destination register or memory location.
SUB reg8, reg/mem8              2A /r       Subtract the contents of an 8-bit register or memory operand from an 8-bit destination register.
SUB reg16, reg/mem16            2B /r       Subtract the contents of a 16-bit register or memory operand from a 16-bit destination register.
SUB reg32, reg/mem32            2B /r       Subtract the contents of a 32-bit register or memory operand from a 32-bit destination register.
SUB reg64, reg/mem64            2B /r       Subtract the contents of a 64-bit register or memory operand from a 64-bit destination register.

XOR AL, imm8                    34 ib       xor the contents of AL with an immediate 8-bit operand and store the result in AL.
XOR AX, imm16                   35 iw       xor the contents of AX with an immediate 16-bit operand and store the result in AX.
XOR EAX, imm32                  35 id       xor the contents of EAX with an immediate 32-bit operand and store the result in EAX.
XOR RAX, imm32                  35 id       xor the contents of RAX with a sign-extended immediate 32-bit operand and store the result in RAX.
XOR reg/mem8, imm8              80 /6 ib    xor the contents of an 8-bit destination register or memory operand with an 8-bit immediate value and store the result in the destination.
XOR reg/mem16, imm16            81 /6 iw    xor the contents of a 16-bit destination register or memory operand with a 16-bit immediate value and store the result in the destination.
XOR reg/mem32, imm32            81 /6 id    xor the contents of a 32-bit destination register or memory operand with a 32-bit immediate value and store the result in the destination.
XOR reg/mem64, imm32            81 /6 id    xor the contents of a 64-bit destination register or memory operand with a sign-extended 32-bit immediate value and store the result in the destination.
XOR reg/mem16, imm8             83 /6 ib    xor the contents of a 16-bit destination register or memory operand with a sign-extended 8-bit immediate value and store the result in the destination.
XOR reg/mem32, imm8             83 /6 ib    xor the contents of a 32-bit destination register or memory operand with a sign-extended 8-bit immediate value and store the result in the destination.
XOR reg/mem64, imm8             83 /6 ib    xor the contents of a 64-bit destination register or memory operand with a sign-extended 8-bit immediate value and store the result in the destination.
XOR reg/mem8, reg8              30 /r       xor the contents of an 8-bit destination register or memory operand with the contents of an 8-bit register and store the result in the destination.
XOR reg/mem16, reg16            31 /r       xor the contents of a 16-bit destination register or memory operand with the contents of a 16-bit register and store the result in the destination.
XOR reg/mem32, reg32            31 /r       xor the contents of a 32-bit destination register or memory operand with the contents of a 32-bit register and store the result in the destination.
XOR reg/mem64, reg64            31 /r       xor the contents of a 64-bit destination register or memory operand with the contents of a 64-bit register and store the result in the destination.
XOR reg8, reg/mem8              32 /r       xor the contents of an 8-bit destination register with the contents of an 8-bit register or memory operand and store the results in the destination.
XOR reg16, reg/mem16            33 /r       xor the contents of a 16-bit destination register with the contents of a 16-bit register or memory operand and store the results in the destination.
XOR reg32, reg/mem32            33 /r       xor the contents of a 32-bit destination register with the contents of a 32-bit register or memory operand and store the results in the destination.
XOR reg64, reg/mem64            33 /r       xor the contents of a 64-bit destination register with the contents of a 64-bit register or memory operand and store the results in the destination.

SYSCALL                         0F 05       Call operating system.
`

export enum OperandType {
    reg8, reg16, reg32, reg64,
    mem,
    regOrMem8, regOrMem16, regOrMem32, regOrMem64,
    imm8, imm16, imm32, imm64,
    AL, AX, EAX, RAX,
    moffset8, moffset16, moffset32, moffset64,
    segReg,
    reg16OrReg32OrReg64OrMem16,
    relativeOffset8, relativeOffset16, relativeOffset32
    ,
}

export const operandTypeToWidth: {[key in OperandType]?: OperationSize} = {
    [OperandType.reg8]: OperationSize.byte,
    [OperandType.reg16]: OperationSize.word,
    [OperandType.reg32]: OperationSize.dword,
    [OperandType.reg64]: OperationSize.qword,
    [OperandType.regOrMem8]: OperationSize.byte,
    [OperandType.regOrMem16]: OperationSize.word,
    [OperandType.regOrMem32]: OperationSize.dword,
    [OperandType.regOrMem64]: OperationSize.qword,
    [OperandType.mem]: OperationSize.qword,
    [OperandType.imm8]: OperationSize.byte,
    [OperandType.imm16]: OperationSize.word,
    [OperandType.imm32]: OperationSize.dword,
    [OperandType.imm64]: OperationSize.qword,
    [OperandType.AL]: OperationSize.byte,
    [OperandType.AX]: OperationSize.word,
    [OperandType.EAX]: OperationSize.dword,
    [OperandType.RAX]: OperationSize.qword,
    [OperandType.moffset8]: OperationSize.byte,
    [OperandType.moffset16]: OperationSize.word,
    [OperandType.moffset32]: OperationSize.dword,
    [OperandType.moffset64]: OperationSize.qword,
    [OperandType.reg16OrReg32OrReg64OrMem16]: OperationSize.qword,
    [OperandType.relativeOffset8]: OperationSize.byte,
    [OperandType.relativeOffset16]: OperationSize.word,
    [OperandType.relativeOffset32]: OperationSize.dword,
}

export type InstructionDefinition = {
    description: string,
    operandModRMOrder: OperandModRMOrder,
    is8BitsInstruction: boolean,
    mnemonic: {
        str: string,
        instructionType: InstructionType,
        operands: OperandType[],
    },
    opCode: {
        str: string,
        uniq: string,
        bytes: number[],
        modRM: boolean,
        immediateSize?: OperationSize,
        codeOffsetSize?: OperationSize,
        modRMExtension?: number,
        registerCode?: OperationSize,
    },
}

const operandStrToOperandType: {[operandTypeStr: string]: OperandType} = {
    'reg/mem8': OperandType.regOrMem8,
    'reg/mem16': OperandType.regOrMem16,
    'reg/mem32': OperandType.regOrMem32,
    'reg/mem64': OperandType.regOrMem64,
    'mem': OperandType.mem,
    'AL': OperandType.AL,
    'AX': OperandType.AX,
    'EAX': OperandType.EAX,
    'RAX': OperandType.RAX,
    'imm8': OperandType.imm8,
    'imm16': OperandType.imm16,
    'imm32': OperandType.imm32,
    'imm64': OperandType.imm64,
    'reg8': OperandType.reg8,
    'reg16': OperandType.reg16,
    'reg32': OperandType.reg32,
    'reg64': OperandType.reg64,
    'moffset8': OperandType.moffset8,
    'moffset16': OperandType.moffset16,
    'moffset32': OperandType.moffset32,
    'moffset64': OperandType.moffset64,

    'segReg': OperandType.segReg,
    'reg16/32/64/mem16': OperandType.reg16OrReg32OrReg64OrMem16,
    'rel8off': OperandType.relativeOffset8,
    'rel16off': OperandType.relativeOffset16,
    'rel32off': OperandType.relativeOffset32,
}

export const instructionDefinitionsByOpCode = new Map<string, InstructionDefinition[]>;

function parseInstructionDefinitions() {
    const lines = rawInstructionDefinitions.split("\n");
    const instructionDefinitions: InstructionDefinition[] = [];

    for (let i = 0 ; i < lines.length ; i++) {
        const line = lines[i];
        if (line.length === 0 || line.startsWith("//")) {
            continue;
        }
        const mnemonicStr = line.substring(0, 31).trim();
        const indexFirstSpace = mnemonicStr.indexOf(' ');
        const mnemonicInstructionStr: string = indexFirstSpace === -1 ? mnemonicStr : mnemonicStr.substring(0, indexFirstSpace);
        const instructionType: InstructionType = InstructionType[mnemonicInstructionStr as keyof typeof InstructionType];
        if (instructionType === undefined) {
            throw new Error(`Undefined mnemonic: ${mnemonicInstructionStr} on line ${line}.`);
        }

        const operands: OperandType[] = [];
        if (indexFirstSpace !== -1) {
            const mnemOperands = mnemonicStr.substring(indexFirstSpace + 1);
            const operandsStr = mnemOperands.split(',').map(op => op.trim());

            for (const operandStr of operandsStr) {
                const operandType: OperandType | undefined = operandStrToOperandType[operandStr];
                if (operandType === undefined) {
                    throw new Error(`Undefined operand: ${operandStr} on line ${line}.`);
                }
                operands.push(operandType)
            }
        }

        const opcodeStr = line.substring(32, 43).trim();
        const opCodeParts = opcodeStr.split(' ');
        let opcodeImmediate: OperationSize | undefined;
        let codeOffsetSize: OperationSize | undefined;
        let modRMExtension: number | undefined;
        let modRM = false;
        let registerCode: OperationSize | undefined;
        const opcodeBytes: number[] = [];
        let uniq = "";
        for (const opcodePart of opCodeParts) {
            switch (opcodePart) {
                case '/r':
                    modRM = true;
                    break;
                case 'ib':
                    opcodeImmediate = OperationSize.byte;
                    break;
                case 'iw':
                    opcodeImmediate = OperationSize.word;
                    break;
                case 'id':
                    opcodeImmediate = OperationSize.dword;
                    break;
                case 'iq':
                    opcodeImmediate = OperationSize.qword;
                    break;
                case 'cb':
                    codeOffsetSize = OperationSize.byte;
                    break;
                case 'cw':
                    codeOffsetSize = OperationSize.word;
                    break;
                case 'cd':
                    codeOffsetSize = OperationSize.dword;
                    break;
                case 'cp':
                    throw new Error('cp not implemented')
                case '/0':
                    modRMExtension = 0;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/1':
                    modRMExtension = 1;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/2':
                    modRMExtension = 2;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/3':
                    modRMExtension = 3;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/4':
                    modRMExtension = 4;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/5':
                    modRMExtension = 5;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/6':
                    modRMExtension = 6;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '/7':
                    modRMExtension = 7;
                    modRM = true;
                    uniq += opcodePart;
                    break;
                case '+rb':
                    registerCode = OperationSize.word;
                    break;
                case '+rw':
                    registerCode = OperationSize.word;
                    break;
                case '+rd':
                    registerCode = OperationSize.dword;
                    break;
                case '+rq':
                    registerCode = OperationSize.qword;
                    break;
                default:
                    try {
                        const num = Number.parseInt(opcodePart, 16);
                        opcodeBytes.push(num);
                        uniq += opcodePart;
                    } catch {
                        throw new Error(`Could not parse opcode byte ${opcodePart}.`);
                    }

            }
        }

        const description = line.substring(44);

        if (modRMExtension && opcodeBytes.length !== 1) {
            throw new Error(`There can't be a register code with an opcode that's more than 1 byte long! On line ${i}`);
        }
        let operandModRMOrder = OperandModRMOrder.regFirstRmSecond;
        let is8BitsInstruction = false;
        if (operands.length > 0) {
            if (operands[0] === OperandType.regOrMem8 ||
                operands[0] === OperandType.regOrMem16 ||
                operands[0] === OperandType.regOrMem32 ||
                operands[0] === OperandType.regOrMem64
            ) {
                operandModRMOrder = OperandModRMOrder.rmFirstRegSecond;
            }
        }
        if (operands.length >= 2) {
            const op0Width = operandTypeToWidth[operands[0]];
            const op1Width = operandTypeToWidth[operands[1]];
            // I'm not sure if this is always true
            if (op0Width === OperationSize.byte && op1Width === OperationSize.byte) {
                is8BitsInstruction = true;
            }
        }

        const id: InstructionDefinition = {
            operandModRMOrder,
            is8BitsInstruction,
            mnemonic: {
                str: mnemonicStr,
                instructionType,
                operands: operands,
            },
            opCode: {
                uniq,
                str: opcodeStr,
                immediateSize: opcodeImmediate,
                codeOffsetSize,
                bytes: opcodeBytes,
                modRMExtension,
                modRM,
                registerCode,
            },
            description,
        };
        const idArray = instructionDefinitionsByOpCode.get(uniq);
        if (idArray !== undefined) {
            idArray.push(id);
        } else {
            instructionDefinitionsByOpCode.set(uniq, [id]);
        }
        instructionDefinitions.push(id);
    }
    return instructionDefinitions;
}

export let instructionDefinitions: InstructionDefinition[] = [];
let initialized = false;
export function initInstructionDefinitions() {
    if (!initialized) {
        instructionDefinitions = parseInstructionDefinitions();
    }
}


section .text
global _start

_start:
    ; Operands must be the same size, therefor this is invalid:
    ; mov rax, r8b
    ; mov rax, r8w
    ; mov rax, r8d

    je ok
    mov rax, 1
    ok:

    ; moving a value to a 32-bits register clears the top 32-bits of the 64-bits register
    mov rax, -1 ; sets all bits of rax to 1
    mov r8, -1  ; sets all bits of r8 to 1
    mov eax, r8d
    ; here the top 32 bits of eax are 0, the bottom 32 bits are 1
    ; rax = 4294967295

    mov rax, -1
    mov ax, r8w
    ; here the 64 bits are 1

    mov rax, -1
    mov al, r8b
    ; here the 64 bits are 1

    ; movzx clears all top bits of the 64-bits register when the
    ; first operand is 64 or 32-bits, but DOES NOT when the first operand is 16-bits!
    mov rax, 0
    movzx rax, r8b
    ; top 56 bits are 0, bottom 8 bits are 1
    ; rax, eax and ax = 255, al = -1

    mov rax, -1
    movzx rax, r8w
    ; here the top 48 bits of rax are 0, bottom 16 bits are 1

    mov rax, -1
    movzx rax, r8b
    ; here the top 56 bits of rax are 0, bottom 8 bits are 1

    mov rax, -1
    movzx eax, r8w
    ; here the top 48 bits of rax are 0, bottom 16 bits are 1
    ; ie if interpreting them as signed integers, rax and eax = 65535, ax = -1

    mov rax, -1
    movzx eax, r8b
    ; here the top 48 bits of rax are 0, bottom 8 bit is 1
    ; ie if interpreting them as signed integers, rax, eax and ax = 255, al = -1

    mov rax, -1
    movzx ax, r8b
    ; here the top 32 bits of rax are 1, bottom 8 bits are 1, rest is 0
    ; ie if interpreting them as signed integers, rax and eax = -65281, ax = 255, al = -1

    mov rax, -1
    mov r8b, 34
    movzx ax, r8b
    ; if interpreted as signed integer, ax = 34
    ; ax = 0010 0010 0000 0000

    mov rax, -1
    mov r8b, -34
    movzx ax, r8b
    ; if interpreted as signed integer, ax = 222,
    ; ax = 1101 1110 0000 0000

    mov rax, -1
    mov r8b, -34
    movzx eax, r8b

    mov rax, -1
    mov r8w, -284
    movzx eax, r8w ;;

    mov rax, -1
    mov r8w, -284
    movzx rax, r8w

    mov rax, -1
    mov r8b, -34
    movzx rax, r8b

    xor rax, rax            ; exit code 0
    mov rax, 60             ; system call code for exit
    syscall                 ; do the system call

section .data
ahh dq 432

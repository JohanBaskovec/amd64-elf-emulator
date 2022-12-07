section .text
global _start

_start:
    mov         rax, 1                  ; system call code for write
    mov         rdi, 1                  ; 1st param: file descriptor stdout
    mov         rsi, hello_world        ; 2st param: string
    mov         rdx, hello_world_len    ; 3rd param: length
    syscall                             ; do the system call

    mov       rax, 60                   ; system call code for exit
    xor       rdi, rdi                  ; exit code 0
    syscall                             ; do the system call

section .data
hello_world db `Hello world!\n`
hello_world_len equ $-hello_world

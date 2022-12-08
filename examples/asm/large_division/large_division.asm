section .text
global _start

_start:

    ; 9223372036854775111 x 94 = 866996971464348860434
    mov rax, 9223372036854775111
    mov rbx, 94
    imul rbx

    ; 866996971464348860434 / 8669969714643488604 = quotient 100, remained 34
    mov rbx, 8669969714643488604
    idiv rbx

    mov       rdi, rdx                  ; exit code 34
    mov       rax, 60                   ; system call code for exit
    syscall                             ; do the system call

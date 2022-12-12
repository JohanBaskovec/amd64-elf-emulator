section .text
global _start

atoi:
    ; rdi: u8* string
    ; esi: u64 string_length

    push rbp                    ; save current EBP
    mov rbp, rsp                ; set stack frame pointer value

    mov r9, rsi                ; u64 char_index = string_length
    sub r9, 1                  ; char_index -= 1, we start from the last character
    xor rax, rax                ; u32 result = 0

    mov rcx, 1                  ; u32 digit_multiplier = 1, start at 1, multiplied by 10 for each digit

    ; while (char_index >= 0)
    .next_char:
    mov r8b, [rdi + r9]         ; char c = string[char_index]
    sub r8b, 48                 ; c -= 48
    movzx r10, r8b               ; u32 digit = c;
    imul r10, rcx               ; digit *= digit_multiplier
    add rax, r10                ; result += digit
    imul rcx, 10
    sub r9, 1                  ; char_index -= 1
    cmp r9, 0
    jge .next_char

    mov rsp, rbp
    pop rbp

    ret

_start:
    mov rdi, number
    mov rsi, 3
    call atoi

    mov rdi, rax            ; exit code 34
    mov rax, 60             ; system call code for exit
    syscall                 ; do the system call

section .data
number db "135"

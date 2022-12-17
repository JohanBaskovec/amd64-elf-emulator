section .text
global _start

atoi:
    ; rdi: u8* string
    ; esi: u64 string_length
    push rbp                    ; save current EBP
    mov rbp, rsp                ; set stack frame pointer value

    mov r9, rsi                 ; u64 char_index = string_length
    sub r9, 1                   ; char_index -= 1, we start from the last character
    xor rax, rax                ; u32 result = 0

    mov rcx, 1                  ; u32 digit_multiplier = 1, start at 1, multiplied by 10 for each digit

    .next_char:
    mov r8b, [rdi + r9]         ; char c = string[char_index]
    sub r8b, 48                 ; c -= 48
    movzx r10, r8b              ; u32 digit = c;
    imul r10, rcx               ; digit *= digit_multiplier
    add rax, r10                ; result += digit
    imul rcx, 10                ; digit_multiplier *= 10
    sub r9, 1                   ; char_index -= 1
    cmp r9, 0
    jge .next_char

    mov rsp, rbp
    pop rbp

    ret

_start:
    mov rbx, [rsp]              ; u64 argc
    lea rcx, [rsp + 8]          ; u8** argv
    mov r9, 1                   ; u64 argi = 1;
    mov r8, rbx                 ; u64 arg_space = (argc) * 8;
    imul r8, 8                  ; "
    sub rsp, r8                 ; rsp -= arg_space
                                ; creates a local variable u64 args_int[]

    .parse_arg:
    mov rdi, [rcx + r9 * 8]     ; u8* arg_string = argv[argi];
    xor rdx, rdx                ; u8 chari = 0;
    .loop_over_char:
    mov sil, [rdi + rdx]        ; u8 c = arg_string[chari]
    cmp sil, 0                  ; if (c == 0)
    je .done_parsing_arg        ; jmp .done_parsing_arg
    inc rdx                     ; chari++;
    jmp .loop_over_char

    .done_parsing_arg:
    push rcx
    push rsi
    push rdi
    push r9
    mov rsi, rdx                ; u64 num = atoi(arg_string, chari)
    call atoi                   ; "
    pop r9
    pop rdi
    pop rsi
    pop rcx
    mov qword [rsp + r9 * 8], rax ; args_int[argi] = num

    inc r9                      ; argi++;
    cmp r9, rbx                 ; if (argi == argc) {
    je  .done_parsing_args      ;   jmp .done_parsing_args
                                ; } else {
    jmp .parse_arg              ;   jmp .parse_arg
                                ; }

    .done_parsing_args:
    xor rdi, rdi                ; u64 sum = 0;
    mov r9, 1                   ; u64 argi = 1;
    .add_arg:
    add rdi, [rsp + r9 * 8]
    inc r9                      ; argi++;
    cmp r9, rbx                 ; if (argi == argc) {
    je  .return                 ;   jmp .return
                                ; } else {
    jmp .add_arg                ;   jmp .add_arg
                                ; }

    .return:
                                ; exit code is rdi (sum)
    mov rax, 60                 ; system call code for exit
    syscall                     ; do the system call

nasm -f elf64 large_division.asm && ld large_division.o -o large_division && ./large_division
echo $?
objdump -D large_division -M "intel" > large_division_decompiled
hexdump -vC large_division > large_division_hex

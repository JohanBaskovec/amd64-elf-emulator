nasm -g -F dwarf -f elf64 atoi.asm && ld atoi.o -o atoi && ./atoi
echo $?
objdump -D atoi -M "intel" > atoi_decompiled
hexdump -vC atoi > atoi_hex

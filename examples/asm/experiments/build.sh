nasm -f elf64 $1.asm && ld $1.o -o $1 && gdb ./$1
echo $?
objdump -D $1 -M "intel" > $1_decompiled
hexdump -vC $1 > $1_hex


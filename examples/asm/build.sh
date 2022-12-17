cd $1/ || exit
nasm -g -F dwarf -f elf64 $1.asm -o object_code.o && ld object_code.o -o executable
objdump -D executable -M "intel" > decompiled
hexdump -vC executable > hex
cd ..


nasm -f elf64 hello_world.asm && ld hello_world.o -o hello_world && ./hello_world
echo $?
objdump -D hello_world -M "intel" > hello_world_decompiled
hexdump -vC hello_world > hello_world_hex

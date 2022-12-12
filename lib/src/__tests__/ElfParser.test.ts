import * as fs from "fs";
import {ElfParser} from "../ElfParser";

test("parsing", () => {
   const elf = new ElfParser().parseExecutableFromPath("src/__tests__/atoi");
   expect(elf.header.sectionHeadersNumber).toBe(13);
   expect(elf.sectionHeaders).toHaveLength(13);
   expect(elf.sectionHeaders[1].name).toBe(".text");
   expect(elf.sectionHeaders[2].name).toBe(".data");
   expect(elf.sectionHeaders[12].name).toBe(".shstrtab");
});

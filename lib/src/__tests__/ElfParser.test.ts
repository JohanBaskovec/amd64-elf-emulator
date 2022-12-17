import * as fs from 'fs';
import {ElfParser} from '../ElfParser';

test('parsing', () => {
  const executableContent = fs.readFileSync('src/__tests__/atoi');
  const elf = new ElfParser().parseExecutableFromBytes(
    executableContent.buffer
  );
  expect(elf.header.sectionHeadersNumber).toBe(13);
  expect(elf.sectionHeaders).toHaveLength(13);
  expect(elf.sectionHeaders[1].name).toBe('.text');
  expect(elf.sectionHeaders[2].name).toBe('.data');
  expect(elf.sectionHeaders[12].name).toBe('.shstrtab');

  expect(elf.symbolTables).toHaveLength(18);
});

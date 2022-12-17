// "test" JS features and make sure they do what we think they do

test('DataView signs', () => {
  // Tests that writing a number into a DataView has the same effect
  // whether we use the unsigned or signed version
  const maxU16 = 65535;
  const maxI16 = 32767;
  const minI16 = -maxI16 - 1;

  {
    // With a small negative number:
    const dataView = new DataView(new ArrayBuffer(4));
    const num = -543;
    dataView.setUint16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(num);
    expect(dataView.getUint16(0, true)).toBe(maxU16 + num + 1);

    dataView.setInt16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(num);
    expect(dataView.getUint16(0, true)).toBe(maxU16 + num + 1);
  }
  {
    // With a large negative number:
    const dataView = new DataView(new ArrayBuffer(4));
    const num = minI16;
    dataView.setUint16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(num);
    expect(dataView.getUint16(0, true)).toBe(maxU16 + num + 1);

    dataView.setInt16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(num);
    expect(dataView.getUint16(0, true)).toBe(maxU16 + num + 1);
  }

  {
    // With a large signed integer:
    const dataView = new DataView(new ArrayBuffer(4));
    const num = maxI16;
    dataView.setUint16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(num);
    expect(dataView.getUint16(0, true)).toBe(num);

    dataView.setInt16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(num);
    expect(dataView.getUint16(0, true)).toBe(num);
  }

  {
    // With a large unsigned integer
    const dataView = new DataView(new ArrayBuffer(4));
    const num = maxU16;
    dataView.setUint16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(-1);
    expect(dataView.getUint16(0, true)).toBe(num);

    dataView.setInt16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(-1);
    expect(dataView.getUint16(0, true)).toBe(num);
  }

  {
    // With a negative integer that underflows 16 bits,
    // only the lowest (rightmost) bits are written when set[U]int16 is called.
    const dataView = new DataView(new ArrayBuffer(4));
    const num = minI16 - 10;
    // num = -32778, in binary: 11111111 11111111 01111111 11110110
    // This binary is written in the dataView:    01111111 11110110 (which is 32758)
    dataView.setUint16(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(32758);
  }

  {
    const dataView = new DataView(new ArrayBuffer(8));
    const num = -1n;

    dataView.setBigUint64(0, num, true);
    expect(dataView.getInt16(0, true)).toBe(-1);
    expect(dataView.getUint16(0, true)).toBe(maxU16);
  }
});

import {immediateFromJsBigIntAndWidth} from '../Instruction';
import {OperationSize} from '../amd64-architecture';

test('immediateFromJsBigIntAndWidth', () => {
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 164n,
      width: OperationSize.byte,
    });
    expect(r.valueUnsigned).toBe(164n);
    expect(r.valueSigned).toBe(-92n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 164n,
      width: OperationSize.word,
    });
    expect(r.valueUnsigned).toBe(164n);
    expect(r.valueSigned).toBe(164n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 164n,
      width: OperationSize.dword,
    });
    expect(r.valueUnsigned).toBe(164n);
    expect(r.valueSigned).toBe(164n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 164n,
      width: OperationSize.qword,
    });
    expect(r.valueUnsigned).toBe(164n);
    expect(r.valueSigned).toBe(164n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 40n,
      width: OperationSize.byte,
    });
    expect(r.valueUnsigned).toBe(40n);
    expect(r.valueSigned).toBe(40n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 40n,
      width: OperationSize.word,
    });
    expect(r.valueUnsigned).toBe(40n);
    expect(r.valueSigned).toBe(40n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 40n,
      width: OperationSize.dword,
    });
    expect(r.valueUnsigned).toBe(40n);
    expect(r.valueSigned).toBe(40n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 40n,
      width: OperationSize.qword,
    });
    expect(r.valueUnsigned).toBe(40n);
    expect(r.valueSigned).toBe(40n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 0n,
      width: OperationSize.byte,
    });
    expect(r.valueUnsigned).toBe(0n);
    expect(r.valueSigned).toBe(0n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 0n,
      width: OperationSize.word,
    });
    expect(r.valueUnsigned).toBe(0n);
    expect(r.valueSigned).toBe(0n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 0n,
      width: OperationSize.dword,
    });
    expect(r.valueUnsigned).toBe(0n);
    expect(r.valueSigned).toBe(0n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 0n,
      width: OperationSize.qword,
    });
    expect(r.valueUnsigned).toBe(0n);
    expect(r.valueSigned).toBe(0n);
  }
  {
    const r = immediateFromJsBigIntAndWidth({
      value: 33018n,
      width: OperationSize.word,
    });
    expect(r.valueUnsigned).toBe(33018n);
    expect(r.valueSigned).toBe(-32518n);
  }
});

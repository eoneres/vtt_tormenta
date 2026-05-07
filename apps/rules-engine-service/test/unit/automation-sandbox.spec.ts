import { AutomationSandbox } from '../../src/infrastructure/sandbox/automation-sandbox';

describe('AutomationSandbox', () => {
  let sandbox: AutomationSandbox;

  beforeEach(() => {
    sandbox = new AutomationSandbox();
  });

  it('executes simple code and captures result', () => {
    const { output, error } = sandbox.execute('result = 2 + 2;');
    expect(error).toBeNull();
    expect(output).toBe(4);
  });

  it('captures console.log output', () => {
    const { logs } = sandbox.execute('console.log("hello", "world");');
    expect(logs).toContain('hello world');
  });

  it('provides context variables', () => {
    const { output } = sandbox.execute('result = hp + bonus;', { hp: 10, bonus: 5 });
    expect(output).toBe(15);
  });

  it('returns error on syntax error', () => {
    const { error } = sandbox.execute('result = !!!invalid');
    expect(error).not.toBeNull();
  });

  it('blocks access to process', () => {
    const { error } = sandbox.execute('result = process.env;');
    expect(error).not.toBeNull();
  });

  it('blocks access to require', () => {
    const { error } = sandbox.execute('result = require("fs");');
    expect(error).not.toBeNull();
  });

  it('times out on infinite loop', () => {
    const { error } = sandbox.execute('while(true) {}');
    expect(error).not.toBeNull();
    expect(error).toContain('timed out');
  });

  it('uses Math functions', () => {
    const { output } = sandbox.execute('result = Math.floor(7 / 2);');
    expect(output).toBe(3);
  });
});

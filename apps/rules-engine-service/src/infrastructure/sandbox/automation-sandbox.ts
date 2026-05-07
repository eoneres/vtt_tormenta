import { createContext, runInContext, Script } from 'vm';

export interface SandboxResult {
  output: unknown;
  logs: string[];
  error: string | null;
}

const TIMEOUT_MS = 100;

/**
 * Secure sandbox for executing automation scripts.
 * Uses Node.js vm module — no access to require, process, or globals.
 */
export class AutomationSandbox {
  execute(code: string, context: Record<string, unknown> = {}): SandboxResult {
    const logs: string[] = [];

    const sandbox = createContext({
      ...context,
      Math,
      console: { log: (...args: unknown[]) => logs.push(args.map(String).join(' ')) },
      result: undefined as unknown,
    });

    try {
      const script = new Script(
        `(function() { "use strict"; ${code} })()`,
        { filename: 'automation.js', lineOffset: 0 },
      );
      script.runInContext(sandbox, { timeout: TIMEOUT_MS });

      return { output: sandbox['result'] as unknown, logs, error: null };
    } catch (err) {
      return {
        output: null,
        logs,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

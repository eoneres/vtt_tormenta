/**
 * FormulaEvaluator — safe arithmetic formula evaluator.
 *
 * Supports: +, -, *, /, floor(), ceil(), round(), min(), max()
 * Variables are injected via a context map.
 * No eval() — uses a recursive descent parser.
 */
export class FormulaEvaluator {
  evaluate(formula: string, context: Record<string, number> = {}): number {
    const tokens = this.tokenize(formula, context);
    const result = this.parseExpression(tokens);
    return result;
  }

  private tokenize(formula: string, context: Record<string, number>): (number | string)[] {
    // Replace variables first
    let resolved = formula;
    for (const [key, value] of Object.entries(context)) {
      resolved = resolved.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
    }

    const tokens: (number | string)[] = [];
    const regex = /(\d+\.?\d*|[a-z_][a-z0-9_]*|[+\-*/(),])/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(resolved)) !== null) {
      const tok = match[1]!;
      const num = parseFloat(tok);
      tokens.push(isNaN(num) ? tok : num);
    }

    return tokens;
  }

  private parseExpression(tokens: (number | string)[], pos = { i: 0 }): number {
    let left = this.parseTerm(tokens, pos);

    while (pos.i < tokens.length && (tokens[pos.i] === '+' || tokens[pos.i] === '-')) {
      const op = tokens[pos.i++] as string;
      const right = this.parseTerm(tokens, pos);
      left = op === '+' ? left + right : left - right;
    }

    return left;
  }

  private parseTerm(tokens: (number | string)[], pos: { i: number }): number {
    let left = this.parseFactor(tokens, pos);

    while (pos.i < tokens.length && (tokens[pos.i] === '*' || tokens[pos.i] === '/')) {
      const op = tokens[pos.i++] as string;
      const right = this.parseFactor(tokens, pos);
      if (op === '/' && right === 0) throw new Error('Division by zero');
      left = op === '*' ? left * right : left / right;
    }

    return left;
  }

  private parseFactor(tokens: (number | string)[], pos: { i: number }): number {
    const tok = tokens[pos.i];

    if (typeof tok === 'number') {
      pos.i++;
      return tok;
    }

    if (tok === '(') {
      pos.i++;
      const val = this.parseExpression(tokens, pos);
      if (tokens[pos.i] !== ')') throw new Error('Expected closing parenthesis');
      pos.i++;
      return val;
    }

    if (tok === '-') {
      pos.i++;
      return -this.parseFactor(tokens, pos);
    }

    if (typeof tok === 'string' && ['floor', 'ceil', 'round', 'min', 'max'].includes(tok)) {
      pos.i++;
      if (tokens[pos.i] !== '(') throw new Error(`Expected '(' after ${tok}`);
      pos.i++;
      const args: number[] = [this.parseExpression(tokens, pos)];
      while (tokens[pos.i] === ',') {
        pos.i++;
        args.push(this.parseExpression(tokens, pos));
      }
      if (tokens[pos.i] !== ')') throw new Error(`Expected ')' after ${tok} args`);
      pos.i++;

      switch (tok) {
        case 'floor': return Math.floor(args[0]!);
        case 'ceil': return Math.ceil(args[0]!);
        case 'round': return Math.round(args[0]!);
        case 'min': return Math.min(...args);
        case 'max': return Math.max(...args);
      }
    }

    throw new Error(`Unexpected token: ${String(tok)}`);
  }
}

import type { Token } from "./types";

export const KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'ORDER',
  'BY',
  'AND',
  'OR',
  'NOT',
  'LIMIT',
  'DESC',
  'ASC',
  'GROUP',
  'COUNT',
  'AS',
  'SUM',
  'AVG',
  'MAX',
  'MIN',
  'DISTINCT',
  'HAVING',
  'JOIN',
  'ON'
];

export const tokenize = (query: string): Token[] => {
  let tokens: Token[] = [];

  let current = 0;

  const peekChar = (): string => query[current + 1];

  const isDigit = (char: string): boolean => /\d/.test(char);

  const isLetter = (char: string): boolean => /^[a-z_]$/i.test(char);

  // @ts-ignore
  const peek = (): Token => tokens[current];

  const isAtEnd = (): boolean => current >= tokens.length;

  // @ts-ignore
  const advance = (): Token => {
    if (!isAtEnd()) {
      current++;
    }
    return tokens[current - 1];
  }

  while (current < query.length) {
    const char = query[current];
    if (char === ' ' || char === '\t') {
      current++;
      continue;
    }

    if (',*().'.includes(char)) {
      tokens.push({ type: 'SYMBOL', value: char });
      current++;
      continue;
    }

    if ('=><!'.includes(char)) {
      if (char === '>' && peekChar() === '=') {
        tokens.push({ type: 'OPERATOR', value: '>=' });
        current += 2;
        continue;
      }

      if (char === '<' && peekChar() === '=') {
        tokens.push({ type: 'OPERATOR', value: '<=' });
        current += 2;
        continue;
      }

      if (char === '!' && peekChar() === '=') {
        tokens.push({ type: 'OPERATOR', value: '!=' });
        current += 2;
        continue;
      }

      tokens.push({ type: 'OPERATOR', value: char });
      current++;
      continue;
    }

    if (char === '"') {
      current++;
      let val: string = '';
      while (query[current] !== '"') {
        val += query[current];
        current++;
      }
      tokens.push({ type: 'STRING', value: val });
      current++;
      continue;
    }

    if (isLetter(char)) {
      let val: string = '';
      while (isLetter(query[current]) || isDigit(query[current])) {
        val += query[current];
        current++;
      }
      if (KEYWORDS.includes(val.toUpperCase())) {
        tokens.push({ type: 'KEYWORD', value: val.toUpperCase() });
      } else if (val.toUpperCase() === 'LIKE') {
        tokens.push({ type: 'OPERATOR', value: val });
      } else {
        tokens.push({ type: 'IDENTIFIER', value: val });
      }
      continue;
    }

    if (isDigit(char)) {
      let val: string = '';
      while (isDigit(query[current]) || query[current] === '.') {
        val += query[current];
        current++;
      }
      tokens.push({ type: 'NUMBER', value: val });
      continue;
    }

    current++;
  }

  return tokens;
}

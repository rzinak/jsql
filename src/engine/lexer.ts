// {
//   type: 'KEYWORD', // ou 'IDENTIFIER', 'NUMBER', 'STRING', 'OPERATOR', 'SYMBOL'
//   value: 'SELECT'  // ou 'age', '18', 'Rio', '>=', ','
// }

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'OPERATOR'
  | 'SYMBOL'

export type Token = {
  type: TokenType;
  value: string;
}

const KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "ORDER",
  "BY",
  "AND",
  "OR",
  "NOT"
];

const tokenize = (query: string): Token[] => {
  let tokens: Token[] = [];

  let current = 0;

  const peekChar = (): string => query[current + 1];

  const isDigit = (char: string): boolean => /\d/.test(char);

  const isLetter = (char: string): boolean => /^[a-z_]$/i.test(char);

  // @ts-ignore
  const peek = (): Token => tokens[current];

  // @ts-ignore
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

    if (',*'.includes(char)) {
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
        console.log(query[current])
        val += query[current];
        current++;
      }
      if (KEYWORDS.includes(val)) {
        tokens.push({ type: 'KEYWORD', value: val });
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

const query = 'SELECT name, age FROM users WHERE age >= 18';
const t = tokenize(query);
console.log(t);

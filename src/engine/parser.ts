import type { Token, TokenType } from "./lexer";

type Where = {
  [key: string]: number | string;
}

type AST = {
  "type": "SelectStatement";
  "columns": string[];
  "from": string;
  "where": Where | null;
}

// @ts-ignore
const parse = (tokens: Token[]): AST => {
  let current = 0;
  const columns: string[] = [];

  const peek = (): Token => tokens[current];

  // @ts-ignore
  const isAtEnd = (): boolean => current >= tokens.length;

  // check current token type, but dont consume
  const check = (type: TokenType, value?: string): boolean => {
    if (isAtEnd()) return false;
    const token = peek();
    if (value && token.value !== value) return false;
    return token.type === type;
  }

  // @ts-ignore
  const advance = () => {
    if (!isAtEnd()) {
      current++;
    }
    return tokens[current - 1];
  }

  // @ts-ignore
  const consume = (type: TokenType, expectedValue?: string) => {
    if (check(type, expectedValue)) {
      return tokens[current++];
    }
    throw new Error(`Syntax error: Expected '${expectedValue || type}', but received '${peek().value}'`);
  }

  const parseColumns = () => {
    if (check('SYMBOL', '*')) {
      columns.push(consume('SYMBOL').value);
      return columns;
    } else {
      columns.push(consume('IDENTIFIER').value);
      while (check('SYMBOL', ',')) {
        consume('SYMBOL', ',');
        columns.push(consume('IDENTIFIER').value);
      }
    }
  }

  // multiple selects per file
  // while (current < tokens.length) {
  //   consume('KEYWORD', 'SELECT');
  //   parseColumns();
  //   consume('KEYWORD', 'FROM');
  //   // ...
  //   if (!check('KEYWORD', 'SELECT')) break;
  // }

  // single select per file
  consume('KEYWORD', 'SELECT');
  parseColumns();
  consume('KEYWORD', 'FROM');
  const table = consume('IDENTIFIER').value;
  let where: Where | null = null;
  if (check('KEYWORD', 'WHERE')) {
    consume('KEYWORD', 'WHERE');
    const left = consume('IDENTIFIER').value;
    const operator = consume('OPERATOR').value;
    const rightToken = consume(tokens[current].type);
    const right = rightToken.type === 'NUMBER'
      ? Number(rightToken.value)
      : rightToken.value;

    where = {
      left,
      operator,
      right
    }
  }

  return {
    "type": "SelectStatement",
    "columns": columns,
    "from": table,
    where
  }

  // return {
  //   "type": "SelectStatement",
  //   "columns": ["name", "age"], // ou ["*"]
  //   "from": "users",
  //   "where": {
  //     "type": "BinaryExpression",
  //     "left": "age",
  //     "operator": ">=",
  //     "right": 18
  //   }
  // }
}

const t: Token[] = [
  { type: 'KEYWORD', value: 'SELECT' },
  { type: 'IDENTIFIER', value: 'name' },
  { type: 'SYMBOL', value: ',' },
  { type: 'IDENTIFIER', value: 'age' },
  { type: 'KEYWORD', value: 'FROM' },
  { type: 'IDENTIFIER', value: 'users' },
  { type: 'KEYWORD', value: 'WHERE' },
  { type: 'IDENTIFIER', value: 'age' },
  { type: 'OPERATOR', value: '>=' },
  { type: 'NUMBER', value: '18' }
]

// const t: Token[] = [
//   { type: 'KEYWORD', value: 'SELECT' },
//   { type: 'SYMBOL', value: '*' },
//   { type: 'KEYWORD', value: 'FROM' },
//   { type: 'IDENTIFIER', value: 'users' }
// ]

console.log(JSON.stringify(parse(t), null, 2));

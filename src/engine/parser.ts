import type { AST, Operator, Order, Token, TokenType, Where } from "./types";

export const parse = (tokens: Token[]): AST => {
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
    const operator = (consume('OPERATOR').value) as Operator;
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

  // TODO: add support for ORDER without providing a direction e.g. ORDER BY id (without passing ASC or DESC)
  let order: Order | null = null;
  if (check('KEYWORD', 'ORDER')) {
    consume('KEYWORD', 'ORDER');
    if (check('KEYWORD', 'BY')) {
      consume('KEYWORD', 'BY');
      const prop = (consume('IDENTIFIER').value);
      if (check('KEYWORD', 'ASC') || check('KEYWORD', 'DESC')) {
        const direction = (consume('KEYWORD').value) as "ASC" | "DESC";
        order = {
          type: "OrderSpecification",
          prop,
          direction
        }
      } else {
        order = {
          type: "OrderSpecification",
          prop,
          direction: null
        }
      }
    }
  }

  let limit: number | null = null;
  if (check('KEYWORD', 'LIMIT')) {
    consume('KEYWORD', 'LIMIT');
    limit = Number((consume('NUMBER').value));
  }

  // console.log({
  //   "type": "SelectStatement",
  //   "columns": columns,
  //   "from": table,
  //   where,
  //   order,
  //   limit
  // });

  return {
    "type": "SelectStatement",
    "columns": columns,
    "from": table,
    where,
    order,
    limit
  }

  // TODO: also gotta make order to be an array to allow ordering by multiple properties
  //
  // "order": [
  //   {
  //     "type": "OrderSpecification",
  //     "by": {
  //       "type": "ColRef",
  //       "prop or name": "column_name"
  //     },
  //     "direction": "ASC"
  //   },
  //   {
  //     "type": "OrderSpecification",
  //     "by": {
  //       "type": "ColRef",
  //       "prop or name": "column_name"
  //     },
  //     "direction": "ASC"
  //   },
  // ]

  // return {
  //   "type": "SelectStatement",
  //   "columns": ["name", "age"], // ou ["*"]
  //   "from": "users",
  //   "where": {
  //     "type": "BinaryExpression",
  //     "left": "age",
  //     "operator": ">=",
  //     "right": 18
  //   },
  //   "order": {
  //     "type": "OrderSpecification",
  //     "prop": "id",
  //     "direction": "ASC" | "DESC" | null
  //   }
  //   "limit": 1
  // }
}

// const t: Token[] = [
//   { type: 'KEYWORD', value: 'SELECT' },
//   { type: 'IDENTIFIER', value: 'name' },
//   { type: 'SYMBOL', value: ',' },
//   { type: 'IDENTIFIER', value: 'age' },
//   { type: 'KEYWORD', value: 'FROM' },
//   { type: 'IDENTIFIER', value: 'users' },
//   { type: 'KEYWORD', value: 'WHERE' },
//   { type: 'IDENTIFIER', value: 'age' },
//   { type: 'OPERATOR', value: '>=' },
//   { type: 'NUMBER', value: '18' }
// ]

// const t: Token[] = [
//   { type: 'KEYWORD', value: 'SELECT' },
//   { type: 'SYMBOL', value: '*' },
//   { type: 'KEYWORD', value: 'FROM' },
//   { type: 'IDENTIFIER', value: 'users' }
// ]

// console.log(JSON.stringify(parse(t), null, 2));

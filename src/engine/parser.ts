import type { AST, LogicalOperator, Operator, Order, Token, TokenType, WhereExpression } from "./types";

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

  const parseSelect = () => {
    consume('KEYWORD', 'SELECT');
    return parseColumns();
  };

  const parseColumns = () => {
    if (check('SYMBOL', '*')) {
      columns.push(consume('SYMBOL').value);
    } else {
      columns.push(consume('IDENTIFIER').value);
      while (check('SYMBOL', ',')) {
        consume('SYMBOL', ',');
        columns.push(consume('IDENTIFIER').value);
      }
    }
    return columns;
  }

  const parseFrom = () => {
    consume('KEYWORD', 'FROM');
    return consume('IDENTIFIER').value;
  }

  const parseComparison = (): WhereExpression => {
    const left = consume('IDENTIFIER').value;
    const operator = (consume('OPERATOR').value) as Operator;
    const rightToken = consume(tokens[current].type);
    const right = rightToken.type === 'NUMBER'
      ? Number(rightToken.value)
      : rightToken.value;
    return {
      type: "Comparison",
      left,
      operator,
      right
    };
  }

  const parseExpression = (): WhereExpression => {
    let left = parseComparison();
    while (check('KEYWORD', 'AND') || check('KEYWORD', 'OR')) {
      const operator = consume('KEYWORD').value as LogicalOperator;
      let right = parseExpression();
      left = {
        type: 'Logical',
        operator,
        left,
        right
      }
    }

    return left;
  }

  const parseWhere = () => {
    if (check('KEYWORD', 'WHERE')) {
      consume('KEYWORD', 'WHERE');
      return parseExpression();
    }
    return null;
  }

  const parseOrder = (): Order[] | null => {
    if (check('KEYWORD', 'ORDER')) {
      consume('KEYWORD', 'ORDER');
      consume('KEYWORD', 'BY');
      const orders: Order[] = [];
      while (true) {
        const prop = consume('IDENTIFIER').value;
        if (check('KEYWORD', 'ASC') || check('KEYWORD', 'DESC')) {
          const direction = (consume('KEYWORD').value) as "ASC" | "DESC";
          orders.push({
            type: "OrderSpecification",
            prop,
            direction
          });

        } else {
          orders.push({
            type: "OrderSpecification",
            prop,
            direction: "ASC"
          });
        }
        if (check('SYMBOL', ',')) {
          consume('SYMBOL', ',');
        } else {
          break;
        }
      }
      return orders;
    }
    return null;
  }

  const parseLimit = () => {
    if (check('KEYWORD', 'LIMIT')) {
      consume('KEYWORD', 'LIMIT');
      return Number(consume('NUMBER').value);
    }
    return null;
  }

  const ast: AST = {
    select: parseSelect() ?? [],
    from: parseFrom(),
    where: parseWhere(),
    order: parseOrder(),
    limit: parseLimit()
  };

  return ast;
}

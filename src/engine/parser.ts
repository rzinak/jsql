import { KEYWORDS } from "./lexer";
import type {
  AST,
  Operator,
  Order,
  SelectItem,
  Token,
  TokenType,
  WhereExpression,
} from "./types";

export const parse = (tokens: Token[]): AST => {
  let current = 0;
  const selectColumns: SelectItem[] = [];

  const peek = (ahead?: number): Token =>
    tokens[ahead ? current + ahead : current];

  const isAtEnd = (): boolean => current >= tokens.length;

  // check current token type, but dont consume
  const check = (type: TokenType, value?: string): boolean => {
    if (isAtEnd()) return false;
    const token = peek();
    if (value && token.value !== value) return false;
    return token.type === type;
  };

  const consume = (type: TokenType, expectedValue?: string) => {
    if (check(type, expectedValue)) {
      return tokens[current++];
    }

    throw new Error(
      `Syntax error: Expected '${expectedValue || type}', but received '${peek().value}'`,
    );
  };

  const parseSelect = () => {
    consume("KEYWORD", "SELECT");
    return parseColumns();
  };

  const parseColumns = () => {
    if (check("SYMBOL", "*")) {
      selectColumns.push({ type: "ColumnRef", name: consume("SYMBOL").value });
    } else {
      let currToken = consume("IDENTIFIER").value;
      if (peek().value === "(") {
        consume("SYMBOL").value;
        selectColumns.push({
          type: "AggregateExpr",
          name: currToken,
          arg: consume("STRING").value,
        });
      } else {
          let alias: string | null = null;
          if (check("KEYWORD", "AS")) {
            consume("KEYWORD", "AS");
            alias = consume("IDENTIFIER").value;
          }
        selectColumns.push({
          type: "ColumnRef",
          name: currToken,
          alias
        });
      }

      while (check("SYMBOL", ",")) {
        consume("SYMBOL", ",");
        if (tokens[current].type === 'KEYWORD') {
        currToken = consume("KEYWORD").value;
        } else {
        currToken = consume("IDENTIFIER").value;
        }
        
        if (peek().value === "(") {
          consume("SYMBOL", "(");
          const arg = consume("SYMBOL").value;
          consume("SYMBOL", ")");
          let alias: string | null = null;
          if (check("KEYWORD", "AS")) {
            consume("KEYWORD", "AS");
            alias = consume("IDENTIFIER").value;
          }
          selectColumns.push({
            type: "AggregateExpr",
            name: currToken,
            arg,
            alias
          });
        } else {
          let alias: string | null = null;
          if (check("KEYWORD", "AS")) {
            consume("KEYWORD", "AS");
            alias = consume("IDENTIFIER").value;
          }
          selectColumns.push({
            type: "ColumnRef",
            name: currToken,
            alias
          });
        }
      }

      
    }
    return selectColumns;
  };

  const parseFrom = () => {
    consume("KEYWORD", "FROM");
    return consume("IDENTIFIER").value
  };

  const parseComparison = (): WhereExpression => {
    const left = consume("IDENTIFIER").value;
    const operator = consume("OPERATOR").value as Operator;
    const rightToken = peek();

    let right: string | number | boolean | null;

    if (rightToken.type === "NUMBER") {
      right = Number(consume("NUMBER").value);
    } else if (rightToken.type === "STRING") {
      right = consume("STRING").value;
    } else if (
      rightToken.type === "KEYWORD" ||
      rightToken.type === "IDENTIFIER"
    ) {
      const val = rightToken.value.toLowerCase();

      if (val === "true") {
        consume(rightToken.type);
        right = true;
      } else if (val === "false") {
        consume(rightToken.type);
        right = false;
      } else {
        right = consume(rightToken.type).value;
      }
    } else {
      right = consume(rightToken.type).value;
    }

    return {
      type: "Comparison",
      left,
      operator,
      right,
    };
  };

  const parseUnary = (): WhereExpression => {
    if (check("KEYWORD", "NOT")) {
      consume("KEYWORD", "NOT");
      const operand = parseUnary();
      return { type: "LogicalUnary", operator: "NOT", operand };
    }
    return parseComparison();
  };

  // higher precedence than OR
  const parseAndExpression = (): WhereExpression => {
    let expression = parseUnary();

    while (check("KEYWORD", "AND")) {
      const operator = consume("KEYWORD", "AND").value as "AND";
      const right = parseUnary();
      expression = { type: "LogicalBinary", operator, left: expression, right };
    }
    return expression;
  };

  const parseWhereExpression = (): WhereExpression => {
    let expression = parseAndExpression();

    while (check("KEYWORD", "OR")) {
      const operator = consume("KEYWORD", "OR").value as "OR";
      const right = parseAndExpression();
      expression = { type: "LogicalBinary", operator, left: expression, right };
    }
    return expression;
  };

  const parseWhere = () => {
    if (check("KEYWORD", "WHERE")) {
      consume("KEYWORD", "WHERE");
      return parseWhereExpression();
    }
    return null;
  };

  const parseGroupBy = (): string[] | null => {
    if (check("KEYWORD", "GROUP")) {
      consume("KEYWORD", "GROUP");
      consume("KEYWORD", "BY");
      const groupByColumns: string[] = [];
      groupByColumns.push(consume("IDENTIFIER").value);
      while (check("SYMBOL", ",")) {
        consume("SYMBOL", ",");
        groupByColumns.push(consume("IDENTIFIER").value);
      }
      return groupByColumns;
    }
    return null;
  };

  const parseOrder = (): Order[] | null => {
    if (check("KEYWORD", "ORDER")) {
      consume("KEYWORD", "ORDER");
      consume("KEYWORD", "BY");
      const orders: Order[] = [];
      while (true) {
        const prop = consume("IDENTIFIER").value;
        if (check("KEYWORD", "ASC") || check("KEYWORD", "DESC")) {
          const direction = consume("KEYWORD").value as "ASC" | "DESC";
          orders.push({
            type: "OrderSpecification",
            prop,
            direction,
          });
        } else {
          orders.push({
            type: "OrderSpecification",
            prop,
            direction: "ASC",
          });
        }
        if (check("SYMBOL", ",")) {
          consume("SYMBOL", ",");
        } else {
          break;
        }
      }
      return orders;
    }
    return null;
  };

  const parseLimit = () => {
    if (check("KEYWORD", "LIMIT")) {
      consume("KEYWORD", "LIMIT");
      return Number(consume("NUMBER").value);
    }
    return null;
  };

  const ast: AST = {
    select: parseSelect() ?? [],
    from: parseFrom(),
    where: parseWhere(),
    groupBy: parseGroupBy() ?? [],
    order: parseOrder(),
    limit: parseLimit(),
  };

  console.log('ast:',ast);
  return ast;
};

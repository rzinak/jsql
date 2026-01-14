import type {
  AST,
  ColumnPath,
  From,
  Operator,
  Order,
  SelectItem,
  Token,
  TokenType,
  WhereExpression,
} from './types';

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
    consume('KEYWORD', 'SELECT');
    return parseColumns();
  };

  const parseAggregateExpr = (functionName: string, selectColumns: SelectItem[]) => {
    consume("SYMBOL", "(");
    let distinct: boolean = false;
    if (check('KEYWORD', 'DISTINCT')) {
      consume('KEYWORD', 'DISTINCT');
      distinct = true;
    }

    const ref = parseColumnPath();
    let AggregateExprName = functionName;
    
    consume('SYMBOL', ')');
    let alias: string | null = null;
    if (check('KEYWORD', 'AS')) {
      consume('KEYWORD', 'AS');
      alias = consume('IDENTIFIER').value;
    }
    selectColumns.push({
      type: 'AggregateExpr',
      ref,
      name: AggregateExprName,
      alias,
      distinct
    });
  }

  const parseColumnRef = (selectColumns: SelectItem[]) => {
    const ref = parseColumnPath();
    let alias: string | null = null;
    if (check('KEYWORD', 'AS')) {
      consume('KEYWORD', 'AS');
      alias = consume("IDENTIFIER").value;
    }
    const columnName = ref.path[ref.path.length - 1];
    selectColumns.push({
      type: 'ColumnRef',
      ref,
      columnName, 
      alias
    });
  }
  
  const parseColumns = () => {
    if (check('SYMBOL', '*')) {
      selectColumns.push({
        type: 'ColumnRef',
        ref: {
          tableAlias: null,
          path: ['*'],
        },
        columnName: consume('SYMBOL').value,
        alias: null,
      })
    } else {
      // we cant start the select with either an identifier or aggregate function
      if (peek(1).value === '(') {
        const identifier =  consume('KEYWORD').value;
        parseAggregateExpr(identifier, selectColumns)
      } else {
        parseColumnRef(selectColumns); 
      }

      while (check('SYMBOL', ',')) {
        consume('SYMBOL', ',');
        
        if (peek(1).value === '(') {
          const identifier = consume('KEYWORD').value;
          parseAggregateExpr(identifier, selectColumns);
        } else {
          parseColumnRef(selectColumns);
        }
      }
    }
    return selectColumns;
  };

  const parseFrom = (): From => {
    consume("KEYWORD", "FROM");
    const table = consume("IDENTIFIER").value;
    if (!isAtEnd() && peek().type !== 'KEYWORD') {
      return {
        table,
        alias: consume("IDENTIFIER").value
      }
    }
    return {
      table,
      alias: null
    }
  };
  
  const parseJoin = () => null;

  const parseComparison = (): WhereExpression => {
    const left = parseColumnPath();
    const operator = consume("OPERATOR").value as Operator;
    const rightToken = peek();

    let right: string | number | boolean | null;

    if (rightToken.type === "NUMBER") {
      right = Number(consume("NUMBER").value);
    } else if (rightToken.type === "STRING") {
      right = consume("STRING").value;
    } else if (rightToken.type === "KEYWORD" || rightToken.type === "IDENTIFIER") {
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

  const parseGroupBy = (): ColumnPath[] | null => {
    if (check("KEYWORD", "GROUP")) {
      consume("KEYWORD", "GROUP");
      consume("KEYWORD", "BY");

      const groupByColumns: ColumnPath[] = [];
      
      groupByColumns.push(parseColumnPath());

      while (check("SYMBOL", ",")) {
        consume("SYMBOL", ",");
        groupByColumns.push(parseColumnPath());
      }

      return groupByColumns;
    }
    return null;
  };
  
  const parseColumnPath = (): ColumnPath => {
    if (check('SYMBOL')) {
      return {
        tableAlias: null,
        path: [consume('SYMBOL').value]
      }
    }

    const parts: string[] = [consume('IDENTIFIER').value];
    
    while (check('SYMBOL', '.')) {
      consume('SYMBOL', '.');
      parts.push(consume('IDENTIFIER').value);
    }
    
    return {
      tableAlias: null,
      path: parts
    }
  }

  const parseHaving = () => {
    if (check("KEYWORD", "HAVING")) {
      consume("KEYWORD", "HAVING");

      let expression = parseAndExpression();

      while (check("KEYWORD", "OR")) {
        const operator = consume("KEYWORD", "OR").value as "OR";
        const right = parseAndExpression();
        expression = { type: "LogicalBinary", operator, left: expression, right };
      }
      return expression;
    }
    return null;
  }

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
    joins: parseJoin(),
    where: parseWhere(),
    groupBy: parseGroupBy() ?? [],
    having: parseHaving(),
    order: parseOrder(),
    limit: parseLimit(),
  };

  return ast;
};

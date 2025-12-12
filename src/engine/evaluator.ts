import type { AST, LogicalOperator, Operator, Order, WhereExpression } from "./types";

export type DataRow = Record<string, any>;

const operators: Record<Operator, (a: number | string, b: number | string) => boolean> = {
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '=': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
}

const logicalOperators: Record<LogicalOperator, (a: boolean, b: boolean) => boolean> = {
  'AND': (a, b) => a && b,
  'OR': (a, b) => a || b,
  'NOT': (a, _b) => !a
}

const evaluateWhereExpression = (expression: WhereExpression, row: DataRow): boolean => {
  if (expression.type === 'Comparison') {
    // handles the base case (ComparisonExpression)
    const { left, operator, right } = expression;

    const leftVal = row[left];
    const opFunction = operators[operator];

    if (!opFunction) {
      throw new Error(`Unknown operator: ${operator}`);
    }

    return opFunction(leftVal, right);
  } else if (expression.type === 'Logical') {
    // handles the recursive case (LogicalExpression)
    const { operator, left, right } = expression;

    const leftResult: boolean = evaluateWhereExpression(left, row);
    const rightResult: boolean = evaluateWhereExpression(right, row);
    const logicalFunction = logicalOperators[operator];

    if (!logicalFunction) {
      throw new Error(`Unknown logical operator: ${operator}`);
    }

    return logicalFunction(leftResult, rightResult);
  }

  throw new Error(`Unknown expression type: ${(expression as any).type}`);
}

const applyOrdering = (result: DataRow[], orders: Order[] | null): DataRow[] => {
  if (!orders || orders.length === 0) {
    return result;
  }

  result.sort((a, b) => {
    for (const order of orders) {
      const prop = order.prop;
      const direction = order.direction;

      const valA = a[prop];
      const valB = b[prop];

      if (valA < valB) return direction === 'ASC' ? -1 : 1;
      if (valA > valB) return direction === 'ASC' ? 1 : -1;
    }

    return 0;
  });

  return result;
}

export const evaluate = (ast: AST, data: any[]) => {
  console.log('ast:', ast);

  let result = data;

  if (ast.where) {
    result = result.filter((row) => evaluateWhereExpression(ast.where!, row));
  }

  result = applyOrdering(result, ast.order);

  if (!(ast.select.length === 1 && ast.select[0] === '*')) {
    result = result.map((row) => {
      const newRow: any = {};
      ast.select.forEach((col) => {
        if (row.hasOwnProperty(col)) {
          newRow[col] = row[col];
        }
      });
      return newRow;
    });
  }

  if (ast.limit) {
    result = result.slice(0, ast.limit);
  }

  return result
}

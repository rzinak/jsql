import type { AST, LogicalOperator, Operator, Order, WhereExpression } from "./types";

export type DataRow = Record<string, any>;

const operators: Record<Operator, (a: number | string | boolean, b: number | string | boolean) => boolean> = {
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '=': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  'LIKE': (a, b) => {
    const regexBody = String(b)
      .replace(/[.*?^${}()|[\]\\]/g, '\\%&')
      .replace(/%/g, '.*')
      .replace(/_/g, '.');
    const regex = new RegExp(`^${regexBody}$`, 'i');
    return regex.test(String(a));
  }
}

const logicalOperators: Record<LogicalOperator, (a: boolean, b: boolean) => boolean> = {
  'AND': (a, b) => a && b,
  'OR': (a, b) => a || b,
  'NOT': (a, _b) => !a
}

const resolvePath = (obj: any, path: string): number | string => {
  return path.split('.').reduce((acc, part) => {
    return acc && acc[part];
  }, obj);
}

const evaluateWhereExpression = (expression: WhereExpression, row: DataRow): boolean => {
  if (expression.type === 'Comparison') {
    const { left, operator, right } = expression;
    const leftVal = resolvePath(row, left);
    const opFunction = operators[operator];

    if (!opFunction) {
      throw new Error(`Unknown operator: ${operator}`);
    }

    return opFunction(leftVal, right);
  } else if (expression.type === 'LogicalBinary') {
    // handles the recursive case (LogicalExpression)
    const { operator, left, right } = expression;

    const leftResult: boolean = evaluateWhereExpression(left, row);
    const rightResult: boolean = evaluateWhereExpression(right, row);
    const logicalFunction = logicalOperators[operator];

    if (!logicalFunction) {
      throw new Error(`Unknown logical operator: ${operator}`);
    }

    return logicalFunction(leftResult, rightResult);
  } else if (expression.type === 'LogicalUnary') {
    const { operand } = expression;
    return !evaluateWhereExpression(operand, row);
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
  let result = data;

  if (ast.where) {
    result = result.filter((row) => evaluateWhereExpression(ast.where!, row));
  }

  result = applyOrdering(result, ast.order);

  if (ast.limit) {
    result = result.slice(0, ast.limit);
  }

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

  return result
}

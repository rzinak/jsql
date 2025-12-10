import type { AST, Operator } from "./types";

const operations: Record<Operator, (a: number | string, b: number | string) => boolean> = {
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '=': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
}

export const evaluate = (ast: AST, data: any[]) => {
  let result = data;

  if (ast.where) {
    const where = ast.where;
    const opFunc = operations[where.operator];

    if (!opFunc) {
      throw new Error(`unknown operator: ${where.operator}`);
    }

    result = result.filter((row) => {
      const leftVal = row[where.left];
      const rightVal = where.right;
      return opFunc(leftVal, rightVal);
    });
  }

  if (ast.columns[0] === '*') {
    if (ast.order && ast.order.direction === 'ASC') {
      const prop = ast.order.prop;
      result.sort((a, b) => a[prop] - b[prop]);
    } else if (ast.order && ast.order.direction === 'DESC') {
      const prop = ast.order.prop;
      result.sort((a, b) => b[prop] - a[prop]);
    }

    if (ast.limit) {
      return result.slice(0, ast.limit);
    } else {
      return result;
    }
  } else {
    result = result.map((row) => {
      const newRow: any = {}
      ast.columns.forEach((col) => {
        if (row.hasOwnProperty(col)) {
          newRow[col] = row[col];
        }
      });
      return newRow;
    });

    if (ast.limit) {
      return result.slice(0, ast.limit);
    } else {
      return result;
    }
  }
}

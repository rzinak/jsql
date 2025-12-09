import type { AST } from "./parser";

export type Operator = '>' | '<' | '=' | '!=' | '>=' | '<=';

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
    return result;
  } else {
    return result.map((row) => {
      const newRow: any = {}
      ast.columns.forEach((col) => {
        if (row.hasOwnProperty(col)) {
          newRow[col] = row[col];
        }
      });
      return newRow;

    });
  }
}

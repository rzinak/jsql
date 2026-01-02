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

// const resolvePath = (obj: unknown, path: { name: string }): number | string => {
//   console.log('obj:', obj);
//   console.log('path:', path);
//   console.log(1);
//   const val = path.name
//     .split('.')
//     .reduce((acc: unknown, part: string) => {
//       if (acc == null || typeof acc !== 'object') {
//         return undefined;
//       }
//       return (acc as Record<string, unknown>)[part];
//     }, obj);
//   console.log(2);
//
//   if (typeof val === 'string' || typeof val === 'number') {
//     return val;
//   }
//   console.log(3);
//
//   throw new Error(`Path ${path.name} does not resolve to a valid value. got ${typeof val}`);
// }

const resolvePath = (obj: any, path: string): number | string => {
  // console.log('obj:', obj);
  // console.log('path:', path);
  return path.split('.').reduce((acc, part) => {
    return acc && acc[part];
  }, obj);
}

const evaluateWhereExpression = (expression: WhereExpression, row: DataRow): boolean => {
  // console.log('expression; ', expression);
  // console.log('row; ', row);

  if (expression.type === 'Comparison') {
    const { left, operator, right } = expression;
    // console.log('left: ', left);
    // console.log('operator: ', operator);
    // console.log('right: ', right);
    const leftVal = resolvePath(row, left);
    // console.log('leftVal: ', leftVal);
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

const applyGrouping = (result: DataRow[], columns: string[]) => {
  console.log(result);
  const map: { [key: string]: DataRow[] } = {};
  console.log('columns:', columns);
  result.forEach((line) => {
    let key = line[columns.join('-')];
    console.log('line:', line[key]);
    if (!map[key]) {
      map[key] = [line];
    } else {
      map[key].push(line);
    }
  });
  // const map = new Map<string, DataRow[]>();
  // result.forEach((line) => {
  //   let key = columns.join('-');
  //   if (map.has(key)) {
  //     map.set
  //   }
  // });
  console.log('map:', map);

  const newRows = [];

  for (const col of columns) {
    for (const key in map) {
      console.log('col:', col);
      console.log('key:', key);
      newRows.push({ [col]: key });
    }
  }

  return newRows;
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

const buildObj = (path: string, value: any, obj: any = {}) => {
  const keys = path.split('.');
  let current: any = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (i === keys.length - 1) {
      current[key] = value;
    } else {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
  }
  return obj;
}

export const evaluate = (ast: AST, data: any[]) => {
  let result = data;

  if (ast.where) {
    result = result.filter((row) => evaluateWhereExpression(ast.where!, row));
  }

  if (ast.groupBy) {
    result = applyGrouping(result, ast.groupBy);
  }

  console.log('result after grouping:', result);

  result = applyOrdering(result, ast.order);

  if (ast.limit) {
    result = result.slice(0, ast.limit);
  }

  // if (!(ast.select.length === 1) && ast.select[0].name !== '*' && !ast.groupBy) {
  if (ast.select[0].name !== '*' && !ast.groupBy) {
    console.log('result inside select:', result);
    result = result.map((row) => {
      const newRow: any = {};
      ast.select.forEach((col) => {
        const objValue = resolvePath(row, col.name);
        const obj = buildObj(col.name, objValue);
        if (row.hasOwnProperty(Object.keys(obj))) {
          newRow[Object.keys(obj)[0]] = Object.values(obj)[0];
        } else if (row.hasOwnProperty(col)) {
          newRow[col.name] = row[col.name];
        }
      });
      return newRow;
    });
  }

  return result
}

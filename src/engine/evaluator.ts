import type { AggregateItem, AST, HavingExpression, LogicalOperator, Operator, Order, SelectItem, WhereExpression } from "./types";

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

const evaluateHavingExpression = (expression: HavingExpression, row: DataRow): boolean => {
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

const calculateAggrCount = (item: AggregateItem, rows: DataRow[]) => {
  if (item.arg === '*') {
    return rows.length;
  } else {
    if (item.distinct) {
      // following sql behavior, distinct also ignores null values
      const filteredRows = rows.filter(row => resolvePath(row, item.arg) !== null);
      return new Set(filteredRows.map(row => resolvePath(row, item.arg))).size;
    }
    return rows.filter(row => row[item.arg] !== null).length;
  }
}

const calculateAggrSum = (item: AggregateItem, rows: DataRow[]) => rows.reduce((acc: number, row: DataRow) => acc + Number(resolvePath(row, item.arg)), 0);

const calculateAggregate = (item: AggregateItem, rows: DataRow[]) => {
  switch (item.name) {
    case 'COUNT':
      return calculateAggrCount(item, rows);
    case 'SUM':
      return calculateAggrSum(item, rows);
    case 'AVG':
      return Number(calculateAggrSum(item, rows)) / calculateAggrCount(item, rows);
    case 'MIN':
      return rows.reduce((min, row) => {
        const value = Number(resolvePath(row, item.arg));
        if (value < min) {
          return value;
        }
        return min;
      }, Infinity);
    case 'MAX':
      return rows.reduce((max, row) => {
        const value = Number(resolvePath(row, item.arg));
        if (value > max) {
          return value;
        }
        return max;
      }, -Infinity);
    default:
      throw new Error(`Unrecognized aggregate function '${item.name}'`);
  }
}

const applyGrouping = (result: DataRow[], groupByColumns: string[], selectItems: SelectItem[]) => {
  if (groupByColumns.length === 0) {
    return result;
  }

  const groups: { [key: string]: DataRow[] } = {};

  result.forEach(row => {
    const groupKey = groupByColumns.map(colName => resolvePath(row, colName)).join('-');

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(row);
  });

  const finalResult = Object.keys(groups).map(key => {
    let groupRows = groups[key];
    const firstRow = groupRows[0];
    const newRow: { [key: string]: string | number } = {};

    selectItems.forEach(item => {
      if (item.type === 'ColumnRef') {
        item.alias
          ? newRow[item.alias] = resolvePath(firstRow, item.name)
          : newRow[item.name] = resolvePath(firstRow, item.name);
      } else if (item.type === 'AggregateExpr') {
        const value = calculateAggregate(item, groupRows);
        const colName = `${item.name}(${item.arg})`;
        item.alias
          ? newRow[item.alias] = value
          : newRow[colName] = value;
      }
    });
    return newRow;
    // i added this filter because i didn't find another way of removing null values from the result
    // if COUNT receives a column instead of '*'.
    // gotta keep this in mind in case it causes problems in the future for other aggregate functions
    // if that happens, i prob have to change the way i pass the result value around the code...
    // it works because i return the length of 'rows' after filtering for non null values in the
    // 'calculateAggregate' function, so here i filter them out.
  }).filter(row => Object.values(row).some(val => val !== 0 && val !== null));
  return finalResult;
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
  console.log('result:',result);

  if (ast.where) {
    result = result.filter((row) => evaluateWhereExpression(ast.where!, row));
  }

  if (ast.groupBy) {
    result = applyGrouping(result, ast.groupBy, ast.select);
  }

  if (ast.having) {
    result = result.filter((row) => evaluateHavingExpression(ast.having!, row));
  }

  result = applyOrdering(result, ast.order);

  if (ast.limit) {
    result = result.slice(0, ast.limit);
  }
  


  if (ast.select[0].name !== '*' && !ast.groupBy) {
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

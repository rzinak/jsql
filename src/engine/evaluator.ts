import type { AggregateItem, AST, ColumnPath, HavingExpression, Join, LogicalOperator, Operator, Order, SelectItem, WhereExpression } from "./types";

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



const verifyTableAlias = (selectItems: SelectItem[], validAliases: string[]) => {
  selectItems.forEach(item => {
    const usedAlias = item.ref.tableAlias;
    if (usedAlias && !validAliases.includes(usedAlias)) {
      console.error(`Table or Alias '${usedAlias}' was not found.`);
    }
    // if the provided tableAlias doesnt match the tableAlies inside From,
    // i assume its a column, instead of throwing an error
    /*  if (item.ref.tableAlias && item.ref.tableAlias !== fromItems.alias) {
      if (fromItems.alias === null && item.ref.tableAlias) {
        throw new Error(`Error when evaluating table alias '${item.ref.tableAlias}'. Are you sure a table with this alias exist?`);
      }

      const itemName =
        item.type === 'AggregateExpr'
          ? item.name
          : item.columnName;
      console.warn(`Error when evaluating '${item.ref.tableAlias}.${itemName!}', there is no table with the alias '${item.ref.tableAlias}'. Did you mean '${fromItems.alias}.${itemName}'?`);
      console.warn(`Anyway, now assuming that '${item.ref.tableAlias}' is a column!`);
      // throw new Error(`Error when evaluating '${item.ref.tableAlias}.${itemName!}', there is no table with the alias '${item.ref.tableAlias}'. Did you mean '${fromItems.alias}.${itemName}'?`)
      item.ref.tableAlias = null;
    } */
  });
}

const evaluateWhereExpression = (expression: WhereExpression, row: DataRow): boolean => {
  if (expression.type === 'Comparison') {
    const { left, operator, right } = expression;
    const leftVal = resolvePath(row, left);
    let rightVal;

    if (typeof right === 'object' && right !== null && 'path' in right) {
      rightVal = resolvePath(row, right);
      // console.log('rightVal;',rightVal);
    } else {
      rightVal = right;
    }

    const opFunction = operators[operator];
    if (!opFunction) {
      throw new Error(`Unknown operator: ${operator}`);
    }
    
    if (leftVal && rightVal) {
      return opFunction(leftVal, rightVal);
    }

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
    let rightVal;

    if (typeof right === 'object' && right !== null && 'path' in right) {
      rightVal = resolvePath(row, right);
    } else {
      rightVal = right;
    }

    const opFunction = operators[operator];

    if (!opFunction) {
      throw new Error(`Unknown operator: ${operator}`);
    }

    if (leftVal && rightVal) {
      return opFunction(leftVal, rightVal);
    }

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
  if (item.ref.path[0] === '*') {
    return rows.length;
  } else {
    if (item.distinct) {
      // following sql behavior, distinct also ignores null values
      const filteredRows = rows.filter(row => resolvePath(row, item.ref) !== null);
      return new Set(filteredRows.map(row => resolvePath(row, item.ref))).size;
    }
    return rows.filter(row => row[[...item.ref.path].join('.')] !== null).length;
  }
}

const calculateAggrSum = (item: AggregateItem, rows: DataRow[]) => rows.reduce((acc: number, row: DataRow) => acc + Number(resolvePath(row, item.ref)), 0);

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
        const value = Number(resolvePath(row, item.ref));
        if (value < min) {
          return value;
        }
        return min;
      }, Infinity);
    case 'MAX':
      return rows.reduce((max, row) => {
        const value = Number(resolvePath(row, item.ref));
        if (value > max) {
          return value;
        }
        return max;
      }, -Infinity);
    default:
      throw new Error(`Unrecognized aggregate function '${item.name}'`);
  }
}

const applyGrouping = (result: DataRow[], groupByColumns: ColumnPath[], selectItems: SelectItem[]) => {
  if (groupByColumns.length === 0) {
    return result;
  }

  const groups: { [key: string]: DataRow[] } = {};
  
  result.forEach(row => {
    const groupKey = groupByColumns
      .map(colPath => {
        const val = resolvePath(row, colPath);
        return typeof val === 'object' ? JSON.stringify(val) : val;
      }).join('-');
    
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
      const val = item.type === 'ColumnRef'
        ? resolvePath(firstRow, item.ref)
        : calculateAggregate(item, groupRows);
      
      if (item.type === 'ColumnRef') {
        const nested = item.ref.path.reduceRight((acc, key) => ({ [key]: acc }), val as any);
        Object.assign(newRow, nested);
      }

      if (item.type === 'AggregateExpr') {
        const nested = item.ref.path.reduceRight((acc, key) => ({ [key]: acc }), val as any);
        Object.assign(newRow, nested);
        if (item.alias) {
          newRow[item.alias] = val;
        }
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
 
const resolvePath = (row: any, colPath: ColumnPath): number | string => {
  let current;
  let finalPath = [...colPath.path];
  
  if (colPath.tableAlias) {
    current = row[colPath.tableAlias];
    if (finalPath[0] === colPath.tableAlias) {
      finalPath.shift();
    }
  } else {
    const keys = Object.keys(row);
    if (keys.length === 1 && row[finalPath[0]] === undefined) {
      current = row[keys[0]];
    } else {
      current = row;
    }
  }
  
  return finalPath.reduce((acc, key) => {
    return (acc && acc[key] !== undefined) ? acc[key] : null;
  }, current);
}

const resolveAstAliases = (ast: AST) => {
  const validAliases = [
    ast.from.alias || ast.from.table,
    ...(ast.joins || []).map(j => j.alias)
  ];
  
  const fixPath = (colPath: ColumnPath) => {
    if (colPath.path.length > 1 && validAliases.includes(colPath.path[0])) {
      colPath.tableAlias = colPath.path[0];
      colPath.path.shift();
    }
  }

  const traverseExpression = (expr: WhereExpression | null) => {
    if (!expr) return;

    if (expr.type === 'Comparison') {
      fixPath(expr.left);
      if (typeof expr.right === 'object' && expr.right !== null && 'path' in expr.right) {
        fixPath(expr.right as ColumnPath);
      }
    } else if (expr.type === 'LogicalBinary') {
      traverseExpression(expr.left);
      traverseExpression(expr.right);
    } else if (expr.type === 'LogicalUnary') {
      traverseExpression(expr.operand);
    }
  }

  ast.select.forEach(item => fixPath(item.ref));
  ast.joins.forEach(j => traverseExpression(j.on));
  traverseExpression(ast.where);
  ast.groupBy.forEach(colPath => fixPath(colPath));
  traverseExpression(ast.having);
}

const evaluateJoins = (currentResult: any[], joins: Join[], database: Record<string, any[]>) => {
  let joinedResult = [...currentResult];

  joins.forEach(join => {

    const tableToJoin = database[join.table];
    const tempStep: any[] = [];
    
    joinedResult.forEach(rowA => {
      tableToJoin.forEach(itemB => {
        const combinedRow = { ...rowA, [join.alias]: itemB };
        if (evaluateWhereExpression(join.on, combinedRow)) {
          tempStep.push(combinedRow);
        }
      });
    });
    joinedResult = tempStep;
  });

  return joinedResult;
}

// added database as param because for JOIN to work i need to work on all input jsons
// database = all input jsons
export const evaluate = (ast: AST, database: Record<string, any[]>) => {
  resolveAstAliases(ast);

  const mainTableName = ast.from.table;
  const mainData = database[mainTableName];

  if (!mainData) throw new Error(`Table '${mainTableName}' not found`);

  const mainTableAlias = ast.from.alias || mainTableName;

  // remove?
  const mainAliases = ast.from.alias || ast.from.table;
  const joinAliases = ast.joins.map(j => j.alias);
  const allAvailableAliases = [mainAliases, ...joinAliases];
  // const tableAlias = ast.from.alias || ast.from.table;

  let result = mainData.map(item => ({ [mainTableAlias]: item}));
  
  
  verifyTableAlias(ast.select, allAvailableAliases);

  if (ast.joins && ast.joins.length > 0) {
    result = evaluateJoins(result, ast.joins, database);
  }

  if (ast.where) {
    result = result.filter((row) => evaluateWhereExpression(ast.where!, row));
  }
  
  const hasAggregate = ast.select.some(item => item.type === 'AggregateExpr');
  
  if (hasAggregate && ast.groupBy.length === 0) {
    const summaryRow: any = {};
    ast.select.map(item => {
      if (item.type === 'AggregateExpr') {
        const value = calculateAggregate(item, result);
        const itemName =
          item.alias
            ? item.alias
            : item.name;
        summaryRow[itemName] = value;
      }
      return summaryRow;
    });
    result = [summaryRow]; 
  }
  
  if (ast.groupBy.length > 0) {
    result = applyGrouping(result, ast.groupBy, ast.select);
    if (ast.having) {
      result = result.filter((row) => evaluateHavingExpression(ast.having!, row));
    }
  }
  
  result = applyOrdering(result, ast.order);

  if (ast.limit) {
    result = result.slice(0, ast.limit);
  }
  
  const itemName =
    ast.select[0].type === 'AggregateExpr'
      ? ast.select[0].name
      : ast.select[0].columnName;

  if (itemName !== '*') {
    result = result.map((row) => {
      const newRow: any = {};
      ast.select.forEach((col) => {
        const defaultName = col.type === 'AggregateExpr' ? col.name : col.columnName;
        const finalKey = col.alias || defaultName;
        const objValue = row.hasOwnProperty(finalKey)
          ? row[finalKey]
          : resolvePath(row, col.ref);
        newRow[finalKey] = objValue;
      });
      return newRow;
    });
  }

  return result
}

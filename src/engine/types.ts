export type Operator = '>' | '<' | '=' | '!=' | '>=' | '<=';

export type LogicalOperator = 'AND' | 'OR' | 'NOT';

// comparisons are =, >, >=, <= and !=
// age > 20 for example
export type ComparisonExpression = {
  "type": "Comparison";
  "left": string; // should be a column name/identifier
  "operator": Operator;
  "right": number | string | boolean;
}

// a logical expression is AND city = "RJ", for example
// also, left and right can be any expression, including another LogicalExpression
export type LogicalBinaryExpression = {
  "type": "LogicalBinary";
  "operator": 'AND' | 'OR';
  "left": WhereExpression;
  "right": WhereExpression;
}

export type LogicalUnaryExpression = {
  "type": 'LogicalUnary';
  "operator": 'NOT';
  "operand": WhereExpression; // because it negates a single expression -> not (something)
}

export type WhereExpression = ComparisonExpression | LogicalBinaryExpression | LogicalUnaryExpression;

export type Where = {
  "left": number | string;
  "operator": Operator;
  "right": number | string;
}

export type Order = {
  "type": "OrderSpecification";
  "prop": string;
  "direction": "ASC" | "DESC" | null;
}

export type AST = {
  "select": string[];
  "from": string;
  "where": WhereExpression | null;
  "order": Order[] | null;
  "limit": number | null;
}

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'OPERATOR'
  | 'SYMBOL'

export type Token = {
  type: TokenType;
  value: string;
}

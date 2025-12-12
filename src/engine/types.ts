export type Operator = '>' | '<' | '=' | '!=' | '>=' | '<=';

// comparisons are =, >, >=, <= and !=
// age > 20 for example
export type ComparisonExpression = {
  "type": "Comparison";
  "left": string; // should be a column name/identifier
  "operator": Operator;
  "right": number | string;
}

export type LogicalOperator = 'AND' | 'OR' | 'NOT';

// a logical expression is AND city = "RJ", for example
// also, left and right can be any expression, including another LogicalExpression
export type LogicalExpression = {
  "type": "Logical";
  "operator": LogicalOperator;
  "left": WhereExpression;
  "right": WhereExpression;
}

export type WhereExpression = ComparisonExpression | LogicalExpression;

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

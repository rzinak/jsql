export type Operator = '>' | '<' | '=' | '!=' | '>=' | '<=' | 'LIKE';

export type LogicalOperator = 'AND' | 'OR' | 'NOT';

// comparisons are =, >, >=, <= and !=
// age > 20 for example
export type ComparisonExpression = {
  "type": "Comparison";
  "left": ColumnPath; 
  "operator": Operator;
  "right": ColumnPath | LiteralValue;
}

export type LiteralValue = number | string | boolean | null;

export type ColumnPath = {
  tableAlias: string | null; // resolved in the "semantic pass" in the validateAST function
  path: string[]; // ['u', 'age'] or ['20'] or ['preferences', 'sms']
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

export type HavingExpression = ComparisonExpression | LogicalBinaryExpression | LogicalUnaryExpression;

export type Order = {
  "type": "OrderSpecification";
  "prop": string;
  "direction": "ASC" | "DESC" | null;
}

export type ColumnRef = string[];

export type AggregateExpr = {
  "func": string;
  "arg": string;
};

export type SelectItem =
  | {
      type: "ColumnRef";
      ref: ColumnPath;
      columnName: string;
      alias?: null | string;
    }
  | {
      type: "AggregateExpr";
      ref: ColumnPath;
      name: string;
      alias?: null | string;
      distinct: boolean;
    }

export type AggregateItem = Extract<SelectItem, {type: "AggregateExpr"}>

export type From = {
  table: string;
  alias: string | null;
}

export type Join = {
  type: 'INNER' | 'LEFT';
  table: string;
  alias: string;
  on: {
    left: string;
    operator: Operator;
    right: string;
  }
}

export type AST = {
  "select": SelectItem[];
  "from": From;
  "joins": Join[] | null;
  "where": WhereExpression | null;
  "groupBy": ColumnPath[];
  "having": HavingExpression | null;
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

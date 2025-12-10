export type Operator = '>' | '<' | '=' | '!=' | '>=' | '<=';

export type Where = {
  "left": number | string;
  "operator": Operator;
  "right": number | string;
}

export type Order = {
  "type": "OrderSpecification";
  "prop": string;
  "direction": "ASC" | "DESC";
}

export type AST = {
  "type": "SelectStatement";
  "columns": string[];
  "from": string;
  "where": Where | null;
  "order": Order | null;
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

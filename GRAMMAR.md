## 1. Valid Queries
```
SELECT * FROM users
SELECT * FROM users LIMIT 1
SELECT name, age, city FROM users
SELECT name, age FROM users WHERE age > 18
SELECT name, email, age FROM users WHERE age >= 18 AND city = "Rio de Janeiro"
SELECT name, age FROM users WHERE age > 18 ORDER BY age DESC
SELECT name, age from USERS WHERE age > 18 AND NOT city = "Rio de Janeiro" ORDER BY id DESC LIMIT 1
```

---

## 2. Tokens

### Keywords
```
SELECT
FROM
WHERE
ORDER
BY
LIMIT
```

### Logical Operators
```
AND
OR
NOT
```

### Direction Keywords
```
ASC
DESC
```

### Comparison Operators
```
=
>

>=
<=
!=
```

### Special Symbols
```
*
,
```

### Identifiers
Names defined by the user:
- Column names: `name`, `age`, `email`, `city`
- Table names: `users`, `data`

**Pattern**: `[a-zA-Z_][a-zA-Z0-9_]*`

### Literals

**Numbers**
- Exemplos: `18`, `21`, `100`
- Pattern: `\d+` or `\d+\.\d+`

**Strings**
- Examples: `"Rio de Janeiro"`, `"Flamengo"`
- Pattern: `"[^"]*"` (basically anything inside quotes)

### Whitespace
- Whitespaces, tabs and break-line
- **Ignored during parsing**

---

## 3. Formal Grammar
```
Query      -> SELECT Columns FROM Table [WHERE Conditions] [ORDER BY OrderClause] [LIMIT Number]
Columns    -> * | ColumnList
ColumnList -> Identifier (, Identifier)*
Conditions -> Condition ((AND | OR) Condition)*
Condition  -> Identifier Operator Literal
Operator   -> = | > | < | >= | <= | !=
Literal    -> Number | String
OrderClause-> Identifier [Direction]
Direction  -> ASC | DESC
Number     -> Digit+
Digit      -> 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

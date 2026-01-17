## 1. Valid Queries
```
SELECT * FROM users
SELECT * FROM users LIMIT 1
SELECT name, age, city FROM users
SELECT name, age FROM users WHERE age > 18
SELECT name, email, age FROM users WHERE age >= 18 AND city = "Rio de Janeiro"
SELECT name, age FROM users WHERE age > 18 ORDER BY age DESC
SELECT name, age from USERS WHERE age > 18 AND NOT city = "Rio de Janeiro" ORDER BY id DESC LIMIT 1
SELECT COUNT(*) FROM users
SELECT city, COUNT(*) FROM users GROUP BY city
SELECT name AS full_name FROM users
SELECT SUM(age) FROM users GROUP BY city
SELECT COUNT(DISTINCT city) FROM users
SELECT name, age FROM users ORDER BY age DESC, name ASC
SELECT preferences.language as lang, COUNT(*) as total_users FROM example_nested WHERE age >= 25 GROUP BY preferences.language HAVING total_users >= 2
SELECT * FROM users u
SELECT u.name, u.age FROM users u WHERE u.age > 18
SELECT u.name, u.address.street FROM users u
SELECT u.name as usuario, c.name as cidade, c.uf FROM users u JOIN cities c ON u.city_id = c.id
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
GROUP
HAVING
COUNT
SUM
AVG
MIN
MAX
AS
DISTINCT
JOIN
ON
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
<

>=
<=
!=
LIKE
```

### Special Symbols
```
*
,
.
(
)
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

### Booleans
- Values: `true`, `false`

### Whitespace
- Whitespaces, tabs and break-line
- **Ignored during parsing**

---

## 3. Formal Grammar
```
Query      -> SELECT Columns FROM TableRef [JOIN JoinClause] [WHERE Conditions] [GROUP BY GroupClause] [HAVING HavingClause] [ORDER BY OrderClause] [LIMIT Number]
Columns    -> * | ColumnList
ColumnList -> Column (, Column)*
Column     -> ColumnPath [AS Identifier] | Aggregate [AS Identifier]
ColumnPath -> Identifier (. Identifier)*
TableRef   -> Identifier [Identifier]
JoinClause -> Identifier Identifier ON Conditions
Aggregate  -> Func ( [DISTINCT] Arg )
Func       -> COUNT | SUM | AVG | MIN | MAX
Arg        -> * | ColumnPath
Conditions -> Condition ((AND | OR) Condition)*
Condition  -> ColumnPath Operator Literal
Operator   -> = | > | < | >= | <= | != | LIKE
Literal    -> Number | String | Boolean
GroupClause-> ColumnPath (, ColumnPath)*
HavingClause-> Condition ((AND | OR) Condition)*
OrderClause-> OrderSpec (, OrderSpec)*
OrderSpec  -> Identifier [Direction]
Direction  -> ASC | DESC
Boolean    -> true | false
Number     -> Digit+
Digit      -> 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

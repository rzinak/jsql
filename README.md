# jsql

A SQL-like engine for querying JSON data directly in the browser.

[**Live Demo**](https://jsql.vercel.app)

## Overview

jsql allows you to run SQL queries against JSON datasets directly in the browser. It parses the SQL and evaluates it against the provided JSON object.

## Features

- **Standard SQL Syntax**: `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`.
- **Table Aliases**: Use aliases for tables (e.g., `FROM users u`).
- **Deep JSON Access**: Query nested properties using dot notation (e.g., `address.street` or `u.address.street` with table alias).
- **Filtering**: Support for `AND`, `OR`, `NOT`, and comparison operators (`=`, `>`, `<`, `>=`, `<=`, `!=`, `LIKE`).
- **Sorting**: Order results by any field in `ASC` or `DESC` order, including multiple columns.
- **Grouping and Aggregation**: `GROUP BY` with aggregate functions like `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, including `DISTINCT` support.
  - `HAVING` clause for filtering grouped results.
  - Columns not in `SELECT` but used in `GROUP BY` are allowed; an arbitrary value from the group is returned (typically the first record).
  - `GROUP BY` columns do not automatically appear in results—only columns specified in `SELECT` are returned.
- **Aliases**: Rename columns and aggregates using `AS`.
- **Instant Feedback**: Runs in real-time in the browser.
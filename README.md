# jsql

A SQL-like engine for querying JSON data directly in the browser.

[**Live Demo**](https://jsql.vercel.app)

## Overview

jsql allows you to run SQL queries against JSON datasets directly in the browser. It parses the SQL and evaluates it against the provided JSON object.

## Features

- **Standard SQL Syntax**: `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`.
- **Deep JSON Access**: Query nested properties using dot notation (e.g., `address.city`).
- **Filtering**: Support for `AND`, `OR`, `NOT`, and comparison operators (`=`, `>`, `<`, `>=`, `<=`, `!=`, `LIKE`).
- **Sorting**: Order results by any field in `ASC` or `DESC` order.
- **Instant Feedback**: Runs in real-time in the browser.
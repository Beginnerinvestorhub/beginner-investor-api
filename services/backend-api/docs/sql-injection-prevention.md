# SQL Injection Prevention

This document outlines the measures implemented to prevent SQL injection in the Beginner Investor Hub backend API.

## Overview

We use a combination of the following strategies to prevent SQL injection:

1. **Parameterized Queries**: All database queries use Prisma's built-in parameterization.
2. **Input Validation**: All user inputs are validated before being used in queries.
3. **Query Sanitization**: Custom sanitization for raw SQL queries.
4. **Least Privilege**: Database user has minimal required permissions.
5. **Error Handling**: Secure error messages that don't leak sensitive information.

## SafeQuery Utility

We provide a `SafeQuery` utility class that wraps Prisma's query builder with additional security checks.

### Basic Usage

```typescript
import { db } from '../utils/db-query';

// Find many records
const users = await db.findMany('user', {
  active: true,
  role: 'INVESTOR'
});

// Find a single record
const user = await db.findUnique('user', { id: userId });

// Create a record
const newUser = await db.create('user', {
  email: 'user@example.com',
  name: 'John Doe',
  role: 'USER'
});

// Update a record
const updatedUser = await db.update('user', 
  { id: userId },
  { name: 'Updated Name' }
);

// Delete a record
await db.delete('user', { id: userId });
```

### Raw SQL Queries

For complex queries that require raw SQL, use the `raw` method with parameterized inputs:

```typescript
// UNSAFE - Vulnerable to SQL injection
const unsafeQuery = `SELECT * FROM users WHERE email = '${userInput}'`;

// SAFE - Uses parameterized queries
const safeQuery = 'SELECT * FROM users WHERE email = ?';
const users = await db.raw(safeQuery, [userInput]);
```

### Transactions

```typescript
import { db } from '../utils/db-query';

await db.transaction(async (tx) => {
  // Perform multiple operations in a transaction
  await tx.user.update({
    where: { id: userId },
    data: { balance: { decrement: amount } }
  });
  
  await tx.transaction.create({
    data: {
      userId,
      amount: -amount,
      type: 'WITHDRAWAL',
      status: 'COMPLETED'
    }
  });
});
```

## Security Measures

### 1. Input Validation

All inputs are validated before being used in queries. The validation includes:

- Type checking
- Length restrictions
- Allowed characters
- Business rule validation

### 2. Query Sanitization

The `SafeQuery` class includes methods to sanitize:

- WHERE clauses
- Data objects
- Raw SQL queries

### 3. Error Handling

Database errors are caught and sanitized to prevent information leakage:

```typescript
try {
  // Database operation
} catch (error) {
  // Log the full error for debugging
  logger.error('Database error:', error);
  
  // Return a generic error to the client
  throw new Error('An error occurred while processing your request');
}
```

### 4. Prepared Statements

All queries use prepared statements under the hood:

```typescript
// This is automatically converted to a prepared statement
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true }
});
```

## Best Practices

1. **Always use the SafeQuery utility** instead of direct Prisma client access.
2. **Never concatenate user input** into SQL queries.
3. **Validate all inputs** before using them in queries.
4. **Use the principle of least privilege** for database users.
5. **Regularly update dependencies** to get security patches.
6. **Log and monitor** database queries in production.

## Testing

To test for SQL injection vulnerabilities:

1. Run the test suite: `npm test`
2. Use a tool like SQLMap to test your API endpoints
3. Perform manual testing with malicious inputs

## Monitoring

Monitor the following metrics:

- Number of failed login attempts
- Unusual query patterns
- Long-running queries
- Failed validations

## Incident Response

If a SQL injection vulnerability is discovered:

1. **Contain** the vulnerability
2. **Assess** the impact
3. **Fix** the vulnerability
4. **Notify** affected users if necessary
5. **Document** the incident and lessons learned

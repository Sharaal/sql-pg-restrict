Restrict `client.query` only handle queries created with the sql tagged template literal.

# Initialization

```javascript
const sql = require('@sharaal/sql-restricted-pg')

sql.restrict(client)
```

:warning: It's needed to use everywhere the `sql` tag from the `@sharaal/sql-restricted-pg` package. The one from the normal `@sharaal/sql-pg` won't work for restricted clients.

# Examples

## Restriction of client.query only allow tagged template literals

```javascript
// Throw an error because of the missing sql tag

const result = await client.query(`
  SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}
`)

// Works

const result = await client.query(sql`
  SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}
`)
```

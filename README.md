Restrict `client.query` only handle queries created with the sql tagged template literal.

# Initialization

```javascript
const sql = require('@sharaal/sql-restricted-pg')

sql.restrict(client)
```

# Examples

## Restriction of client.query only allow tagged template literals

```javascript
// Will throw an error because the sql tag is missing

const result = await client.query(`
  SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}
`)

// Will work

const result = await client.query(sql`
  SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}
`)
```

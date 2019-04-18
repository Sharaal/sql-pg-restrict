Provide a restricted client only handle queries created with the sql tagged template literal.

# Initialization

```javascript
const sql = require('sql-pg-restrict')
const client = sql.restrict(originalClient)
```

:warning: It's needed to use everywhere the `sql` tag from the `sql-pg-restrict` package. The one from the original `sql-pg` won't work for restricted clients.

:warning: The restricted client only contains the `query` method. If you want to monkey patch the original client you can overwrite the original `query` method:
```javascript
const sql = require('sql-pg-restrict')
client.query = sql.restrict(client).query
```

# Examples

```javascript
// Throws an error because of the missing sql tag

const result = await client.query(`
  SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}
`)

// Works

const result = await client.query(sql`
  SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}
`)
```

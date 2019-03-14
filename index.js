const sql = require('../sql-pg')

const secret = Symbol('sql-pg-restrict')

module.exports = (textFragments, ...valueFragments) => Object.assign(
  sql(textFragments, ...valueFragments),
  { secret }
)

module.exports.restrict = client => {
  const originalQuery = client.query
  client.query = (...params) => {
    const [query] = params
    if (typeof query !== 'function' || query.secret !== secret) {
      throw Error('only queries create with the sql tagged template literal are allowed')
    }
    return originalQuery(...params)
  }
}

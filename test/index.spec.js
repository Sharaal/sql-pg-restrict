const assert = require('power-assert')
const sinon = require('sinon')

const sql = require('../')

describe('sql-restrict-pg', () => {
  describe('Restriction of client.query only allow tagged template literals', () => {
    it('should keep the behavior if tagged template literal is used', async () => {
      const expectedRows = [{ id: 5 }]
      const expectedRowCount = 5
      const client = {
        query: sinon.fake.returns(Promise.resolve({ rows: expectedRows, rowCount: expectedRowCount }))
      }
      const originalQuery = client.query

      sql.restrict(client)

      const result = await client.query(sql`SELECT * FROM users`)

      assert.deepEqual(result.rows, expectedRows)
      assert.equal(result.rowCount, expectedRowCount)

      const expectedArgs = {
        text: 'SELECT * FROM users',
        parameters: []
      }
      assert(originalQuery.calledOnce)
      let actualArgs = originalQuery.getCall(0).args[0]
      assert.deepEqual({ text: actualArgs.text, parameters: actualArgs.parameters }, expectedArgs)
      assert.equal(typeof actualArgs.secret, 'symbol')
      assert.equal(actualArgs.secret.toString(), 'Symbol(sql-restrict-pg)')
      actualArgs = actualArgs(0)
      assert.deepEqual({ text: actualArgs.text, parameters: actualArgs.parameters }, expectedArgs)
    })

    it('should throw an exception if a string is used as query', async () => {
      const client = { query: () => {} }

      sql.restrict(client)

      try {
        await client.query('SELECT * FROM users')
        assert(false)
      } catch (e) {
        assert.equal(e.message, 'only queries create with the sql tagged template literal are allowed')
      }
    })
  })
})

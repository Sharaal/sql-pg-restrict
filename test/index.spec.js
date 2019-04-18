const assert = require('power-assert')
const sinon = require('sinon')

const sql = require('../')

describe('sql-pg-restrict', () => {
  describe('Use restricted query only allow tagged template literals beside the original client.query', () => {
    it('should keep the original client.query', async () => {
      const originalClient = {
        query: () => {}
      }
      const originalQuery = originalClient.query

      const client = sql.restrict(originalClient)

      assert(originalClient.query === originalQuery)
      assert(client.query !== originalQuery)
    })

    it('should keep the behavior if tagged template literal is used', async () => {
      const expectedRows = [{ id: 5 }]
      const expectedRowCount = 5
      const originalClient = {
        query: sinon.fake.returns(Promise.resolve({ rows: expectedRows, rowCount: expectedRowCount }))
      }

      const client = sql.restrict(originalClient)

      const result = await client.query(sql`SELECT * FROM users`)

      assert.deepEqual(result.rows, expectedRows)
      assert.equal(result.rowCount, expectedRowCount)

      const expectedArgs = {
        text: 'SELECT * FROM users',
        parameters: []
      }
      assert(originalClient.query.calledOnce)
      let actualArgs = originalClient.query.getCall(0).args[0]
      assert.deepEqual({ text: actualArgs.text, parameters: actualArgs.parameters }, expectedArgs)
      assert.equal(typeof actualArgs.secret, 'symbol')
      assert.equal(actualArgs.secret.toString(), 'Symbol(sql-pg-restrict)')
      actualArgs = actualArgs(0)
      assert.deepEqual({ text: actualArgs.text, parameters: actualArgs.parameters }, expectedArgs)
    })

    it('should throw an exception if a string is used as query', async () => {
      const originalClient = { query: () => {} }

      const client = sql.restrict(originalClient.query)

      try {
        await client.query('SELECT * FROM users')
        assert(false)
      } catch (e) {
        assert.equal(e.message, 'only queries create with the sql tagged template literal are allowed')
      }
    })
  })

  describe('Monkey patching of client.query only allow tagged template literals', () => {
    it('should keep the behavior if tagged template literal is used', async () => {
      const expectedRows = [{ id: 5 }]
      const expectedRowCount = 5
      const client = {
        query: sinon.fake.returns(Promise.resolve({ rows: expectedRows, rowCount: expectedRowCount }))
      }
      const originalQuery = client.query

      client.query = sql.restrict(client).query

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
      assert.equal(actualArgs.secret.toString(), 'Symbol(sql-pg-restrict)')
      actualArgs = actualArgs(0)
      assert.deepEqual({ text: actualArgs.text, parameters: actualArgs.parameters }, expectedArgs)
    })

    it('should throw an exception if a string is used as query', async () => {
      const client = { query: () => {} }

      client.query = sql.restrict(client).query

      try {
        await client.query('SELECT * FROM users')
        assert(false)
      } catch (e) {
        assert.equal(e.message, 'only queries create with the sql tagged template literal are allowed')
      }
    })
  })
})

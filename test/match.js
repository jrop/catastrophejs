'use strict'

const assert = require('assert')
const match = require('../match')

describe('match', function () {
	it('any', function () {
		const paths = match.any(match.regex('Number', /^\s*(\d+)\s*/), match.regex('Alpha', /^\s*([a-zA-Z]+)\s*/))

		let m = paths.match('  123  ')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'Number',
			parts: [ '123' ],
		})

		m = paths.match('  abcABC  ')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'Alpha',
			parts: [ 'abcABC' ],
		})
	})

	it('many', function () {
		let matcher = match.many('NumberList', /^\s*(\d+)\s*/, ',')

		let m = matcher.match('1,2,')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'NumberList',
			parts: [ {
				type: 'Item',
				parts: [ { type: 'RegExp', parts: [ '1' ] }, { type: 'String', parts: [ ',' ] } ],
			}, {
				type: 'Item',
				parts: [ { type: 'RegExp', parts: [ '2' ] }, { type: 'String', parts: [ ',' ] } ],
			} ],
		})

		m = matcher.match('1,2')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'NumberList',
			parts: [ {
				type: 'Item',
				parts: [ { type: 'RegExp', parts: [ '1' ] }, { type: 'String', parts: [ ',' ] } ],
			}, {
				type: 'Item',
				parts: [ { type: 'RegExp', parts: [ '2' ] } ],
			} ],
		})

		matcher = match.many('NumberList', /^\s*(\d+)\s*/)
		m = matcher.match('  1 2  ')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'NumberList',
			parts: [ {
				type: 'Item',
				parts: [ { type: 'RegExp', parts: [ '1' ] }, { type: 'Separator', parts: [ ] } ],
			}, {
				type: 'Item',
				parts: [ { type: 'RegExp', parts: [ '2' ] }, { type: 'Separator', parts: [ ] } ],
			} ],
		})
	})

	it('optional', function () {
		let m = match.optional('None', ',').match('  123  ')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '  123  ')
		assert.deepEqual(m.node.toObject(), {
			type: 'None',
			parts: [ ],
		})

		m = match.optional('None', ',').match('  ,123  ')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '123  ')
		assert.deepEqual(m.node.toObject(), {
			type: 'String',
			parts: [ ',' ],
		})
	})

	it('plus', function () {
		const matcher = match.plus('NumberList', match.regex('Number', /^\s*(\d+)\s*/))

		let m = matcher.match(',')
		assert(!m, 'Returned match when it should not have')

		m = matcher.match('1,')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), ',')
		assert.deepEqual(m.node.toObject(), {
			type: 'NumberList',
			parts: [ {
				type: 'Item',
				parts: [ { type: 'Number', parts: [ '1' ] }, { type: 'Separator', parts: [ ] } ],
			} ],
		})

		m = matcher.match('1 2')
		assert(Boolean(m), 'Returned undefined match')
		assert.deepEqual(m.node.toObject(), {
			type: 'NumberList',
			parts: [ {
				type: 'Item',
				parts: [ { type: 'Number', parts: [ '1' ] }, { type: 'Separator', parts: [ ] } ],
			}, {
				type: 'Item',
				parts: [ { type: 'Number', parts: [ '2' ] }, { type: 'Separator', parts: [ ] } ],
			} ],
		})
	})

	it('regex', function () {
		const m = match.regex('Number', /^\s*(\d+)\s*/).match('  123  ')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'Number',
			parts: [ '123' ],
		})
	})

	it('sequence', function () {
		const id = match.regex('Id', /\s*(\w+)\s*/)
		const num = match.regex('Num', /\s*(\d+)\s*/)
		const matcher = match.sequence('Seq', '{', id, '=', num, '}')

		let m = matcher.match('  { three = 3 }  ')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'Seq',
			parts: [ {
				type: 'String',
				parts: [ '{' ],
			}, {
				type: 'Id',
				parts: [ 'three' ],
			}, {
				type: 'String',
				parts: [ '=' ],
			}, {
				type: 'Num',
				parts: [ '3' ],
			}, {
				type: 'String',
				parts: [ '}' ],
			} ],
		})

		m = matcher.match('  three = 3 }  ')
		assert(!m, 'Returned match when it should not have')
	})

	it('string', function () {
		const m = match.string('LeftBrace', '{').match('  {}')
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '}')
		assert.deepEqual(m.node.toObject(), {
			type: 'LeftBrace',
			parts: [ '{' ],
		})
	})
})

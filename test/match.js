'use strict'

const assert = require('assert')
const match = require('../match')
const SourceContext = require('../source-context')

describe('match', function () {
	it('any', function () {
		const paths = match.any('Any', match.regex('Number', /^\s*(\d+)\s*/), match.regex('Alpha', /^\s*([a-zA-Z]+)\s*/))

		let m = paths(new SourceContext('  123  '))
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'Number',
			parts: [ '123' ],
		})

		m = paths(new SourceContext('  abcABC  '))
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'Alpha',
			parts: [ 'abcABC' ],
		})
	})

	it('many', function () {
		let matcher = match.many('NumberList', /^\s*(\d+)\s*/, ',')

		let m = matcher(new SourceContext('1,2,'))
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

		m = matcher(new SourceContext('1,2'))
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
		m = matcher(new SourceContext('  1 2  '))
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
		let m = match.optional('None', ',')(new SourceContext('  123  '))
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '  123  ')
		assert.deepEqual(m.node.toObject(), {
			type: 'None',
			parts: [ ],
		})

		m = match.optional('None', ',')(new SourceContext('  ,123  '))
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '123  ')
		assert.deepEqual(m.node.toObject(), {
			type: 'String',
			parts: [ ',' ],
		})
	})

	it('plus')

	it('regex', function () {
		const m = match.regex('Number', /^\s*(\d+)\s*/)(new SourceContext('  123  '))
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '')
		assert.deepEqual(m.node.toObject(), {
			type: 'Number',
			parts: [ '123' ],
		})
	})

	it('sequence')

	it('string', function () {
		const m = match.string('LeftBrace', '{')(new SourceContext('  {}'))
		assert(Boolean(m), 'Returned undefined match')
		assert.equal(m.ctx.toString(), '}')
		assert.deepEqual(m.node.toObject(), {
			type: 'LeftBrace',
			parts: [ '{' ],
		})
	})
})

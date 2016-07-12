'use strict'

const assert = require('assert')
const AstNode = require('../ast-node')

describe('AstNode', function () {
	it('constructor', function () {
		const node = new AstNode('Type', [ 1, 2, 3 ])

		assert.equal(node.type, 'Type')
		assert.deepEqual(node.parts, [ 1, 2, 3 ])
	})

	it('toObject', function () {
		const node = new AstNode('Type', [
			1, 2, new AstNode('Inner', [ 'inner' ])
		])
		assert.deepEqual(node.toObject(), {
			type: 'Type',
			parts: [ 1, 2, {
				type: 'Inner',
				parts: [ 'inner' ],
			} ],
		})
	})
})

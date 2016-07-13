'use strict'

const assert = require('assert')
const lexer = require('../lexer')

describe('Lexer', function () {
	it('should tokenize source text', function () {
		const lex = lexer()
			.token('Number', /\d+/)
			.token('$Skip', /\/\/[^\r\n]*/)
			.token('$Skip', /\/\*(?:.|[\r\n])*?\*\//) // block comment: /* ... */
			.token('$Skip', /\s+/)
		const src = `3 /* .
		*/ 1 4
		1 5 9 // bleh`

		const tokens = lex(src)
		assert.deepEqual(tokens.map(t => parseInt(t.text)), [ 3, 1, 4, 1, 5, 9 ])

		assert.throws(() => lex('3 1 4 oops 1 5 8'), /Unrecognized input/)

		const bracketTokens = (lexer().token('{'))('{')
		assert.deepEqual(bracketTokens, [ {
			type: '{', text: '{',
		} ])
	})
})

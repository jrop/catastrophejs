'use strict'
/* eslint-disable no-console, no-case-declarations */

const { inspect } = require('util')
const lexer = require('../../lexer')
const match = require('../../index')

const lex = lexer()
	.token('{').token('}')
	.token('[').token(']')
	.token(',')
	.token(':')
	// .token('LeftBrace', /\{/)
	// .token('RightBrace', /\}/)
	// .token('LeftBracket', /\[/)
	// .token('RightBracket', /\]/)
	// .token('Colon', /:/)
	// .token('Comma', /\,/)
	.token('NullLiteral', /null/)
	.token('StringLiteral', /"((?:(?:\\")|[^"\n])*)"/)
	.token('NumberLiteral', /(\d+(?:\.\d*)?|\.\d+)/)
	.token('BooleanLiteral', /(true|false)/)
	.token('$Skip', /\s+/)

// //
// // BEGIN: Grammar
// //
// function g(name) {
// 	return function (ctx) {
// 		return g[name](ctx)
// 	}
// }
// g['NullLiteral'] = match.string('NullLiteral', 'null')
// g['StringLiteral'] = match.regex('StringLiteral', /^\s*"((?:(?:\\")|[^"\n])*)"\s*/gm)
// g['NumberLiteral'] = match.regex('NumberLiteral', /^\s*(\d+(?:\.\d*)?|\.\d+)\s*/gm)
// g['BooleanLiteral'] = match.regex('BooleanLiteral', /^\s*(true|false)\s*/gm)
//
// //
// // Objects
// //
// g['ObjectLiteral'] = match.sequence('ObjectLiteral',
// 	'{', g('ObjectLiteralKeyValuePairs'), '}')
//
// g['ObjectLiteralKeyValuePairs'] = match.many('ObjectLiteralKeyValuePairs', g('ObjectLiteralKeyValuePair'), ',')
//
// g['ObjectLiteralKeyValuePair'] = match.sequence('ObjectLiteralKeyValuePair',
// 	g('StringLiteral'), ':', g('Literal'))
//
// //
// // Arrays
// //
// g['ArrayLiteral'] = match.sequence('ArrayLiteral', '[', g('ArrayLiteralItems'), ']')
// g['ArrayLiteralItems'] = match.many('ArrayLiteralItems', g('Literal'), ',')
//
// //
// // Literal
// //
// g['Literal'] = match.any(
// 	g('NullLiteral'),
// 	g('BooleanLiteral'),
// 	g('NumberLiteral'),
// 	g('StringLiteral'),
// 	g('ObjectLiteral'),
// 	g('ArrayLiteral'))
// //
// // END: Grammar
// //
//
// function reduce(ast) {
// 	switch (ast.type) {
// 	case 'NullLiteral':
// 		return null
//
// 	case 'StringLiteral':
// 		return eval(`"${ast.parts[0]}"`)
//
// 	case 'NumberLiteral':
// 		return parseFloat(ast.parts[0])
//
// 	case 'BooleanLiteral':
// 		return ast.parts[0] == 'true' ? true : false
//
// 	case 'ObjectLiteral':
// 		return Object.assign.apply(null, reduce(ast.parts[1]))
//
// 	case 'ObjectLiteralKeyValuePairs':
// 		return ast.parts.map(item =>
// 			reduce(item.parts[0]))
//
// 	case 'ObjectLiteralKeyValuePair':
// 		const nm = reduce(ast.parts[0])
// 		const val = reduce(ast.parts[2])
// 		return { [nm]: val }
//
// 	case 'ArrayLiteral':
// 		return reduce(ast.parts[1])
//
// 	case 'ArrayLiteralItems':
// 		return ast.parts.map(item =>
// 			reduce(item.parts[0]))
//
// 	default:
// 		return ast
// 	}
// }

const src = `{ "three": 3.14, "four": [ 4, { "another": false }, null ], "string": "my \\"string\\"" }`
try {
	console.log(lex(src))
} catch (e) {
	console.error(e)
	if (e && e.src)
		console.error(e.src)
}
// console.log(`Parsing source: "${src}"`)
//
// const ast = g['Literal'].parse(src)
// console.log('\nParsed AST:')
// console.log(inspect(ast.toObject(), null, null))
//
// console.log('\nEvaluated object:')
// console.log(reduce(ast))

// time node examples/json/index.js
// time node -e "JSON.parse('{ \"three\": 3.14, \"four\": [ 4, { \"another\": false } ], \"string\": \"my string\" }')"

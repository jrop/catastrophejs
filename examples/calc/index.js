'use strict'
/* eslint-disable no-console */

const { inspect } = require('util')
const match = require('../../index')

function g(name) {
	return function (ctx) {
		return g[name](ctx)
	}
}

g['Num'] = match.regex('Num', /^\s*(\d+)\s*/gm)
g['Parenthetical'] = match.sequence('Parenthetical', '(', g('E'), ')')
g['Division'] = match.sequence('Division', g('E'), '/', g('E'))
g['Multiplication'] = match.sequence('Multiplication', g('E'), '*', g('E'))
g['Addition'] = match.sequence('Addition', g('E'), '+', g('E'))
g['Subtraction'] = match.sequence('Subtraction', g('E'), '-', g('E'))

g['E'] = match.any(
	g('Division'),
	g('Multiplication'),
	g('Addition'),
	g('Subtraction'),
	g('Num'),
	g('Parenthetical'))

g['Expr'] = match.sequence('Expr', g('E'), match.eof())

// const ast = match.sequence('Addition', g('E'), '+', g('E')).parse('2 + 3')
const ast = g['Expr'].parse('2 + 3')
console.log(inspect(ast ? ast.toObject() : ast, null, null))

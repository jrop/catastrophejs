'use strict'

const co = require('co')
const debug = require('debug')
const fs = require('fs')
const { inspect } = require('util')

class SourceContext {
	constructor(fullSource, offset) {
		this.fullSource = fullSource
		this.offset = offset || 0
	}
	skip(n) {
		return new SourceContext(this.fullSource, this.offset + n)
	}
	toString() {
		return this.fullSource.substring(this.offset)
	}
}

class AstNode {
	constructor(type, parts) {
		this.type = type
		this.parts = parts
	}
	toString() {
		return `AstNode(${this.type}) ${JSON.stringify(this.parts)}`
	}
}

function createStringMatcher(s) {
	s = s
		.replace('{', '\\{')
		.replace('}', '\\}')
		.replace('[', '\\[')
		.replace(']', '\\]')
	return createRegExpMatcher(new RegExp(`(${s})`))
}

function createRegExpMatcher(regex) {
	return function (ctx) {
		const match = regex.exec(ctx.toString())
		debug('rdp:regex')(ctx.toString(), regex.source, match)
		if (!match) return

		// console.log('skipping', match[0].length)
		// const nextCtx = ctx.skip(match[0].length)
		return {
			ctx: ctx.skip(match[0].length),
			node: new AstNode('RegExp', match.slice(1)),
		}
	}
}

/**
 * matcher: (SourceContext) => AstNode
 */
function createMatcher(...tokens) {
	// convert tokens to matchers:
	const matchers = tokens.map(token => {
		if (typeof token == 'string')
			return createStringMatcher(token)
		else if (token && typeof token.exec == 'function')
			return createRegExpMatcher(token)
		else if (typeof token == 'function')
			return token
		else
			throw new Error('Invalid token: ' + token)
	})

	// combine into one matcher:
	return function(ctx) {
		let currCtx = ctx
		const matches = [ ]
		for (const matcher of matchers) {
			console.log('CURR_CTX:' + currCtx.toString())
			const match = matcher(currCtx)
			if (!match) return

			matches.push(match.node)
			currCtx = match.ctx
		} // for
		return matches
	} // matcher
}

// match: '{' [object_tupleList] '}'
function literal_object(src) {
	const _D = debug('rdp:literal_object')
	_D(src)
	const begin = /^\s*\{(.*)$/gm
	const end = /\s*\}/gm

	const m = begin.exec(src)
	if (!m) return

	src = m[1]
	const tuples = object_tupleList(src)
	src = tuples.rest

	const endBrace = /^\s*\}(.*)/gm.exec(src)
	if (!endBrace) return
	else return {
		node: {
			type: 'literal_object',
			tuples: tuples.node.tuples,
		},
		rest: src,
	}
}

// match (object_tuple ',')*
function object_tupleList(src) {
	const tuples = [ ]
	let tuple
	while((tuple = object_tuple(src))) {
		tuples.push(tuple.node)
		src = tuple.rest

		// eat comma, if there:
		const comma = /^\s*,(.*)$/gm.exec(src)
		if (comma) src = comma[1]
		else break
	}

	return {
		node: {
			type: 'object_tupleList',
			tuples: tuples,
		},
		rest: src,
	}
}

// match '"' ID '"' ':' literal_number
function object_tuple(src) {
	const _D = debug('rdp:object_tuple')
	_D(src)
	const begin = /^\s*"([a-zA-Z0-9\$_]+)"\s*:\s*(.*)$/gm
	const m = begin.exec(src)
	if (!m) return

	_D(m[1], m[2])
	const num = literal_number(m[2])
	if (num) {
		return {
			node: {
				type: 'object_tuple',
				left: m[1],
				right: num.node,
			},
			rest: num.rest,
		}
	}
}

// match [0-9]+
function literal_number(src) {
	const _D = debug('rdp:literal_number')
	const begin = /^\s*(\d+)(.*)$/gm
	const m = begin.exec(src)
	if (!m) return

	_D(parseFloat(m[1]))
	return {
		node: {
			type: 'literal_number',
			value: parseFloat(m[1]),
		},
		rest: m[2],
	}
}

co(function * main() {
	// var src = (yield done => fs.readFile('./test.json', done)).toString('utf-8')
	// console.log(inspect(literal_object(src), null, null))

	const T = s => new RegExp(`^\\s*(${s})\\s*`)
	const keyVal = createMatcher(T('\\{'), /^(\w+)\s*(=)\s*(\w+)/, T('\\}'))
	console.log(keyVal(new SourceContext(' {  x=  56 } ')))
})
.catch(e => console.error(e && e.stack ? e.stack : e))

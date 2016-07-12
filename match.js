'use strict'

const assert = require('assert')
const AstNode = require('./ast-node')
const debug = require('debug')

function normalizeMatchers(matchers) {
	return matchers.map(matcher => {
		if (typeof matcher == 'string')
			return string('String', matcher)
		else if (matcher && typeof matcher.exec == 'function')
			return regex('RegExp', matcher)
		else if (typeof matcher == 'function')
			return matcher
		else
			throw new Error('Invalid matcher: ' + matcher)
	})
}

function any(type = 'Any', ...tokens) {
	assert(typeof type == 'string', 'Must pass a node type to match.any (signature: match.any(type, ...tokens))')
	const matchers = normalizeMatchers(tokens)

	return function anyMatcher(ctx) {
		for (const matcher of matchers) {
			const match = matcher(ctx)
			if (match)
				return match
		}
	}
}

function many(type = 'Many', matcher, separator) {
	assert(typeof type == 'string', 'Must pass a node type to match.many (signature: match.many(type, matcher, separator))')
	separator = separator || ((ctx) => ({ ctx, node: new AstNode('Separator', [ ]) }))

	;[ matcher, separator ] = normalizeMatchers([ matcher, separator ])
	return function manyMatcher(ctx) {
		const matches = [ ]

		do {
			const match = matcher(ctx)
			if (!match) break
			const sepMatch = separator(match.ctx)

			ctx = sepMatch ? sepMatch.ctx : match.ctx
			matches.push(new AstNode('Item', [ match.node ].concat(sepMatch ? [ sepMatch.node ] : [ ])))
		} while (true)

		return {
			ctx,
			node: new AstNode(type, matches),
		}
	}
}

function optional(type = 'Empty', matcher) {
	assert(typeof type == 'string', 'Must pass a node type to match.optional (signature: match.optional(type, matcher))')
	;[ matcher ] = normalizeMatchers([ matcher ])
	return function optionalMatcher(ctx) {
		const match = matcher(ctx)
		return match ? match : {
			ctx,
			node: new AstNode(type, [ ])
		}
	}
}

function plus(type = 'Many', matcher, separator) {
	const _matcher = many(type, matcher, separator)
	return function plusMatcher(ctx) {
		const match = _matcher(ctx)
		return match && match.node.parts.length > 1 ? match : undefined
	}
}

function regex(type = 'RegExp', regex) {
	assert(typeof type == 'string', 'Must pass a node type to match.regex (signature: match.regex(type, s))')
	return function regexMatcher(ctx) {
		const match = regex.exec(ctx.toString())
		debug('rdp:regex')(ctx.toString(), regex.source, match)
		if (!match) return

		return {
			ctx: ctx.skip(match[0].length),
			node: new AstNode(type, match.slice(1)),
		}
	}
}

function sequence(type = 'Sequence', ...tokens) {
	assert(typeof type == 'string', 'Must pass a node type to match.sequence (signature: match.sequence(type, ...tokens))')
	const matchers = normalizeMatchers(tokens)

	// combine into one matcher:
	return function sequenceMatcher(ctx) {
		let currCtx = ctx
		const matches = [ ]
		for (const matcher of matchers) {
			const match = matcher(currCtx)
			if (!match) return

			matches.push(match.node)
			currCtx = match.ctx
		} // for

		return {
			ctx: currCtx,
			node: new AstNode(type, matches),
		}
	} // matcher
}

function string(type = 'String', s) {
	assert(typeof type == 'string', 'Must pass a node type to match.string (signature: match.string(type, s))')

	//
	// http://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
	//
	s = s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	return regex(type, new RegExp(`^\\s*(${s})\\s*`))
}

module.exports = {
	any,
	many,
	optional,
	plus,
	regex,
	sequence,
	string,
}

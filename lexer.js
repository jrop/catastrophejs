'use strict'

const assert = require('assert')
const escapeStringRegExp = require('escape-string-regexp')

function lexer() {
	const tokenDefinitions = [ ]
	function splitter(src) {
		const tokens = [ ]
		let offset = 0

		function next() {
			for (const tokenDefinition of tokenDefinitions) {
				tokenDefinition.lastIndex = 0
				const match = tokenDefinition.regex.exec(src.substring(offset))
				if (match) {
					offset += match[0].length
					return { type: tokenDefinition.type, text: match[0] }
				}
			}

			// uh-oh, we got here with no matches.
			const skipped = src.charAt(offset)
			offset += 1
			const nextT = next()
			if (nextT.skipped) {
				return { skipped: skipped + nextT.skipped }
			} else {
				return { skipped }
			}
		}

		// eslint-disable-next-line no-constant-condition
		while (offset != src.length) {
			const nextT = next()
			if (nextT.skipped)
				throw new Error('Unrecognized input: "' + nextT.skipped + '"')

			if (nextT.type != '$Skip')
				tokens.push(nextT)
		}

		return tokens
	}

	splitter.token = function (type, regex) {
		if (typeof regex == 'undefined')
			regex = new RegExp(escapeStringRegExp(type))

		const rSrc = regex.source
		assert(rSrc.length > 0 || rSrc == '^', 'Bad regex specified')

		if (rSrc.charAt(0) != '^')
			regex = new RegExp(`^${rSrc}`, regex.flags)
		tokenDefinitions.push({ type, regex })
		return splitter
	}
	return splitter
}

module.exports = lexer

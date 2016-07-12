'use strict'

const assert = require('assert')

module.exports = class AstNode {
	constructor(type, parts) {
		assert(typeof type == 'string', '`type` parameter must be a string')
		assert(Array.isArray(parts), '`parts` parameter must be an array')
		this.type = type
		this.parts = parts
	}
	toObject() {
		return {
			type: this.type,
			parts: this.parts.map(part => part && part.toObject ? part.toObject() : part),
		}
	}
	toString() {
		return `AstNode(${this.type}) ${JSON.stringify(this.parts)}`
	}
}

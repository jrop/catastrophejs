'use strict'

module.exports = class SourceContext {
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

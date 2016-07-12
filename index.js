'use strict'

const co = require('co')
const { inspect } = require('util')
const match = require('./match')
const SourceContext = require('./source-context')

co(function * main() {
	// var src = (yield done => fs.readFile('./test.json', done)).toString('utf-8')
	// console.log(inspect(literal_object(src), null, null))

	const keyVal = match.sequence('Block',
		match.string('LeftBrace', '{'),
		match.regex('Assignment', /^(\w+)\s*(=)\s*(\w+)/),
		match.string('RightBrace', '}'))

	const keyValOrNum = match.any('Any',
		keyVal,
		match.regex('Number', /^\s*(\d+)/))


	const manyNums = match.many('NumberList',
		match.regex('Number', /^\s*(\d+)\s*/), ',')

	const opt = match.optional('None', match.regex('Number', /^\s*(\d+)\s*/))

	// const ast = keyValOrNum(new SourceContext(' {  x=  56 } '))
	// const ast = keyValOrNum(new SourceContext('  48 '))
	// const ast = manyNums(new SourceContext('1,2,3'))
	const ast = opt(new SourceContext('123'))
	console.log(inspect(ast, null, null))
})
.catch(e => console.error(e && e.stack ? e.stack : e))

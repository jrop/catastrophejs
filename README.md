# catASTrophe

> parse source text into an Abstract Syntax Tree (AST)

# Installation

```sh
$ npm install catastrophe
```

# Use

1. Create a matcher
2. Call `yourMatcher.parse(src)`
3. Do stuff with the generated AST

```js
'use strict'

const match = require('catastrophe')

const numberList = match.many('NumberList',
	match.regex('Number', /^\s*(\d+)\s*/),
	',')

const ast = numberList.parse('1, 2, 3,').toObject()
/*
{ type: 'NumberList',
  parts:
   [ { type: 'Item',
       parts:
        [ { type: 'Number', parts: [ '1' ] },
          { type: 'String', parts: [ ',' ] } ] },
     { type: 'Item',
       parts:
        [ { type: 'Number', parts: [ '2' ] },
          { type: 'String', parts: [ ',' ] } ] },
     { type: 'Item',
       parts:
        [ { type: 'Number', parts: [ '3' ] },
          { type: 'String', parts: [ ',' ] } ] } ] }
*/
```

# API

## Matcher

A "Matcher" has two different forms, depending on how it is being referred to below: 1) as a parameter, and 2) as a return value.  When it is being passed as a parameter, it will be normalized to its more formal definition.  The pseudo-code for normalization is:

```js
function normalize(matcher) {
	return match.string(matcher) if matcher is string
	return match.regex(matcher) if matcher is regex
	return matcher if matcher is function
	throw new Error('Invalid matcher: ' + matcher)
}
```

The normalized matcher is just a function that takes the form:

```js
function matcher(ctx: SourceContext) {
	return undefined if no match
	return {
		ctx: SourceContext after match,
		node: AstNode after match
	}
}
matcher.match = str => matcher(new SourceContext(str))
matcher.parse = str => matcher.match(str).node
```

## Functions

### match.any(...matchers: Array<Matcher>): Matcher

Returns a matcher that matches the first matching matcher given.

Example:

```js
match.any(numberMatcher, alphaMatcher).parse('123')
// => { type: 'Number', ... }
```

### match.many(type: string, item: Matcher, separator: Matcher): Matcher

Returns a matcher that matches zero-or-more items as specified by the given item-matcher and separator-matcher.

### match.optional(noneType: string, matcher: Matcher): Matcher
### match.plus(type: string, item: Matcher, separator: Matcher): Matcher
### match.regex(type: string, regex: RegExp): Matcher
### match.sequence(type: string, ...matchers: Array<Matcher>): Matcher
### match.string(type: string, s: string): Matcher

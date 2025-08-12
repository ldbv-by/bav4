import { CqlLexer, CqlTokenType, CqlKeyword } from '../../../../src/modules/oaf/utils/CqlLexer.js';

describe('CqlLexer', () => {
	const setup = () => {
		return new CqlLexer();
	};

	describe('Lexing', () => {
		it('has all TokenTypes defined', () => {
			expect(Object.keys(CqlTokenType)).toHaveSize(13);
			expect(CqlTokenType.COMPARISON_OPERATOR).toEqual('comparison_operator');
			expect(CqlTokenType.BINARY_OPERATOR).toEqual('binary_operator');
			expect(CqlTokenType.OPEN_BRACKET).toEqual('open_bracket');
			expect(CqlTokenType.CLOSED_BRACKET).toEqual('closed_bracket');
			expect(CqlTokenType.SYMBOL).toEqual('symbol');
			expect(CqlTokenType.STRING).toEqual('string');
			expect(CqlTokenType.NUMBER).toEqual('number');
			expect(CqlTokenType.BOOLEAN).toEqual('boolean');
			expect(CqlTokenType.TIMESTAMP).toEqual('timestamp');
			expect(CqlTokenType.DATE).toEqual('date');
			expect(CqlTokenType.AND).toEqual('and');
			expect(CqlTokenType.OR).toEqual('or');
			expect(CqlTokenType.NOT).toEqual('not');
		});

		it('lexes keywords to correct token', () => {
			const lexer = setup();
			const keywordMap = [
				// -- Brackets --
				['(', { type: CqlTokenType.OPEN_BRACKET, value: '(', operatorKeyword: null, startsAt: 0, endsAt: 1 }],
				[')', { type: CqlTokenType.CLOSED_BRACKET, value: ')', operatorKeyword: null, startsAt: 0, endsAt: 1 }],

				// -- Operators --
				['=', { type: CqlTokenType.BINARY_OPERATOR, value: '=', operatorKeyword: CqlKeyword.EQUALS, startsAt: 0, endsAt: 1 }],
				['<>', { type: CqlTokenType.BINARY_OPERATOR, value: '<>', operatorKeyword: CqlKeyword.NOT_EQUALS, startsAt: 0, endsAt: 2 }],
				['<', { type: CqlTokenType.BINARY_OPERATOR, value: '<', operatorKeyword: CqlKeyword.LESS, startsAt: 0, endsAt: 1 }],
				['>', { type: CqlTokenType.BINARY_OPERATOR, value: '>', operatorKeyword: CqlKeyword.GREATER, startsAt: 0, endsAt: 1 }],
				['<=', { type: CqlTokenType.BINARY_OPERATOR, value: '<=', operatorKeyword: CqlKeyword.LESS_EQUALS, startsAt: 0, endsAt: 2 }],
				['>=', { type: CqlTokenType.BINARY_OPERATOR, value: '>=', operatorKeyword: CqlKeyword.GREATER_EQUALS, startsAt: 0, endsAt: 2 }],
				['LIKE', { type: CqlTokenType.BINARY_OPERATOR, value: 'LIKE', operatorKeyword: CqlKeyword.LIKE, startsAt: 0, endsAt: 4 }],
				['BETWEEN', { type: CqlTokenType.COMPARISON_OPERATOR, value: 'BETWEEN', operatorKeyword: CqlKeyword.BETWEEN, startsAt: 0, endsAt: 7 }],

				// -- Symbol --
				['mySymbol', { type: CqlTokenType.SYMBOL, value: 'mySymbol', operatorKeyword: null, startsAt: 0, endsAt: 8 }],

				// -- Literals --
				["'25'", { type: CqlTokenType.STRING, value: '25', operatorKeyword: null, startsAt: 0, endsAt: 4 }],

				['25.182', { type: CqlTokenType.NUMBER, value: 25.182, operatorKeyword: null, startsAt: 0, endsAt: 6 }],
				['25', { type: CqlTokenType.NUMBER, value: 25, operatorKeyword: null, startsAt: 0, endsAt: 2 }],
				['-25', { type: CqlTokenType.NUMBER, value: -25, operatorKeyword: null, startsAt: 0, endsAt: 3 }],
				['-25.182', { type: CqlTokenType.NUMBER, value: -25.182, operatorKeyword: null, startsAt: 0, endsAt: 7 }],

				['true', { type: CqlTokenType.BOOLEAN, value: true, operatorKeyword: null, startsAt: 0, endsAt: 4 }],
				["DATE('2010-05-05')", { type: CqlTokenType.DATE, value: '2010-05-05', operatorKeyword: null, startsAt: 0, endsAt: 18 }],
				[
					"TIMESTAMP('2010-05-05T10:20:00')",
					{ type: CqlTokenType.TIMESTAMP, value: '2010-05-05T10:20:00', operatorKeyword: null, startsAt: 0, endsAt: 32 }
				],

				// -- Special Keywords --
				['AND', { type: CqlTokenType.AND, value: 'AND', operatorKeyword: null, startsAt: 0, endsAt: 3 }],
				['OR', { type: CqlTokenType.OR, value: 'OR', operatorKeyword: null, startsAt: 0, endsAt: 2 }],
				['NOT', { type: CqlTokenType.NOT, value: 'NOT', operatorKeyword: null, startsAt: 0, endsAt: 3 }]
			];

			keywordMap.forEach(([keyword, expectedToken]) => {
				const tokens = lexer.tokenize(keyword);
				expect(tokens).toHaveSize(1);
				expect(tokens[0]).toEqual(expectedToken);
			});
		});

		it('lexes case insensitive keywords', () => {
			const lexer = setup();
			const insensitiveMap = [
				{ expression: 'TrUe truE TRUE', expectedTokenLength: 3, expected: { type: CqlTokenType.BOOLEAN, value: true } },
				{ expression: 'and And aNd', expectedTokenLength: 3, expected: { type: CqlTokenType.AND, value: 'AND' } },
				{ expression: 'Or or oR', expectedTokenLength: 3, expected: { type: CqlTokenType.OR, value: 'OR' } },
				{ expression: 'not Not nOt', expectedTokenLength: 3, expected: { type: CqlTokenType.NOT, value: 'NOT' } },
				{ expression: 'between beTweEn Between', expectedTokenLength: 3, expected: { type: CqlTokenType.COMPARISON_OPERATOR, value: 'BETWEEN' } },
				{ expression: 'like Like LIke', expectedTokenLength: 3, expected: { type: CqlTokenType.BINARY_OPERATOR, value: 'LIKE' } }
			];

			insensitiveMap.forEach((testCase) => {
				const tokens = lexer.tokenize(testCase.expression);

				expect(tokens).toHaveSize(testCase.expectedTokenLength);
				tokens.forEach((token) => {
					expect(token).toEqual(jasmine.objectContaining(testCase.expected));
				});
			});
		});

		it('ignores whitespace', () => {
			const lexer = setup();
			const tokens = lexer.tokenize('  (   ');
			expect(tokens).toHaveSize(1);
			expect(tokens[0]).toEqual(jasmine.objectContaining({ type: CqlTokenType.OPEN_BRACKET, value: '(' }));
		});

		it('does not ignore whitespace when includeSkippedTokens is enabled', () => {
			const lexer = setup();
			const tokens = lexer.tokenize('  (  ', false, true);
			expect(tokens).toHaveSize(3);
		});

		it('does not throw on unrecognized token when silent', () => {
			const lexer = setup();
			const tokens = lexer.tokenize('2unrecognized foo 3unrecognized', true);

			expect(tokens).toHaveSize(3);
			expect(tokens[0]).toEqual(jasmine.objectContaining({ type: null, value: '2unrecognized ' }));
			expect(tokens[1]).toEqual(jasmine.objectContaining({ type: CqlTokenType.SYMBOL, value: 'foo' }));
			expect(tokens[2]).toEqual(jasmine.objectContaining({ type: null, value: '3unrecognized' }));
		});

		it('returns the unmodified tokenValue when rawValue is enabled', () => {
			const lexer = setup();
			const tokens = lexer.tokenize('LikE', false, false, true);
			expect(tokens).toHaveSize(1);
			expect(tokens[0]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BINARY_OPERATOR, value: 'LikE' }));
		});

		it('lexes complex expression', () => {
			const lexer = setup();
			const expression = "(foo = 25) = <= <> LIKE 'aString' and NoT 25 OR LIKE between (bar = true))";
			const tokens = lexer.tokenize(expression);
			expect(tokens[0]).toEqual(jasmine.objectContaining({ type: CqlTokenType.OPEN_BRACKET, value: '(' }));
			expect(tokens[1]).toEqual(jasmine.objectContaining({ type: CqlTokenType.SYMBOL, value: 'foo' }));
			expect(tokens[2]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BINARY_OPERATOR, value: '=' }));
			expect(tokens[3]).toEqual(jasmine.objectContaining({ type: CqlTokenType.NUMBER, value: 25 }));
			expect(tokens[4]).toEqual(jasmine.objectContaining({ type: CqlTokenType.CLOSED_BRACKET, value: ')' }));
			expect(tokens[5]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BINARY_OPERATOR, value: '=' }));
			expect(tokens[6]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BINARY_OPERATOR, value: '<=' }));
			expect(tokens[7]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BINARY_OPERATOR, value: '<>' }));
			expect(tokens[8]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BINARY_OPERATOR, value: 'LIKE' }));
			expect(tokens[9]).toEqual(jasmine.objectContaining({ type: CqlTokenType.STRING, value: 'aString' }));
			expect(tokens[10]).toEqual(jasmine.objectContaining({ type: CqlTokenType.AND, value: 'AND' }));
			expect(tokens[11]).toEqual(jasmine.objectContaining({ type: CqlTokenType.NOT, value: 'NOT' }));
			expect(tokens[12]).toEqual(jasmine.objectContaining({ type: CqlTokenType.NUMBER, value: 25 }));
			expect(tokens[13]).toEqual(jasmine.objectContaining({ type: CqlTokenType.OR, value: 'OR' }));
			expect(tokens[14]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BINARY_OPERATOR, value: 'LIKE' }));
			expect(tokens[15]).toEqual(jasmine.objectContaining({ type: CqlTokenType.COMPARISON_OPERATOR, value: 'BETWEEN' }));
			expect(tokens[16]).toEqual(jasmine.objectContaining({ type: CqlTokenType.OPEN_BRACKET, value: '(' }));
			expect(tokens[17]).toEqual(jasmine.objectContaining({ type: CqlTokenType.SYMBOL, value: 'bar' }));
			expect(tokens[18]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BINARY_OPERATOR, value: '=' }));
			expect(tokens[19]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BOOLEAN, value: true }));
			expect(tokens[20]).toEqual(jasmine.objectContaining({ type: CqlTokenType.CLOSED_BRACKET, value: ')' }));
			expect(tokens[21]).toEqual(jasmine.objectContaining({ type: CqlTokenType.CLOSED_BRACKET, value: ')' }));
		});
	});

	describe('Error Handling', () => {
		it('throws an error for unrecognized token', () => {
			const lexer = setup();
			expect(() => lexer.tokenize('2unrecognizedToken foo bar')).toThrowError('Unrecognized token at position 0: "2unrecognizedToken foo bar"');
			expect(() => lexer.tokenize('-22.020.20')).toThrowError('Unrecognized token at position 0: "-22.020.20"');
			expect(() => lexer.tokenize('22.020.20')).toThrowError('Unrecognized token at position 0: "22.020.20"');
		});
	});
});

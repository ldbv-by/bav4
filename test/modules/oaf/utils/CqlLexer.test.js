import { CqlLexer, CqlTokenType } from '../../../../src/modules/oaf/utils/CqlLexer.js';
import { CqlOperator } from '../../../../src/modules/oaf/utils/oafUtils.js';

describe('CqlLexer', () => {
	const setup = () => {
		return new CqlLexer();
	};

	describe('Lexing', () => {
		it('has all TokenTypes defined', () => {
			expect(Object.keys(CqlTokenType)).toHaveSize(12);
			expect(CqlTokenType.ComparisonOperator).toEqual('comparison_operator');
			expect(CqlTokenType.BinaryOperator).toEqual('binary_operator');
			expect(CqlTokenType.OpenBracket).toEqual('open_bracket');
			expect(CqlTokenType.ClosedBracket).toEqual('closed_bracket');
			expect(CqlTokenType.Symbol).toEqual('symbol');
			expect(CqlTokenType.String).toEqual('string');
			expect(CqlTokenType.Number).toEqual('number');
			expect(CqlTokenType.Boolean).toEqual('boolean');
			expect(CqlTokenType.Date).toEqual('date');
			expect(CqlTokenType.And).toEqual('and');
			expect(CqlTokenType.Or).toEqual('or');
			expect(CqlTokenType.Not).toEqual('not');
		});

		it('lexes keywords to correct token', () => {
			const lexer = setup();
			const keywordMap = [
				// -- Brackets --
				['(', { type: CqlTokenType.OpenBracket, value: '(', operatorName: null, startsAt: 0, endsAt: 1 }],
				[')', { type: CqlTokenType.ClosedBracket, value: ')', operatorName: null, startsAt: 0, endsAt: 1 }],

				// -- Operators --
				['=', { type: CqlTokenType.BinaryOperator, value: '=', operatorName: CqlOperator.EQUALS, startsAt: 0, endsAt: 1 }],
				['<>', { type: CqlTokenType.BinaryOperator, value: '<>', operatorName: CqlOperator.NOT_EQUALS, startsAt: 0, endsAt: 2 }],
				['<', { type: CqlTokenType.BinaryOperator, value: '<', operatorName: CqlOperator.LESS, startsAt: 0, endsAt: 1 }],
				['>', { type: CqlTokenType.BinaryOperator, value: '>', operatorName: CqlOperator.GREATER, startsAt: 0, endsAt: 1 }],
				['<=', { type: CqlTokenType.BinaryOperator, value: '<=', operatorName: CqlOperator.LESS_EQUALS, startsAt: 0, endsAt: 2 }],
				['>=', { type: CqlTokenType.BinaryOperator, value: '>=', operatorName: CqlOperator.GREATER_EQUALS, startsAt: 0, endsAt: 2 }],
				['LIKE', { type: CqlTokenType.BinaryOperator, value: 'LIKE', operatorName: CqlOperator.LIKE, startsAt: 0, endsAt: 4 }],
				['BETWEEN', { type: CqlTokenType.ComparisonOperator, value: 'BETWEEN', operatorName: CqlOperator.BETWEEN, startsAt: 0, endsAt: 7 }],

				// -- Symbol --
				['mySymbol', { type: CqlTokenType.Symbol, value: 'mySymbol', operatorName: null, startsAt: 0, endsAt: 8 }],

				// -- Literals --
				["'25'", { type: CqlTokenType.String, value: '25', operatorName: null, startsAt: 0, endsAt: 4 }],

				['25.182', { type: CqlTokenType.Number, value: 25.182, operatorName: null, startsAt: 0, endsAt: 6 }],
				['25', { type: CqlTokenType.Number, value: 25, operatorName: null, startsAt: 0, endsAt: 2 }],
				['-25', { type: CqlTokenType.Number, value: -25, operatorName: null, startsAt: 0, endsAt: 3 }],
				['-25.182', { type: CqlTokenType.Number, value: -25.182, operatorName: null, startsAt: 0, endsAt: 7 }],

				['true', { type: CqlTokenType.Boolean, value: true, operatorName: null, startsAt: 0, endsAt: 4 }],
				["DATE('2010-05-05')", { type: CqlTokenType.Date, value: '2010-05-05', operatorName: null, startsAt: 0, endsAt: 18 }],

				// -- Special Keywords --
				['AND', { type: CqlTokenType.And, value: 'AND', operatorName: null, startsAt: 0, endsAt: 3 }],
				['OR', { type: CqlTokenType.Or, value: 'OR', operatorName: null, startsAt: 0, endsAt: 2 }],
				['NOT', { type: CqlTokenType.Not, value: 'NOT', operatorName: null, startsAt: 0, endsAt: 3 }]
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
				{ expression: 'TrUe truE TRUE', expectedTokenLength: 3, expected: { type: CqlTokenType.Boolean, value: true } },
				{ expression: 'and And aNd', expectedTokenLength: 3, expected: { type: CqlTokenType.And, value: 'AND' } },
				{ expression: 'Or or oR', expectedTokenLength: 3, expected: { type: CqlTokenType.Or, value: 'OR' } },
				{ expression: 'not Not nOt', expectedTokenLength: 3, expected: { type: CqlTokenType.Not, value: 'NOT' } },
				{ expression: 'between beTweEn Between', expectedTokenLength: 3, expected: { type: CqlTokenType.ComparisonOperator, value: 'BETWEEN' } },
				{ expression: 'like Like LIke', expectedTokenLength: 3, expected: { type: CqlTokenType.BinaryOperator, value: 'LIKE' } }
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
			const tokens = lexer.tokenize('  (       ');
			expect(tokens).toHaveSize(1);
			expect(tokens[0]).toEqual(jasmine.objectContaining({ type: CqlTokenType.OpenBracket, value: '(' }));
		});

		it('lexes complex expression', () => {
			const lexer = setup();
			const expression = "(foo = 25) = <= <> LIKE 'aString' and NoT 25 OR LIKE between (bar = true))";
			const tokens = lexer.tokenize(expression);
			expect(tokens[0]).toEqual(jasmine.objectContaining({ type: CqlTokenType.OpenBracket, value: '(' }));
			expect(tokens[1]).toEqual(jasmine.objectContaining({ type: CqlTokenType.Symbol, value: 'foo' }));
			expect(tokens[2]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BinaryOperator, value: '=' }));
			expect(tokens[3]).toEqual(jasmine.objectContaining({ type: CqlTokenType.Number, value: 25 }));
			expect(tokens[4]).toEqual(jasmine.objectContaining({ type: CqlTokenType.ClosedBracket, value: ')' }));
			expect(tokens[5]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BinaryOperator, value: '=' }));
			expect(tokens[6]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BinaryOperator, value: '<=' }));
			expect(tokens[7]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BinaryOperator, value: '<>' }));
			expect(tokens[8]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BinaryOperator, value: 'LIKE' }));
			expect(tokens[9]).toEqual(jasmine.objectContaining({ type: CqlTokenType.String, value: 'aString' }));
			expect(tokens[10]).toEqual(jasmine.objectContaining({ type: CqlTokenType.And, value: 'AND' }));
			expect(tokens[11]).toEqual(jasmine.objectContaining({ type: CqlTokenType.Not, value: 'NOT' }));
			expect(tokens[12]).toEqual(jasmine.objectContaining({ type: CqlTokenType.Number, value: 25 }));
			expect(tokens[13]).toEqual(jasmine.objectContaining({ type: CqlTokenType.Or, value: 'OR' }));
			expect(tokens[14]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BinaryOperator, value: 'LIKE' }));
			expect(tokens[15]).toEqual(jasmine.objectContaining({ type: CqlTokenType.ComparisonOperator, value: 'BETWEEN' }));
			expect(tokens[16]).toEqual(jasmine.objectContaining({ type: CqlTokenType.OpenBracket, value: '(' }));
			expect(tokens[17]).toEqual(jasmine.objectContaining({ type: CqlTokenType.Symbol, value: 'bar' }));
			expect(tokens[18]).toEqual(jasmine.objectContaining({ type: CqlTokenType.BinaryOperator, value: '=' }));
			expect(tokens[19]).toEqual(jasmine.objectContaining({ type: CqlTokenType.Boolean, value: true }));
			expect(tokens[20]).toEqual(jasmine.objectContaining({ type: CqlTokenType.ClosedBracket, value: ')' }));
			expect(tokens[21]).toEqual(jasmine.objectContaining({ type: CqlTokenType.ClosedBracket, value: ')' }));
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

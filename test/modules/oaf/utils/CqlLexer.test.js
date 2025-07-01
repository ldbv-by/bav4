import { CqlLexer, CqlTokenType } from '../../../../src/modules/oaf/utils/CqlLexer.js';
import { CqlOperator } from '../../../../src/modules/oaf/utils/oafUtils.js';

describe('CqlLexer', () => {
	const setup = () => {
		return new CqlLexer();
	};

	describe('Initial', () => {
		it('has all TokenTypes defined', () => {
			expect(Object.keys(CqlTokenType)).toHaveSize(10);
			expect(CqlTokenType.ComparisonOperator).toEqual('comparison_operator');
			expect(CqlTokenType.BinaryOperator).toEqual('binary_operator');
			expect(CqlTokenType.OpenBracket).toEqual('open_bracket');
			expect(CqlTokenType.ClosedBracket).toEqual('closed_bracket');
			expect(CqlTokenType.Symbol).toEqual('symbol');
			expect(CqlTokenType.String).toEqual('string');
			expect(CqlTokenType.Number).toEqual('number');
			expect(CqlTokenType.Boolean).toEqual('boolean');
			expect(CqlTokenType.And).toEqual('and');
			expect(CqlTokenType.Or).toEqual('or');
		});

		it('lexes keywords to correct token', () => {
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

				// -- Symbol --
				['mySymbol', { type: CqlTokenType.Symbol, value: 'mySymbol', operatorName: null, startsAt: 0, endsAt: 8 }],

				//	// -- Literals --
				["'25'", { type: CqlTokenType.String, value: '25', operatorName: null, startsAt: 0, endsAt: 4 }],
				['25', { type: CqlTokenType.Number, value: 25, operatorName: null, startsAt: 0, endsAt: 2 }],
				['true', { type: CqlTokenType.Boolean, value: true, operatorName: null, startsAt: 0, endsAt: 4 }],

				// -- Connections --
				['AND', { type: CqlTokenType.And, value: 'AND', operatorName: null, startsAt: 0, endsAt: 3 }],
				['OR', { type: CqlTokenType.Or, value: 'OR', operatorName: null, startsAt: 0, endsAt: 2 }]
			];

			const lexer = setup();

			keywordMap.forEach(([keyword, expectedToken]) => {
				const tokens = lexer.tokenize(keyword);
				expect(tokens).toHaveSize(1);
				expect(tokens[0]).toEqual(expectedToken);
			});
		});
	});
});

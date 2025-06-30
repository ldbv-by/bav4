/**
 * @module modules/oaf/utils/CqlTokenizer
 */

import { CqlOperator } from './oafUtils';

export const CqlTokenType = Object.freeze({
	ComparisonOperator: 'ComparisonOperator',
	BinaryOperator: 'BinaryOperator',
	OpenBracket: 'OpenBracket',
	ClosedBracket: 'ClosedBracket',
	Symbol: 'Symbol',
	String: 'String',
	Number: 'Number',
	Boolean: 'Boolean',
	And: 'And',
	Or: 'Or'
});

export const CqlTokenSpecification = Object.freeze([
	{
		regex: /\s+/,
		type: null // Null types are skipped in tokenizer
	},
	{
		regex: /\(/,
		type: CqlTokenType.OpenBracket,
		getValue: () => '('
	},
	{
		regex: /\)/,
		type: CqlTokenType.ClosedBracket,
		getValue: () => ')'
	},
	{
		regex: /=/,
		type: CqlTokenType.BinaryOperator,
		getValue: () => '=',
		operatorName: CqlOperator.EQUALS
	},
	{
		regex: /<=/,
		type: CqlTokenType.BinaryOperator,
		getValue: () => '<=',
		operatorName: CqlOperator.LESS_EQUALS
	},
	{
		regex: />=/,
		type: CqlTokenType.BinaryOperator,
		getValue: () => '>=',
		operatorName: CqlOperator.GREATER_EQUALS
	},
	{
		regex: />/,
		type: CqlTokenType.BinaryOperator,
		getValue: () => '>',
		operatorName: CqlOperator.GREATER
	},
	{
		regex: /</,
		type: CqlTokenType.BinaryOperator,
		getValue: () => '<',
		operatorName: CqlOperator.LESS
	},
	{
		regex: /\bLIKE\b/i,
		type: CqlTokenType.BinaryOperator,
		getValue: () => 'LIKE',
		operatorName: CqlOperator.LIKE
	},
	{
		regex: /\bBETWEEN\b/i,
		type: CqlTokenType.ComparisonOperator,
		getValue: () => 'BETWEEN',
		operatorName: CqlOperator.BETWEEN
	},
	{
		regex: /\bAND\b/i,
		type: CqlTokenType.And,
		getValue: () => 'AND'
	},
	{
		regex: /\bOR\b/i,
		type: CqlTokenType.Or,
		getValue: () => 'OR'
	},

	{
		regex: /\b(false|true)\b/i,
		type: CqlTokenType.Boolean,
		getValue: (tokenValue) => tokenValue.toLowerCase() === 'true'
	},
	{
		regex: /\d+/,
		type: CqlTokenType.Number,
		getValue: (tokenValue) => Number(tokenValue)
	},
	{
		regex: /'[^']*'/,
		type: CqlTokenType.String,
		getValue: (tokenValue) => tokenValue.slice(1, -1) // Remove quotes
	},
	{
		regex: /\b[a-zA-Z_][a-zA-Z0-9_]+\b/,
		type: CqlTokenType.Symbol,
		getValue: (tokenValue) => tokenValue
	}
]);

export class CqlLexer {
	constructor() {}

	tokenize(string) {
		let cursor = 0;
		let tokenString = '';
		const hasTokensLeft = (cursor) => {
			return cursor < string.length;
		};

		const getNextToken = (cursor) => {
			tokenString = string.slice(cursor);

			for (const token of CqlTokenSpecification) {
				const match = token.regex.exec(tokenString);
				const matchedValue = match?.[0] ?? null;

				// current regex did not fit => go to next specification
				// tokens have to start at the beginning of the sliced expression to ensure all tokens are found
				if (matchedValue === null || tokenString.indexOf(matchedValue) !== 0) {
					continue;
				}

				//
				if (token.type === null) {
					// Skip this token
					return getNextToken(cursor + matchedValue.length);
				}

				return {
					type: token.type,
					value: token.getValue(matchedValue),
					startsAt: cursor,
					endsAt: cursor + matchedValue.length,
					operatorName: token.operatorName ?? null
				};
			}

			throw new Error(`Unrecognized token at position ${cursor}: "${tokenString}"`);
		};

		const tokens = [];

		while (hasTokensLeft(cursor)) {
			const token = getNextToken(cursor);
			cursor = token.endsAt;
			tokens.push(token);
		}

		return tokens;
	}
}

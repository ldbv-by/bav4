/**
 * @module modules/oaf/utils/CqlLexer
 */

import { CqlOperator } from './oafUtils';

/**
 * Represents a piece of a CQL string (e.g. keyword, symbol)
 * @typedef CqlToken
 * @property {CqlTokenType} type The type of the token
 * @property {string|number|boolean} value The value of the token.
 * @property {number} startsAt The starting index of the token in the provided CQL string.
 * @property {number} endsAt The ending index (exclusive) of the token in the provided CQL string.
 * @property {string|null} operatorName The operator name if the token's type represents an operator, otherwise null.
 */

/**
 * Available Token Types the lexer can interpret
 * @readonly
 * @enum {string}
 */
export const CqlTokenType = Object.freeze({
	ComparisonOperator: 'comparison_operator',
	BinaryOperator: 'binary_operator',
	OpenBracket: 'open_bracket',
	ClosedBracket: 'closed_bracket',
	Symbol: 'symbol',
	String: 'string',
	Number: 'number',
	Boolean: 'boolean',
	Date: 'date',
	And: 'and',
	Or: 'or',
	Not: 'not'
});

const CqlTokenSpecification = Object.freeze([
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
		regex: /<>/,
		type: CqlTokenType.BinaryOperator,
		getValue: () => '<>',
		operatorName: CqlOperator.NOT_EQUALS
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
		regex: /\bNOT\b/i,
		type: CqlTokenType.Not,
		getValue: () => 'NOT'
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
		regex: /(?<!\w)DATE\(\s*'[^']*'\s*\)(?!\w)/i,
		type: CqlTokenType.Date,
		getValue: (tokenValue) => {
			// Get the string inside the DATE literal and remove quotes
			return /'[^']*'/.exec(tokenValue)[0].slice(1, -1);
		}
	},
	{
		regex: /\b(false|true)\b/i,
		type: CqlTokenType.Boolean,
		getValue: (tokenValue) => tokenValue.toLowerCase() === 'true'
	},
	{
		regex: /^-?[0-9]*\.?[0-9]+(?![\w.-])/,
		type: CqlTokenType.Number,
		getValue: (tokenValue) => Number(tokenValue)
	},
	{
		regex: /'[^']*'/,
		type: CqlTokenType.String,
		getValue: (tokenValue) => tokenValue.slice(1, -1)
	},
	{
		regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
		type: CqlTokenType.Symbol,
		getValue: (tokenValue) => tokenValue
	}
]);

/**
 * Tokenizes a given CQL string
 * @class
 * @author herrmutig
 */
export class CqlLexer {
	constructor() {}

	/**
	 * Tokenizes/lexes a given CQL string.
	 * @param {string} string
	 * @returns { Array<CqlToken> }
	 */
	tokenize(string) {
		let cursor = 0;
		let tokenString = '';
		const hasTokensLeft = (cursor) => {
			return cursor < string.length;
		};

		const getNextToken = (cursor) => {
			tokenString = string.slice(cursor);

			if (!hasTokensLeft(cursor)) {
				return null;
			}

			for (const token of CqlTokenSpecification) {
				const match = token.regex.exec(tokenString);
				const matchedValue = match?.[0] ?? null;

				// current regex did not fit => go to next specification
				// tokens have to start at the beginning of the sliced expression to ensure all tokens are found
				if (matchedValue === null || tokenString.indexOf(matchedValue) !== 0) {
					continue;
				}

				if (token.type === null) {
					// Skip this token
					return getNextToken(cursor + matchedValue.length);
				}

				const resultToken = {
					type: token.type,
					value: token.getValue(matchedValue),
					startsAt: cursor,
					endsAt: cursor + matchedValue.length,
					operatorName: token.operatorName ?? null
				};

				return resultToken;
			}

			throw new Error(`Unrecognized token at position ${cursor}: "${tokenString}"`);
		};

		const tokens = [];
		let currentToken;
		while ((currentToken = getNextToken(cursor)) !== null) {
			cursor = currentToken.endsAt;
			tokens.push(currentToken);
		}

		return tokens;
	}
}

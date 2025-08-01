/**
 * @module modules/oaf/utils/CqlLexer
 */

/**
 * Represents a piece of a CQL string (e.g. keyword, symbol)
 * @typedef CqlToken
 * @property {CqlTokenType} type The type of the token
 * @property {string|number|boolean} value The value of the token.
 * @property {number} startsAt The starting index of the token in the provided CQL string.
 * @property {number} endsAt The ending index (exclusive) of the token in the provided CQL string.
 * @property {string|null} operatorKeyword The operator name if the token's type represents an operator, otherwise null.
 */

/**
 * Enum that represents operators used in CQL expressions.
 * @readonly
 * @enum {string}
 */
export const CqlKeyword = Object.freeze({
	EQUALS: '=',
	NOT_EQUALS: '<>',
	LIKE: 'LIKE',
	BETWEEN: 'BETWEEN',
	GREATER: '>',
	GREATER_EQUALS: '>=',
	LESS: '<',
	LESS_EQUALS: '<=',
	DATE: 'DATE',
	TIMESTAMP: 'TIMESTAMP',
	AND: 'AND',
	OR: 'OR',
	NOT: 'NOT'
});

/**
 * Available Token Types the lexer can interpret
 * @readonly
 * @enum {string}
 */
export const CqlTokenType = Object.freeze({
	COMPARISON_OPERATOR: 'comparison_operator',
	BINARY_OPERATOR: 'binary_operator',
	OPEN_BRACKET: 'open_bracket',
	CLOSED_BRACKET: 'closed_bracket',
	SYMBOL: 'symbol',
	STRING: 'string',
	NUMBER: 'number',
	BOOLEAN: 'boolean',
	DATE: 'date',
	TIMESTAMP: 'timestamp',
	AND: 'and',
	OR: 'or',
	NOT: 'not'
});

const CqlTokenSpecification = Object.freeze([
	{
		regex: /\s+/,
		type: null, // Null types are skipped in tokenizer
		getValue: (tokenValue) => tokenValue
	},
	{
		regex: /\(/,
		type: CqlTokenType.OPEN_BRACKET,
		getValue: () => '('
	},
	{
		regex: /\)/,
		type: CqlTokenType.CLOSED_BRACKET,
		getValue: () => ')'
	},
	{
		regex: /=/,
		type: CqlTokenType.BINARY_OPERATOR,
		getValue: () => '=',
		operatorKeyword: CqlKeyword.EQUALS
	},
	{
		regex: /<>/,
		type: CqlTokenType.BINARY_OPERATOR,
		getValue: () => '<>',
		operatorKeyword: CqlKeyword.NOT_EQUALS
	},
	{
		regex: /<=/,
		type: CqlTokenType.BINARY_OPERATOR,
		getValue: () => '<=',
		operatorKeyword: CqlKeyword.LESS_EQUALS
	},
	{
		regex: />=/,
		type: CqlTokenType.BINARY_OPERATOR,
		getValue: () => '>=',
		operatorKeyword: CqlKeyword.GREATER_EQUALS
	},
	{
		regex: />/,
		type: CqlTokenType.BINARY_OPERATOR,
		getValue: () => '>',
		operatorKeyword: CqlKeyword.GREATER
	},
	{
		regex: /</,
		type: CqlTokenType.BINARY_OPERATOR,
		getValue: () => '<',
		operatorKeyword: CqlKeyword.LESS
	},
	{
		regex: /\bLIKE\b/i,
		type: CqlTokenType.BINARY_OPERATOR,
		getValue: () => 'LIKE',
		operatorKeyword: CqlKeyword.LIKE
	},
	{
		regex: /\bBETWEEN\b/i,
		type: CqlTokenType.COMPARISON_OPERATOR,
		getValue: () => 'BETWEEN',
		operatorKeyword: CqlKeyword.BETWEEN
	},
	{
		regex: /\bNOT\b/i,
		type: CqlTokenType.NOT,
		getValue: () => 'NOT'
	},
	{
		regex: /\bAND\b/i,
		type: CqlTokenType.AND,
		getValue: () => 'AND'
	},
	{
		regex: /\bOR\b/i,
		type: CqlTokenType.OR,
		getValue: () => 'OR'
	},
	{
		regex: /(?<!\w)DATE\(\s*'[^']*'\s*\)(?!\w)/i,
		type: CqlTokenType.DATE,
		getValue: (tokenValue) => {
			// Get the string inside the DATE literal and remove quotes
			return /'[^']*'/.exec(tokenValue)[0].slice(1, -1);
		}
	},
	{
		regex: /(?<!\w)TIMESTAMP\(\s*'[^']*'\s*\)(?!\w)/i,
		type: CqlTokenType.TIMESTAMP,
		getValue: (tokenValue) => {
			// Get the string inside the TIMESTAMP literal and remove quotes
			return /'[^']*'/.exec(tokenValue)[0].slice(1, -1);
		}
	},
	{
		regex: /\b(false|true)\b/i,
		type: CqlTokenType.BOOLEAN,
		getValue: (tokenValue) => tokenValue.toLowerCase() === 'true'
	},
	{
		regex: /^-?[0-9]*\.?[0-9]+(?![\w.-])/,
		type: CqlTokenType.NUMBER,
		getValue: (tokenValue) => Number(tokenValue)
	},
	{
		regex: /'[^']*'/,
		type: CqlTokenType.STRING,
		getValue: (tokenValue) => tokenValue.slice(1, -1)
	},
	{
		regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
		type: CqlTokenType.SYMBOL,
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
	 * @param {boolean} silent true = ignores unrecognized tokens, false = throws when lexing fails
	 * @returns { Array<CqlToken> }
	 */
	tokenize(string, silent = false, includeSkippedTokens = false, rawValue = false) {
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

			for (let i = 0; i < CqlTokenSpecification.length; i++) {
				const token = CqlTokenSpecification[i];
				const match = token.regex.exec(tokenString);
				const matchedValue = match?.[0] ?? null;
				const matchIndex = matchedValue === null ? -1 : tokenString.indexOf(matchedValue);

				// current regex did not fit => go to next specification
				// tokens have to start at the beginning of the sliced expression to ensure all tokens are found
				if (matchIndex !== 0) {
					if (silent && i === CqlTokenSpecification.length - 1) {
						// returns the part of the string that could not get mapped to a token
						return {
							type: matchedValue,
							value: matchedValue ? tokenString.substring(0, matchIndex) : tokenString,
							startsAt: cursor,
							endsAt: cursor + (matchedValue ? matchIndex : tokenString.length),
							operatorKeyword: null
						};
					}

					continue;
				}

				if (token.type === null && !includeSkippedTokens) {
					// Skip this token
					return getNextToken(cursor + matchedValue.length);
				}

				const resultToken = {
					type: token.type,
					value: rawValue ? matchedValue : token.getValue(matchedValue),
					startsAt: cursor,
					endsAt: cursor + matchedValue.length,
					operatorKeyword: token.operatorKeyword ?? null
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

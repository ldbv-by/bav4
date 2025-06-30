import { CqlLexer, CqlTokenType } from '../utils/CqlLexer';
import { CqlOperator, createDefaultFilterGroup, createDefaultOafFilter } from '../utils/oafUtils';

export class OafMaskParserService {
	#cqlLexer;

	constructor() {
		this.#cqlLexer = new CqlLexer();
	}

	/**
	 * parses a cql string with the schema: ( ( () AND () ) OR (...) )
	 * @param {*} string
	 * @returns
	 */
	parse(string) {
		console.log(string);
		const unconsumedTokens = this.#cqlLexer.tokenize(string);
		if (unconsumedTokens.length === 0) {
			return [];
		}

		// TODO consider throwing an Error instead.
		const validateBrackets = () => {
			let bracketDepth = 0;

			if (
				unconsumedTokens[0].type !== CqlTokenType.OpenBracket ||
				unconsumedTokens[unconsumedTokens.length - 1].type !== CqlTokenType.ClosedBracket
			) {
				return false;
			}

			for (const token of unconsumedTokens) {
				if (token.type === CqlTokenType.OpenBracket) {
					bracketDepth++;
				} else if (token.type === CqlTokenType.ClosedBracket) {
					bracketDepth--;
				}

				if (bracketDepth < 0) {
					return false;
				}
			}

			return bracketDepth === 0;
		};

		const consume = () => {
			const tokenToReturn = unconsumedTokens[0];
			unconsumedTokens.splice(0, 1);
			return tokenToReturn;
		};

		const consumeLiteral = () => {
			const literal = consume();
			if (![CqlTokenType.String, CqlTokenType.Number, CqlTokenType.Boolean].includes(literal.type)) {
				throw new Error(`Expected a literal type but got ${literal.type}.`);
			}

			return literal;
		};

		const parseToOafExpression = () => {
			const group = [];

			while (unconsumedTokens.length > 0) {
				let token = consume();

				while (unconsumedTokens.length > 0 && token.type !== CqlTokenType.OpenBracket && token.type !== CqlTokenType.ClosedBracket) {
					// Skip Ands and Ors because the resulting data is structured to distinguish between them.
					if (token.type === CqlTokenType.And || token.type === CqlTokenType.Or) {
						token = consume();
						continue;
					}

					// An expression has to start with a symbol.
					const symbol = token;
					if (symbol.type !== CqlTokenType.Symbol) {
						throw new Error(`Expected a Symbol type but got ${symbol.type}.`);
					}

					const operator = consume();
					if (operator.type === CqlTokenType.BinaryOperator) {
						const binaryExpression = { symbol: token, operator: operator, literal: consumeLiteral() };
						group.push(binaryExpression);
					} else if (operator.type === CqlTokenType.ComparisonOperator) {
						const startValueLiteral = consumeLiteral();
						const andToken = consume();

						if (andToken.type !== CqlTokenType.And) {
							throw new Error(`Comparison expected a ${CqlTokenType.And} but got ${andToken.type}`);
						}

						const endValueLiteral = consumeLiteral();

						const comparisonExpression = { symbol: symbol, operator: operator, startValue: startValueLiteral, endValue: endValueLiteral };
						group.push(comparisonExpression);
					} else {
						throw new Error(`Expected an Operator type but got ${operator.type}.`);
					}

					token = consume();
				}

				if (token.type === CqlTokenType.OpenBracket) {
					group.push(parseToOafExpression());
				}

				if (token.type === CqlTokenType.ClosedBracket) {
					return group;
				}
			}

			// return recursion root (only contains 1 element).
			return group.length < 1 ? [] : group[0];
		};

		if (!validateBrackets()) {
			return [];
		}

		// skip root, since it always is an array with 1 entry.
		const filterGroupExpressions = parseToOafExpression();
		const result = [];

		// Create Filter Groups
		for (const filterExpressions of filterGroupExpressions) {
			const filterGroup = createDefaultFilterGroup();

			for (const expressions of filterExpressions) {
				/*
				filterGroup.oafFilters.push({
					...createDefaultOafFilter(),
					value: filterExpr[0].literal.value
				}); */
				console.log(filterExpressions);
			}

			result.push(filterGroup);
		}

		console.log(result);
		return result;
	}
}

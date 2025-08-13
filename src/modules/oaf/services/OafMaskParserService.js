/**
 * @module modules/oaf/services/OafMaskParserService
 */
import { CqlLexer, CqlOperator, CqlTokenType } from '../utils/CqlLexer';
import { OafOperator, createDefaultFilterGroup, createDefaultOafFilter, getOperatorByName } from '../utils/oafUtils';

/**
 * Definition of an operator used in {@link OafFilter}
 * @typedef {Object} OafOperatorDefinition
 * @property {OafOperator} name The unique name of the operator represented by an {@link OafOperator} enum.
 * @property {string} translationKey The translation key for localization.
 * @property {Array<OafQueryableType>} typeConstraints The allowed types for this operator.
 */

/**
 * A filter group object of a {@link OafMask}
 * @typedef OafFilterGroupData
 * @property {number} [id] The id of this filter group
 * @property {Array<OafFilterData>} [oafFilters] The oafFilters associated with this filter group
 */

/**
 * A filter object of a {@link OafFilterGroup}
 * @typedef OafFilterData
 * @property {OafQueryable} [queryable] The queryable associated with this filter
 * @property {Object} [operator] The operator used in this filter
 * @property {string|number|null} [value] The value for the filter
 * @property {number|null}  [minValue] The minimum value for range filters
 * @property {number|null}  [maxValue] The maximum value for range filters
 * @property {string} [expression] The CQL expression for this filter
 */

/**
 * Service to parse CQL strings and convert them to a filter array, consumable by {@link OafMask}.
 * @class
 * @author herrmutig
 */
export class OafMaskParserService {
	#cqlLexer;
	_literalTokenTypes = Object.freeze([CqlTokenType.STRING, CqlTokenType.NUMBER, CqlTokenType.BOOLEAN, CqlTokenType.DATE, CqlTokenType.TIMESTAMP]);

	constructor() {
		this.#cqlLexer = new CqlLexer();
	}

	/**
	 * Parses a CQL string with the schema ([group([expression] AND [expression])]) OR [group([expression] AND [expression])]).
	 *
	 * @param {string} string the cql string to parse
	 * @returns {Array<OafFilterGroupData>} An array containing filter-groups that can be consumed by {@link OafMask}
	 */
	parse(string, queryables) {
		const connectionTokenTypes = [CqlTokenType.AND, CqlTokenType.OR];
		const unconsumedTokens = this.#cqlLexer.tokenize(string);
		if (unconsumedTokens.length === 0) {
			return [];
		}

		const validateBrackets = () => {
			let bracketDepth = 0;

			if (
				unconsumedTokens[0].type !== CqlTokenType.OPEN_BRACKET ||
				unconsumedTokens[unconsumedTokens.length - 1].type !== CqlTokenType.CLOSED_BRACKET
			) {
				throw new Error('CQL string must start with an opening bracket and end with a closing bracket.');
			}

			for (const token of unconsumedTokens) {
				if (token.type === CqlTokenType.OPEN_BRACKET) {
					bracketDepth++;
				} else if (token.type === CqlTokenType.CLOSED_BRACKET) {
					bracketDepth--;
				}

				if (bracketDepth < 0) {
					throw new Error('Closing bracket found without matching opening bracket.');
				}
			}

			if (bracketDepth !== 0) {
				throw new Error('Brackets are not balanced. There are more opening brackets than closing brackets.');
			}
		};

		const findQueryableById = (id) => {
			return queryables.find((q) => q.id === id);
		};

		const peek = (index) => {
			return unconsumedTokens[index];
		};

		const consume = () => {
			const tokenToReturn = unconsumedTokens[0];
			unconsumedTokens.splice(0, 1);
			return tokenToReturn;
		};

		const consumeSymbol = () => {
			const symbol = consume();
			if (symbol.type !== CqlTokenType.SYMBOL) {
				throw new Error(`Expected a symbol type but got "${symbol.type}".`);
			}
			return symbol;
		};

		const consumeLiteral = () => {
			const literal = consume();
			//@ts-ignore
			if (!this._literalTokenTypes.includes(literal.type)) {
				throw new Error(`Expected a literal type but got "${literal.type}".`);
			}
			return literal;
		};

		const consumeNotIfPresent = () => {
			const not = peek(0);
			if (not.type === CqlTokenType.NOT) {
				consume(); // Consume not
				consume(); // Consume open bracket
				return not;
			}

			return null;
		};

		const parseBinaryExpression = () => {
			const expr = { symbol: consumeSymbol(), operator: consume(), literal: consumeLiteral() };

			if (peek(1).type === CqlTokenType.SYMBOL && peek(2).type === CqlTokenType.BINARY_OPERATOR) {
				const andToken = consume(); // Ignore AND/OR token
				if (andToken.type !== CqlTokenType.AND) {
					throw new Error(`Expected "${CqlTokenType.AND}" but got "${andToken.type}".`);
				}

				const secondSymbol = consumeSymbol();
				const secondOperator = consume();
				const secondLiteral = consumeLiteral();

				if (expr.symbol.value !== secondSymbol.value) {
					throw new Error(`Expected a symbol named "${expr.symbol.value}" but got "${secondSymbol.value}".`);
				}

				//@ts-ignore
				const operatorCombinationString = expr.operator.value + secondOperator.value;
				const operatorCombination = { ...expr.operator };

				if (operatorCombinationString === '>=<=') {
					operatorCombination.value = '>=<=';
					operatorCombination.type = CqlTokenType.COMPARISON_OPERATOR;
					operatorCombination.operatorName = OafOperator.BETWEEN;

					return { symbol: expr.symbol, operator: operatorCombination, leftLiteral: expr.literal, rightLiteral: secondLiteral };
				}

				throw new Error(`Can not parse Expression - Unsupported operator combination: "${expr.operator.value}" and ${secondOperator.value}".`);
			}

			// Return simple binary expression
			return expr;
		};

		const parseComparisonExpression = () => {
			const symbol = consumeSymbol();
			const operator = consume();
			const literal = consumeLiteral();

			const andToken = consume();
			if (andToken.type !== CqlTokenType.AND) {
				throw new Error(`Expected "${CqlTokenType.AND}" but got "${andToken.type}".`);
			}

			const rightLiteral = consumeLiteral();
			return { symbol: symbol, operator: operator, leftLiteral: literal, rightLiteral: rightLiteral };
		};

		const parseExpression = () => {
			const not = consumeNotIfPresent();
			const peekedOperator = peek(1);

			if (peekedOperator.type === CqlTokenType.BINARY_OPERATOR) {
				return { not: not, ...parseBinaryExpression() };
			} else if (peekedOperator.type === CqlTokenType.COMPARISON_OPERATOR) {
				return { not: not, ...parseComparisonExpression() };
			}

			throw new Error(`Expected an operator type but got "${peekedOperator.type}".`);
		};

		const parseUnconsumedTokens = () => {
			const group = [];

			while (unconsumedTokens.length > 0) {
				let token = peek(0);

				while (unconsumedTokens.length > 0 && token.type !== CqlTokenType.OPEN_BRACKET && token.type !== CqlTokenType.CLOSED_BRACKET) {
					//@ts-ignore
					if (connectionTokenTypes.includes(peek(0).type)) {
						consume();
						token = peek(0);
						continue;
					}

					const expr = parseExpression();
					consume(); // Token after an expression is always ")".
					return expr;
				}

				if (token.type === CqlTokenType.OPEN_BRACKET) {
					consume();
					group.push(parseUnconsumedTokens());
				}

				if (token.type === CqlTokenType.CLOSED_BRACKET) {
					consume();
					return group;
				}
			}

			// return root (contains 1 element holding filter groups and expressions).
			return group[0];
		};

		const binaryExpressionToOafValue = (expression) => {
			let literalValue = expression.literal.value;

			if (expression.operator.operatorName === CqlOperator.LIKE) {
				if (literalValue.charAt(0) === '%') {
					literalValue = literalValue.slice(1);
				}

				if (literalValue.charAt(literalValue.length - 1) === '%') {
					literalValue = literalValue.slice(0, -1);
				}
			}

			return literalValue;
		};

		const convertExpressionToOafFilter = (expression) => {
			const queryable = findQueryableById(expression.symbol.value);

			if (queryable === undefined) {
				return null;
			}

			if (expression.operator.type === CqlTokenType.BINARY_OPERATOR) {
				const oafFilter = {
					...createDefaultOafFilter(),
					operator: this._expressionToOafOperator(expression),
					queryable: queryable,
					value: binaryExpressionToOafValue(expression)
				};

				return oafFilter;
			}

			// Otherwise the operator is of CqlTokenType.ComparisonOperator
			return {
				...createDefaultOafFilter(),
				operator: this._expressionToOafOperator(expression),
				queryable: queryable,
				minValue: expression.leftLiteral.value,
				maxValue: expression.rightLiteral.value
			};
		};

		validateBrackets();
		const filterGroupExpressions = parseUnconsumedTokens();
		const result = [];

		for (const filterExpressions of filterGroupExpressions) {
			const filterGroup = createDefaultFilterGroup();

			for (const expression of filterExpressions) {
				const oafFilter = convertExpressionToOafFilter(expression);
				if (oafFilter !== null) {
					filterGroup.oafFilters.push(oafFilter);
				}
			}

			result.push(filterGroup);
		}

		return result;
	}

	_expressionToOafOperator = (expression) => {
		const cqlOperator = expression.operator.operatorName;
		const not = expression.not !== null ? OafOperator.NOT : '';

		switch (cqlOperator) {
			case CqlOperator.EQUALS:
				return getOperatorByName(not + OafOperator.EQUALS);
			case CqlOperator.NOT_EQUALS:
				return getOperatorByName(not + OafOperator.NOT_EQUALS);
			case CqlOperator.LIKE: {
				// Like only works for strings, so we can safely assume that the literal is a string literal.
				const literalValue = expression.literal.value;
				const startsWithCondition = literalValue.charAt(0) !== '%';
				const endsWithCondition = literalValue.charAt(expression.literal.value.length - 1) !== '%';

				if (!startsWithCondition && !endsWithCondition) {
					return getOperatorByName(not + OafOperator.CONTAINS);
				}
				if (startsWithCondition) {
					return getOperatorByName(not + OafOperator.BEGINS_WITH);
				}

				return getOperatorByName(not + OafOperator.ENDS_WITH);
			}
			case CqlOperator.BETWEEN:
				return getOperatorByName(not + OafOperator.BETWEEN);
			case CqlOperator.GREATER:
				return getOperatorByName(not + OafOperator.GREATER);
			case CqlOperator.GREATER_EQUALS:
				return getOperatorByName(not + OafOperator.GREATER_EQUALS);
			case CqlOperator.LESS:
				return getOperatorByName(not + OafOperator.LESS);
			case CqlOperator.LESS_EQUALS:
				return getOperatorByName(not + OafOperator.LESS_EQUALS);
			default: // Dev Safety. Happens when a new CqlOperator was introduced but not yet implemented in the Parser.
				throw new Error(`Can not convert operator with cql operator named "${cqlOperator}".`);
		}
	};
}

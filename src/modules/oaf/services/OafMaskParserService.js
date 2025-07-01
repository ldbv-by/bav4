import { CqlLexer, CqlTokenType } from '../utils/CqlLexer';
import { CqlOperator, createDefaultFilterGroup, createDefaultOafFilter, getOperatorByName } from '../utils/oafUtils';

export class OafMaskParserService {
	#cqlLexer;

	constructor() {
		this.#cqlLexer = new CqlLexer();
	}

	/**
	 * parses a cql string with the schema: ( ( () AND (
	 * ) ) OR (...) )
	 * and returns a ui filter object that can be consumed by OafMask component
	 * @param {*} string
	 * @returns
	 */
	parse(string, queryables) {
		const connectionTokenTypes = [CqlTokenType.And, CqlTokenType.Or];

		const unconsumedTokens = this.#cqlLexer.tokenize(string);
		if (unconsumedTokens.length === 0) {
			return [];
		}

		const validateBrackets = () => {
			let bracketDepth = 0;

			if (
				unconsumedTokens[0].type !== CqlTokenType.OpenBracket ||
				unconsumedTokens[unconsumedTokens.length - 1].type !== CqlTokenType.ClosedBracket
			) {
				throw new Error('CQL string must start with an opening bracket and end with a closing bracket.');
			}

			for (const token of unconsumedTokens) {
				if (token.type === CqlTokenType.OpenBracket) {
					bracketDepth++;
				} else if (token.type === CqlTokenType.ClosedBracket) {
					bracketDepth--;
				}

				if (bracketDepth < 0) {
					throw new Error('Closing bracket found without matching opening bracket.');
				}
			}
		};

		const findQueryableById = (id) => {
			return queryables.find((q) => q.id === id);
		};

		const peek = (index) => {
			return index < unconsumedTokens.length ? unconsumedTokens[index] : null;
		};

		const consume = () => {
			const tokenToReturn = unconsumedTokens[0];
			unconsumedTokens.splice(0, 1);
			return tokenToReturn;
		};

		const consumeSymbol = () => {
			const symbol = consume();
			if (symbol.type !== CqlTokenType.Symbol) {
				throw new Error(`Expected a symbol type but got "${symbol.type}".`);
			}
			return symbol;
		};

		const consumeOperator = () => {
			const operator = consume();
			if (![CqlTokenType.BinaryOperator, CqlTokenType.ComparisonOperator].includes(operator.type)) {
				throw new Error(`Expected an operator type but got "${operator.type}".`);
			}
			return operator;
		};

		const consumeLiteral = () => {
			const literal = consume();
			if (![CqlTokenType.String, CqlTokenType.Number, CqlTokenType.Boolean].includes(literal.type)) {
				throw new Error(`Expected a literal type but got "${literal.type}".`);
			}
			return literal;
		};

		const parseBinaryExpression = () => {
			const expr = { symbol: consumeSymbol(), operator: consumeOperator(), literal: consumeLiteral() };

			if (peek(1).type === CqlTokenType.Symbol && peek(2).type === CqlTokenType.BinaryOperator) {
				const andToken = consume(); // Ignore AND/OR token
				if (andToken.type !== CqlTokenType.And) {
					throw new Error(`Expected "${CqlTokenType.And}" but got "${andToken.type}".`);
				}

				const secondSymbol = consumeSymbol();
				const secondOperator = consumeOperator();
				const secondLiteral = consumeLiteral();

				if (expr.symbol.value !== secondSymbol.value) {
					throw new Error(`Expected symbol "${expr.symbol.value}" but got "${secondSymbol.value}".`);
				}

				const operatorCombinationString = expr.operator.value + secondOperator.value;
				const operatorCombination = { ...expr.operator };

				if (operatorCombinationString === '>=<=') {
					operatorCombination.value = '>=<=';
					operatorCombination.type = CqlTokenType.ComparisonOperator;
					operatorCombination.operatorName = CqlOperator.BETWEEN;

					return { symbol: expr.symbol, operator: operatorCombination, leftLiteral: expr.literal, rightLiteral: secondLiteral };
				}

				throw new Error(`Can not parse Expression - Unsupported operator combination: "${expr.operator.value}" and ${secondOperator.value}".`);
			}

			// Return simple binary expression
			return expr;
		};

		const parseComparisonExpression = () => {
			const symbol = consumeSymbol();
			const operator = consumeOperator();
			const literal = consumeLiteral();

			const andToken = consume();
			if (andToken.type !== CqlTokenType.And) {
				throw new Error(`Expected "${CqlTokenType.And}" but got "${andToken.type}".`);
			}

			const rightLiteral = consumeLiteral();
			return { symbol: symbol, operator: operator, leftLiteral: literal, rightLiteral: rightLiteral };
		};

		const parseExpression = () => {
			const peekedOperator = peek(1);

			if (peekedOperator.type === CqlTokenType.BinaryOperator) {
				return parseBinaryExpression();
			} else if (peekedOperator.type === CqlTokenType.ComparisonOperator) {
				return parseComparisonExpression();
			}

			throw new Error(`Unable to parse Expression. Operator of type "${peekedOperator.type}" is not supported.`);
		};

		const parseUnconsumedTokens = () => {
			const group = [];

			while (unconsumedTokens.length > 0) {
				let token = peek(0);

				while (unconsumedTokens.length > 0 && token.type !== CqlTokenType.OpenBracket && token.type !== CqlTokenType.ClosedBracket) {
					// Skip Ands and Ors because the resulting data is structured to distinguish between them.
					if (connectionTokenTypes.includes(peek(0).type)) {
						consume();
						token = peek(0);
						continue;
					}

					const expr = parseExpression();
					consume(); // Token after an expression is always ")".
					return expr;
				}

				if (token.type === CqlTokenType.OpenBracket) {
					consume();
					group.push(parseUnconsumedTokens());
				}

				if (token.type === CqlTokenType.ClosedBracket) {
					consume();
					return group;
				}
			}

			// return recursion root (contains 1 element otherwise can not build UI from it).
			return group.length < 1 ? [] : group[0];
		};

		const convertExpressionToOafFilter = (expression) => {
			const queryable = findQueryableById(expression.symbol.value);

			if (queryable === undefined) {
				return null;
			}
			switch (expression.operator.type) {
				case CqlTokenType.BinaryOperator:
					return {
						...createDefaultOafFilter(),
						operator: getOperatorByName(expression.operator.operatorName),
						queryable: queryable,
						value: expression.literal.value
					};
				case CqlTokenType.ComparisonOperator:
					return {
						...createDefaultOafFilter(),
						operator: getOperatorByName(expression.operator.operatorName),
						queryable: queryable,
						minValue: expression.leftLiteral.value,
						maxValue: expression.rightLiteral.value
					};
				default:
					throw new Error(`Can not convert Expression to OafFilter - Unsupported operator of type: "${expression.operator.type}"`);
			}
		};

		validateBrackets();
		// skip root, since it always is an array with 1 entry.
		const filterGroupExpressions = parseUnconsumedTokens();
		const result = [];

		// Create Filter Groups
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
}

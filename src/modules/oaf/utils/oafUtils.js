/**
 * @module modules/oaf/utils/oafUtils
 */
import { createUniqueId } from '../../../utils/numberUtils';
import { OafQueryableType } from '../../../domain/oaf';
import { isNumber, isString } from '../../../utils/checks';

/**
 * Enum representing operator names
 * @readonly
 * @enum {string}
 */
export const CqlOperator = Object.freeze({
	EQUALS: 'equals',
	NOT_EQUALS: 'not_equals',
	LIKE: 'like',
	NOT_LIKE: 'not_like',
	BETWEEN: 'between',
	NOT_BETWEEN: 'not_between',
	GREATER: 'greater',
	GREATER_EQUALS: 'greater_equals',
	LESS: 'less',
	LESS_EQUALS: 'less_equals',
	NOT: 'not_'
});

const operators = Object.freeze([
	{
		name: CqlOperator.EQUALS,
		translationKey: 'oaf_operator_equals'
	},
	{
		name: CqlOperator.NOT_EQUALS,
		translationKey: 'oaf_operator_not_equals'
	},
	{
		name: CqlOperator.LIKE,
		translationKey: 'oaf_operator_like',
		typeConstraints: [OafQueryableType.STRING]
	},
	{
		name: CqlOperator.NOT_LIKE,
		translationKey: 'oaf_operator_not_like',
		typeConstraints: [OafQueryableType.STRING]
	},
	{
		name: CqlOperator.BETWEEN,
		translationKey: 'oaf_operator_between',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.NOT_BETWEEN,
		translationKey: 'oaf_operator_not_between',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.GREATER,
		translationKey: 'oaf_operator_greater',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.GREATER_EQUALS,
		translationKey: 'oaf_operator_greater_equals',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.LESS,
		translationKey: 'oaf_operator_less',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.LESS_EQUALS,
		translationKey: 'oaf_operator_less_equals',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	}
]);

/**
 * Gets all Operator Definitions
 * @function
 * @param {string} [type] filters definitions by a type constraint
 *
 * @returns {Array<object>} List of operator definitions
 */
export const getOperatorDefinitions = (type = null) => {
	if (type === null) return [...operators];

	return operators.filter((op) => {
		const constraints = op.typeConstraints ?? [];

		if (constraints.length > 0) {
			return constraints.find((c) => c === type);
		}
		return true;
	});
};

/**
 * Gets a operator definition by the operator's name
 * @function
 * @param {string|CqlOperator} name - Name of the operator to get.
 *
 * @returns {object} The operator definition or undefined if not found
 */
export const getOperatorByName = (name) => {
	return getOperatorDefinitions().find((op) => op.name === name);
};

/**
 * Generates a full CQL-2 Text expression from a list of filter groups.
 * @function
 * @param {Array<object>} oafFilterGroups - An array of filter group objects, each containing precomputed CQL-2 expressions within there corresponding oafFilters.
 *
 * @returns {string} A combined CQL-2 Text expression representing all provided filter groups and filters.
 */
export const createCqlExpression = (oafFilterGroups) => {
	let finalExpression = '';
	for (let i = 0; i < oafFilterGroups.length; i++) {
		const group = oafFilterGroups[i];

		let groupExpression = '';

		for (let j = 0; j < group.oafFilters.length; j++) {
			const filter = group.oafFilters[j];
			filter.expression = createCqlFilterExpression(filter);

			if (filter.expression === '' || filter.expression === null) {
				continue;
			}

			if (groupExpression !== '') {
				groupExpression += ' AND ';
			}

			groupExpression += filter.expression;
		}

		if (groupExpression === '') continue;

		if (finalExpression === '') {
			finalExpression = '(' + groupExpression + ')';
		} else {
			finalExpression += ' OR ' + '(' + groupExpression + ')';
		}
	}

	if (finalExpression !== '') {
		finalExpression = '(' + finalExpression + ')';
	}
	return finalExpression;
};

/**
 * Generates a CQL-2 Text expression for the provided OafFilter properties.
 * @function
 * @param {object} oafFilter - Properties of a oafFilter.
 *
 * @returns {string} A CQL-2 Text expression for the provided OafFilter properties.
 */
export const createCqlFilterExpression = (oafFilter) => {
	const { value, minValue, maxValue, operator } = oafFilter;
	const { type, id } = oafFilter.queryable;
	const useQuotes = type === OafQueryableType.DATE || type === OafQueryableType.STRING;

	if (!Object.values(OafQueryableType).includes(type)) {
		return '';
	}

	if (!isString(id) || id.trim() === '') {
		return '';
	}

	const equalOp = (negate) => {
		const exprValue = value ?? '';

		if (!useQuotes && !isNumber(exprValue)) {
			return '';
		}

		const operator = negate ? '<>' : '=';
		const expression = useQuotes ? `${id} ${operator} '${exprValue}'` : `${id} ${operator} ${exprValue}`;
		return `(${expression})`;
	};

	const likeOp = (negate) => {
		const exprValue = value ?? '';
		const expression = `${id} LIKE '%${exprValue}%'`;
		return negate ? `NOT(${expression})` : `(${expression})`;
	};

	const greaterOp = (withEquals) => {
		if (!isNumber(value)) {
			return '';
		}

		return `(${id} ${withEquals ? '>=' : '>'} ${value})`;
	};

	const lessOp = (withEquals) => {
		if (!isNumber(value)) {
			return '';
		}

		return `(${id} ${withEquals ? '<=' : '<'} ${value})`;
	};

	const betweenOp = (negate) => {
		let exprMinValue = minValue === '' ? null : minValue;
		let exprMaxValue = maxValue === '' ? null : maxValue;
		let expression = null;

		if (exprMinValue !== null) {
			exprMinValue = useQuotes ? `'${exprMinValue}'` : exprMinValue;
		}

		if (exprMaxValue !== null) {
			exprMaxValue = useQuotes ? `'${exprMaxValue}'` : exprMaxValue;
		}

		if (exprMinValue !== null && exprMaxValue !== null) {
			expression = `${id} >= ${exprMinValue} AND ${id} <= ${exprMaxValue}`;
		} else if (exprMinValue !== null) {
			expression = `${id} >= ${exprMinValue}`;
		} else if (exprMaxValue !== null) {
			expression = `${id} <= ${exprMaxValue}`;
		}

		if (expression !== null) {
			return negate ? `NOT(${expression})` : `(${expression})`;
		}

		return '';
	};

	switch (operator.name) {
		case CqlOperator.EQUALS:
			return equalOp(false);
		case CqlOperator.NOT_EQUALS:
			return equalOp(true);
		case CqlOperator.LIKE:
			return likeOp(false);
		case CqlOperator.NOT_LIKE:
			return likeOp(true);
		case CqlOperator.GREATER:
			return greaterOp(false);
		case CqlOperator.GREATER_EQUALS:
			return greaterOp(true);
		case CqlOperator.LESS:
			return lessOp(false);
		case CqlOperator.LESS_EQUALS:
			return lessOp(true);
		case CqlOperator.BETWEEN:
			return betweenOp(false);
		case CqlOperator.NOT_BETWEEN:
			return betweenOp(true);
		default:
			return '';
		// Add more value cases here...
	}
};

/**
 * Creates a default representation an oafFilterGroup
 * @function
 *
 * @returns {object} properties of an oafFilterGroup
 */
export const createDefaultFilterGroup = () => {
	return { id: createUniqueId(), oafFilters: [] };
};

/**
 * Creates a default representation an oafFilter
 * @function
 *
 * @returns {object} properties of an oafFilter
 */
export const createDefaultOafFilter = () => {
	return {
		queryable: {},
		operator: getOperatorByName(CqlOperator.EQUALS),
		value: null,
		minValue: null,
		maxValue: null,
		expression: ''
	};
};

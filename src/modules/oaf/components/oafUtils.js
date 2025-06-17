/**
 * @module modules/oaf/components/oafUtils
 */
import { createUniqueId } from '../../../utils/numberUtils';
import { OafQueryableType } from '../../../domain/oaf';
import { isString } from '../../../utils/checks';

/**
 * Enum representing operator names
 * @readonly
 * @enum {string}
 */
export const CqlOperator = Object.freeze({
	EQUALS: 'equals',
	LIKE: 'like',
	GREATER: 'greater',
	LESSER: 'lesser',
	BETWEEN: 'between'
});

const operators = Object.freeze([
	{
		name: CqlOperator.EQUALS,
		translationKey: 'oaf_operator_equals'
	},
	{
		name: CqlOperator.LIKE,
		translationKey: 'oaf_operator_like',
		typeConstraints: [OafQueryableType.STRING]
	},
	{
		name: CqlOperator.GREATER,
		translationKey: 'oaf_operator_greater',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.LESSER,
		translationKey: 'oaf_operator_lesser',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.BETWEEN,
		translationKey: 'oaf_operator_between',
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
			if (filter.expression === '' || filter.expression === null) continue;

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
	const { value, minValue, maxValue, operator, useNegation } = oafFilter;
	const { type, name } = oafFilter.queryable;
	const useQuotes = type === OafQueryableType.DATE || type === OafQueryableType.STRING;

	if (!Object.values(OafQueryableType).includes(type)) {
		return '';
	}

	if (!isString(name)) {
		return '';
	}

	const equalOp = () => {
		const exprValue = value ?? '';
		const expression = useQuotes ? `${name} = '${exprValue}'` : `${name} = ${exprValue}`;
		return useNegation ? `NOT(${expression})` : `(${expression})`;
	};

	const likeOp = () => {
		const exprValue = value ?? '';
		const expression = `${name} LIKE '%${exprValue}%'`;
		return useNegation ? `NOT(${expression})` : `(${expression})`;
	};

	const greaterOp = () => {
		if (isNaN(value)) {
			return '';
		}

		const expression = `${name} > ${value}`;
		return useNegation ? `NOT(${expression})` : `(${expression})`;
	};

	const lesserOp = () => {
		if (isNaN(value)) {
			return '';
		}

		const expression = `${name} < ${value}`;
		return useNegation ? `NOT(${expression})` : `(${expression})`;
	};

	const betweenOp = () => {
		let exprMinValue = minValue;
		let exprMaxValue = maxValue;
		let expression = null;

		if (exprMinValue !== null) {
			exprMinValue = useQuotes ? `'${exprMinValue}'` : exprMinValue;
		}

		if (exprMaxValue !== null) {
			exprMaxValue = useQuotes ? `'${exprMaxValue}'` : exprMaxValue;
		}

		if (exprMinValue !== null && exprMaxValue !== null) {
			expression = `${name} <= ${exprMinValue} AND ${name} >= ${exprMaxValue}`;
		} else if (exprMinValue !== null) {
			expression = `${name} <= ${exprMinValue}`;
		} else if (exprMaxValue !== null) {
			expression = `${name} >= ${exprMaxValue}`;
		}

		if (expression !== null) {
			return useNegation ? `NOT(${expression})` : `(${expression})`;
		}

		return '';
	};

	switch (operator.name) {
		case CqlOperator.EQUALS:
			return equalOp();
		case CqlOperator.LIKE:
			return likeOp();
		case CqlOperator.GREATER:
			return greaterOp();
		case CqlOperator.LESSER:
			return lesserOp();
		case CqlOperator.BETWEEN:
			return betweenOp();
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
		expression: '',
		useNegation: false
	};
};

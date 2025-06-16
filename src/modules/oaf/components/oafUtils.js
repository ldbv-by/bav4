/**
 * @module modules/oaf/components/oafUtils
 */
import { createUniqueId } from '../../../utils/numberUtils';
import { OafQueryableType } from '../../../domain/oaf';

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
		key: 'oaf_operator_equals'
	},
	{
		name: CqlOperator.LIKE,
		key: 'oaf_operator_like',
		typeConstraints: [OafQueryableType.STRING]
	},
	{
		name: CqlOperator.GREATER,
		key: 'oaf_operator_greater',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.LESSER,
		key: 'oaf_operator_lesser',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT]
	},
	{
		name: CqlOperator.BETWEEN,
		key: 'oaf_operator_between',
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
	const { operator } = oafFilter;
	const { type, name } = oafFilter.queryable;
	const isString = type === 'date' || type === 'time' || type === 'string';
	const value = oafFilter.value;
	let { minValue, maxValue } = oafFilter;

	if (value !== null) {
		switch (operator.key) {
			case 'oaf_operator_equals':
				if (isString) {
					return `(${name} = '${value}')`;
				}
				return `(${name} = ${value})`;
			case 'oaf_operator_like':
				return `(${name} LIKE '%${value}%')`;
			case 'oaf_operator_greater':
				return `(${name} > ${value})`;
			case 'oaf_operator_lesser':
				return `(${name} < ${value})`;
			// Add more value cases here...
		}
	}

	if (operator.key === 'oaf_operator_between') {
		if (minValue !== null) {
			minValue = isString ? `'${minValue}'` : minValue;
		}

		if (maxValue !== null) {
			maxValue = isString ? `'${maxValue}'` : maxValue;
		}

		if (minValue !== null && maxValue !== null) {
			return `(${name} <= ${minValue} AND ${name} >= ${maxValue})`;
		} else if (minValue !== null) {
			return `(${name} <= ${minValue})`;
		} else if (maxValue !== null) {
			return `(${name} >= ${maxValue})`;
		}
	}

	return '';
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

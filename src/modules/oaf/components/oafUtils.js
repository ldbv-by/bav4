/**
 * @module modules/oaf/components/oafUtils
 */
import { createUniqueId } from '../../../utils/numberUtils';

const operators = Object.freeze([
	{
		name: 'equals',
		key: 'oaf_operator_equals'
	},
	{
		name: 'like',
		key: 'oaf_operator_like',
		typeConstraints: ['string']
	},
	{
		name: 'greater',
		key: 'oaf_operator_greater',
		typeConstraints: ['integer', 'float']
	},
	{
		name: 'lesser',
		key: 'oaf_operator_lesser',
		typeConstraints: ['integer', 'float']
	},
	{
		name: 'between',
		key: 'oaf_operator_between',
		typeConstraints: ['integer', 'float']
	}
]);

/**
 * Gets all Operator Definitions
 * @function
 * @param {string} [type] filters definitions by a type constraint
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
 * @param {string} name - Name of the operator to get.
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
export const createOafExpression = (oafFilterGroups) => {
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
 * Generates a CQL-2 Text expression for a provided OafFilter model.
 * @function
 * @param {object} oafFilter - Model of a oafFilter.
 *
 * @returns {string} A CQL-2 Text expression for the provided OafFilter model.
 */
export const createOafFilterExpression = (oafFilter) => {
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
 * Creates a default model representing an oafFilterGroup
 * @function
 */
export const createDefaultFilterGroup = () => {
	return { id: createUniqueId(), oafFilters: [] };
};

/**
 * Creates a default model representing an oafFilter
 * @function
 *
 */
export const createDefaultOafFilter = () => {
	return {
		queryable: {},
		operator: getOperatorByName('equals'),
		value: null,
		minValue: null,
		maxValue: null,
		expression: ''
	};
};

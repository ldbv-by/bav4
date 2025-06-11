/**
 * @module modules/oaf/components/oafUtils
 */
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

export const getOperatorByName = (name) => {
	return getOperatorDefinitions().find((op) => op.name === name);
};

/**
 * Returns a CQL-2 Text expression for a provided OafFilter model.
 * @param {Object} oafFilter
 */
export const createExpression = (oafFilter) => {
	const { operator } = oafFilter;
	const { type, name } = oafFilter.queryable;
	const isString = type === 'date' || type === 'time' || type === 'string';

	let { value, minValue, maxValue } = oafFilter;

	if (value !== null) {
		if (isString) {
			value = `'${value}'`;
		}

		switch (operator.key) {
			case 'oaf_operator_equals':
				return `(${name} = ${value})`;
			case 'oaf_operator_like':
				return `(${name} LIKE %${value}%)`;
			case 'oaf_operator_greater':
				return `(${name} > ${value})`;
			case 'oaf_operator_lesser':
				return `(${name} < ${value})`;
			// Add more value cases here...
			default:
				return '';
		}
	}

	if (operator.key === 'oaf_operator_between') {
		if (minValue !== null) {
			minValue = isString ? minValue : `'${minValue}'`;
		}

		if (maxValue !== null) {
			maxValue = isString ? maxValue : `'${maxValue}'`;
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

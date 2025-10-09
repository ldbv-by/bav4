/**
 * @module modules/oaf/utils/oafUtils
 */
import { createUniqueId } from '../../../utils/numberUtils';
import { OafQueryableType } from '../../../domain/oaf';
import { isNumber, isString } from '../../../utils/checks';
import { CqlKeyword } from './CqlLexer';

/**
 * Enum representing operators used in the @link {OafMask}
 * @readonly
 * @enum {string}
 */
export const OafOperator = Object.freeze({
	EQUALS: 'equals',
	NOT_EQUALS: 'not_equals',
	CONTAINS: 'contains',
	NOT_CONTAINS: 'not_contains',
	BEGINS_WITH: 'begins_with',
	NOT_BEGINS_WITH: 'not_begins_with',
	ENDS_WITH: 'ends_with',
	NOT_ENDS_WITH: 'not_ends_with',
	BETWEEN: 'between',
	NOT_BETWEEN: 'not_between',
	GREATER: 'greater',
	GREATER_EQUALS: 'greater_equals',
	LESS: 'less',
	LESS_EQUALS: 'less_equals',
	NOT: 'not_'
});

export const OafOperatorType = Object.freeze({
	Binary: 'binary',
	Comparison: 'comparison'
});

const keywordDefinitions = Object.freeze([
	{
		keyword: CqlKeyword.EQUALS,
		translationKey: 'oaf_operator_equals'
	},
	{
		keyword: CqlKeyword.NOT_EQUALS,
		translationKey: 'oaf_operator_not_equals'
	},
	{
		keyword: CqlKeyword.BETWEEN,
		translationKey: 'oaf_operator_between'
	},
	{
		keyword: CqlKeyword.LIKE,
		translationKey: 'oaf_operator_like'
	},
	{
		keyword: CqlKeyword.GREATER,
		translationKey: 'oaf_operator_greater'
	},
	{
		keyword: CqlKeyword.GREATER_EQUALS,
		translationKey: 'oaf_operator_greater_equals'
	},
	{
		keyword: CqlKeyword.LESS,
		translationKey: 'oaf_operator_less'
	},
	{
		keyword: CqlKeyword.LESS_EQUALS,
		translationKey: 'oaf_operator_less_equals'
	},
	{
		keyword: CqlKeyword.DATE,
		translationKey: 'oaf_operator_date'
	},
	{
		keyword: CqlKeyword.TIMESTAMP,
		translationKey: 'oaf_operator_timestamp'
	},
	{
		keyword: CqlKeyword.AND,
		translationKey: 'oaf_operator_and'
	},
	{
		keyword: CqlKeyword.OR,
		translationKey: 'oaf_operator_or'
	},
	{
		keyword: CqlKeyword.NOT,
		translationKey: 'oaf_operator_not'
	}
]);

const oafOperatorDefinitions = Object.freeze([
	{
		name: OafOperator.EQUALS,
		translationKey: 'oaf_operator_equals',
		operatorType: OafOperatorType.Binary,
		allowPattern: true
	},
	{
		name: OafOperator.NOT_EQUALS,
		translationKey: 'oaf_operator_not_equals',
		operatorType: OafOperatorType.Binary,
		allowPattern: true
	},
	{
		name: OafOperator.GREATER,
		translationKey: 'oaf_operator_greater',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.GREATER_EQUALS,
		translationKey: 'oaf_operator_greater_equals',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.LESS,
		translationKey: 'oaf_operator_less',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.LESS_EQUALS,
		translationKey: 'oaf_operator_less_equals',
		typeConstraints: [OafQueryableType.INTEGER, OafQueryableType.FLOAT],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.CONTAINS,
		translationKey: 'oaf_operator_contains',
		typeConstraints: [OafQueryableType.STRING],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.NOT_CONTAINS,
		translationKey: 'oaf_operator_not_contains',
		typeConstraints: [OafQueryableType.STRING],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.BEGINS_WITH,
		translationKey: 'oaf_operator_begins_with',
		typeConstraints: [OafQueryableType.STRING],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.NOT_BEGINS_WITH,
		translationKey: 'oaf_operator_not_begins_with',
		typeConstraints: [OafQueryableType.STRING],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.ENDS_WITH,
		translationKey: 'oaf_operator_ends_with',
		typeConstraints: [OafQueryableType.STRING],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.NOT_ENDS_WITH,
		translationKey: 'oaf_operator_not_ends_with',
		typeConstraints: [OafQueryableType.STRING],
		operatorType: OafOperatorType.Binary,
		allowPattern: false
	},
	{
		name: OafOperator.BETWEEN,
		translationKey: 'oaf_operator_between',
		typeConstraints: [OafQueryableType.DATE, OafQueryableType.DATETIME, OafQueryableType.INTEGER, OafQueryableType.FLOAT],
		operatorType: OafOperatorType.Comparison,
		allowPattern: false
	},
	{
		name: OafOperator.NOT_BETWEEN,
		translationKey: 'oaf_operator_not_between',
		typeConstraints: [OafQueryableType.DATE, OafQueryableType.DATETIME, OafQueryableType.INTEGER, OafQueryableType.FLOAT],
		operatorType: OafOperatorType.Comparison,
		allowPattern: false
	}
]);

/**
 * Gets all OafOperator Definitions
 * @function
 * @param {string} [type] filters definitions by a type constraint
 *
 * @returns {Array<object>} List of oafOperator definitions
 */
export const getOafOperatorDefinitions = (type = null) => {
	if (type === null) return [...oafOperatorDefinitions];

	return oafOperatorDefinitions.filter((op) => {
		const constraints = op.typeConstraints ?? [];

		if (constraints.length > 0) {
			return constraints.find((c) => c === type);
		}
		return true;
	});
};

/**
 * Gets all CqlOperator Definitions
 * @function
 * @returns {Array<object>} List of cqlOperator definitions
 */
export const getCqlKeywordDefinitions = () => {
	return [...keywordDefinitions];
};

/**
 * Gets a operator definition by the operator's name
 * @function
 * @param {string|OafOperator} name - Name of the operator to get.
 *
 * @returns {object} The operator definition or undefined if not found
 */
export const getOperatorByName = (name) => {
	return { ...getOafOperatorDefinitions().find((op) => op.name === name) };
};

/**
 * Generates a full CQL-2 Text expression from a list of filter groups.
 * @function
 * @param {Array<object>} oafFilters - An array of OafFilter objects
 *
 * @returns {string} A grouped CQL-2 Text expression.
 */
export const oafFiltersToCqlExpressionGroup = (oafFilters) => {
	let groupExpression = '';

	for (let j = 0; j < oafFilters.length; j++) {
		const filter = oafFilters[j];
		filter.expression = oafFilterToCqlExpression(filter);

		if (filter.expression === '' || filter.expression === null) {
			continue;
		}

		if (groupExpression !== '') {
			groupExpression += ' AND ';
		}

		groupExpression += filter.expression;
	}

	return groupExpression !== '' ? `(${groupExpression})` : '';
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
		const groupExpression = oafFilterGroups[i].expression;

		if (groupExpression === '') continue;

		if (finalExpression === '') {
			finalExpression = groupExpression;
		} else {
			finalExpression += ' OR ' + groupExpression;
		}
	}

	return finalExpression !== '' ? `(${finalExpression})` : '';
};

/**
 * Generates a CQL-2 Text expression for the provided OafFilter properties.
 * @function
 * @param {object} oafFilter - Properties of a oafFilter.
 *
 * @returns {string} A CQL-2 Text expression for the provided OafFilter properties.
 */
export const oafFilterToCqlExpression = (oafFilter) => {
	const { value, minValue, maxValue, operator } = oafFilter;
	const { type, id } = oafFilter.queryable;

	if (!isString(id) || id.trim() === '') {
		return '';
	}

	if (!Object.values(OafQueryableType).includes(type)) {
		return '';
	}

	const equalOp = (negate) => {
		let exprValue = null;

		switch (type) {
			case OafQueryableType.STRING:
				exprValue = value ? `'${value}'` : "''";
				break;
			case OafQueryableType.DATETIME:
				exprValue = value ? `TIMESTAMP('${value}Z')` : null;
				break;
			case OafQueryableType.DATE:
				exprValue = value ? `DATE('${value}')` : null;
				break;
			case OafQueryableType.INTEGER:
			case OafQueryableType.FLOAT:
				exprValue = isNumber(value) ? value : null;
				break;
			case OafQueryableType.BOOLEAN:
				exprValue = value === 'true' || value === true;
		}

		if (exprValue === null) {
			return '';
		}

		const operator = negate ? '<>' : '=';
		const expression = `${id} ${operator} ${exprValue}`;
		return `(${expression})`;
	};

	const likeOp = (options = { negate: false, prefix: '%', postfix: '%' }) => {
		const exprValue = `${options.prefix}${value ? value : ''}${options.postfix}`;

		const expression = `${id} LIKE '${exprValue}'`;
		return options.negate ? `NOT(${expression})` : `(${expression})`;
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
		let exprMinValue = null;
		let exprMaxValue = null;
		let expression = null;

		switch (type) {
			case OafQueryableType.INTEGER:
			case OafQueryableType.FLOAT:
				exprMinValue = isNumber(minValue) ? minValue : null;
				exprMaxValue = isNumber(maxValue) ? maxValue : null;
				break;
			case OafQueryableType.DATE:
				exprMinValue = minValue ? `DATE('${minValue}')` : null;
				exprMaxValue = maxValue ? `DATE('${maxValue}')` : null;
				break;
			case OafQueryableType.DATETIME:
				exprMinValue = minValue ? `TIMESTAMP('${minValue}Z')` : null;
				exprMaxValue = maxValue ? `TIMESTAMP('${maxValue}Z')` : null;
				break;
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
		case OafOperator.EQUALS:
			return equalOp(false);
		case OafOperator.NOT_EQUALS:
			return equalOp(true);
		case OafOperator.CONTAINS:
			return likeOp();
		case OafOperator.NOT_CONTAINS:
			return likeOp({ negate: true, prefix: '%', postfix: '%' });
		case OafOperator.BEGINS_WITH:
			return likeOp({ negate: false, prefix: '', postfix: '%' });
		case OafOperator.NOT_BEGINS_WITH:
			return likeOp({ negate: true, prefix: '', postfix: '%' });
		case OafOperator.ENDS_WITH:
			return likeOp({ negate: false, prefix: '%', postfix: '' });
		case OafOperator.NOT_ENDS_WITH:
			return likeOp({ negate: true, prefix: '%', postfix: '' });
		case OafOperator.GREATER:
			return greaterOp(false);
		case OafOperator.GREATER_EQUALS:
			return greaterOp(true);
		case OafOperator.LESS:
			return lessOp(false);
		case OafOperator.LESS_EQUALS:
			return lessOp(true);
		case OafOperator.BETWEEN:
			return betweenOp(false);
		case OafOperator.NOT_BETWEEN:
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
	return { id: createUniqueId(), oafFilters: [], expression: '' };
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
		operator: getOperatorByName(OafOperator.EQUALS),
		value: null,
		minValue: null,
		maxValue: null,
		expression: ''
	};
};

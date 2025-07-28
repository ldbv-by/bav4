import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { TestUtils } from '../../../test-utils';
import {
	createDefaultFilterGroup,
	createDefaultOafFilter,
	createCqlFilterExpression,
	createCqlExpression,
	getOperatorByName,
	getOperatorDefinitions,
	OafOperator,
	OafOperatorType
} from '../../../../src/modules/oaf/utils/oafUtils';
import { $injector } from '../../../../src/injection';
import { OafQueryableType } from '../../../../src/domain/oaf';

window.customElements.define(OafFilter.tag, OafFilter);

describe('oafUtils', () => {
	const allOperators = Object.values(OafOperator).filter((o) => o !== OafOperator.NOT);
	const numberOperators = [
		OafOperator.EQUALS,
		OafOperator.NOT_EQUALS,
		OafOperator.GREATER,
		OafOperator.GREATER_EQUALS,
		OafOperator.LESS,
		OafOperator.LESS_EQUALS,
		OafOperator.BETWEEN,
		OafOperator.NOT_BETWEEN
	];

	const createQueryable = (id, type) => {
		return {
			id: id,
			type: type,
			values: [],
			finalList: false
		};
	};

	beforeEach(() => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
	});

	describe('Enum OafOperator', () => {
		it('provides an enum of all known OafOperator types', () => {
			expect(Object.keys(OafOperator).length).toBe(15);
			expect(Object.isFrozen(OafOperator)).toBeTrue();

			expect(OafOperator.EQUALS).toBe('equals');
			expect(OafOperator.NOT_EQUALS).toBe('not_equals');

			expect(OafOperator.CONTAINS).toBe('contains');
			expect(OafOperator.NOT_CONTAINS).toBe('not_contains');
			expect(OafOperator.BEGINS_WITH).toBe('begins_with');
			expect(OafOperator.NOT_BEGINS_WITH).toBe('not_begins_with');
			expect(OafOperator.ENDS_WITH).toBe('ends_with');
			expect(OafOperator.NOT_ENDS_WITH).toBe('not_ends_with');

			expect(OafOperator.GREATER).toBe('greater');
			expect(OafOperator.GREATER_EQUALS).toBe('greater_equals');
			expect(OafOperator.LESS).toBe('less');
			expect(OafOperator.LESS_EQUALS).toBe('less_equals');

			expect(OafOperator.BETWEEN).toBe('between');
			expect(OafOperator.NOT_BETWEEN).toBe('not_between');
			expect(OafOperator.NOT).toBe('not_');
		});

		it('has a operator definition for every OafOperator type', () => {
			expect(allOperators.length).toBe(getOperatorDefinitions().length);
			expect(getOperatorByName(OafOperator.EQUALS)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.EQUALS,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_equals',
					allowPattern: true
				})
			);
			expect(getOperatorByName(OafOperator.NOT_EQUALS)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.NOT_EQUALS,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_not_equals',
					allowPattern: true
				})
			);
			expect(getOperatorByName(OafOperator.CONTAINS)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.CONTAINS,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_contains',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.NOT_CONTAINS)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.NOT_CONTAINS,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_not_contains'
				})
			);
			expect(getOperatorByName(OafOperator.BEGINS_WITH)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.BEGINS_WITH,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_begins_with',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.NOT_BEGINS_WITH)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.NOT_BEGINS_WITH,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_not_begins_with',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.ENDS_WITH)).toEqual(
				jasmine.objectContaining({ name: OafOperator.ENDS_WITH, operatorType: OafOperatorType.Binary, translationKey: 'oaf_operator_ends_with' })
			);
			expect(getOperatorByName(OafOperator.NOT_ENDS_WITH)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.NOT_ENDS_WITH,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_not_ends_with',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.GREATER)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.GREATER,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_greater',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.GREATER_EQUALS)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.GREATER_EQUALS,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_greater_equals',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.LESS)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.LESS,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_less',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.LESS_EQUALS)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.LESS_EQUALS,
					operatorType: OafOperatorType.Binary,
					translationKey: 'oaf_operator_less_equals',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.BETWEEN)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.BETWEEN,
					operatorType: OafOperatorType.Comparison,
					translationKey: 'oaf_operator_between',
					allowPattern: false
				})
			);
			expect(getOperatorByName(OafOperator.NOT_BETWEEN)).toEqual(
				jasmine.objectContaining({
					name: OafOperator.NOT_BETWEEN,
					operatorType: OafOperatorType.Comparison,
					translationKey: 'oaf_operator_not_between',
					allowPattern: false
				})
			);
		});
	});

	describe('createDefaultOafFilter', () => {
		it('creates a default oafFilter representation', async () => {
			const oafFilterElement = await TestUtils.render(OafFilter.tag);
			expect(createDefaultOafFilter()).toEqual({ ...oafFilterElement.getModel(), expression: oafFilterElement.expression });
		});
	});

	describe('getOperatorDefinitions', () => {
		it('returns all defined operators by default', () => {
			const operators = getOperatorDefinitions();

			expect(operators).toHaveSize(allOperators.length);
			expect(operators.map((op) => op.name)).toEqual(jasmine.arrayContaining(allOperators));
		});

		it('returns default when optional type parameter is set to null', () => {
			const operatorsNullTyped = getOperatorDefinitions(null);
			const operatorsDefault = getOperatorDefinitions();

			expect(operatorsNullTyped).toHaveSize(operatorsDefault.length);
			expect(operatorsNullTyped).toEqual(jasmine.arrayContaining(operatorsDefault));
		});

		it('returns defined operators for queryable type "integer"', () => {
			const operators = getOperatorDefinitions('integer');

			expect(operators).toHaveSize(numberOperators.length);
			expect(operators.map((op) => op.name)).toEqual(jasmine.arrayContaining(numberOperators));
		});

		it('returns defined operators for queryable type "float"', () => {
			const operators = getOperatorDefinitions('float');

			expect(operators).toHaveSize(numberOperators.length);
			expect(operators.map((op) => op.name)).toEqual(jasmine.arrayContaining(numberOperators));
		});
	});

	describe('getOperatorByName', () => {
		it('returns operator by name', () => {
			const operator = getOperatorByName(OafOperator.BETWEEN);

			expect(operator).toEqual(
				jasmine.objectContaining({
					name: 'between'
				})
			);
		});
	});

	describe('createCqlFilterExpression', () => {
		it('returns an empty string when queryable name is missing', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.value = 'bar';

			oafFilter.queryable = createQueryable('', OafQueryableType.STRING);
			expect(createCqlFilterExpression(oafFilter)).toBe('');

			oafFilter.queryable = createQueryable(' ', OafQueryableType.STRING);
			expect(createCqlFilterExpression(oafFilter)).toBe('');

			oafFilter.queryable = createQueryable(null, OafQueryableType.STRING);
			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});

		it('returns an empty string when OafQueryableType is unknown', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', 'unknown type');
			oafFilter.value = 'bar';

			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});

		it('creates a "equals" CQL expression for a string type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);

			oafFilter.value = 'bar';
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo = 'bar')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe("(foo <> 'bar')");
		});

		it('creates a "equals" CQL expression with empty value for a string type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo = '')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe("(foo <> '')");

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo = '')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe("(foo <> '')");
		});

		it('creates a "equals" CQL expression for a boolean type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.BOOLEAN);

			oafFilter.value = 'true';
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = true)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('(foo <> true)');

			oafFilter.value = true;
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = true)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('(foo <> true)');

			oafFilter.value = false;
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = false)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('(foo <> false)');

			oafFilter.value = 'false';
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = false)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('(foo <> false)');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = false)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('(foo <> false)');

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = false)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('(foo <> false)');
		});

		it('creates a "equals" CQL expression for an integer type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.value = 0.25;
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = 0.25)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('(foo <> 0.25)');
		});

		it('creates an empty "equals" CQL expression for a integer type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('');
		});

		it('creates a "equals" CQL expression for a float type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.FLOAT);

			oafFilter.value = 0.25;
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = 0.25)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('(foo <> 0.25)');
		});

		it('creates an empty "equals" CQL expression for a float type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.FLOAT);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('');
		});

		it('creates a "equals" CQL expression for a date type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.DATE);

			oafFilter.value = '2025-08-12';
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo = DATE('2025-08-12'))");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe("(foo <> DATE('2025-08-12'))");
		});

		it('creates an empty "equals" CQL expression for a date type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.DATE);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_EQUALS) })).toBe('');
		});

		it('creates a "like" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);
			oafFilter.value = 'bar';

			// Testing all OafOperators that are supposed to use "LIKE" expressions:
			oafFilter.operator = getOperatorByName(OafOperator.CONTAINS);
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE '%bar%')");

			oafFilter.operator = getOperatorByName(OafOperator.NOT_CONTAINS);
			expect(createCqlFilterExpression(oafFilter)).toBe("NOT(foo LIKE '%bar%')");

			oafFilter.operator = getOperatorByName(OafOperator.BEGINS_WITH);
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE 'bar%')");

			oafFilter.operator = getOperatorByName(OafOperator.NOT_BEGINS_WITH);
			expect(createCqlFilterExpression(oafFilter)).toBe("NOT(foo LIKE 'bar%')");

			oafFilter.operator = getOperatorByName(OafOperator.ENDS_WITH);
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE '%bar')");

			oafFilter.operator = getOperatorByName(OafOperator.NOT_ENDS_WITH);
			expect(createCqlFilterExpression(oafFilter)).toBe("NOT(foo LIKE '%bar')");
		});

		it('creates a "like" CQL expression with an empty value', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);
			oafFilter.value = null;

			[null, ''].forEach((value) => {
				oafFilter.value = value;
				oafFilter.operator = getOperatorByName(OafOperator.CONTAINS);
				expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE '%%')");

				oafFilter.operator = getOperatorByName(OafOperator.NOT_CONTAINS);
				expect(createCqlFilterExpression(oafFilter)).toBe("NOT(foo LIKE '%%')");

				oafFilter.operator = getOperatorByName(OafOperator.BEGINS_WITH);
				expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE '%')");

				oafFilter.operator = getOperatorByName(OafOperator.NOT_BEGINS_WITH);
				expect(createCqlFilterExpression(oafFilter)).toBe("NOT(foo LIKE '%')");

				oafFilter.operator = getOperatorByName(OafOperator.ENDS_WITH);
				expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE '%')");

				oafFilter.operator = getOperatorByName(OafOperator.NOT_ENDS_WITH);
				expect(createCqlFilterExpression(oafFilter)).toBe("NOT(foo LIKE '%')");
			});
		});

		it('creates a "between" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.minValue = 2;
			oafFilter.maxValue = 8;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo >= 2 AND foo <= 8)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_BETWEEN) })).toBe('NOT(foo >= 2 AND foo <= 8)');
		});

		it('creates a "between" CQL expression with date type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.DATE);
			oafFilter.minValue = '2025-08-12';
			oafFilter.maxValue = '2025-08-25';

			expect(createCqlFilterExpression(oafFilter)).toBe("(foo >= DATE('2025-08-12') AND foo <= DATE('2025-08-25'))");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_BETWEEN) })).toBe(
				"NOT(foo >= DATE('2025-08-12') AND foo <= DATE('2025-08-25'))"
			);
		});

		it('creates a "between" CQL expression without "maxValue"', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.minValue = 2;
			oafFilter.maxValue = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo >= 2)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_BETWEEN) })).toBe('NOT(foo >= 2)');

			oafFilter.queryable = createQueryable('foo', OafQueryableType.DATE);
			oafFilter.minValue = '2022-08-12';
			oafFilter.maxValue = null;
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo >= DATE('2022-08-12'))");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_BETWEEN) })).toBe(
				"NOT(foo >= DATE('2022-08-12'))"
			);
		});

		it('creates a "between" CQL expression without "minValue"', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.BETWEEN);

			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.minValue = null;
			oafFilter.maxValue = 8;
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo <= 8)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_BETWEEN) })).toBe('NOT(foo <= 8)');

			oafFilter.queryable = createQueryable('foo', OafQueryableType.DATE);
			oafFilter.minValue = null;
			oafFilter.maxValue = '2022-08-12';
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo <= DATE('2022-08-12'))");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_BETWEEN) })).toBe(
				"NOT(foo <= DATE('2022-08-12'))"
			);
		});

		it('creates an empty CQL expression for operator "between" without values', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.minValue = null;
			oafFilter.maxValue = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_BETWEEN) })).toBe('');

			oafFilter.minValue = '';
			oafFilter.maxValue = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(OafOperator.NOT_BETWEEN) })).toBe('');
		});

		it('creates a "greater" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.GREATER);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.value = 10;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo > 10)');
		});

		it('creates an empty "greater" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.GREATER);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});

		it('creates a "greater or equal" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.GREATER_EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.value = 10;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo >= 10)');
		});

		it('creates an empty "greater or equal" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.GREATER_EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});

		it('creates a "less" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.LESS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.value = 10;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo < 10)');
		});

		it('creates an empty "less" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.LESS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});

		it('creates a "less or equal" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.LESS_EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.value = 10;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo <= 10)');
		});

		it('creates an empty "less or equal" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(OafOperator.LESS_EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});

		it('creates an empty CQL expression when operator is not defined', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = { name: 'undefined name', key: 'undefined key' };
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.value = 10;

			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});
	});

	describe('createCqlExpression', () => {
		it('creates a empty expression when filter groups are empty', () => {
			const group = createDefaultFilterGroup();

			expect(createCqlExpression([])).toBe('');
			expect(createCqlExpression([group])).toBe('');
		});

		it('creates an group-expression when a group contains an oafFilter with an expression', () => {
			const group = createDefaultFilterGroup();
			group.oafFilters = [
				{
					...createDefaultOafFilter(),
					operator: getOperatorByName(OafOperator.EQUALS),
					queryable: createQueryable('foo', OafQueryableType.STRING),
					value: 'bar'
				}
			];

			expect(createCqlExpression([group])).toBe("(((foo = 'bar')))");
		});

		it('does not concatenate empty oafFilter expressions within a group', () => {
			const group = createDefaultFilterGroup();
			group.oafFilters = [
				{
					...createDefaultOafFilter(),
					operator: getOperatorByName(OafOperator.CONTAINS),
					queryable: createQueryable('exp1', OafQueryableType.STRING),
					value: 'val1'
				},
				{
					...createDefaultOafFilter()
				}
			];

			expect(createCqlExpression([group])).toBe("(((exp1 LIKE '%val1%')))");
		});

		it('concatenates oafFilters\' expressions within a group with "AND"', () => {
			const group = createDefaultFilterGroup();
			group.oafFilters = [
				{
					...createDefaultOafFilter(),
					operator: getOperatorByName(OafOperator.BEGINS_WITH),
					queryable: createQueryable('exp1', OafQueryableType.STRING),
					value: 'val1'
				},
				{
					...createDefaultOafFilter(),
					operator: getOperatorByName(OafOperator.EQUALS),
					queryable: createQueryable('exp2', OafQueryableType.STRING),
					value: 'val2'
				},
				{
					// Should not affect out, since filter is empty, thus has no expression
					...createDefaultOafFilter()
				}
			];

			expect(createCqlExpression([group])).toBe("(((exp1 LIKE 'val1%') AND (exp2 = 'val2')))");
		});

		it('concatenates multiple groups with "OR"', () => {
			const groupA = createDefaultFilterGroup();
			const groupB = createDefaultFilterGroup();

			groupA.oafFilters = [
				{
					...createDefaultOafFilter(),
					operator: getOperatorByName(OafOperator.ENDS_WITH),
					queryable: createQueryable('exp1', OafQueryableType.STRING),
					value: 'val1'
				}
			];

			groupB.oafFilters = [
				{
					...createDefaultOafFilter(),
					operator: getOperatorByName(OafOperator.BEGINS_WITH),
					queryable: createQueryable('exp2', OafQueryableType.STRING),
					value: 'val2'
				}
			];

			expect(createCqlExpression([groupA, groupB])).toBe("(((exp1 LIKE '%val1')) OR ((exp2 LIKE 'val2%')))");
		});

		it('does not concatenate groups with empty filters or filter-expressions', () => {
			const groupA = createDefaultFilterGroup();
			const groupB = createDefaultFilterGroup();
			const groupC = createDefaultFilterGroup();

			groupA.oafFilters = [
				{
					...createDefaultOafFilter(),
					operator: getOperatorByName(OafOperator.CONTAINS),
					queryable: createQueryable('exp1', OafQueryableType.STRING),
					value: 'val1'
				}
			];

			groupB.oafFilters = [
				{
					...createDefaultOafFilter()
				}
			];

			expect(createCqlExpression([groupA, groupB, groupC])).toBe("(((exp1 LIKE '%val1%')))");
		});
	});
});

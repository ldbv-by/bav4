import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { TestUtils } from '../../../test-utils';
import {
	createDefaultFilterGroup,
	createDefaultOafFilter,
	createCqlFilterExpression,
	createCqlExpression,
	getOperatorByName,
	getOperatorDefinitions,
	CqlOperator
} from '../../../../src/modules/oaf/components/oafUtils';
import { $injector } from '../../../../src/injection';
import { OafQueryableType } from '../../../../src/domain/oaf';

window.customElements.define(OafFilter.tag, OafFilter);

describe('oafUtils', () => {
	const allOperators = ['equals', 'not_equals', 'like', 'not_like', 'greater', 'less', 'between', 'not_between'];
	const numberOperators = ['equals', 'not_equals', 'greater', 'less', 'between', 'not_between'];

	const createQueryable = (name, type) => {
		return {
			name: name,
			type: type,
			values: [],
			finalList: false
		};
	};

	beforeEach(() => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
	});

	describe('Enum CqlOperator', () => {
		it('provides an enum of all known CqlOperator types', () => {
			expect(Object.keys(CqlOperator).length).toBe(8);
			expect(Object.isFrozen(CqlOperator)).toBeTrue();

			expect(CqlOperator.EQUALS).toBe('equals');
			expect(CqlOperator.NOT_EQUALS).toBe('not_equals');
			expect(CqlOperator.LIKE).toBe('like');
			expect(CqlOperator.NOT_LIKE).toBe('not_like');
			expect(CqlOperator.GREATER).toBe('greater');
			expect(CqlOperator.LESS).toBe('less');
			expect(CqlOperator.BETWEEN).toBe('between');
			expect(CqlOperator.NOT_BETWEEN).toBe('not_between');
		});

		it('has a operator definition for every CqlOperator type', () => {
			expect(Object.keys(CqlOperator).length).toBe(getOperatorDefinitions().length);
			expect(getOperatorByName(CqlOperator.EQUALS)).toEqual(jasmine.objectContaining({ name: CqlOperator.EQUALS }));
			expect(getOperatorByName(CqlOperator.NOT_EQUALS)).toEqual(jasmine.objectContaining({ name: CqlOperator.NOT_EQUALS }));
			expect(getOperatorByName(CqlOperator.LIKE)).toEqual(jasmine.objectContaining({ name: CqlOperator.LIKE }));
			expect(getOperatorByName(CqlOperator.NOT_LIKE)).toEqual(jasmine.objectContaining({ name: CqlOperator.NOT_LIKE }));
			expect(getOperatorByName(CqlOperator.GREATER)).toEqual(jasmine.objectContaining({ name: CqlOperator.GREATER }));
			expect(getOperatorByName(CqlOperator.LESS)).toEqual(jasmine.objectContaining({ name: CqlOperator.LESS }));
			expect(getOperatorByName(CqlOperator.BETWEEN)).toEqual(jasmine.objectContaining({ name: CqlOperator.BETWEEN }));
			expect(getOperatorByName(CqlOperator.NOT_BETWEEN)).toEqual(jasmine.objectContaining({ name: CqlOperator.NOT_BETWEEN }));
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
			const operator = getOperatorByName(CqlOperator.BETWEEN);

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
			oafFilter.operator = getOperatorByName(CqlOperator.EQUALS);
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
			oafFilter.operator = getOperatorByName(CqlOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', 'unknown type');
			oafFilter.value = 'bar';

			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});

		it('creates a "equals" CQL expression for a string type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);
			oafFilter.value = 'bar';

			expect(createCqlFilterExpression(oafFilter)).toBe("(foo = 'bar')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_EQUALS) })).toBe("(foo <> 'bar')");
		});

		it('creates a "equals" CQL expression with empty value for a string type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo = '')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_EQUALS) })).toBe("(foo <> '')");

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo = '')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_EQUALS) })).toBe("(foo <> '')");
		});

		it('creates a "equals" CQL expression for a number type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.FLOAT);

			oafFilter.value = 0.25;
			expect(createCqlFilterExpression(oafFilter)).toBe('(foo = 0.25)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_EQUALS) })).toBe('(foo <> 0.25)');
		});

		it('creates an empty "equals" CQL expression for a number type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.EQUALS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.FLOAT);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_EQUALS) })).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_EQUALS) })).toBe('');
		});

		it('creates a "like" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.LIKE);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);

			oafFilter.value = 'bar';
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE '%bar%')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_LIKE) })).toBe("NOT(foo LIKE '%bar%')");
		});

		it('creates a "like" CQL expression with empty value', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.LIKE);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);
			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE '%%')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_LIKE) })).toBe("NOT(foo LIKE '%%')");

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe("(foo LIKE '%%')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_LIKE) })).toBe("NOT(foo LIKE '%%')");
		});

		it('creates a "between" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.minValue = 2;
			oafFilter.maxValue = 8;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo <= 2 AND foo >= 8)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_BETWEEN) })).toBe('NOT(foo <= 2 AND foo >= 8)');
		});

		it('creates a "between" CQL expression with string type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.STRING);
			oafFilter.minValue = '2025-08-12';
			oafFilter.maxValue = '2025-08-25';

			expect(createCqlFilterExpression(oafFilter)).toBe("(foo <= '2025-08-12' AND foo >= '2025-08-25')");
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_BETWEEN) })).toBe(
				"NOT(foo <= '2025-08-12' AND foo >= '2025-08-25')"
			);
		});

		it('creates a "between" CQL expression without "maxValue"', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.minValue = 2;
			oafFilter.maxValue = null;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo <= 2)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_BETWEEN) })).toBe('NOT(foo <= 2)');
		});

		it('creates a "between" CQL expression without "minValue"', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.minValue = null;
			oafFilter.maxValue = 8;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo >= 8)');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_BETWEEN) })).toBe('NOT(foo >= 8)');
		});

		it('creates an empty CQL expression for operator "between" without values', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.BETWEEN);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.minValue = null;
			oafFilter.maxValue = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_BETWEEN) })).toBe('');

			oafFilter.minValue = '';
			oafFilter.maxValue = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
			expect(createCqlFilterExpression({ ...oafFilter, operator: getOperatorByName(CqlOperator.NOT_BETWEEN) })).toBe('');
		});

		it('creates a "greater" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.GREATER);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.value = 10;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo > 10)');
		});

		it('creates an empty "greater" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.GREATER);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);

			oafFilter.value = null;
			expect(createCqlFilterExpression(oafFilter)).toBe('');

			oafFilter.value = '';
			expect(createCqlFilterExpression(oafFilter)).toBe('');
		});

		it('creates a "less" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.LESS);
			oafFilter.queryable = createQueryable('foo', OafQueryableType.INTEGER);
			oafFilter.value = 10;

			expect(createCqlFilterExpression(oafFilter)).toBe('(foo < 10)');
		});

		it('creates an empty "less" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName(CqlOperator.LESS);
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
					expression: "foo = 'bar'"
				}
			];

			expect(createCqlExpression([group])).toBe("((foo = 'bar'))");
		});

		it('does not concatenate empty oafFilter expressions within a group', () => {
			const group = createDefaultFilterGroup();
			group.oafFilters = [
				{
					...createDefaultOafFilter(),
					expression: "exp1 LIKE 'val1'"
				},
				{
					...createDefaultOafFilter()
				}
			];

			expect(createCqlExpression([group])).toBe("((exp1 LIKE 'val1'))");
		});

		it('concatenates oafFilters\' expressions within a group with "AND"', () => {
			const group = createDefaultFilterGroup();
			group.oafFilters = [
				{
					...createDefaultOafFilter(),
					expression: "exp1 LIKE 'val1'"
				},
				{
					...createDefaultOafFilter(),
					expression: "exp2 = 'val2'"
				},
				{
					// Should not affect out, since no expression was set
					...createDefaultOafFilter()
				}
			];

			expect(createCqlExpression([group])).toBe("((exp1 LIKE 'val1' AND exp2 = 'val2'))");
		});

		it('concatenates multiple groups with "OR"', () => {
			const groupA = createDefaultFilterGroup();
			const groupB = createDefaultFilterGroup();

			groupA.oafFilters = [
				{
					...createDefaultOafFilter(),
					expression: "exp1 LIKE 'val1'"
				}
			];

			groupB.oafFilters = [
				{
					...createDefaultOafFilter(),
					expression: "exp2 LIKE 'val2'"
				}
			];

			expect(createCqlExpression([groupA, groupB])).toBe("((exp1 LIKE 'val1') OR (exp2 LIKE 'val2'))");
		});

		it('does not concatenate groups with empty filters or filter-expressions', () => {
			const groupA = createDefaultFilterGroup();
			const groupB = createDefaultFilterGroup();
			const groupC = createDefaultFilterGroup();

			groupA.oafFilters = [
				{
					...createDefaultOafFilter(),
					expression: "exp1 LIKE 'val1'"
				}
			];

			groupB.oafFilters = [
				{
					...createDefaultOafFilter(),
					expression: ''
				}
			];

			expect(createCqlExpression([groupA, groupB, groupC])).toBe("((exp1 LIKE 'val1'))");
		});
	});
});

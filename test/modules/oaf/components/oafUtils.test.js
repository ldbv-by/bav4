import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { TestUtils } from '../../../test-utils';
import {
	createDefaultFilterGroup,
	createDefaultOafFilter,
	createOafFilterExpression,
	createOafExpression,
	getOperatorByName,
	getOperatorDefinitions
} from '../../../../src/modules/oaf/components/oafUtils';
import { $injector } from '../../../../src/injection';

window.customElements.define(OafFilter.tag, OafFilter);

describe('oafUtils', () => {
	const allOperators = ['equals', 'like', 'greater', 'lesser', 'between'];
	const numberOperators = ['equals', 'greater', 'lesser', 'between'];

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

	describe('createDefaultOafFilter', () => {
		it('creates a default oafFilter Model', async () => {
			const oafFilterElement = await TestUtils.render(OafFilter.tag);
			expect(createDefaultOafFilter()).toEqual(oafFilterElement.getModel());
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
			const operator = getOperatorByName('between');

			expect(operator).toEqual(
				jasmine.objectContaining({
					name: 'between'
				})
			);
		});
	});

	describe('createOafFilterExpression', () => {
		it('creates a "equals" CQL expression for a string type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('equals');
			oafFilter.queryable = createQueryable('foo', 'string');
			oafFilter.value = 'bar';

			expect(createOafFilterExpression(oafFilter)).toBe("(foo = 'bar')");
		});

		it('creates a "equals" CQL expression for a number type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('equals');
			oafFilter.queryable = createQueryable('foo', 'float');
			oafFilter.value = 0.25;

			expect(createOafFilterExpression(oafFilter)).toBe('(foo = 0.25)');
		});

		it('creates a "like" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('like');
			oafFilter.queryable = createQueryable('foo', 'string');
			oafFilter.value = 'bar';

			expect(createOafFilterExpression(oafFilter)).toBe("(foo LIKE '%bar%')");
		});

		it('creates a "between" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('between');
			oafFilter.queryable = createQueryable('foo', 'integer');
			oafFilter.minValue = 2;
			oafFilter.maxValue = 8;

			expect(createOafFilterExpression(oafFilter)).toBe('(foo <= 2 AND foo >= 8)');
		});

		it('creates a "between" CQL expression with string type', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('between');
			oafFilter.queryable = createQueryable('foo', 'string');
			oafFilter.minValue = '2025-08-12';
			oafFilter.maxValue = '2025-08-25';

			expect(createOafFilterExpression(oafFilter)).toBe("(foo <= '2025-08-12' AND foo >= '2025-08-25')");
		});

		it('creates a "between" CQL expression without "maxValue"', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('between');
			oafFilter.queryable = createQueryable('foo', 'integer');
			oafFilter.minValue = 2;
			oafFilter.maxValue = null;

			expect(createOafFilterExpression(oafFilter)).toBe('(foo <= 2)');
		});

		it('creates a "between" CQL expression without "minValue"', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('between');
			oafFilter.queryable = createQueryable('foo', 'integer');
			oafFilter.minValue = null;
			oafFilter.maxValue = 8;

			expect(createOafFilterExpression(oafFilter)).toBe('(foo >= 8)');
		});

		it('creates an empty CQL expression for operator "between" without values', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('between');
			oafFilter.queryable = createQueryable('foo', 'integer');
			oafFilter.minValue = null;
			oafFilter.maxValue = null;

			expect(createOafFilterExpression(oafFilter)).toBe('');
		});

		it('creates a "greater" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('greater');
			oafFilter.queryable = createQueryable('foo', 'integer');
			oafFilter.value = 10;

			expect(createOafFilterExpression(oafFilter)).toBe('(foo > 10)');
		});

		it('creates a "lesser" CQL expression', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = getOperatorByName('lesser');
			oafFilter.queryable = createQueryable('foo', 'integer');
			oafFilter.value = 10;

			expect(createOafFilterExpression(oafFilter)).toBe('(foo < 10)');
		});

		it('creates an empty CQL expression when operator is not defined', () => {
			const oafFilter = createDefaultOafFilter();
			oafFilter.operator = { name: 'undefined name', key: 'undefined key' };
			oafFilter.queryable = createQueryable('foo', 'integer');
			oafFilter.value = 10;

			expect(createOafFilterExpression(oafFilter)).toBe('');
		});
	});

	describe('createOafExpression', () => {
		it('creates a empty expression when filter groups are empty', () => {
			const group = createDefaultFilterGroup();

			expect(createOafExpression([])).toBe('');
			expect(createOafExpression([group])).toBe('');
		});

		it('creates an group-expression when a group contains an oafFilter with an expression', () => {
			const group = createDefaultFilterGroup();
			group.oafFilters = [
				{
					...createDefaultOafFilter(),
					expression: "foo = 'bar'"
				}
			];

			expect(createOafExpression([group])).toBe("((foo = 'bar'))");
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

			expect(createOafExpression([group])).toBe("((exp1 LIKE 'val1'))");
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

			expect(createOafExpression([group])).toBe("((exp1 LIKE 'val1' AND exp2 = 'val2'))");
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

			expect(createOafExpression([groupA, groupB])).toBe("((exp1 LIKE 'val1') OR (exp2 LIKE 'val2'))");
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

			expect(createOafExpression([groupA, groupB, groupC])).toBe("((exp1 LIKE 'val1'))");
		});
	});
});

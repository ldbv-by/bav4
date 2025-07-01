import { OafQueryableType } from '../../../../src/domain/oaf.js';
import { OafMaskParserService } from '../../../../src/modules/oaf/services/OafMaskParserService.js';
import {
	CqlOperator,
	createCqlExpression,
	createDefaultFilterGroup,
	createDefaultOafFilter,
	getOperatorByName,
	getOperatorDefinitions
} from '../../../../src/modules/oaf/utils/oafUtils.js';

describe('OafParserService', () => {
	const setup = () => {
		return new OafMaskParserService();
	};

	const createQueryable = (id, type) => {
		return {
			id: id,
			type: type,
			values: [],
			finalList: false
		};
	};

	describe('Parsing & Conversion', () => {
		const queryables = [
			createQueryable('address', OafQueryableType.STRING),
			createQueryable('number', OafQueryableType.INTEGER),
			createQueryable('boolSym', OafQueryableType.BOOLEAN)
		];

		describe('CqlOperators', () => {
			it('has all CqlOperators covered', () => {
				const operatorDefinitions = getOperatorDefinitions();

				// Note: Ensure to test parsing for newly added operators.
				expect(Object.keys(CqlOperator).length).toBe(operatorDefinitions.length);
				expect(Object.values(CqlOperator)).toEqual(
					jasmine.arrayWithExactContents([
						CqlOperator.EQUALS,
						/*
						CqlOperator.NOT_EQUALS, */
						CqlOperator.LIKE,
						/*
						CqlOperator.NOT_LIKE, */
						CqlOperator.BETWEEN,
						/*
						CqlOperator.NOT_BETWEEN,
						*/
						CqlOperator.GREATER,
						CqlOperator.GREATER_EQUALS,
						CqlOperator.LESS,
						CqlOperator.LESS_EQUALS
					])
				);
			});

			it(`converts expression with cql operator "${CqlOperator.EQUALS}"`, () => {
				const parser = setup();
				const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[0], operator: getOperatorByName(CqlOperator.EQUALS), value: 'Foo' };
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilter = parser.parse(expression, queryables);

				expect(parsedFilter[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilter[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilter[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlOperator.LIKE}"`, () => {
				const parser = setup();
				const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[0], operator: getOperatorByName(CqlOperator.LIKE), value: 'Foo' };
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilter = parser.parse(expression, queryables);

				expect(parsedFilter[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilter[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilter[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlOperator.BETWEEN}"`, () => {
				const parser = setup();
				const oafFilter = {
					...createDefaultOafFilter(),
					queryable: queryables[1],
					operator: getOperatorByName(CqlOperator.BETWEEN),
					minValue: 5,
					maxValue: 20
				};
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilter = parser.parse(expression, queryables);

				expect(parsedFilter[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilter[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilter[0].oafFilters[0].minValue).toBe(oafFilter.minValue);
				expect(parsedFilter[0].oafFilters[0].maxValue).toBe(oafFilter.maxValue);
			});

			it(`converts expression with cql operator "${CqlOperator.GREATER}"`, () => {
				const parser = setup();
				const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[1], operator: getOperatorByName(CqlOperator.GREATER), value: 25 };
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilter = parser.parse(expression, queryables);

				expect(parsedFilter[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilter[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilter[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlOperator.GREATER_EQUALS}"`, () => {
				const parser = setup();
				const oafFilter = {
					...createDefaultOafFilter(),
					queryable: queryables[1],
					operator: getOperatorByName(CqlOperator.GREATER_EQUALS),
					value: 25
				};
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilter = parser.parse(expression, queryables);

				expect(parsedFilter[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilter[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilter[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlOperator.LESS}"`, () => {
				const parser = setup();
				const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[1], operator: getOperatorByName(CqlOperator.LESS), value: 25 };
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilter = parser.parse(expression, queryables);

				expect(parsedFilter[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilter[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilter[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlOperator.LESS_EQUALS}"`, () => {
				const parser = setup();
				const oafFilter = {
					...createDefaultOafFilter(),
					queryable: queryables[1],
					operator: getOperatorByName(CqlOperator.LESS_EQUALS),
					value: 25
				};
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilter = parser.parse(expression, queryables);

				expect(parsedFilter[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilter[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilter[0].oafFilters[0].value).toBe(oafFilter.value);
			});
		});
	});
});

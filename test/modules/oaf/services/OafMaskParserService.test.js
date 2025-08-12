import { CqlKeyword, CqlTokenType } from '../../../../src/modules/oaf/utils/CqlLexer.js';
import { OafQueryableType } from '../../../../src/domain/oaf.js';
import { OafMaskParserService } from '../../../../src/modules/oaf/services/OafMaskParserService.js';
import {
	createCqlExpression,
	createDefaultFilterGroup,
	createDefaultOafFilter,
	getOperatorByName,
	OafOperator
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

		describe('CqlKeywords', () => {
			it('has all CqlKeywords covered', () => {
				expect(Object.values(CqlKeyword)).toEqual(
					jasmine.arrayWithExactContents([
						CqlKeyword.EQUALS,
						CqlKeyword.NOT_EQUALS,
						CqlKeyword.LIKE,
						CqlKeyword.BETWEEN,
						CqlKeyword.GREATER,
						CqlKeyword.GREATER_EQUALS,
						CqlKeyword.LESS,
						CqlKeyword.LESS_EQUALS,
						CqlKeyword.DATE,
						CqlKeyword.TIMESTAMP,
						CqlKeyword.AND,
						CqlKeyword.OR,
						CqlKeyword.NOT
					])
				);
			});

			it('has all literal tokens covered', () => {
				const parser = setup();
				expect(parser._literalTokenTypes).toEqual(
					jasmine.arrayWithExactContents([CqlTokenType.STRING, CqlTokenType.NUMBER, CqlTokenType.BOOLEAN, CqlTokenType.DATE, CqlTokenType.TIMESTAMP])
				);
			});
			it('returns an empty array for an empty expression', () => {
				const parser = setup();
				expect(parser.parse('', queryables)).toEqual([]);
			});

			it(`converts expression with cql operator "${CqlKeyword.EQUALS}"`, () => {
				const parser = setup();
				const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[0], operator: getOperatorByName(OafOperator.EQUALS), value: 'Foo' };
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilterGroups = parser.parse(expression, queryables);

				expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilterGroups[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlKeyword.NOT_EQUALS}"`, () => {
				const parser = setup();
				const oafFilter = {
					...createDefaultOafFilter(),
					queryable: queryables[0],
					operator: getOperatorByName(OafOperator.NOT_EQUALS),
					value: 'Foo'
				};
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilterGroups = parser.parse(expression, queryables);

				expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilterGroups[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlKeyword.LIKE}"`, () => {
				const parser = setup();
				const likeOperatorsTestCases = [
					OafOperator.CONTAINS,
					OafOperator.NOT_CONTAINS,
					OafOperator.BEGINS_WITH,
					OafOperator.NOT_BEGINS_WITH,
					OafOperator.ENDS_WITH,
					OafOperator.NOT_ENDS_WITH
				];

				likeOperatorsTestCases.forEach((oafOperator) => {
					const oafFilterGroup = createDefaultFilterGroup();
					const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[0], value: 'Foo' };

					oafFilter.operator = getOperatorByName(oafOperator);
					oafFilterGroup.oafFilters = [oafFilter];

					const expression = createCqlExpression([oafFilterGroup]);
					const parsedFilterGroups = parser.parse(expression, queryables);
					expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
					expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilter.operator);
					expect(parsedFilterGroups[0].oafFilters[0].value).toBe(oafFilter.value);
				});
			});

			it(`converts expression with cql operator "${CqlKeyword.BETWEEN}"`, () => {
				const parser = setup();

				[OafOperator.BETWEEN, OafOperator.NOT_BETWEEN].forEach((oafOperator) => {
					const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[1], minValue: 5, maxValue: 20 };
					const oafFilterGroup = { ...createDefaultFilterGroup() };

					oafFilter.operator = getOperatorByName(oafOperator);
					oafFilterGroup.oafFilters = [oafFilter];

					const expression = createCqlExpression([oafFilterGroup]);
					const parsedFilterGroups = parser.parse(expression, queryables);

					expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
					expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilter.operator);
					expect(parsedFilterGroups[0].oafFilters[0].minValue).toBe(oafFilter.minValue);
					expect(parsedFilterGroups[0].oafFilters[0].maxValue).toBe(oafFilter.maxValue);
				});
			});

			it(`converts expression with cql operator "${CqlKeyword.GREATER}"`, () => {
				const parser = setup();
				const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[1], operator: getOperatorByName(OafOperator.GREATER), value: 25 };
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilterGroups = parser.parse(expression, queryables);

				expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilterGroups[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlKeyword.GREATER_EQUALS}"`, () => {
				const parser = setup();
				const oafFilter = {
					...createDefaultOafFilter(),
					queryable: queryables[1],
					operator: getOperatorByName(OafOperator.GREATER_EQUALS),
					value: 25
				};
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilterGroups = parser.parse(expression, queryables);

				expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilterGroups[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlKeyword.LESS}"`, () => {
				const parser = setup();
				const oafFilter = { ...createDefaultOafFilter(), queryable: queryables[1], operator: getOperatorByName(OafOperator.LESS), value: 25 };
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilterGroups = parser.parse(expression, queryables);

				expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilterGroups[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it(`converts expression with cql operator "${CqlKeyword.LESS_EQUALS}"`, () => {
				const parser = setup();
				const oafFilter = {
					...createDefaultOafFilter(),
					queryable: queryables[1],
					operator: getOperatorByName(OafOperator.LESS_EQUALS),
					value: 25
				};
				const oafFilterGroup = { ...createDefaultFilterGroup(), oafFilters: [oafFilter] };

				const expression = createCqlExpression([oafFilterGroup]);
				const parsedFilterGroups = parser.parse(expression, queryables);

				expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilter.queryable);
				expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilter.operator);
				expect(parsedFilterGroups[0].oafFilters[0].value).toBe(oafFilter.value);
			});

			it('parses comparison expression', () => {
				const parser = setup();
				const queryable = queryables[0];
				const parsedFilterGroups = parser.parse(`(((${queryable.id} BETWEEN 'bar' AND 'faz')))`, queryables);

				expect(parsedFilterGroups[0].oafFilters[0]).toEqual(
					jasmine.objectContaining({
						queryable: queryable,
						minValue: 'bar',
						maxValue: 'faz'
					})
				);
			});

			it('converts multiple filter groups', () => {
				const parser = setup();
				const oafFilterA = { ...createDefaultOafFilter(), queryable: queryables[0], operator: getOperatorByName(OafOperator.EQUALS), value: 'Foo' };
				const oafFilterB = { ...createDefaultOafFilter(), queryable: queryables[0], operator: getOperatorByName(OafOperator.EQUALS), value: 'Bar' };

				const oafFilterGroupA = { ...createDefaultFilterGroup(), oafFilters: [oafFilterA] };
				const oafFilterGroupB = { ...createDefaultFilterGroup(), oafFilters: [oafFilterB] };

				const expression = createCqlExpression([oafFilterGroupA, oafFilterGroupB]);
				const parsedFilterGroups = parser.parse(expression, queryables);

				expect(parsedFilterGroups[0].oafFilters[0].queryable).toEqual(oafFilterA.queryable);
				expect(parsedFilterGroups[0].oafFilters[0].operator).toEqual(oafFilterA.operator);
				expect(parsedFilterGroups[0].oafFilters[0].value).toBe(oafFilterA.value);
				expect(parsedFilterGroups[1].oafFilters[0].queryable).toEqual(oafFilterB.queryable);
				expect(parsedFilterGroups[1].oafFilters[0].operator).toEqual(oafFilterB.operator);
				expect(parsedFilterGroups[1].oafFilters[0].value).toBe(oafFilterB.value);
			});
		});
	});

	describe('Error Handling', () => {
		it('throws when expression contains an undefined queryable', () => {
			const parser = setup();
			const expression = `(((undefinedQueryableSymbol BETWEEN 'bar' AND 'faz')))`;
			expect(() => {
				parser.parse(expression, [createQueryable('definedQueryableSymbol', OafQueryableType.BOOLEAN)]);
			}).toThrowError('Expected symbol "undefinedQueryableSymbol" to exist in provided queryables.');
		});

		it('throws when expression does not have leading and trailing brackets', () => {
			const parser = setup();
			expect(() => {
				parser.parse('(a) = 25');
			}).toThrowError('CQL string must start with an opening bracket and end with a closing bracket.');

			expect(() => {
				parser.parse('a = (25)');
			}).toThrowError('CQL string must start with an opening bracket and end with a closing bracket.');
		});

		it('throws when expression have unbalanced bracket count', () => {
			const parser = setup();
			expect(() => {
				parser.parse('(a = 2(5)');
			}).toThrowError('Brackets are not balanced. There are more opening brackets than closing brackets.');

			expect(() => {
				parser.parse('(foo = 25))(a = 2(5)');
			}).toThrowError('Closing bracket found without matching opening bracket.');
		});

		it('throws when expression expected a symbol but got something else', () => {
			const parser = setup();
			expect(() => {
				parser.parse('(((30 = address)))');
			}).toThrowError('Expected a symbol type but got "number".');
		});

		it('throws when expression expected an operator but got something else', () => {
			const parser = setup();
			expect(() => {
				parser.parse('(((30 foo address)))');
			}).toThrowError('Expected an operator type but got "symbol".');
		});

		it('throws when expression expected a literal but got something else', () => {
			const parser = setup();
			expect(() => {
				parser.parse('(((foo = bar)))');
			}).toThrowError('Expected a literal type but got "symbol".');
		});

		it('throws when a multi binary expression is incorrectly formatted', () => {
			const parser = setup();
			expect(() => {
				parser.parse('(((foo >= 25 OR bar <= 10)))');
			}).toThrowError('Expected "and" but got "or".');
			expect(() => {
				parser.parse('(((foo >= 25 AND bar <= 10)))');
			}).toThrowError('Expected a symbol named "foo" but got "bar".');
			expect(() => {
				parser.parse('(((foo >= 25 AND foo >= 10)))');
			}).toThrowError('Can not parse Expression - Unsupported operator combination: ">=" and >=".');
		});

		it('throws when a comparison expression is incorrectly formatted', () => {
			const parser = setup();
			expect(() => {
				parser.parse("(((foo BETWEEN 'bar' OR 'faz')))");
			}).toThrowError('Expected "and" but got "or".');

			expect(() => {
				parser.parse("(((foo BETWEEN 'bar' AND faz)))");
			}).toThrowError('Expected a literal type but got "symbol".');
		});

		it('throws when converting an expression with an unsupported operator', () => {
			const parser = setup();
			const symbolToken = {
				type: CqlTokenType.SYMBOL,
				value: 'symbol',
				operatorKeyword: null
			};
			const operatorToken = {
				type: CqlTokenType.BINARY_OPERATOR,
				value: 'UnknownOperator',
				operatorKeyword: 'unknown'
			};
			const literalToken = {
				type: CqlTokenType.STRING,
				value: 'Some Value',
				operatorKeyword: null
			};

			expect(() => parser._expressionToOafOperator({ symbol: symbolToken, operator: operatorToken, literal: literalToken })).toThrowError(
				'Can not convert operator with cql operator named "unknown".'
			);
		});
	});
});

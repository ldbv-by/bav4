import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { TestUtils } from '../../../test-utils';
import { createDefaultOafFilter, getOperatorByName, getOperatorDefinitions } from '../../../../src/modules/oaf/components/oafUtils';
import { $injector } from '../../../../src/injection';

window.customElements.define(OafFilter.tag, OafFilter);

describe('oafUtils', () => {
	const allOperators = ['equals', 'like', 'greater', 'lesser', 'between'];
	const numberOperators = ['equals', 'greater', 'lesser', 'between'];

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
		it('returns all defined operators by default', async () => {
			const operators = getOperatorDefinitions();

			expect(operators).toHaveSize(allOperators.length);
			expect(operators.map((op) => op.name)).toEqual(jasmine.arrayContaining(allOperators));
		});

		it('returns default when optional type parameter is set to null', async () => {
			const operatorsNullTyped = getOperatorDefinitions(null);
			const operatorsDefault = getOperatorDefinitions();

			expect(operatorsNullTyped).toHaveSize(operatorsDefault.length);
			expect(operatorsNullTyped).toEqual(jasmine.arrayContaining(operatorsDefault));
		});

		it('returns defined operators for queryable type "integer"', async () => {
			const operators = getOperatorDefinitions('integer');

			expect(operators).toHaveSize(numberOperators.length);
			expect(operators.map((op) => op.name)).toEqual(jasmine.arrayContaining(numberOperators));
		});

		it('returns defined operators for queryable type "float"', async () => {
			const operators = getOperatorDefinitions('float');

			expect(operators).toHaveSize(numberOperators.length);
			expect(operators.map((op) => op.name)).toEqual(jasmine.arrayContaining(numberOperators));
		});
	});

	describe('getOperatorByName', () => {
		it('returns operator by name', async () => {
			const operator = getOperatorByName('between');

			expect(operator).toEqual(
				jasmine.objectContaining({
					name: 'between'
				})
			);
		});
	});
});

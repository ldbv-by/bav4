import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { TestUtils } from '../../../test-utils';

window.customElements.define(OafFilter.tag, OafFilter);

describe('OafFilter', () => {
	const T_STRING = 'string';
	const T_INTEGER = 'integer';
	const T_FLOAT = 'float';
	const T_DATE = 'date';
	const T_TIME = 'time';

	const setup = async () => {
		TestUtils.setupStoreAndDi({});
		return TestUtils.render(OafFilter.tag);
	};

	const createQueryable = (name, type) => {
		return {
			name: name,
			type: type,
			values: [],
			finalList: false
		};
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await setup();
			expect(element.getModel()).toEqual({
				queryable: {},
				operator: 'equals',
				value: null,
				minValue: null,
				maxValue: null
			});
		});
	});

	describe('when the ui renders with property', () => {
		describe(`queryable type: "${T_STRING}"`, () => {
			it(`renders filter with data-type attribute of: "${T_STRING}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_STRING);

				expect(element.shadowRoot.querySelector(`[data-type="${T_STRING}"]`)).not.toBeNull();
			});

			it(`renders operator field with the default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_STRING);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});
		});

		describe(`queryable type: "${T_INTEGER}"`, () => {
			it(`renders filter with data-type attribute of: "${T_INTEGER}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_INTEGER);

				expect(element.shadowRoot.querySelector(`[data-type="${T_INTEGER}"]`)).not.toBeNull();
			});

			it(`renders operator field with the default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_INTEGER);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});
		});

		describe(`queryable type: "${T_FLOAT}"`, () => {
			it(`renders filter with data-type attribute of: "${T_FLOAT}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_FLOAT);

				expect(element.shadowRoot.querySelector(`[data-type="${T_FLOAT}"]`)).not.toBeNull();
			});

			it(`renders operator field with the default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_FLOAT);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});
		});

		describe(`queryable type: "${T_DATE}"`, () => {
			it(`renders filter with data-type attribute of: "${T_DATE}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_DATE);

				expect(element.shadowRoot.querySelector(`[data-type="${T_DATE}"]`)).not.toBeNull();
			});

			it(`renders operator field with the default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_DATE);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});
		});

		describe(`queryable type: "${T_TIME}"`, () => {
			it(`renders filter with data-type attribute of: "${T_TIME}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_TIME);

				expect(element.shadowRoot.querySelector(`[data-type="${T_TIME}"]`)).not.toBeNull();
			});

			it(`renders operator field with the default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_TIME);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});
		});
	});
});

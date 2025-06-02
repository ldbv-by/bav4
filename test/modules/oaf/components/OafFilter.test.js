import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { SearchableSelect } from '../../../../src/modules/commons/components/searchableSelect/SearchableSelect';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(OafFilter.tag, OafFilter);
window.customElements.define(SearchableSelect.tag, SearchableSelect);

describe('OafFilter', () => {
	const T_String = 'string';
	const T_Integer = 'integer';
	const T_Float = 'float';
	const T_Date = 'date';
	const T_Time = 'time';
	const T_Boolean = 'boolean';

	const setup = async () => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

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

		it('has properties with default values from the model', async () => {
			const element = await setup();

			//properties from model
			expect(element.queryable).toEqual({});
			expect(element.operator).toBe('equals');
			expect(element.value).toBeNull();
			expect(element.maxValue).toBeNull();
			expect(element.minValue).toBeNull();
		});
	});

	describe('when the ui renders', () => {
		it('renders "Remove Filter Group" Button', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.remove-button')).not.toBeNull();
		});

		it('fires remove event when "Remove Button" was clicked', async () => {
			const element = await setup();
			const spy = jasmine.createSpy();
			element.addEventListener('remove', spy);
			element.shadowRoot.querySelector('.remove-button').click();

			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('when the ui renders with property', () => {
		describe('"operator"', () => {
			it('renders operator-field with "operator" default', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual(element.operator);
			});

			it('updates operator-field when "operator" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				element.operator = 'between';

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('between');
			});

			it('updates "operator" when operator-field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				const operatorField = element.shadowRoot.querySelector('#select-operator');

				// calling change manually because html-select only invokes events on user input.
				operatorField.value = 'between';
				operatorField.dispatchEvent(new Event('change'));

				expect(element.operator).toEqual('between');
			});
		});

		describe('"value"', () => {
			it('updates field when "value" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_String);
				element.value = 'foo';

				expect(element.shadowRoot.querySelector('.value-input').selected).toEqual('foo');
			});

			it('invokes change event when "value" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_String);

				const spy = jasmine.createSpy();
				element.addEventListener('change', spy);
				element.value = 'foo';

				expect(spy).toHaveBeenCalledOnceWith(jasmine.anything());
			});
		});

		describe('"minValue"', () => {
			it('updates field when "minValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				element.operator = 'between';
				element.minValue = 1;

				expect(Number(element.shadowRoot.querySelector('.min-value-input').value)).toEqual(1);
			});

			it('invokes change event when "minValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				element.operator = 'between';

				const spy = jasmine.createSpy();
				element.addEventListener('change', spy);
				element.minValue = 1;

				expect(spy).toHaveBeenCalledOnceWith(jasmine.anything());
			});
		});

		describe('"maxValue"', () => {
			it('updates field when "maxValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				element.operator = 'between';
				element.maxValue = 1;

				expect(Number(element.shadowRoot.querySelector('.max-value-input').value)).toEqual(1);
			});

			it('invokes change event when "maxValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				element.operator = 'between';

				const spy = jasmine.createSpy();
				element.addEventListener('change', spy);
				element.maxValue = 1;

				expect(spy).toHaveBeenCalledOnceWith(jasmine.anything());
			});
		});

		describe(`"queryable.type": "${T_String}"`, () => {
			it(`renders field with data-type attribute "${T_String}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_String);

				expect(element.shadowRoot.querySelector(`[data-type="${T_String}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_String);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

			it('renders field with default value of "null"', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_String);

				expect(element.shadowRoot.querySelector('.value-input').selected).toBeNull();
			});

			it("updates properties when field's value changes", async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_String);
				element.shadowRoot.querySelector('.value-input').selected = 'foo-val';

				expect(element.value).toEqual('foo-val');
			});
		});

		describe(`"queryable.type": "${T_Integer}"`, () => {
			const testCases = [-42, '-10', 0, '12', 44];

			it(`updates property "value" on field-input`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.value).toBe(Number(valueToTest));
				});
			});

			it(`updates value-field on field-input`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(inputField.value).toBe(`${valueToTest}`);
				});
			});

			it(`updates property "minValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', T_Integer) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.minValue).toBe(Number(valueToTest));
				});
			});

			it(`updates min-value-field on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', T_Integer) };
				element.operator = 'between';
				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(inputField.value).toBe(`${valueToTest}`);
				});
			});

			it(`updates property "maxValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', T_Integer) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.maxValue).toBe(Number(valueToTest));
				});
			});

			it(`updates max-value-field on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', T_Integer) };
				element.operator = 'between';
				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(inputField.value).toBe(`${valueToTest}`);
				});
			});

			it(`renders filter with data-type attribute "${T_Integer}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);

				expect(element.shadowRoot.querySelector(`[data-type="${T_Integer}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

			it('renders field default value as empty string', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);

				expect(element.shadowRoot.querySelector('.value-input').value).toEqual('');
			});

			it('does not update field on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('input'));

				expect(inputField.value).toBe('');
			});

			it('does not update property "value" on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Integer);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('input'));

				expect(element.value).toEqual(null);
			});
		});

		describe(`"queryable.type": "${T_Float}"`, () => {
			const testCases = [-42, -42.124, '-10', 0, '12', '12.241', 44, 44.12];

			it(`updates property "value" on field-input`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Float);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.value).toBe(Number(valueToTest));
				});
			});

			it(`updates value-field on field-input`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Float);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(inputField.value).toBe(`${valueToTest}`);
				});
			});

			it(`updates property "minValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', T_Float) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.minValue).toBe(Number(valueToTest));
				});
			});

			it(`updates min-value-field on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', T_Float) };
				element.operator = 'between';
				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(inputField.value).toBe(`${valueToTest}`);
				});
			});

			it(`updates property "maxValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', T_Float) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.maxValue).toBe(Number(valueToTest));
				});
			});

			it(`updates max-value-field on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', T_Float) };
				element.operator = 'between';
				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(inputField.value).toBe(`${valueToTest}`);
				});
			});

			it(`renders field with data-type attribute "${T_Float}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Float);

				expect(element.shadowRoot.querySelector(`[data-type="${T_Float}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Float);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

			it('does not update field on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Float);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('input'));

				expect(inputField.value).toBe('');
			});

			it('does not update property "value" on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Float);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('input'));

				expect(element.value).toEqual(null);
			});
		});

		describe(`"queryable.type": "${T_Date}"`, () => {
			it(`renders field with data-type attribute "${T_Date}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Date);

				expect(element.shadowRoot.querySelector(`[data-type="${T_Date}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Date);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});
		});

		describe(`"queryable.type": "${T_Time}"`, () => {
			it(`renders field with data-type attribute "${T_Time}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Time);

				expect(element.shadowRoot.querySelector(`[data-type="${T_Time}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Time);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

			it('renders field with default value of "null"', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Time);

				expect(element.shadowRoot.querySelector('.value-input').selected).toBeNull();
			});

			it('updates property "value" when field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Time);
				element.shadowRoot.querySelector('.value-input').selected = '20:15';

				expect(element.value).toEqual('20:15');
			});

			it('updates property "minValue" when field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Time);
				element.operator = 'between';
				element.shadowRoot.querySelector('.min-value-input').selected = '20:15';

				expect(element.minValue).toEqual('20:15');
			});

			it('updates property "maxValue" when field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Time);
				element.operator = 'between';
				element.shadowRoot.querySelector('.max-value-input').selected = '20:15';

				expect(element.maxValue).toEqual('20:15');
			});
		});

		describe(`"queryable.type": "${T_Boolean}"`, () => {
			it(`renders field with data-type attribute "${T_Boolean}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Boolean);

				expect(element.shadowRoot.querySelector(`[data-type="${T_Boolean}"]`)).not.toBeNull();
			});

			it(`renders operator-field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', T_Boolean);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});
		});
	});
});

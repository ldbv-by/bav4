import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { SearchableSelect } from '../../../../src/modules/commons/components/searchableSelect/SearchableSelect';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { OafQueryableType } from '../../../../src/domain/oaf';
import { getOperatorByName, getOperatorDefinitions, CqlOperator } from '../../../../src/modules/oaf/components/oafUtils';

window.customElements.define(OafFilter.tag, OafFilter);
window.customElements.define(SearchableSelect.tag, SearchableSelect);

describe('OafFilter', () => {
	const T_Time = 'time';

	const setupStoreAndDi = (state = {}) => {
		TestUtils.setupStoreAndDi(state);
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
	};

	const setup = async (state = {}, properties = {}) => {
		setupStoreAndDi(state);
		return TestUtils.render(OafFilter.tag, properties);
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
				operator: getOperatorByName(CqlOperator.EQUALS),
				value: null,
				minValue: null,
				maxValue: null
			});
		});

		it('has properties with default values from the model', async () => {
			const element = await setup();

			//properties from model
			expect(element.queryable).toEqual({});
			expect(element.operator).toBe(getOperatorByName(CqlOperator.EQUALS));
			expect(element.value).toBeNull();
			expect(element.maxValue).toBeNull();
			expect(element.minValue).toBeNull();
			expect(element.expression).toBe('');
		});

		it('updates values in model when initialized with queryable property as last', async () => {
			const element = await setup(
				{},
				{ value: null, minValue: null, maxValue: null, queryable: createQueryable('StringQueryable', OafQueryableType.STRING) }
			);

			expect(element.getModel().value).toBe('');
			expect(element.getModel().minValue).toBe('');
			expect(element.getModel().maxValue).toBe('');
		});
	});

	describe('when the ui renders', () => {
		it('renders "Remove Filter" Button', async () => {
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
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual(element.operator.name);
			});

			it('updates operator-field when "operator" changes', async () => {
				setupStoreAndDi();

				// Pass operator as string
				const elementA = await TestUtils.render(OafFilter.tag);
				elementA.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				elementA.operator = 'between';

				// Pass operator as object
				const elementB = await TestUtils.render(OafFilter.tag);
				elementB.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				elementB.operator = getOperatorByName(CqlOperator.BETWEEN);

				expect(elementA.shadowRoot.querySelector('#select-operator').value).toEqual('between');
				expect(elementB.shadowRoot.querySelector('#select-operator').value).toEqual('between');
			});

			it('updates "operator" when operator-field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const operatorField = element.shadowRoot.querySelector('#select-operator');

				// calling change manually because html-select only invokes events on user input.
				operatorField.value = 'between';
				operatorField.dispatchEvent(new Event('change'));

				expect(element.operator).toEqual(getOperatorByName(CqlOperator.BETWEEN));
			});

			it('translates operator-field with correct key', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', null);

				const operators = getOperatorDefinitions();
				const operatorField = element.shadowRoot.querySelector('#select-operator');

				for (const operator of operators) {
					element.operator = operator;
					expect(operatorField.selectedOptions[0].innerText).toBe(operator.translationKey);
				}
			});
		});

		describe('"value"', () => {
			it('updates field when "value" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);
				element.value = 'foo';

				expect(element.shadowRoot.querySelector('.value-input').selected).toEqual('foo');
			});

			it('invokes change event when "value" changes', async () => {
				const element = await setup();
				const spy = jasmine.createSpy();

				element.addEventListener('change', spy);
				element.queryable = createQueryable('foo', OafQueryableType.STRING);
				element.value = 'foo';

				expect(spy).toHaveBeenCalledOnceWith(jasmine.anything());
			});
		});

		describe('"minValue"', () => {
			it('updates field when "minValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				element.operator = 'between';
				element.minValue = 1;

				expect(Number(element.shadowRoot.querySelector('.min-value-input').value)).toEqual(1);
			});

			it('invokes change event when "minValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
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
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				element.operator = 'between';
				element.maxValue = 1;

				expect(Number(element.shadowRoot.querySelector('.max-value-input').value)).toEqual(1);
			});

			it('invokes change event when "maxValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				element.operator = 'between';

				const spy = jasmine.createSpy();
				element.addEventListener('change', spy);
				element.maxValue = 1;

				expect(spy).toHaveBeenCalledOnceWith(jasmine.anything());
			});
		});

		describe(`"queryable.type": "${OafQueryableType.STRING}"`, () => {
			it(`renders field with data-type attribute "${OafQueryableType.STRING}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);

				expect(element.shadowRoot.querySelector('.value-input').placeholder).toBe('oaf_filter_input_placeholder');
				expect(element.shadowRoot.querySelector(`[data-type="${OafQueryableType.STRING}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

			it('renders field with default value of "null"', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);

				expect(element.shadowRoot.querySelector('.value-input').selected).toBeNull();
			});

			it("updates properties when field's value changes", async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);
				element.shadowRoot.querySelector('.value-input').selected = 'foo-val';

				expect(element.value).toEqual('foo-val');
			});

			it('does not render dropdown-header when queryable is finalized', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), finalized: true };
				const searchableSelect = element.shadowRoot.querySelector('.value-input');
				const dropdownHeader = searchableSelect.shadowRoot.querySelector('.dropdown-header');

				expect(dropdownHeader).toBeNull();
			});

			it('renders a dropdown-header when queryable is not finalized', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), finalized: false };
				const searchableSelect = element.shadowRoot.querySelector('.value-input');
				const dropdownHeader = searchableSelect.shadowRoot.querySelector('.dropdown-header');

				expect(dropdownHeader).not.toBeNull();
				expect(dropdownHeader.innerText).toEqual('oaf_filter_dropdown_header_title');
			});
		});

		describe(`"queryable.type": "${OafQueryableType.INTEGER}"`, () => {
			const testCases = [-42, '-10', 0, '12', 44];

			it(`updates property "value" on field-input`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.value).toBe(Number(valueToTest));
				});

				inputField.value = '';
				inputField.dispatchEvent(new Event('input'));
				expect(element.value).toBe('');
			});

			it(`updates field-input when property "value" changes`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					element.value = valueToTest;
					expect(inputField.value).toBe(`${valueToTest}`);
				});

				element.value = '';
				expect(inputField.value).toBe('');
				expect(inputField.placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`updates property "minValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.minValue).toBe(Number(valueToTest));
				});

				inputField.value = '';
				inputField.dispatchEvent(new Event('input'));
				expect(element.minValue).toBe('');
			});

			it(`updates field-input when property "minValue" changes`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					element.minValue = valueToTest;
					expect(inputField.value).toBe(`${valueToTest}`);
				});

				element.minValue = '';
				expect(inputField.value).toBe('');
				expect(inputField.placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`updates property "maxValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));

					expect(element.maxValue).toBe(Number(valueToTest));
				});

				inputField.value = '';
				inputField.dispatchEvent(new Event('input'));
				expect(element.maxValue).toBe('');
			});

			it(`updates field-input when property "maxValue" changes`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER) };
				element.operator = 'between';
				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					element.maxValue = valueToTest;
					expect(inputField.value).toBe(`${valueToTest}`);
				});

				element.maxValue = '';
				expect(inputField.value).toBe('');
				expect(inputField.placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`renders filter with data-type attribute "${OafQueryableType.INTEGER}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);

				expect(element.shadowRoot.querySelector(`[data-type="${OafQueryableType.INTEGER}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

			it('renders field default value as empty string', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);

				expect(element.shadowRoot.querySelector('.value-input').value).toEqual('');
			});

			it('does not update field on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('input'));

				expect(inputField.value).toBe('');
			});

			it('does not update property "value" on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('input'));

				expect(element.value).toEqual(null);
			});
		});

		describe(`"queryable.type": "${OafQueryableType.FLOAT}"`, () => {
			const testCases = [-42, -42.124, '-10', 0, '12', '12.241', 44, 44.12];

			it(`updates property "value" on field-input`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));
					expect(element.value).toBe(Number(valueToTest));
				});

				inputField.value = '';
				inputField.dispatchEvent(new Event('input'));
				expect(element.value).toBe('');
			});

			it(`updates field-input when property "value" changes`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					element.value = valueToTest;
					expect(inputField.value).toBe(`${valueToTest}`);
				});

				element.value = '';
				expect(inputField.value).toBe('');
				expect(inputField.placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`updates property "minValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.FLOAT) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));
					expect(element.minValue).toBe(Number(valueToTest));
				});

				inputField.value = '';
				inputField.dispatchEvent(new Event('input'));
				expect(element.minValue).toBe('');
			});

			it(`updates field-input when property "minValue" changes`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.FLOAT) };
				element.operator = 'between';
				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					element.minValue = valueToTest;
					expect(inputField.value).toBe(`${valueToTest}`);
				});

				element.minValue = '';
				expect(inputField.value).toBe('');
				expect(inputField.placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`updates property "maxValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.FLOAT) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('input'));
					expect(element.maxValue).toBe(Number(valueToTest));
				});

				inputField.value = '';
				inputField.dispatchEvent(new Event('input'));
				expect(element.maxValue).toBe('');
			});

			it(`updates field-input when property "maxValue" changes`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.FLOAT) };
				element.operator = 'between';
				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					element.maxValue = valueToTest;
					expect(inputField.value).toBe(`${valueToTest}`);
				});

				element.maxValue = '';
				expect(inputField.value).toBe('');
				expect(inputField.placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`renders field with data-type attribute "${OafQueryableType.FLOAT}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);

				expect(element.shadowRoot.querySelector(`[data-type="${OafQueryableType.FLOAT}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

			it('does not update field on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('input'));

				expect(inputField.value).toBe('');
			});

			it('does not update property "value" on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('input'));

				expect(element.value).toEqual(null);
			});
		});

		describe(`"queryable.type": "${OafQueryableType.DATE}"`, () => {
			it(`renders field with data-type attribute "${OafQueryableType.DATE}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.DATE);

				expect(element.shadowRoot.querySelector(`[data-type="${OafQueryableType.DATE}"]`)).not.toBeNull();
			});

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.DATE);

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

		describe(`"queryable.type": "${OafQueryableType.BOOLEAN}"`, () => {
			it('updates property "value" when field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.BOOLEAN);
				const select = element.shadowRoot.querySelector('.value-input');
				select.value = true;
				select.dispatchEvent(new Event('change'));

				expect(element.value).toEqual(true);
			});

			it(`renders field with data-type attribute "${OafQueryableType.BOOLEAN}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.BOOLEAN);
				const selectField = element.shadowRoot.querySelector(`[data-type="${OafQueryableType.BOOLEAN}"]`);
				expect(selectField).not.toBeNull();
				expect(selectField.options).toHaveSize(2);
				expect(selectField.options[0].innerText).toBe('oaf_filter_yes');
				expect(selectField.options[1].innerText).toBe('oaf_filter_no');
			});

			it(`renders operator-field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.BOOLEAN);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});
		});
	});
});

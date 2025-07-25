import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { SearchableSelect } from '../../../../src/modules/commons/components/searchableSelect/SearchableSelect';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { OafQueryableType } from '../../../../src/domain/oaf';
import { getOperatorByName, getOperatorDefinitions, OafOperator } from '../../../../src/modules/oaf/utils/oafUtils';

window.customElements.define(OafFilter.tag, OafFilter);
window.customElements.define(SearchableSelect.tag, SearchableSelect);

describe('OafFilter', () => {
	const setupStoreAndDi = (state = {}) => {
		TestUtils.setupStoreAndDi(state);
		$injector.registerSingleton('TranslationService', { translate: (key, params = []) => `${key}${params[0] ?? ''}` });
	};

	const setup = async (state = {}, properties = {}) => {
		setupStoreAndDi(state);
		return TestUtils.render(OafFilter.tag, properties);
	};

	const createQueryable = (id, type) => {
		return {
			id: id,
			type: type,
			values: [],
			finalList: false,
			description: null
		};
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await setup();
			expect(element.getModel()).toEqual({
				queryable: {},
				operator: getOperatorByName(OafOperator.EQUALS),
				value: null,
				minValue: null,
				maxValue: null
			});
		});

		it('has properties with default values from the model', async () => {
			const element = await setup();

			//properties from model
			expect(element.queryable).toEqual({});
			expect(element.operator).toEqual(getOperatorByName(OafOperator.EQUALS));
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

		it('shows queryable title', async () => {
			const element = await setup();
			element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), title: 'BAR' };
			expect(element.shadowRoot.querySelector('.title').innerText).toBe('BAR');
		});

		it('shows queryable description on title', async () => {
			const element = await setup();
			element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), title: 'BAR', description: 'My Description' };
			expect(element.shadowRoot.querySelector('.title').title).toBe('My Description');
		});

		it('shows queryable id when title is missing', async () => {
			const element = await setup();
			element.queryable = { ...createQueryable('foo', OafQueryableType.STRING) };

			expect(element.shadowRoot.querySelector('.title').innerText).toBe('foo');
			element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), title: null };
			expect(element.shadowRoot.querySelector('.title').innerText).toBe('foo');
			element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), title: '' };
			expect(element.shadowRoot.querySelector('.title').innerText).toBe('foo');
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
				elementA.operator = OafOperator.BETWEEN;

				// Pass operator as object
				const elementB = await TestUtils.render(OafFilter.tag);
				elementB.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				elementB.operator = getOperatorByName(OafOperator.BETWEEN);

				expect(elementA.shadowRoot.querySelector('#select-operator').value).toEqual(OafOperator.BETWEEN);
				expect(elementB.shadowRoot.querySelector('#select-operator').value).toEqual(OafOperator.BETWEEN);
			});

			it('updates "operator" when operator-field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const operatorField = element.shadowRoot.querySelector('#select-operator');

				// calling change manually because html-select only invokes events on user input.
				operatorField.value = 'between';
				operatorField.dispatchEvent(new Event('change'));

				expect(element.operator).toEqual(getOperatorByName(OafOperator.BETWEEN));
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

			it('uses pattern validation when binary operator allows it', async () => {
				const queryablePatternTypes = Object.values(OafQueryableType).filter(
					(t) => ![OafQueryableType.BOOLEAN, OafQueryableType.DATE, OafQueryableType.DATETIME].includes(t)
				);
				const element = await setup();
				element.operator = getOperatorByName(OafOperator.EQUALS);
				element.operator.allowPattern = true;
				element.queryable = { ...createQueryable('foo'), pattern: 'fooRegex', type: OafQueryableType.STRING };

				for (const queryableType of queryablePatternTypes) {
					element.queryable = { ...createQueryable('foo'), pattern: 'fooRegex', type: queryableType };
					expect(element.shadowRoot.querySelector('.value-input').pattern).toBe('fooRegex');
				}
			});

			it('ignores pattern validation when binary operator disallows it', async () => {
				const queryablePatternTypes = Object.values(OafQueryableType).filter(
					(t) => ![OafQueryableType.BOOLEAN, OafQueryableType.DATE, OafQueryableType.DATETIME].includes(t)
				);
				const element = await setup();
				element.operator = getOperatorByName(OafOperator.EQUALS);
				element.operator.allowPattern = false;

				for (const queryableType of queryablePatternTypes) {
					element.queryable = { ...createQueryable('foo'), pattern: 'fooRegex', type: queryableType };
					expect(element.shadowRoot.querySelector('.value-input').pattern).toBe('');
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

			it('validates field and reports custom message', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), pattern: 'foo' };
				const validationSpy = spyOn(element, '_validateField').and.callThrough();
				const searchableSelect = element.shadowRoot.querySelector('.value-input');

				searchableSelect.selected = 'anything but foo';
				const invalidValue = element.value;
				const invalidCustomMessage = searchableSelect.validationMessage;
				searchableSelect.selected = 'foo';
				const validValue = element.value;

				expect(invalidValue).toEqual('');
				expect(invalidCustomMessage).toEqual('oaf_filter_pattern_validation_msg');
				expect(validValue).toEqual('foo');
				expect(validationSpy).toHaveBeenCalledWith(searchableSelect);
				expect(validationSpy).toHaveBeenCalledTimes(2);
			});

			it('validates field and reports default message', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER), minValue: 1 };

				const validationSpy = spyOn(element, '_validateField').and.callThrough();
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = -1;
				inputField.dispatchEvent(new Event('change'));

				expect(element.value).toEqual(null);
				expect(inputField.validationMessage).not.toEqual(''); // Default message is browser dependent.
				expect(validationSpy).toHaveBeenCalledOnceWith(inputField);
			});

			it('validates field on input when dirty', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), pattern: 'foo' };
				const searchableSelect = element.shadowRoot.querySelector('.value-input');
				searchableSelect.selected = 'anything but foo';

				const validationSpy = spyOn(element, '_validateField').and.callThrough();
				searchableSelect.dispatchEvent(new Event('input'));

				expect(element.value).toEqual('');
				expect(validationSpy).toHaveBeenCalledOnceWith(searchableSelect);
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

			it('validates field and reports default message', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER), minValue: 1 };
				element.operator = getOperatorByName(OafOperator.BETWEEN);
				const validationSpy = spyOn(element, '_validateField').and.callThrough();
				const inputField = element.shadowRoot.querySelector('.min-value-input');

				inputField.value = -1;
				inputField.dispatchEvent(new Event('change'));

				expect(element.minValue).toEqual(null);
				expect(inputField.validationMessage).not.toEqual('');
				expect(validationSpy).toHaveBeenCalledOnceWith(inputField);
			});
		});

		describe('"maxValue"', () => {
			it('updates field when "maxValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				element.operator = getOperatorByName(OafOperator.BETWEEN);
				element.maxValue = 1;

				expect(Number(element.shadowRoot.querySelector('.max-value-input').value)).toEqual(1);
			});

			it('invokes change event when "maxValue" changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				element.operator = getOperatorByName(OafOperator.BETWEEN);

				const spy = jasmine.createSpy();
				element.addEventListener('change', spy);
				element.maxValue = 1;

				expect(spy).toHaveBeenCalledOnceWith(jasmine.anything());
			});

			it('validates field and reports default message', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER), minValue: 1 };
				element.operator = getOperatorByName(OafOperator.BETWEEN);
				const validationSpy = spyOn(element, '_validateField').and.callThrough();
				const inputField = element.shadowRoot.querySelector('.max-value-input');

				inputField.value = -1;
				inputField.dispatchEvent(new Event('change'));

				expect(element.maxValue).toEqual(null);
				expect(inputField.validationMessage).not.toEqual('');
				expect(validationSpy).toHaveBeenCalledOnceWith(inputField);
			});
		});

		describe(`"queryable.type": "${OafQueryableType.STRING}"`, () => {
			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
				expect(element.shadowRoot.querySelector('.value-input').placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`renders field with data-type attribute "${OafQueryableType.STRING}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);

				expect(element.shadowRoot.querySelector(`[data-type="${OafQueryableType.STRING}"]`)).not.toBeNull();
			});

			it('renders field with default value', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);

				expect(element.shadowRoot.querySelector('.value-input').selected).toBeNull();
			});

			it('renders a dropdown-header when queryable is not finalized', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), finalized: false };
				const searchableSelect = element.shadowRoot.querySelector('.value-input');
				const dropdownHeader = searchableSelect.shadowRoot.querySelector('.dropdown-header');

				expect(dropdownHeader).not.toBeNull();
				expect(dropdownHeader.innerText).toEqual('oaf_filter_dropdown_header_title');
			});

			it('does not render dropdown-header when queryable is finalized', async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), finalized: true };
				const searchableSelect = element.shadowRoot.querySelector('.value-input');
				const dropdownHeader = searchableSelect.shadowRoot.querySelector('.dropdown-header');

				expect(dropdownHeader).toBeNull();
			});

			it("updates properties when field's value changes", async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.STRING);
				element.shadowRoot.querySelector('.value-input').selected = 'foo-val';

				expect(element.value).toEqual('foo-val');
			});
		});

		describe(`"queryable.type": "${OafQueryableType.INTEGER}"`, () => {
			const testCases = ['', -42, '-10', 0, '12', 44];

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
				expect(element.shadowRoot.querySelector('.value-input').placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`renders min and max input-fields on a comparison operator`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				element.operator = OafOperator.BETWEEN;

				expect(element.shadowRoot.querySelector('.min-value-input').placeholder).toBe('oaf_filter_input_placeholder');
				expect(element.shadowRoot.querySelector('.max-value-input').placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`renders filter with data-type attribute "${OafQueryableType.INTEGER}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);

				expect(element.shadowRoot.querySelector(`[data-type="${OafQueryableType.INTEGER}"]`)).not.toBeNull();
			});

			it(`updates property "value" on field-input`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('change'));

					expect(element.value).toBe(valueToTest === '' ? '' : Number(valueToTest));
				});
			});

			it(`updates field-input when property "value" changes`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					element.value = valueToTest;
					expect(inputField.value).toBe(`${valueToTest}`);
				});
			});

			it(`updates property "minValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('change'));

					expect(element.minValue).toBe(valueToTest === '' ? '' : Number(valueToTest));
				});
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
			});

			it(`updates property "maxValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.INTEGER) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('change'));
					expect(element.maxValue).toBe(valueToTest === '' ? '' : Number(valueToTest));
				});
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
			});

			it('does not update the input-field on invalid input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'foo';
				inputField.dispatchEvent(new Event('input'));

				expect(inputField.value).toBe('');
			});

			it('does not update property "value" with invalid input-field change', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.INTEGER);
				const inputField = element.shadowRoot.querySelector('.value-input');

				inputField.value = 'invalid because I am a string';
				inputField.dispatchEvent(new Event('change'));

				expect(element.value).toEqual('');
			});

			it('does not update properties "minValue" and "maxValue" on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				element.operator = OafOperator.BETWEEN;

				const minInputField = element.shadowRoot.querySelector('.min-value-input');
				const maxInputField = element.shadowRoot.querySelector('.max-value-input');

				minInputField.value = 'foo invalid';
				maxInputField.value = 'bar invalid';
				minInputField.dispatchEvent(new Event('input'));
				maxInputField.dispatchEvent(new Event('input'));

				expect(element.minValue).toEqual(null);
				expect(element.maxValue).toEqual(null);
			});
		});

		describe(`"queryable.type": "${OafQueryableType.FLOAT}"`, () => {
			const testCases = ['', -42, -42.124, '-10', 0, '12', '12.241', 44, 44.12];

			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
				expect(element.shadowRoot.querySelector('.value-input').placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`renders min and max input-fields on a comparison operator`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				element.operator = OafOperator.BETWEEN;

				expect(element.shadowRoot.querySelector('.min-value-input').placeholder).toBe('oaf_filter_input_placeholder');
				expect(element.shadowRoot.querySelector('.max-value-input').placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`renders field with data-type attribute "${OafQueryableType.FLOAT}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);

				expect(element.shadowRoot.querySelector(`[data-type="${OafQueryableType.FLOAT}"]`)).not.toBeNull();
			});

			it(`updates property "value" on field-input`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('change'));
					expect(element.value).toBe(valueToTest === '' ? '' : Number(valueToTest));
				});
			});

			it(`updates field-input when property "value" changes`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				const inputField = element.shadowRoot.querySelector('.value-input');

				testCases.forEach((valueToTest) => {
					element.value = valueToTest;
					expect(inputField.value).toBe(`${valueToTest}`);
				});
			});

			it(`updates property "minValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.FLOAT) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.min-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('change'));
					expect(element.minValue).toBe(valueToTest === '' ? '' : Number(valueToTest));
				});
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
			});

			it(`updates property "maxValue" on field-input`, async () => {
				const element = await setup();
				element.queryable = { ...createQueryable('foo', OafQueryableType.FLOAT) };
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.max-value-input');

				testCases.forEach((valueToTest) => {
					inputField.value = valueToTest;
					inputField.dispatchEvent(new Event('change'));
					expect(element.maxValue).toBe(valueToTest === '' ? '' : Number(valueToTest));
				});
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

			it('does not update properties "minValue" and "maxValue" on invalid field input', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.FLOAT);
				element.operator = OafOperator.BETWEEN;

				const minInputField = element.shadowRoot.querySelector('.min-value-input');
				const maxInputField = element.shadowRoot.querySelector('.max-value-input');

				minInputField.value = 'foo invalid';
				maxInputField.value = 'bar invalid';
				minInputField.dispatchEvent(new Event('input'));
				maxInputField.dispatchEvent(new Event('input'));

				expect(element.minValue).toEqual(null);
				expect(element.maxValue).toEqual(null);
			});
		});

		describe(`"queryable.type": "${OafQueryableType.DATE}"`, () => {
			it(`renders operator field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.DATE);

				expect(element.shadowRoot.querySelector('.value-input').placeholder).toBe('oaf_filter_input_placeholder');
				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

			it(`renders min and max input-fields on a comparison operator`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.DATE);
				element.operator = OafOperator.BETWEEN;

				expect(element.shadowRoot.querySelector('.min-value-input').placeholder).toBe('oaf_filter_input_placeholder');
				expect(element.shadowRoot.querySelector('.max-value-input').placeholder).toBe('oaf_filter_input_placeholder');
			});

			it(`renders field with data-type attribute "${OafQueryableType.DATE}"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.DATE);

				expect(element.shadowRoot.querySelector(`[data-type="${OafQueryableType.DATE}"]`)).not.toBeNull();
			});

			it('updates property "value" when field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.DATE);
				const inputField = element.shadowRoot.querySelector('.value-input');
				inputField.value = '2015-06-04';
				inputField.dispatchEvent(new Event('input'));

				expect(element.value).toEqual('2015-06-04');
			});

			it('updates property "minValue" when field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.DATE);
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.min-value-input');
				inputField.value = '2015-06-04';
				inputField.dispatchEvent(new Event('input'));

				expect(element.minValue).toEqual('2015-06-04');
			});

			it('updates property "maxValue" when field changes', async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.DATE);
				element.operator = 'between';

				const inputField = element.shadowRoot.querySelector('.max-value-input');
				inputField.value = '2015-07-08';
				inputField.dispatchEvent(new Event('input'));

				expect(element.maxValue).toEqual('2015-07-08');
			});
		});

		describe(`"queryable.type": "${OafQueryableType.BOOLEAN}"`, () => {
			it(`renders operator-field with default operator "equals"`, async () => {
				const element = await setup();
				element.queryable = createQueryable('foo', OafQueryableType.BOOLEAN);

				expect(element.shadowRoot.querySelector('#select-operator').value).toEqual('equals');
			});

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
		});
	});
});

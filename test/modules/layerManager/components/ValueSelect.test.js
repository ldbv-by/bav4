import { $injector } from '../../../../src/injection';
import { ValueSelect } from '../../../../src/modules/layerManager/components/ValueSelect';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { TestUtils } from '../../../test-utils';

window.customElements.define(ValueSelect.tag, ValueSelect);

describe('ValueSelect', () => {
	const environmentService = {
		isTouch: () => false
	};

	const setup = (state = {}, attributes = {}, properties = {}) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer()
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('EnvironmentService', environmentService);
		return TestUtils.render(ValueSelect.tag, properties, attributes);
	};
	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const model = element.getModel();

			expect(model.title).toBe('');
			expect(model.values).toEqual([]);
			expect(model.selected).toBeNull();
			expect(model.isCollapsed).toBeTrue();
			expect(model.portrait).toBeFalse();
		});

		it('renders the view as responsive container in non-touch environment', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			spyOn(environmentService, 'isTouch').and.returnValue(false);
			const element = await setup(state, {}, { title: 'foo' });

			//view
			expect(element.shadowRoot.querySelector('.values_header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.ba_values_container.iscollapsed')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.valueselect__toggle-button').title).toBe('foo');
			expect(element.shadowRoot.querySelector('.valueselect__toggle-button').disabled).toBeTrue();
			expect(element.shadowRoot.querySelector('.ba_values_container').childElementCount).toBe(0);

			expect(element.shadowRoot.querySelectorAll('.valueselect__container .values_header')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.valueselect__container .ba_values_container')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#symbol-value').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('renders the view as select element in touch environment', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			spyOn(environmentService, 'isTouch').and.returnValue(true);
			const element = await setup(state, {}, { title: 'foo', values: [21, 42] });

			//view
			expect(element.shadowRoot.querySelectorAll('.valueselect__container select')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.valueselect__container .values_header')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.valueselect__container .ba_values_container')).toHaveSize(0);
		});

		it('check portrait', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});

			expect(element.shadowRoot.querySelector('.valueselect__container').classList).toContain('is-landscape');
			expect(element.shadowRoot.querySelector('.valueselect__container').classList).not.toContain('is-portrait');
		});

		it('check landscape', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			const element = await setup(state, {});

			expect(element.shadowRoot.querySelector('.valueselect__container').classList).not.toContain('is-landscape');
			expect(element.shadowRoot.querySelector('.valueselect__container').classList).toContain('is-portrait');
		});
	});

	describe("when property'title' changes", () => {
		it('updates the view', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});
			const iconButton = element.shadowRoot.querySelector('.valueselect__toggle-button');

			expect(iconButton.title).toBe('');

			element.title = 'foo';

			expect(iconButton.title).toBe('foo');

			element.title = 'bar';

			expect(iconButton.title).toBe('bar');
		});
	});

	describe("when property 'values' changes", () => {
		it('updates the view', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {}, { values: [21, 42] });

			expect(element.values.length).toBe(2);
		});
	});

	describe('when value-button is clicked', () => {
		it('expands and collapse the container', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {}, { values: [21, 42] });

			const valueButton = element.shadowRoot.querySelector('.valueselect__toggle-button');
			const valuesContainer = element.shadowRoot.querySelector('.ba_values_container');

			expect(valuesContainer.classList.contains('iscollapsed')).toBeTrue();
			valueButton.click();
			expect(valuesContainer.classList.contains('iscollapsed')).toBeFalse();
			valueButton.click();
			expect(valuesContainer.classList.contains('iscollapsed')).toBeTrue();
		});
	});

	describe('when icon is selected (event handling) ', () => {
		it('fires a "select" event', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {}, { values: [21, 42] });
			const spy = jasmine.createSpy();
			element.addEventListener('select', spy);

			element.click();
			const selectableIcon = element.shadowRoot.querySelector('#value_21');
			selectableIcon.click();

			expect(spy).toHaveBeenCalledOnceWith(jasmine.any(CustomEvent));
		});

		it('calls the onSelect callback via property callback', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {}, { values: [21, 42] });
			const selectSpy = spyOn(element, 'onSelect');
			const iconButton = element.shadowRoot.querySelector('.valueselect__toggle-button');
			iconButton.click();

			const selectableIcon = element.shadowRoot.querySelector('#value_21');

			selectableIcon.click();

			expect(selectSpy).toHaveBeenCalledWith(21);
		});

		it('calls the onSelect callback via attribute callback', async () => {
			spyOn(window, 'alert');

			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, { onSelect: "alert('called')" }, { values: ['21', '42'] });
			const valueButton = element.shadowRoot.querySelector('.valueselect__toggle-button');
			valueButton.click();

			const selectableValue = element.shadowRoot.querySelector('#value_21');

			selectableValue.click();

			expect(window.alert).toHaveBeenCalledWith('called');
		});
	});
});

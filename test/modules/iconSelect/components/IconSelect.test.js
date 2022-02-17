import { $injector } from '../../../../src/injection';
import { IconSelect } from '../../../../src/modules/iconSelect/components/IconSelect';
import { IconResult } from '../../../../src/services/IconService';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { TestUtils } from '../../../test-utils';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';

window.customElements.define(IconSelect.tag, IconSelect);

describe('IconSelect', () => {

	const iconServiceMock = { default: () => new IconResult('marker', 'foo'), all: () => [] };

	const setup = (state = {}, attributes = {}) => {

		const initialState = {
			media: {
				portrait: false
			},
			...state

		};

		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('IconService', iconServiceMock);
		return TestUtils.render(IconSelect.tag, attributes);
	};

	describe('when initialized', () => {

		it('contains default values in the model', async () => {

			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state);

			//model
			expect(element.title).toBe('');
			expect(element.icons).toEqual([]);
			expect(element.value).toBeNull();
			expect(element.color).toBeNull();
		});

		it('renders the view', async () => {

			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});
			element.title = 'foo';

			//view
			expect(element.shadowRoot.querySelector('.catalog_header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.ba_catalog_container.iscollapsed')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.iconselect__toggle-button').title).toBe('foo');
			expect(element.shadowRoot.querySelector('.iconselect__toggle-button').disabled).toBeTrue();
			expect(element.shadowRoot.querySelector('.ba_catalog_container').childElementCount).toBe(1);
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#symbol-icon').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();

		});

		it('check portrait', async () => {

			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});

			expect(element.shadowRoot.querySelector('.iconselect__container').classList).toContain('is-landscape');
			expect(element.shadowRoot.querySelector('.iconselect__container').classList).not.toContain('is-portrait');
		});

		it('check landscape', async () => {

			const state = {
				media: {
					portrait: true
				}
			};
			const element = await setup(state, {});

			expect(element.shadowRoot.querySelector('.iconselect__container').classList).not.toContain('is-landscape');
			expect(element.shadowRoot.querySelector('.iconselect__container').classList).toContain('is-portrait');
		});
	});

	describe('when property\'title\' changes', () => {

		it('updates the view', async () => {

			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});
			const iconButton = element.shadowRoot.querySelector('.iconselect__toggle-button');

			expect(iconButton.title).toBe('');

			element.title = 'foo';

			expect(iconButton.title).toBe('foo');

			element.title = 'bar';

			expect(iconButton.title).toBe('bar');
		});
	});

	describe('when property\'color\' changes', () => {

		it('updates the view', async () => {

			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});

			expect(element.getModel().color).toBe(null);

			element.color = '#00ff00';

			expect(element.getModel().color).toBe('#00ff00');
		});
	});


	describe('when property\'icons\' changes', () => {

		it('updates the view', async (done) => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'),
				new IconResult('bar', '42')]));
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});

			setTimeout(() => {
				expect(element.icons.length).toBe(2);
				done();
			});
		});
	});

	describe('when icon-button is clicked', () => {
		it('expands and collapse the container', async () => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'),
				new IconResult('bar', '42')]));
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});

			const iconButton = element.shadowRoot.querySelector('.iconselect__toggle-button');
			const iconContainer = element.shadowRoot.querySelector('.ba_catalog_container');

			expect(iconContainer.classList.contains('iscollapsed')).toBeTrue();
			iconButton.click();
			expect(iconContainer.classList.contains('iscollapsed')).toBeFalse();
			iconButton.click();
			expect(iconContainer.classList.contains('iscollapsed')).toBeTrue();
		});
	});

	describe('when icon is selected (event handling) ', () => {
		it('calls the onSelect callback via property callback', async () => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'),
				new IconResult('bar', '42')]));

			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});
			const selectSpy = spyOn(element, 'onSelect');
			const iconButton = element.shadowRoot.querySelector('.iconselect__toggle-button');
			iconButton.click();

			const selectableIcon = element.shadowRoot.querySelector('#svg_foo');

			selectableIcon.click();

			expect(selectSpy).toHaveBeenCalledWith(jasmine.any(IconResult));
		});

		it('calls the onSelect callback via attribute callback', async () => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'),
				new IconResult('bar', '42')]));

			spyOn(window, 'alert');

			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, { onSelect: 'alert(\'called\')' });
			const iconButton = element.shadowRoot.querySelector('.iconselect__toggle-button');
			iconButton.click();

			const selectableIcon = element.shadowRoot.querySelector('#svg_foo');

			selectableIcon.click();

			expect(window.alert).toHaveBeenCalledWith('called');
		});
	});
});

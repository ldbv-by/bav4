import { BottomSheet } from '../../../../src/modules/stackables/components/bottomSheet/BottomSheet';
import { TestUtils } from '../../../test-utils';
import { html } from 'lit-html';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { setIsPortrait } from '../../../../src/store/media/media.action';
import { toggle } from '../../../../src/store/mainMenu/mainMenu.action';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { bottomSheetReducer } from '../../../../src/store/bottomSheet/bottomSheet.reducer';
import { openBottomSheet } from '../../../../src/store/bottomSheet/bottomSheet.action';

window.customElements.define(BottomSheet.tag, BottomSheet);

describe('BottomSheet', () => {
	let store;
	const defaultState = {
		mainMenu: {
			open: false
		},
		media: {
			portrait: false
		}
	};

	const setup = async (content, state = {}) => {
		const initialState = { ...defaultState, ...state };

		store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			bottomSheet: bottomSheetReducer
		});

		const element = await TestUtils.renderAndLogLifecycle(BottomSheet.tag);
		element.content = content;
		return element;
	};

	describe('constructor', () => {
		it('sets a initial model', async () => {
			TestUtils.setupStoreAndDi(defaultState);
			const element = new BottomSheet();

			expect(element.getModel()).toEqual({
				content: null,
				open: false,
				portrait: false
			});
		});

		it('subscribes to the store', async () => {
			TestUtils.setupStoreAndDi(defaultState);
			const element = new BottomSheet();

			expect(element._subscriptions).toHaveSize(2);
			expect(element._subscriptions.every((subscription) => typeof subscription === 'function')).toBeTrue();
		});
	});

	describe('when initialized', () => {
		it('renders nothing when no data available', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when BottomSheet is rendered', () => {
		it('displays the bottom sheet content', async () => {
			const element = await setup('FooBar');
			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__close-button')).toHaveSize(1);
		});

		it('displays the bottom sheet content from a lit-html template-result', async () => {
			const template = (str) => html`${str}`;

			const element = await setup(template('FooBarBaz'));
			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toMatch(/FooBarBaz[\r\n]?/);
			expect(element.shadowRoot.querySelectorAll('.tool-container__close-button')).toHaveSize(1);
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape and open Menu', async () => {
			const element = await setup('FooBar', { mainMenu: { open: true }, media: { portrait: false } });
			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(1);
		});

		it('layouts for landscape and closed Menu', async () => {
			const element = await setup('FooBar', { mainMenu: { open: false }, media: { portrait: false } });
			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(0);
		});

		it('layouts for portrait and open Menu', async () => {
			const element = await setup('FooBar', { mainMenu: { open: true }, media: { portrait: true } });
			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(0);
		});

		it('layouts for portrait and closed Menu', async () => {
			const element = await setup('FooBar', { mainMenu: { open: false }, media: { portrait: true } });
			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(0);
		});
	});

	describe('after initial rendering ', () => {
		it('when orientation changes', async () => {
			const element = await setup('FooBar', { mainMenu: { open: true }, media: { portrait: false, observeResponsiveParameter: true } });

			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(1);

			setIsPortrait(true);
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(0);

			setIsPortrait(false);
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(1);
		});

		it('when toggle menu', async () => {
			const element = await setup('FooBar', { mainMenu: { open: true }, media: { portrait: false } });

			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(1);

			toggle();
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(0);

			toggle();
			expect(element.shadowRoot.querySelectorAll('.bottom-sheet.is-open')).toHaveSize(1);
		});

		it('when close button clicked', async () => {
			const element = await setup('FooBar', { mainMenu: { open: true }, media: { portrait: false } });

			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');
			expect(element.shadowRoot.querySelectorAll('.fade-out')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.tool-container__close-button')).toHaveSize(1);
			const closeButton = element.shadowRoot.querySelectorAll('.tool-container__close-button')[0];
			openBottomSheet(true);

			expect(store.getState().bottomSheet.data).not.toBeNull();
			expect(contentElement.innerText).toContain('FooBar');

			closeButton.click();

			expect(element.shadowRoot.querySelectorAll('.fade-out')).toHaveSize(1);
			contentElement.dispatchEvent(new Event('animationend'));
			expect(store.getState().bottomSheet.data).toBeNull();
		});
	});

	describe('when disconnected', () => {
		it('removes all observers', async () => {
			const element = await setup();
			const spy1 = jasmine.createSpy();
			const spy2 = jasmine.createSpy();
			element._subscriptions = [spy1, spy2];

			element.onDisconnect(); // we call onDisconnect manually

			expect(spy1).toHaveBeenCalled();
			expect(spy2).toHaveBeenCalled();
		});
	});
});

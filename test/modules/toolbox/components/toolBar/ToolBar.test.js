/* eslint-disable no-undef */

import { ToolBar } from '../../../../../src/modules/toolbox/components/toolBar/ToolBar';
import { networkReducer } from '../../../../../src/store/network/network.reducer';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { setFetching } from '../../../../../src/store/network/network.action';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { ToolId } from '../../../../../src/store/tools/tools.action';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../src/utils/markup';

window.customElements.define(ToolBar.tag, ToolBar);


describe('ToolBarElement', () => {


	let store;
	const setup = async (state = {}, config = {}) => {

		const { embed = false, fetching = false } = config;

		const initialState = {
			tools: {
				current: false
			},
			network: {
				fetching: fetching,
				pendingRequests: 0
			},
			media: {
				portrait: false,
				minWidth: true
			},
			...state
		};


		store = TestUtils.setupStoreAndDi(initialState, {
			tools: toolsReducer,
			network: networkReducer,
			media: createNoInitialStateMediaReducer()
		});

		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(ToolBar.tag);
	};

	describe('constructor', () => {

		it('sets a default model', async () => {
			setup();
			const element = new ToolBar();

			expect(element.getModel()).toEqual({
				isOpen: true,
				isFetching: false,
				isPortrait: false,
				hasMinWidth: false,
				toolId: null
			});
		});
	});

	describe('when initialized', () => {

		it('adds a div which holds the toolbar with four Tools and close button', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-bar')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.action-button')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.measure')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.pencil')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.share')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.import')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.close')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.hide-button')).toHaveSize(1);
		});

		it('contains test-id attributes', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(6);
			expect(element.shadowRoot.querySelector('#measure-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#draw-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#share-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#import-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#action-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#tools-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when Toolbar button is clicked', () => {

		it('open or closes the Toolbar in portrait orientation', async () => {

			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);
			const toolBarButton = element.shadowRoot.querySelector('.toolbar__button-tools');

			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.hide-button')).toHaveSize(0);

			toolBarButton.click();

			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.hide-button')).toHaveSize(1);

			toolBarButton.click();

			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.hide-button')).toHaveSize(0);
		});

		it('open or closes the Toolbar in desktop orientation', async () => {

			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};

			const element = await setup(state);
			const toolBarButton = element.shadowRoot.querySelector('.tool-bar__button-close');

			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.hide-button')).toHaveSize(1);

			toolBarButton.click();

			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.hide-button')).toHaveSize(0);

			toolBarButton.click();

			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.hide-button')).toHaveSize(1);
		});
	});

	describe('when tool buttons are clicked', () => {

		it('toggles a tool', async () => {

			const element = await setup();
			const toolButtons = element.shadowRoot.querySelectorAll('.tool-bar__button_icon');

			expect(toolButtons).toHaveSize(5);

			toolButtons[0].click();
			expect(store.getState().tools.current).toBe(ToolId.MEASURING);
			expect(element.shadowRoot.querySelector('#measure-button').classList.contains('is-active')).toBeTrue();
			toolButtons[0].click();
			expect(store.getState().tools.current).toBeNull();
			expect(element.shadowRoot.querySelector('#measure-button').classList.contains('is-active')).toBeFalse();

			toolButtons[1].click();
			expect(store.getState().tools.current).toBe(ToolId.DRAWING);
			expect(element.shadowRoot.querySelector('#draw-button').classList.contains('is-active')).toBeTrue();
			toolButtons[1].click();
			expect(store.getState().tools.current).toBeNull();
			expect(element.shadowRoot.querySelector('#draw-button').classList.contains('is-active')).toBeFalse();

			toolButtons[2].click();
			expect(store.getState().tools.current).toBe(ToolId.IMPORT);
			expect(element.shadowRoot.querySelector('#import-button').classList.contains('is-active')).toBeTrue();
			toolButtons[2].click();
			expect(store.getState().tools.current).toBeNull();
			expect(element.shadowRoot.querySelector('#import-button').classList.contains('is-active')).toBeFalse();

			toolButtons[3].click();
			expect(store.getState().tools.current).toBe(ToolId.SHARING);
			expect(element.shadowRoot.querySelector('#share-button').classList.contains('is-active')).toBeTrue();
			toolButtons[3].click();
			expect(element.shadowRoot.querySelector('#share-button').classList.contains('is-active')).toBeFalse();

			expect(element.getModel().isOpen).toBeTrue();
			toolButtons[4].click();
			expect(element.getModel().isOpen).toBeFalse();
			toolButtons[4].click();
			expect(element.getModel().isOpen).toBeTrue();

			expect(store.getState().tools.current).toBeNull();
		});

		it('switches a tool', async () => {

			const element = await setup();
			const toolButtons = element.shadowRoot.querySelectorAll('.tool-bar__button_icon');

			expect(toolButtons).toHaveSize(5);

			toolButtons[0].click();
			expect(store.getState().tools.current).toBe(ToolId.MEASURING);
			toolButtons[1].click();
			expect(store.getState().tools.current).toBe(ToolId.DRAWING);
			toolButtons[2].click();
			expect(store.getState().tools.current).toBe(ToolId.IMPORT);
			toolButtons[3].click();
			expect(store.getState().tools.current).toBe(ToolId.SHARING);
		});
	});

	describe('network fetching state', () => {
		it('runs or pauses the border animation class', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.action-button__border.animated-action-button__border').classList.contains('animated-action-button__border__running')).toBeFalse();
			setFetching(true);
			expect(element.shadowRoot.querySelector('.action-button__border.animated-action-button__border').classList.contains('animated-action-button__border__running')).toBeTrue();
			setFetching(false);
			expect(element.shadowRoot.querySelector('.action-button__border.animated-action-button__border').classList.contains('animated-action-button__border__running')).toBeFalse();
		});
	});

	describe('responsive layout ', () => {

		it('layouts for landscape desktop', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-bar')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(1);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('none');
		});

		it('layouts for landscape tablet', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-bar')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(0);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('block');
		});

		it('layouts for portrait desktop', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-bar')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(0);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('none');
		});

		it('layouts for portrait tablet', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-bar')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar.is-open')).toHaveSize(0);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('block');
		});
	});
});

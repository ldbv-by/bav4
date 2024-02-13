/* eslint-disable no-undef */

import { ToolBar } from '../../../../../src/modules/toolbox/components/toolBar/ToolBar';
import { networkReducer } from '../../../../../src/store/network/network.reducer';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { navigationRailReducer } from '../../../../../src/store/navigationRail/navigationRail.reducer';
import { setFetching } from '../../../../../src/store/network/network.action';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../src/utils/markup';
import { Tools } from '../../../../../src/domain/tools';

window.customElements.define(ToolBar.tag, ToolBar);

describe('ToolBarElement', () => {
	let store;
	const setup = async (state = {}, config = {}) => {
		const { embed = false, fetching = false, standalone = false } = config;

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
			media: createNoInitialStateMediaReducer(),
			navigationRail: navigationRailReducer
		});

		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				isStandalone: () => standalone
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
		it('adds a div which holds the toolbar with five Tools and close button', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-bar')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.action-button')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button').length).toBe(6);
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.measure')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.pencil')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.share')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.import')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.export')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.close')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.hide-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.toolbar__logo-badge').innerText).toBe('header_logo_badge');
		});

		it('contains test-id attributes', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(7);
			expect(element.shadowRoot.querySelector('#measure-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#draw-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#share-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#import-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#export-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#tools-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders for standalone', async () => {
			const element = await setup({}, { standalone: true });

			expect(element.shadowRoot.querySelectorAll('.is-demo')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.toolbar__logo-badge').innerText).toBe('header_logo_badge_standalone');
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

	describe('when action-button clicked', () => {
		it('toggle navigation rail', async () => {
			const element = await setup();

			expect(store.getState().navigationRail.open).toBe(false);

			element.shadowRoot.querySelector('.action-button').click();

			expect(store.getState().navigationRail.open).toBe(true);

			element.shadowRoot.querySelector('.action-button').click();

			expect(store.getState().navigationRail.open).toBe(false);
		});
	});

	describe('when tool buttons are clicked', () => {
		it('toggles a tool', async () => {
			const element = await setup();
			const toolButtons = element.shadowRoot.querySelectorAll('.tool-bar__button_icon');

			expect(toolButtons).toHaveSize(6);

			toolButtons[0].click();
			expect(store.getState().tools.current).toBe(Tools.MEASURE);
			expect(element.shadowRoot.querySelector('#measure-button').classList.contains('is-active')).toBeTrue();
			toolButtons[0].click();
			expect(store.getState().tools.current).toBeNull();
			expect(element.shadowRoot.querySelector('#measure-button').classList.contains('is-active')).toBeFalse();

			toolButtons[1].click();
			expect(store.getState().tools.current).toBe(Tools.DRAW);
			expect(element.shadowRoot.querySelector('#draw-button').classList.contains('is-active')).toBeTrue();
			toolButtons[1].click();
			expect(store.getState().tools.current).toBeNull();
			expect(element.shadowRoot.querySelector('#draw-button').classList.contains('is-active')).toBeFalse();

			toolButtons[2].click();
			expect(store.getState().tools.current).toBe(Tools.IMPORT);
			expect(element.shadowRoot.querySelector('#import-button').classList.contains('is-active')).toBeTrue();
			toolButtons[2].click();
			expect(store.getState().tools.current).toBeNull();
			expect(element.shadowRoot.querySelector('#import-button').classList.contains('is-active')).toBeFalse();

			toolButtons[3].click();
			expect(store.getState().tools.current).toBe(Tools.EXPORT);
			expect(element.shadowRoot.querySelector('#export-button').classList.contains('is-active')).toBeTrue();
			toolButtons[3].click();
			expect(element.shadowRoot.querySelector('#export-button').classList.contains('is-active')).toBeFalse();

			toolButtons[4].click();
			expect(store.getState().tools.current).toBe(Tools.SHARE);
			expect(element.shadowRoot.querySelector('#share-button').classList.contains('is-active')).toBeTrue();
			toolButtons[4].click();
			expect(element.shadowRoot.querySelector('#share-button').classList.contains('is-active')).toBeFalse();

			expect(element.getModel().isOpen).toBeTrue();
			toolButtons[5].click();
			expect(element.getModel().isOpen).toBeFalse();
			toolButtons[5].click();
			expect(element.getModel().isOpen).toBeTrue();

			expect(store.getState().tools.current).toBeNull();
		});

		it('switches a tool', async () => {
			const element = await setup();
			const toolButtons = element.shadowRoot.querySelectorAll('.tool-bar__button_icon');

			expect(toolButtons).toHaveSize(6);

			toolButtons[0].click();
			expect(store.getState().tools.current).toBe(Tools.MEASURE);
			toolButtons[1].click();
			expect(store.getState().tools.current).toBe(Tools.DRAW);
			toolButtons[2].click();
			expect(store.getState().tools.current).toBe(Tools.IMPORT);
			toolButtons[3].click();
			expect(store.getState().tools.current).toBe(Tools.EXPORT);
			toolButtons[4].click();
			expect(store.getState().tools.current).toBe(Tools.SHARE);
		});
	});

	describe('network fetching state', () => {
		it('runs or pauses the border animation class', async () => {
			const element = await setup();
			expect(
				element.shadowRoot
					.querySelector('.action-button__border.animated-action-button__border')
					.classList.contains('animated-action-button__border__running')
			).toBeFalse();
			setFetching(true);
			expect(
				element.shadowRoot
					.querySelector('.action-button__border.animated-action-button__border')
					.classList.contains('animated-action-button__border__running')
			).toBeTrue();
			setFetching(false);
			expect(
				element.shadowRoot
					.querySelector('.action-button__border.animated-action-button__border')
					.classList.contains('animated-action-button__border__running')
			).toBeFalse();
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

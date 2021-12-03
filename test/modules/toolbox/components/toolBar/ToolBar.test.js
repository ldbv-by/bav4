/* eslint-disable no-undef */

import { ToolBar } from '../../../../../src/modules/toolbox/components/toolBar/ToolBar';
import { networkReducer } from '../../../../../src/store/network/network.reducer';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { setFetching } from '../../../../../src/store/network/network.action';
import { toolContainerReducer } from '../../../../../src/store/toolContainer/toolContainer.reducer';
import { toolBarReducer } from '../../../../../src/store/toolBar/toolBar.reducer';
import { toggleToolBar } from '../../../../../src/store/toolBar/toolBar.action';

window.customElements.define(ToolBar.tag, ToolBar);


describe('ToolBarElement', () => {

	let store;
	const setup = async (state = {}, config = {}) => {

		const { embed = false, fetching = false, isStandalone = false } = config;

		const initialState = {
			toolBar: {
				open: true
			},
			toolContainer: {
				open: false,
				contentId: false
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
			toolBar: toolBarReducer,
			toolContainer: toolContainerReducer,
			network: networkReducer,
			media: createNoInitialStateMediaReducer()
		});

		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				isStandalone: () => isStandalone
			})
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(ToolBar.tag);
	};


	describe('when initialized', () => {

		it('adds a div which holds the toolbar with three Tools', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-bar.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.action-button')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button').length).toBe(3);
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.measure')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.pencil')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-bar__button_icon.share')).toBeTruthy();
		});

		it('closes the toolbar', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-bar.is-open')).toBeTruthy();
			toggleToolBar();
			expect(element.shadowRoot.querySelector('.tool-box.is-open')).toBeFalsy();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('toggles a tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('.tool-bar__button_icon.measure');

			expect(store.getState().toolContainer.open).toBeFalse();
			toolButton.click();
			expect(store.getState().toolContainer.open).toBeTrue();
			toolButton.click();
			expect(store.getState().toolContainer.open).toBeFalse();

		});

		it('toggles and switches the tools', async () => {

			const element = await setup();
			const measureToolButton = element.shadowRoot.querySelector('.tool-bar__button_icon.measure');
			const drawToolButton = element.shadowRoot.querySelector('.tool-bar__button_icon.pencil');
			const shareToolButton = element.shadowRoot.querySelector('.tool-bar__button_icon.share');

			expect(store.getState().toolContainer.open).toBeFalse();
			expect(store.getState().toolContainer.contentId).toBeFalse();
			measureToolButton.click();
			expect(store.getState().toolContainer.open).toBeTrue();
			expect(store.getState().toolContainer.contentId).toBe('ba-tool-measure-content');
			drawToolButton.click();
			expect(store.getState().toolContainer.open).toBeTrue();
			expect(store.getState().toolContainer.contentId).toBe('ba-tool-draw-content');
			drawToolButton.click();
			expect(store.getState().toolContainer.open).toBeFalse();
			shareToolButton.click();
			expect(store.getState().toolContainer.open).toBeTrue();
			expect(store.getState().toolContainer.contentId).toBe('ba-tool-share-content');
			shareToolButton.click();
			expect(store.getState().toolContainer.open).toBeFalse();

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

		describe('in standalone-modus', () => {
			it('disable the share-button, when App is standalone', async () => {
				const element = await setup({}, { isStandalone: true });

				const shareToolIcon = element.shadowRoot.querySelector('.tool-bar__button_icon.share');
				const button = shareToolIcon.closest('.tool-bar__button');
				expect(button.disabled).toBeTrue();
			});

			it('disable not the share-button, when App is NOT standalone', async () => {
				const element = await setup();

				const shareToolIcon = element.shadowRoot.querySelector('.tool-bar__button_icon.share');
				const button = shareToolIcon.closest('.tool-bar__button');
				expect(button.disabled).toBeFalse();
			});
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
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('block');
		});
	});
});

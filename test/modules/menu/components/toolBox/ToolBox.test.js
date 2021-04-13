/* eslint-disable no-undef */

import { ToolBox } from '../../../../../src/modules/menu/components/toolBox/ToolBox';
import { toolBoxReducer } from '../../../../../src/modules/menu/store/toolBox.reducer';
import { toolContainerReducer } from '../../../../../src/modules/toolbox/store/toolContainer.reducer';
import { toggleToolBox } from '../../../../../src/modules/menu/store/toolBox.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ToolBox.tag, ToolBox);


describe('ToolBoxElement', () => {

	const windowMock = {
		matchMedia() { }
	};
	let store;
	const setup = async (config = {}) => {

		const { embed = false } = config;

		const state = {
			toolBox: {
				open: true
			},
			toolContainer:{
				open:false,
				contentId:false
			}
		};


		store = TestUtils.setupStoreAndDi(state, { toolBox: toolBoxReducer, toolContainer:toolContainerReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SearchResultProviderService', { getGeoresourceSearchResultProvider: () => { } });
		return TestUtils.render(ToolBox.tag);
	};


	describe('when initialized', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('adds a div which holds the toolbox with three Tools', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-box.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.action-button')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-box__button').length).toBe(3);
			expect(element.shadowRoot.querySelectorAll('.tool-box__button_icon.measure')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-box__button_icon.pencil')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-box__button_icon.share')).toBeTruthy();
		});

		it('it closes the toolbox', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-box.is-open')).toBeTruthy();
			toggleToolBox();
			expect(element.shadowRoot.querySelector('.tool-box.is-open')).toBeFalsy();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('it toggles a tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('.tool-box__button_icon.measure');

			expect(store.getState().toolContainer.open).toBeFalse();
			toolButton.click();
			expect(store.getState().toolContainer.open).toBeTrue();
			toolButton.click();
			expect(store.getState().toolContainer.open).toBeFalse();
			
		});

		it('it toggles and switches the tools', async () => {

			const element = await setup();
			const measureToolButton = element.shadowRoot.querySelector('.tool-box__button_icon.measure');
			const drawToolButton = element.shadowRoot.querySelector('.tool-box__button_icon.pencil');

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
			
		});
	});

	describe('responsive layout ', () => {

		it('layouts for landscape desktop', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-box')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('none');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for landscape tablet', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-box')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('block');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait desktop', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-box')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('none');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait tablet', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-box')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.action-button')).display).toBe('block');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});
});

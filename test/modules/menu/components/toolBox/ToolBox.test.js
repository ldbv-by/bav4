/* eslint-disable no-undef */

import { ToolBox } from '../../../../../src/modules/menu/components/toolBox/ToolBox';
import { toolBoxReducer } from '../../../../../src/modules/menu/store/toolBox.reducer';
import { toggleToolBox } from '../../../../../src/modules/menu/store/toolBox.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ToolBox.tag, ToolBox);


describe('ToolBoxElement', () => {

	const windowMock = {
		matchMedia() { }
	};

	const setup = async (config = {}) => {

		const { embed = false } = config;

		const state = {
			toolBox: {
				open: true
			}
		};

		TestUtils.setupStoreAndDi(state, { toolBox: toolBoxReducer });
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

		it('adds a div which holds the toolbox with tow Tools', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-box.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.action-button')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-box__button').length).toBe(2);
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

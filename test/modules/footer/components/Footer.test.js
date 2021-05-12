/* eslint-disable no-undef */

import { Footer } from '../../../../src/modules/footer/components/Footer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { mainMenuReducer } from '../../../../src/modules/menu/store/mainMenu.reducer';

window.customElements.define(Footer.tag, Footer);


describe('Footer', () => {

	const windowMock = {
		matchMedia() { }
	};

	const setup = (config = {}) => {
		const { embed = false } = config;

		const state = {
			mainMenu: {
				open: true
			}
		};

		TestUtils.setupStoreAndDi(state,  { mainMenu: mainMenuReducer });
		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed,
			getWindow: () => windowMock
		});

		return TestUtils.render(Footer.tag);
	};

	describe('responsive layout ', () => {
		it('layouts with open main menu for landscape mode', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.footer.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('block');
			expect(element.shadowRoot.querySelector('ba-map-info')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(1);
		});

		it('layouts with open main menu for portrait mode', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.footer.is-open')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('none');
			expect(element.shadowRoot.querySelector('ba-map-info')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(1);
		});
	});


	describe('when initialized', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('removes a preload css class', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.preload')).toBeFalsy();
		});

		it('adds footer elements and css classes for landscape mode', async () => {

			const element = await setup({ portrait: false });
			
			expect(element.shadowRoot.querySelector('.footer')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-map-info')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-attribution-info')).toBeTruthy();
		});


		it('renders nothing when embedded', async () => {

			const element = await setup({ embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});
});

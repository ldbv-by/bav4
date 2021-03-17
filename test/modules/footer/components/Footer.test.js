/* eslint-disable no-undef */

import { Footer } from '../../../../src/modules/footer/components/Footer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';

window.customElements.define(Footer.tag, Footer);


describe('Footer', () => {

	const setup = (config = {}) => {
		const {  embed = false  } = config;

		const state = {
			contentPanel: {
				open: true
			}
		};

		TestUtils.setupStoreAndDi(state);
		$injector.registerSingleton('EnvironmentService', {
			isEmbedded : () => embed
		});

		return TestUtils.render(Footer.tag);
	};

	describe('when initialized', () => {
		it('adds footer elements and css classes for landscape mode', async () => {

			const element = await setup({ portrait: false });
			expect(element.shadowRoot.querySelector('.footer')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-map-info')).toBeTruthy();
		});

		it('with open contentpanel for landscape mode', async () => {
						
			const matchMediaSpy = spyOn(window, 'matchMedia')
			//mock landscape
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false));
			const element = await setup();
			expect(element.shadowRoot.querySelector('.footer.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-map-info')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(1);
		});

		it('with open contentpanel for portrait mode', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//mock  portrait
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true));
			const element = await setup();
			expect(element.shadowRoot.querySelector('.footer.is-open')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-map-info')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(1);
		});
		
		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});
	});
});

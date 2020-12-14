/* eslint-disable no-undef */

import { Footer } from '../../../src/components/footer/Footer';
import { TestUtils } from '../../test-utils.js';
import { $injector } from '../../../src/injection';

window.customElements.define(Footer.tag, Footer);


describe('Footer', () => {

	const setup = (config) => {
		const { portrait } = config;

		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('EnvironmentService', {
			getScreenOrientation: () => {
				return { portrait: portrait };
			}
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

		it('adds nothing for portrait mode', async () => {

			const element = await setup({ portrait: true });

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});
});

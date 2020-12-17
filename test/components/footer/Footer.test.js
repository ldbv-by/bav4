/* eslint-disable no-undef */

import { Footer } from '../../../src/components/footer/Footer';
import { TestUtils } from '../../test-utils.js';
import { $injector } from '../../../src/injection';

window.customElements.define(Footer.tag, Footer);


describe('Footer', () => {

	const setup = (config) => {
		const { portrait = false,  embed = false  } = config;

		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('EnvironmentService', {
			getScreenOrientation: () => {
				return { portrait: portrait };
			},
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

		it('renders nothing when portrait mode', async () => {

			const element = await setup({ portrait: true });

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});
	});
});

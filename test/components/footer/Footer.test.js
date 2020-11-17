/* eslint-disable no-undef */

import { Footer } from '../../../src/components/footer/Footer';
import { html } from 'lit-html';
import { TestUtils } from '../../test-utils.js';
import { $injector } from '../../../src/injection';

window.customElements.define(Footer.tag, Footer);


describe('Footer', () => {

	beforeAll(() => {
		//we don't want to test child element
		Footer.prototype.createChildrenView = () => html``;
	});


	const setup = (config) => {
		const { mobile } = config;

		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('EnvironmentService', {
			mobile: mobile
		});

		return TestUtils.render(Footer.tag);
	};

	describe('when initialized', () => {
		it('adds footer elements and css classes for dektop', async () => {

			const element = await setup({ mobile: false });

			expect(element.shadowRoot.querySelector('.footer')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();
		});

		it('adds nothing for mobile', async () => {

			const element = await setup({ mobile: true });

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

	});
});

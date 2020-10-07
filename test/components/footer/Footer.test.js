/* eslint-disable no-undef */

import { Footer } from '../../../src/components/footer/Footer';
import { html } from 'lit-html';
import { TestUtils } from '../../test-utils.js';
window.customElements.define(Footer.tag, Footer);


describe('Footer', () => {
	let element;

	beforeAll(() => {
		window.classUnderTest = Footer.name;
    
		//we don't want to test child element
		Footer.prototype.createChildrenView = () => html``;
	});

	afterAll(() => {
		window.classUnderTest = undefined;

	});


	beforeEach(async () => {

		TestUtils.setupStoreAndDi();

		element = await TestUtils.render(Footer.tag);
	});


	describe('when initialized', () => {
		it('adds footer css class', () => {

			expect(element.querySelector('.some')).toBeTruthy();

		});

	});

});

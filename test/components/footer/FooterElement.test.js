/* eslint-disable no-undef */

import { FooterElement } from '../../../src/components/footer/FooterElement';
import { html } from 'lit-html';
import { createStore } from 'redux';


import { $injector } from '../../../src/injection';


import { TestUtils } from '../../test-utils.js';
window.customElements.define(FooterElement.tag, FooterElement);

let mockedStore;

const setupStoreAndDi = () => {

	mockedStore = createStore(() => { }, {});

	const storeService = {
		getStore: function () {
			return mockedStore;
		}
	};


	$injector
		.reset()
		.registerSingleton('StoreService', storeService);
};


describe('FooterElement', () => {
	let element;

	beforeAll(() => {
		window.classUnderTest = FooterElement.name;
    
		//we don't want to test child element
		FooterElement.prototype.createChildrenView = () => html``;
	});

	afterAll(() => {
		window.classUnderTest = undefined;

	});


	beforeEach(async () => {

		setupStoreAndDi();
		element = await TestUtils.render(FooterElement.tag);
	});


	describe('when initialized', () => {
		it('adds footer css class', () => {

			expect(element.querySelector('.some')).toBeTruthy();

		});

	});

});
